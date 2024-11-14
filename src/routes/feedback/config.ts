import type { Icon } from "lucide-svelte";
import type { ComponentType } from "svelte";
import * as Icons from "./icons.js";

export type Route = {
	title: string;
	label: string;
	icon: ComponentType<Icon>;
	variant: "default" | "ghost";
};

export const primaryRoutes: Route[] = [
	{
		title: "Inbox",
		label: "128",
		icon: Icons.Inbox,
		variant: "default",
	},
	{
		title: "Issues",
		label: "9",
		icon: Icons.File,
		variant: "ghost",
	},
	{
		title: "Junk",
		label: "23",
		icon: Icons.ArchiveX,
		variant: "ghost",
	},
	{
		title: "Trash",
		label: "",
		icon: Icons.Trash2,
		variant: "ghost",
	},
];

export const secondaryRoutes: Route[] = [
	{
		title: "Other",
		label: "1",
		icon: Icons.Users,
		variant: "ghost",
	}
];
