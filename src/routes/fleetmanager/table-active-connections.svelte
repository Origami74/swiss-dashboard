<script lang="ts">

    import { type NostrEvent } from "@nostrify/nostrify";

    import {getTag, nostrNow, getTags} from "@/utils/nostrUtils";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import {CopyIcon, Heart, HeartPulseIcon} from "lucide-svelte";


    type TollgateSession = {
        mac: string;
        endTime: string;
    }

    export let sessions: NostrEvent[];
    $: sessionDTOs = sessions.map(sessionEvent => {
        return {
            mac: getTag(sessionEvent, 'mac')?.[1] ?? "?",
            endTime: getTag(sessionEvent, 'session-end')?.[1] ?? "?",
        }
    })
</script>

<Table.Root>
    <Table.Caption>A list of Epoxy proxies.</Table.Caption>
    <Table.Header>
        <Table.Row>
            <Table.Head>Mac Address</Table.Head>
            <Table.Head>EndTime</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each sessionDTOs as session, i (i)}
            <Table.Row>
                <Table.Cell>{session.mac}</Table.Cell>
                <Table.Cell>{session.endTime}</Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>