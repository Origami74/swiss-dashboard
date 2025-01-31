import {getEncodedToken, PaymentRequest} from "@cashu/cashu-ts";
import {NRelay1, type NostrEvent, NSecSigner} from "@nostrify/nostrify";
import {getTag, nostrNow} from "@/utils/nostrUtils";

export interface IPurser {
    run(): Promise<void>;
}

export type OnMessageFn = (message: NostrEvent) => void

export class Purser implements IPurser {

    private relay?: NRelay1;
    // private relayAddress = "wss://tollbooth.stens.dev"
    private relayAddress = "ws://localhost:7777"
    private accesspointAPubkey = "02d9613afcd8c0e292dab9dfccf5fd508e323eecedd84530afd81d506da3703c" // Same as tollbooth page!

    constructor() {

    }

    public async run(): Promise<void> {
        // this.relay = new NRelay1(this.relayAddress)
        //
        // for await (const msg of this.relay.req([{ kinds: [55555], since: nostrNow()  }])) {
        //     if (msg[0] === 'EVENT') {
        //         await this.handleConnectionRequest(msg[2])
        //     }
        //     // if (msg[0] === 'EOSE') break; // Sends a `CLOSE` message to the relay.
        // }
    }


    private async handleConnectionRequest(request: NostrEvent) {
        // TODO: validate cashu
        // TODO: encrypt/decrypt

        const macAddress = getTag(request, 'mac')?.[1]

        if(!macAddress){
            console.error("No mac address found")
            return;
        }

        // npub15ptlwslv48h7njt7vdvt72ehkpf5jq57m74p5hnwpsghlj2mjy2qxj7xeh
        // (hex) a057f743eca9efe9c97e6358bf2b37b05349029edfaa1a5e6e0c117fc95b9114
        const signer = new NSecSigner("d14eac761399681eeccebf7ea6761aca1d7fa69226bc7e8d3c46bfcd88505ae5");

        const note = {
            kind: 66666,
            pubkey: signer.getPublicKey(),
            content: "cashuAbcde",
            created_at: nostrNow(),
            tags: [
                ["p", this.accesspointAPubkey],
                ["mac", macAddress],
                ["session-end", `${nostrNow() + 600}`], // 1 min access
            ],
        };
        const signedEvent = await signer.signEvent(note);

        console.log(`sending to tollgate: ${JSON.stringify(signedEvent)}`);
        await this.relay!.event(signedEvent);

    }
}
