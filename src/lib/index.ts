import { NPool, NRelay1, type NostrEvent } from "@nostrify/nostrify";


const relays = ["wss://relay.nostr.watch","wss://relay.damus.io/"];

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
        authors: [pubkey],
        limit: 1
    }
    console.log(`iterate`)
    for await (const msg of pool.req([profileFilter])) {
        console.log(`iterate`)
        if (msg[0] === 'EVENT') {
            const profileEvent = msg[2];
            try{
                return JSON.parse(profileEvent.content);
            } catch (e) {
                console.error("Unable to parse user profile content", e);
                return undefined;
            }

        }
        if (msg[0] !== 'EOSE') {
            console.log(`No profile found for ${pubkey}`)
            return undefined
        }

    }
}