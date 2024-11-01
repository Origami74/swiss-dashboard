import { NPool, NRelay1 } from "@nostrify/nostrify";


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