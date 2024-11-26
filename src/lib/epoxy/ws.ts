import {PaymentRequest} from "@cashu/cashu-ts";
import { NSecSigner, type NostrEvent } from "@nostrify/nostrify";
import {nostrNow} from "@/utils/nostrUtils";

export type ProxyRequestMessage = ["PROXY", string] | ["PROXY", string, PaymentRequest | NostrEvent];
export type ProxyConnectingMessage = ["PROXY", "CONNECTING"];
export type ProxyConnectedMessage = ["PROXY", "CONNECTED"];
export type ProxyErrorMessage = ["PROXY", "ERROR", string];

export type ProxyMessage =
    | ProxyConnectingMessage
    | ProxyConnectedMessage
    | ProxyErrorMessage

export type NIP42PaymentRequestMessage = ["AUTH", string, PaymentRequest];
export type NIP42AuthRequest = ["AUTH", string];

export type AuthRequest =
    | NIP42PaymentRequestMessage
    | NIP42AuthRequest;

type Hop = {
  endpoint: string;
  connected: boolean;
  authEventId?: string;
}

export type OnPaymentRequestFn = (request: PaymentRequest) => Promise<string | null>

export class ProxyWebSocket extends EventTarget implements WebSocket {
  // events
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
  onerror: ((this: WebSocket, ev: Event) => any) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
  onopen: ((this: WebSocket, ev: Event) => any) | null = null;

  public url: string;
  private ws: WebSocket;
  private _readyState: number = WebSocket.CLOSED;

  private hopConnectionTimeout = 5000;
  private connectedToDestination: boolean = false;
  private currentHop?: Hop;

  private onPaymentRequest?: OnPaymentRequestFn;

  constructor(entrypoint: string, onPaymentRequest: OnPaymentRequestFn) {
    super();

    this.onPaymentRequest = onPaymentRequest

    this.url = entrypoint;
    this.ws = new WebSocket(entrypoint);

    // intercept PROXY messages
    this.ws.onmessage = async (event: MessageEvent) => {
      // console.log("Received message", event);
      if(this.connectedToDestination){
        this.dispatchEvent(new Event("message", event));
        return;
      }

      try{
        await this.interceptMessage(event);
      } catch (e) {
        console.error("Error while intercepting message:", e.message);
        this.close()
        throw e
      }

    };

    this.ws.onerror = this.upstreamError.bind(this);
    this.ws.onclose = this.upstreamClose.bind(this);
  }


  public async proxyTo(hops: string[]){
    if(hops.length === 0){
      // console.log("no more hops, connected to destination!")
      this.connectedToDestination = true;

      // Send Upstream the open event
      const event = new Event("open");
      this._readyState = WebSocket.OPEN;
      this.onopen?.(event);
      this.dispatchEvent(event);

      this.ws.onmessage = this.onmessage;
      return
    }

    this.currentHop = {
      endpoint: hops[0],
      connected: false
    }

    await waitForCondition(() => this.ws.readyState === WebSocket.OPEN, 20);

    this.sendProxyRequest(this.currentHop.endpoint)
    const startedConnecting = nostrNow();

    // wait till hop connected or hitting the timeout
    await waitForCondition(() => this.currentHop?.connected || nostrNow() > startedConnecting + this.hopConnectionTimeout, 20);

    if(!this.currentHop.connected){
      throw new Error(`Hop ${this.currentHop} timed out...`);
    }

    // Continue next hops
    await this.proxyTo(hops.slice(1))
  }

  private upstreamError(event: Event) {
    this.dispatchEvent(new Event("error", event));
  }

  private upstreamClose(event: CloseEvent) {
    if (this._readyState === WebSocket.CLOSED) return;
    this._readyState = this.ws.readyState;
    this.dispatchEvent(new CloseEvent("close", event));
  }

  private upstreamProxyError(message?: string) {
    // @ts-expect-error
    const event = new Event("error", { message: message });
    this.ws.close();
    this.dispatchEvent(event);
  }

  // websocket methods
  close(code?: number, reason?: string) {
    this.ws.close(code, reason);
  }

  send(data: string | ArrayBufferLike | Blob | ArrayBufferView) {
    this.ws.send(data);
  }

  // forward fields
  get readyState() {
    return this._readyState;
  }
  get extensions() {
    return this.ws.extensions;
  }
  get binaryType() {
    return this.ws.binaryType;
  }
  set binaryType(v) {
    this.ws.binaryType = v;
  }
  get bufferedAmount() {
    return this.ws.bufferedAmount;
  }
  get protocol() {
    return this.ws.protocol;
  }

  // static fields
  CONNECTING = WebSocket.CONNECTING;
  OPEN = WebSocket.OPEN;
  CLOSED = WebSocket.CLOSED;
  CLOSING = WebSocket.CLOSING;

  private handleProxyMessage(message: ProxyMessage) {
    switch (message[1]) {
      case "CONNECTING":
        break;
      case "CONNECTED":
        this.currentHop!.connected = true;
        break;
      case "ERROR":
        console.log(`Proxy gave error: ${message[2]}`)
        break;
      default:
        throw new Error(`Unknown PROXY response: ${message[1]}`);
    }
  }

  private async handleAuthRequest(message: AuthRequest) {

    const challengeString = message[1];
    const paymentRequest = message[2];
    if(paymentRequest){
      const cashuToken = await this.onPaymentRequest?.(paymentRequest!);

      if (!cashuToken) {
        console.error("No provided by user, closing...")
        // cancel
        this.close();
        return;
      }

      await this.sendAuthResponse(challengeString, cashuToken);
    }
  }

  private async interceptMessage(event: MessageEvent) {
      const message = JSON.parse(event.data) as ProxyMessage;
      if (!Array.isArray(message)) throw new Error("Message is not a json array");
      console.log(event.data)

      if (message[0] === "PROXY") {
        this.handleProxyMessage(message)
        return;
      }

      if(message[0] === "AUTH") {
        await this.handleAuthRequest(message)
        return;
      }

      if(message[0] === "OK") {
        const eventId = message[1]
        const successful = message[2]

        if(eventId === this.currentHop?.authEventId && successful){
          // RESEND proxy request
          this.sendProxyRequest(this.currentHop.endpoint);

        } else {
          console.error(`Unknown PROXY response: ${message}`);
        }
      }
  }

  private async sendAuthResponse(challenge: string, cashuToken: string) {
    const authEvent = {
      "kind": 22242,
      "tags": [
        ["relay", this.currentHop?.endpoint ?? "n/a"],
        ["challenge", challenge]
      ],
      "content": cashuToken,
      "created_at": nostrNow()
    }

    const signer = new NSecSigner("4e007801c927832ebfe06e57ef08dba5aefe44076a0add96b1700c9061313490");
    const signedAuthEvent = await signer.signEvent(authEvent);

    this.currentHop.authEventId = signedAuthEvent.id;

    const authMsg = JSON.stringify(["AUTH", signedAuthEvent]);
    this.ws.send(authMsg);
  }

  private sendProxyRequest(target: string) {
    const message: ProxyRequestMessage = ["PROXY", target];
    this.ws.send(JSON.stringify(message));
  }
}

function waitForCondition(checkFn: () => boolean, interval = 1000): Promise<void> {
  return new Promise<void>((resolve) => {
    const checkInterval = setInterval(() => {
      if (checkFn()) {
        clearInterval(checkInterval);
        resolve();
      }
    }, interval);
  });
}