<script lang="ts">
	import { cn } from "@/utils.js";
	import {Button} from "@/components/ui/button";
	import {FeedbackForm} from "../index";

	let className: string | undefined | null = undefined;
	export { className as class };

</script>

<nav class={cn("flex items-center space-x-4 lg:space-x-6", className)}>
	<a href="/" class="hover:text-primary text-sm font-medium transition-colors">
		Dashboard
	</a>
	<a href="/route-builder" class="hover:text-primary text-sm font-medium transition-colors">
		Route Builder
	</a>
	<a href="/feedback" class="hover:text-primary text-sm font-medium transition-colors">
		Feedback
	</a>
	<a href="/tollbooth" class="hover:text-primary text-sm font-medium transition-colors">
		Tollbooth
	</a>
	<a href="/fleetmanager" class="hover:text-primary text-sm font-medium transition-colors">
		Fleet Manager
	</a>
	<a href="/actions" class="hover:text-primary text-sm font-medium transition-colors">
		GitHub Actions
	</a>
	<FeedbackForm/>
</nav>


