import { type Proof, PaymentRequest } from "@cashu/cashu-ts";
import { NSecSigner } from "@nostrify/nostrify";
import {nostrNow} from "@/utils/nostrUtils";

export type Payment = Proof[];

type NostrEvent = {
  kind: number;
  content: string;
  tags: string[][];
  created_at: number;
  sig: string;
  id: string;
  pubkey: string;
};

export type ProxyRequestMessage = ["PROXY", string] | ["PROXY", string, PaymentRequest | NostrEvent];

export type ProxyConnectingMessage = ["PROXY", "CONNECTING"];
export type ProxyConnectedMessage = ["PROXY", "CONNECTED"];
export type ProxyErrorMessage = ["PROXY", "ERROR", string];
export type NIP42PaymentRequestMessage = ["AUTH", string, PaymentRequest];
export type NIP42AuthMessage = ["AUTH", string];

export type ProxyMessage =
  | ProxyConnectingMessage
  | ProxyConnectedMessage
  | ProxyErrorMessage
  | NIP42PaymentRequestMessage
  | NIP42AuthMessage;

export type ProxyHandlers = {
  onPaymentRequest?: (socket: WebSocket, hop: string, request: PaymentRequest) => Promise<string | null>;
  onAuthRequest?: (socket: WebSocket, hop: string, challenge: string) => Promise<NostrEvent | null>;
};

export class ProxyWebSocket extends EventTarget implements WebSocket, ProxyHandlers {
  _readyState: number;

  // events
  onclose: ((this: WebSocket, ev: CloseEvent) => any) | null = null;
  onerror: ((this: WebSocket, ev: Event) => any) | null = null;
  onmessage: ((this: WebSocket, ev: MessageEvent) => any) | null = null;
  onopen: ((this: WebSocket, ev: Event) => any) | null = null;
  onproxy: ((this: WebSocket, hop: string) => any) | null = null;

  // handlers
  onPaymentRequest?: (socket: WebSocket, hop: string, request: PaymentRequest) => Promise<string | null>;
  onAuthRequest?: (socket: WebSocket, hop: string, challenge: string) => Promise<NostrEvent | null>;

  url: string;
  hops: string[];
  private hopIndex = 0;

  private ws: WebSocket;
  private authEventId: string;

  constructor(proxyUrl: string, hops: string[], handlers?: ProxyHandlers) {
    super();
    if (hops.length === 0) throw new Error("Missing hops");

    this.hops = hops;
    this.url = proxyUrl;
    this.ws = new WebSocket(proxyUrl);
    this.onPaymentRequest = handlers?.onPaymentRequest;
    this.onAuthRequest = handlers?.onAuthRequest;

    this._readyState = WebSocket.CONNECTING;

    // intercept PROXY messages
    this.ws.onmessage = async (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data) as ProxyMessage;
        if (!Array.isArray(message)) throw new Error("Message is not a json array");
        const hop = this.hops[this.hopIndex];
        console.log(event.data)
        if (message[0] === "PROXY") {
          switch (message[1]) {
            case "CONNECTING":
              this._readyState = WebSocket.CONNECTING;
              break;
            case "CONNECTED":
              this.hopIndex++;
              this.upstreamProxyConnected();
              break;
            case "ERROR":
              this.upstreamProxyError(message[2]);
              break;
            default:
              throw new Error(`Unknown PROXY response: ${message[1]}`);
          }
        } else if(message[0] === "AUTH") {
          const challengeString = message[1];
          const paymentRequest = message[2];
          if(paymentRequest){
            const payment = await this.onPaymentRequest?.(this, hop, paymentRequest!);

            console.log(payment);
            if (payment === null) {
              // cancel
              this.close();
            } else {
              // retry proxy with payment
              const authEvent = {
                "kind": 22242,
                "tags": [
                  ["relay", hop],
                  ["challenge", challengeString]
                ],
                "content": payment ?? "",
                "created_at": nostrNow()
              }

              const signer = new NSecSigner("4e007801c927832ebfe06e57ef08dba5aefe44076a0add96b1700c9061313490");
              const signedAuthEvent = await signer.signEvent(authEvent);

              this.authEventId = signedAuthEvent.id;

              const authMsg = JSON.stringify(["AUTH", signedAuthEvent]);
              this.ws.send(authMsg);
            }
          }
        }  else if(message[0] === "OK") {
          const eventId = message[1]
          const successful = message[2]

          if(eventId === this.authEventId && successful){
            // RESEND proxy request
            const message: ProxyRequestMessage = ["PROXY", this.hops[this.hopIndex]];
            this.ws.send(JSON.stringify(message));
          } else {
            console.error(`Unknown PROXY response: ${message}`);
          }
        }
      } catch (error) {}
    };

    this.ws.onerror = this.upstreamError.bind(this);
    this.ws.onopen = this.upstreamOpen.bind(this);
    this.ws.onclose = this.upstreamClose.bind(this);
  }

  private upstreamOpen(_event: Event) {
    this._readyState = WebSocket.CONNECTING;
    const message: ProxyRequestMessage = ["PROXY", this.hops[this.hopIndex]];
    this.ws.send(JSON.stringify(message));
  }
  private upstreamError(event: Event) {
    this._readyState = this.ws.readyState;
    this.onerror?.(event);
    this.dispatchEvent(new Event("error", event));
  }
  private upstreamClose(event: CloseEvent) {
    // check already closed
    if (this._readyState === WebSocket.CLOSED) return;
    this._readyState = this.ws.readyState;
    this.onclose?.(event);
    this.dispatchEvent(new CloseEvent("close", event));
  }

  private upstreamProxyConnected() {
    this.onproxy?.(this.hops[this.hopIndex - 1]);

    if (this.hopIndex < this.hops.length) {
      const message: ProxyRequestMessage = ["PROXY", this.hops[this.hopIndex]];
      this.ws.send(JSON.stringify(message));
    } else {
      // finished building route
      const event = new Event("open");
      this._readyState = WebSocket.OPEN;
      this.onopen?.(event);
      this.dispatchEvent(event);

      // remove proxy handler
      this.ws.onmessage = (event) => {
        this.onmessage?.(event);
        // @ts-expect-error
        this.dispatchEvent(new MessageEvent("message", event));
      };
    }
  }
  private upstreamProxyError(message?: string) {
    // @ts-expect-error
    const event = new Event("error", { message: message });
    this._readyState = WebSocket.CLOSED;
    this.onclose?.(new CloseEvent("close", {reason: message}));
    this.ws.close();
    this.dispatchEvent(event);
  }

  // websocket methods
  close(code?: number, reason?: string) {
    this._readyState = WebSocket.CLOSING;
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
  static CONNECTING = WebSocket.CONNECTING;
  static OPEN = WebSocket.OPEN;
  static CLOSED = WebSocket.CLOSED;
  static CLOSING = WebSocket.CLOSING;
  CONNECTING = WebSocket.CONNECTING;
  OPEN = WebSocket.OPEN;
  CLOSED = WebSocket.CLOSED;
  CLOSING = WebSocket.CLOSING;
}
