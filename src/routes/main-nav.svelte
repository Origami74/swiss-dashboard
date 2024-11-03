<script lang="ts">
	import { cn } from "$lib/utils.js";
	import {Button} from "@/components/ui/button";
	import {FeedbackForm} from "./index";

	let className: string | undefined | null = undefined;
	export { className as class };

	let feedbackOpen = false;
	function openFeedbackForm() {
		feedbackOpen = true;
	}

</script>

<nav class={cn("flex items-center space-x-4 lg:space-x-6", className)}>
	<a href="/" class="hover:text-primary text-sm font-medium transition-colors">
		Dashboard
	</a>

	<a
		href="/route-builder"
		class="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
	>
		Route Builder
	</a>
	<a
		href="/examples/dashboard"
		class="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
	>
		Products
	</a>
	<a
		href="/examples/dashboard"
		class="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
	>
		Settings
	</a>
	<FeedbackForm/>
</nav>


