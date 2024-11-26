import {type OnPaymentRequestFn, ProxyWebSocket} from "./ws";
import {getEncodedToken, PaymentRequest} from "@cashu/cashu-ts";

export interface IEpoxy {
    connect(hops: string[], minutes: number): Promise<WebSocket>;
    topUp(minutes: number): Promise<void>;
}

export type OnMessageFn = (message: string) => void

export class Epoxy implements IEpoxy {
    private ws: ProxyWebSocket | WebSocket | undefined = undefined;

    private onMessage: OnMessageFn;
    private onPaymentReq: OnPaymentRequestFn;

    constructor(onMessage: OnMessageFn, onPaymentReq: OnPaymentRequestFn) {
        this.onMessage = onMessage;
        this.onPaymentReq = onPaymentReq;
    }

    private resolvePubkey(entrypoint: string) {
        return entrypoint; // TODO actually resolve
    }

    public async connect(hops: string[]): Promise<ProxyWebSocket> {
        if (hops.length === 0) throw new Error("Missing hops");
        if (hops.length === 1) throw new Error("Provide at least one hop before the destination");

        // Resolve all pubkeys to addresses
        for (let i = 0; i < hops.length; i++){
            hops[i] = this.resolvePubkey(hops[i]);
        }

        // separate entrypoint from other hops
        const entrypoint = hops[0];
        hops = hops.slice(1);

        const proxy = (this.ws = new ProxyWebSocket(entrypoint, this.onPaymentReq));

        proxy.proxyTo(hops)

        return proxy;
    }

    public disconnect() {

    }

    private connectHop(){

    }


}
