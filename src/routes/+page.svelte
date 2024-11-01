<script lang="ts">

    import Download from "lucide-svelte/icons/download";
    import Users from "lucide-svelte/icons/users";

    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import ProxiesTab from "./tab-proxies.svelte";
    import RelaysTab from "./tab-relays.svelte";
</script>



<div class="flex-1 space-y-4 p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div class="flex items-center space-x-2">
<!--                <DatePickerWithRange />-->
            <Button size="sm">
                <Download class="mr-2 h-4 w-4" />
                Download
            </Button>
        </div>
    </div>
    <Tabs.Root value="proxies" class="space-y-4">
        <Tabs.List>
            <Tabs.Trigger value="proxies">Proxies (Epoxy)</Tabs.Trigger>
            <Tabs.Trigger value="relays">Relays</Tabs.Trigger>
            <Tabs.Trigger value="mints" disabled>Mints</Tabs.Trigger>
        </Tabs.List>
        <ProxiesTab></ProxiesTab>
        <RelaysTab></RelaysTab>
    </Tabs.Root>
</div>