<script lang="ts">

    import { type NostrEvent } from "@nostrify/nostrify";

    import {getTag, nostrNow, getTags} from "@/utils/nostrUtils";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import {CopyIcon, HeartPulseIcon} from "lucide-svelte";


    type Profile = {
        name: string;
        description: string;
        icon: string;
    }

    function getStatusColor(createdAt: number): string {

        if(createdAt > nostrNow() - (60 * 5)){
            return "green";
        }
        if(createdAt > nostrNow() - (60 * 60)){
            return "orange";
        }
        return "gray"
    }

    export let relays: NostrEvent[];
    $: relayDTOs = relays.map(evnt => {
        let profile: Profile;
        try{
            profile = JSON.parse(evnt.content)
        } catch (e){
            // ignore
        }

        // if(profile !== undefined){
        //     console.log(profile);
        // }
        return {
            // picture: profile.picture,
            name: profile?.name,
            description: profile?.description,
            icon: profile?.icon,
            locations: getTags(evnt, 'l')?.map(nTag => nTag[1]) ?? ["?"],
            networks: getTags(evnt, 'n')?.map(nTag => nTag[1]) ?? ["?"],
            addresses: getTags(evnt, 'd')?.map(nTag => nTag[1]) ?? ["?"],
            types: getTags(evnt, 'T')?.map(nTag => nTag[1]) ?? ["?"],
            supportedNips: getTags(evnt, 'N')?.map(nTag => nTag[1]) ?? ["?"],
            pubkey: evnt.pubkey,
            statusColor: getStatusColor(evnt.created_at),
            // mint: getTag(evnt, 'mint')?.[1] ?? "?",
        }
    })
</script>

<Table.Root>
    <Table.Caption>A list of Epoxy proxies.</Table.Caption>
    <Table.Header>
        <Table.Row>
            <Table.Head class="w-[20px]"></Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Pubkey</Table.Head>
            <Table.Head>Name</Table.Head>
            <Table.Head>Address</Table.Head>
            <Table.Head>Supported NIPs</Table.Head>
            <Table.Head>Networks</Table.Head>
            <Table.Head>Type</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each relayDTOs as relay, i (i)}
            <Table.Row>
                <Table.Cell class="font-medium">
                    <Avatar.Root>
                        <Avatar.Image src="{relay.icon}" alt="@shadcn" />
                        <Avatar.Fallback>PX</Avatar.Fallback>
                    </Avatar.Root>
                </Table.Cell>
                <Table.Cell><HeartPulseIcon color="white" fill="{relay.statusColor}"/></Table.Cell>
                <Table.Cell>{`${relay.pubkey.substring(0, 3)}...${relay.pubkey.substring(61, 64)}`} <Button variant="secondary" on:click={() => navigator.clipboard.writeText(relay.pubkey)}><CopyIcon class="text-muted-foreground h-4 w-4" /></Button></Table.Cell>
                <Table.Cell>{relay.name}</Table.Cell>
                <Table.Cell>{relay.addresses}</Table.Cell>
                <Table.Cell class="text-right">{relay.supportedNips.join(", ")}</Table.Cell>
                <Table.Cell class="text-right">{relay.networks.join(", ")}</Table.Cell>
                <Table.Cell class="text-right">{relay.types.join(", ")}</Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>