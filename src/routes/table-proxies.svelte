<script lang="ts">

    import { type NostrEvent } from "@nostrify/nostrify";

    import {getTag, nostrNow, getTags} from "@/utils/nostrUtils";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Avatar from "$lib/components/ui/avatar/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
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
            urls: getTags(evnt, 'url') ?? [],
            pubkey: evnt.pubkey,
            statusColor: getStatusColor(evnt.created_at),
            mint: getTag(evnt, 'mint')?.[1] ?? "?",
            hidden: true
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
            <Table.Row on:click={() => proxyDTOs[i].hidden = !proxyDTOs[i].hidden}>
                <Table.Cell class="font-medium">
                    <Avatar.Root>
                        <Avatar.Image src="{proxy.picture}" alt="@profilePicture" />
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
            <Table.Row hidden="{proxy.hidden}">
                <Table.Cell colSpan={8}>
                    <div class="grid md:grid-cols-4 gap-4 col-span-full">
                        <div class="flex flex-col">
                            <Card.Root class="w-[250px] flex flex-col space-y-1.5 p-6 pb-0">
                                <Card.Content>
                                    <img src="{proxy.picture}" alt="@profilePicture" />
                                </Card.Content>
                            </Card.Root>
                        </div>
                        <div class="flex flex-col">
                            <Card.Root class="flex flex-col">
                                <Card.Header>
                                    <Card.Title>Networks</Card.Title>
                                </Card.Header>
                                <Card.Content>
                                    {#each proxy.urls as url}
                                        {url[2]} - {url[1]} <Button variant="secondary" on:click={() => navigator.clipboard.writeText(url[1])}><CopyIcon class="text-muted-foreground h-4 w-4" /></Button><br/>
                                    {/each}
                                </Card.Content>
                            </Card.Root>
                        </div>
                    </div>


                </Table.Cell>
            </Table.Row>
        {/each}
    </Table.Body>
</Table.Root>