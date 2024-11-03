<script lang="ts">
import DollarSign from "lucide-svelte/icons/dollar-sign";
import Users from "lucide-svelte/icons/users";
import Activity from "lucide-svelte/icons/activity";
import CreditCard from "lucide-svelte/icons/credit-card";

import * as Card from "$lib/components/ui/card/index.js";
import * as Tabs from "$lib/components/ui/tabs/index.js";
import { NRelay1, NPool, type NostrEvent, NSet } from "@nostrify/nostrify";

import {writable, type Writable} from "svelte/store";


import {pool} from "@/index";
import {ProxiesTable, RelaysTable} from "./index";

const cache: NSet = new NSet();
let relays: Writable<NostrEvent[]> = writable([]);

const filters = [
    {
        kinds: [30166],
        limit: 300
        // since: Math.round(Date.now() / 1000) - 60 * 60
    }
]

async function init() {
    for await (const msg of pool.req(filters, {})) {

        if (msg[0] === 'EVENT') {
            await handle(msg[2])
            continue;
        }
        if (msg[0] !== 'EOSE') {
            console.log(`No more historic messages`)
        }
    }
}

async function handle(nostrEvent: NostrEvent) {
    if (cache.has(nostrEvent)) {
        return;
    }
    cache.add(nostrEvent);
    // console.log(nostrEvent)

    // console.log(`Handling event ${nostrEvent.id}`)
    relays.update(px => px.concat([nostrEvent]))
}

</script>

{#await init()}
{/await}

<Tabs.Content value="relays" class="space-y-4">
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card.Root>
            <Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
                <Card.Title class="text-sm font-medium">Total Proxies</Card.Title>
                <DollarSign class="text-muted-foreground h-4 w-4" />
            </Card.Header>
            <Card.Content>
                <div class="text-2xl font-bold">{$relays.length}</div>
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
                <RelaysTable bind:relays="{$relays}" />
            </Card.Content>
        </Card.Root>
    </div>
</Tabs.Content>