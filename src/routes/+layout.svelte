<script lang="ts">
	import '../app.css';
    import { ModeWatcher } from "mode-watcher";
    import {DashboardMainNav, Search, TeamSwitcher, UserNav} from "./index";
	let { children } = $props();

</script>

<div class="border-b">
    <div class="flex h-16 items-center px-4">
        <TeamSwitcher />
        <DashboardMainNav class="mx-6" />
        <div class="ml-auto flex items-center space-x-4">
            <Search />
            <UserNav />
        </div>
    </div>
</div>
<ModeWatcher/>
<!--<div class="md:hidden">-->
<!--        <enhanced:img src={DashboardLight} alt="Dashboard" class="block dark:hidden" />-->
<!--        <enhanced:img src={DashboardDark} alt="Dashboard" class="hidden dark:block" />-->
<!--</div>-->
{@render children()}
