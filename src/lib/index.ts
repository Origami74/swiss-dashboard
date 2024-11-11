import { NPool, NRelay1, type NostrEvent } from "@nostrify/nostrify";


const relays = ["wss://relay.nostr.watch","wss://relay.damus.io/", "wss://relay.primal.net/"];

export const pool = new NPool({
    open(url) {
        return new NRelay1(url);
    },
    // deno-lint-ignore require-await
    reqRouter: async (filters) => {
        return new Map(
            relays.map((relay) => {
                return [relay, filters];
            }),
        );
    },
    // deno-lint-ignore require-await
    eventRouter: async (_event) => {
        return relays;
    },
});


export async function getProfile(pubkey: string): Promise<NostrEvent | undefined> {
    const profileFilter = {
        kinds: [0],
        authors: [pubkey]
    }

    for await (const msg of pool.req([profileFilter], {})) {
        if (msg[0] === 'EVENT') {
            return msg[2]
        }
        if (msg[0] !== 'EOSE') {
            console.log(`No profile found for ${pubkey}`)
            return undefined
        }
    }
}