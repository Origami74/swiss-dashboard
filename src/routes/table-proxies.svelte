<script lang="ts">

    import { type NostrEvent } from "@nostrify/nostrify";

    import {getTag, nostrNow, getTags} from "@/utils/nostrUtils";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import {CopyIcon, Heart, HeartPulseIcon} from "lucide-svelte";


    type Profile = {
        name: string;
        about: string;
        picture: string;
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


    export let proxies: NostrEvent[];
    $: proxyDTOs = proxies.map(evnt => {
        const profile: Profile = JSON.parse(evnt.content)
        return {
            picture: profile.picture,
            name: profile.name,
            about: profile.about,
            price: Number(getTag(evnt, 'price')?.[1]) ?? 0,
            unit: getTag(evnt, 'price')?.[2] ?? "?",
            networks: getTags(evnt, 'n')?.map(nTag => nTag[1]) ?? ["?"],
            pubkey: evnt.pubkey,
            statusColor: getStatusColor(evnt.created_at),
            mint: getTag(evnt, 'mint')?.[1] ?? "?",
        }
    })
</script>

<Table.Root>
    <Table.Caption>A list of Epoxy proxies.</Table.Caption>
    <Table.Header>
        <Table.Row>
            <Table.Head class="w-[20px]"></Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head>Name</Table.Head>
            <Table.Head>Description</Table.Head>
            <Table.Head>Price</Table.Head>
            <Table.Head>Pubkey</Table.Head>
            <Table.Head>Mint</Table.Head>
            <Table.Head class="text-right">Networks</Table.Head>
        </Table.Row>
    </Table.Header>
    <Table.Body>
        {#each proxyDTOs as proxy, i (i)}
            <Table.Row>
                <Table.Cell class="font-medium">
                    <Avatar.Root>
                        <Avatar.Image src="{proxy.picture}" alt="@shadcn" />
                        <Avatar.Fallback>PX</Avatar.Fallback>
                    </Avatar.Root>
                </Table.Cell>
                <Table.Cell><HeartPulseIcon color="white" fill="{proxy.statusColor}"/></Table.Cell>
                <Table.Cell>{proxy.name}</Table.Cell>
                <Table.Cell>{proxy.about}</Table.Cell>
                <Table.Cell class="text-right">{(proxy.price * 60)} {proxy.unit}/h</Table.Cell>
                <Table.Cell>{`${proxy.pubkey.substring(0, 3)}...${proxy.pubkey.substring(61, 64)}`} <Button variant="secondary" on:click={() => navigator.clipboard.writeText(proxy.pubkey)}><CopyIcon class="text-muted-foreground h-4 w-4" /></Button></Table.Cell>
                <Table.Cell>{proxy.mint}</Table.Cell>
                <Table.Cell class="text-right">{proxy.networks.join(", ")}</Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>