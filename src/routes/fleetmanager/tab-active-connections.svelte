<script lang="ts">
import DollarSign from "lucide-svelte/icons/dollar-sign";
import Users from "lucide-svelte/icons/users";
import Activity from "lucide-svelte/icons/activity";
import CreditCard from "lucide-svelte/icons/credit-card";

import * as Card from "$lib/components/ui/card/index.js";
import * as Tabs from "$lib/components/ui/tabs/index.js";
import { NRelay1, NPool, type NostrEvent, NCache } from "@nostrify/nostrify";

import {writable, type Writable} from "svelte/store";
import {SessionsTable} from "./index";
import {getTag, nostrNow} from "@/utils/nostrUtils";

let relay: NRelay1
const relayAddress = "wss://tollbooth.stens.dev"

const cache = new NCache({ max: 1000 });
let sessions: Writable<NostrEvent[]> = writable([]);
async function getSessions() {
    for await (const msg of relay.req([{ kinds: [66666] }])) {
        if (msg[0] === 'EVENT') {
            await handleSessionEvent(msg[2])
        }
        // if (msg[0] === 'EOSE') break; // Sends a `CLOSE` message to the relay.
    }
}

async function handleSessionEvent(session: NostrEvent) {
    console.log("new session event")
    if(cache.has(session)){
        return;
    }

    const sessionEndTime = getTag(session, "session-end")?.[1];

    if(!sessionEndTime || isNaN(Number(sessionEndTime)) || Number(sessionEndTime) < nostrNow()){
        console.log(`Session expired, skipping...`)
        return;
    }

    sessions.update(px => px.concat([session]))
}

async function init() {
    relay = new NRelay1(relayAddress);
    await getSessions()
}

</script>

{#await init()}
{/await}

<Tabs.Content value="active" class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card.Root>
            <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                <Card.Title class="text-sm font-medium">Active Sessions</Card.Title>
                <DollarSign class="text-muted-foreground h-4 w-4" />
            </Card.Header>
            <Card.Content>
                <div class="text-2xl font-bold">{$sessions.length}</div>
                <!--                        <p class="text-muted-foreground text-xs">+20.1% from last month</p>-->
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Header
                    class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
                <Card.Title class="text-sm font-medium">Subscriptions</Card.Title>
                <Users class="text-muted-foreground h-4 w-4" />
            </Card.Header>
            <Card.Content>
                <div class="text-2xl font-bold">+2350</div>
                <p class="text-muted-foreground text-xs">+180.1% from last month</p>
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Header
                    class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
                <Card.Title class="text-sm font-medium">Sales</Card.Title>
                <CreditCard class="text-muted-foreground h-4 w-4" />
            </Card.Header>
            <Card.Content>
                <div class="text-2xl font-bold">+12,234</div>
                <p class="text-muted-foreground text-xs">+19% from last month</p>
            </Card.Content>
        </Card.Root>
        <Card.Root>
            <Card.Header
                    class="flex flex-row items-center justify-between space-y-0 pb-2"
            >
                <Card.Title class="text-sm font-medium">Active Now</Card.Title>
                <Activity class="text-muted-foreground h-4 w-4" />
            </Card.Header>
            <Card.Content>
                <div class="text-2xl font-bold">+573</div>
                <p class="text-muted-foreground text-xs">+201 since last hour</p>
            </Card.Content>
        </Card.Root>
    </div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <Card.Root class="col-span-4">
            <Card.Header>
                <Card.Title>Overview</Card.Title>
            </Card.Header>
            <Card.Content>
                <SessionsTable bind:sessions="{$sessions}" />
            </Card.Content>
        </Card.Root>
    </div>
</Tabs.Content>