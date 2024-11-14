import type { ComponentType } from "svelte";
import type { Icon } from "lucide-svelte";
import Vercel from "./(components)/icons/vercel.svelte";
import ICloud from "./(components)/icons/icloud.svelte";
import Gmail from "./(components)/icons/gmail.svelte";
import type {Address} from "@welshman/util";

export const mails = [
	{
		id: "6c84fb90-12c4-11e1-840d-7b25c5ee775a",
		name: "William Smith",
		email: "williamsmith@example.com",
		subject: "Meeting Tomorrow",
		text: "Hi, let's have a meeting tomorrow to discuss the project. I've been reviewing the project details and have some ideas I'd like to share. It's crucial that we align on our next steps to ensure the project's success.\n\nPlease come prepared with any questions or insights you may have. Looking forward to our meeting!\n\nBest regards, William",
		date: "2023-10-22T09:00:00",
		read: true,
		labels: ["meeting", "work", "important"],
	},
	{
		id: "6c9a7f94-8329-4d70-95d3-51f68c186ae1",
		name: "Samuel Turner",
		email: "samuelturner@example.com",
		subject: "Weekend Hike",
		text: "Who's up for a weekend hike in the mountains? I've been craving some outdoor adventure, and a hike in the mountains sounds like the perfect escape. If you're up for the challenge, we can explore some scenic trails and enjoy the beauty of nature.\n\nI've done some research and have a few routes in mind.\n\nLet me know if you're interested, and we can plan the details.\n\nIt's sure to be a memorable experience! Samuel",
		date: "2022-07-28T17:30:00",
		read: false,
		labels: ["personal"],
	},
];

// export type Mail = (typeof mails)[number];

export type Mail = {
	id: string,
	senderPubkey: string
	repoAddress?: Address
	name: string
	email: string
	category: string
	host: string
	path: string
	subject: string
	text: string
	date: string
	read: boolean,
	labels: string[]
}

export type Project = {
	displayName: string;
	identifier: string;
	repoAddress: string;
	icon: ComponentType<Icon>;
};

export const accounts: Project[] = [
	{
		displayName: "SwissDash",
		identifier: "swiss-dashboard",
		repoAddress: "naddr1qvzqqqrhnypzpwa4mkswz4t8j70s2s6q00wzqv7k7zamxrmj2y4fs88aktcfuf68qy88wumn8ghj7mn0wvhxcmmv9uqq7umhd9ehxttyv9ekscn0v9exg6vhflj",
		icon: ICloud,
	},
	{
		displayName: "Epoxy Reverse Proxy",
		identifier: "nostr-epoxy-reverse-proxy",
		repoAddress: "naddr1qvzqqqrhnypzpwa4mkswz4t8j70s2s6q00wzqv7k7zamxrmj2y4fs88aktcfuf68qythwumn8ghj7un9d3shjtnwdaehgu3wvfskuep0qqvkummnw3ez6etsdau8jttjv4mx2unnv5khqun00pus837pe9",
		icon: ICloud,
	},
	{
		displayName: "Onion Peeler",
		identifier: "nostr-onion-peeler",
		repoAddress: "naddr1qvzqqqrhnypzpwa4mkswz4t8j70s2s6q00wzqv7k7zamxrmj2y4fs88aktcfuf68qythwumn8ghj7un9d3shjtnwdaehgu3wvfskuep0qqvkummnw3ez6etsdau8jttjv4mx2unnv5khqun00pus837pe9",
		icon: ICloud,
	}
];

export const contacts = [
	{
		name: "Emma Johnson",
		email: "emma.johnson@example.com",
	},
	{
		name: "Liam Wilson",
		email: "liam.wilson@example.com",
	},
	{
		name: "Olivia Davis",
		email: "olivia.davis@example.com",
	},
	{
		name: "Noah Martinez",
		email: "noah.martinez@example.com",
	},
	{
		name: "Ava Taylor",
		email: "ava.taylor@example.com",
	},
	{
		name: "Lucas Brown",
		email: "lucas.brown@example.com",
	},
	{
		name: "Sophia Smith",
		email: "sophia.smith@example.com",
	},
	{
		name: "Ethan Wilson",
		email: "ethan.wilson@example.com",
	},
	{
		name: "Isabella Jackson",
		email: "isabella.jackson@example.com",
	},
	{
		name: "Mia Clark",
		email: "mia.clark@example.com",
	},
	{
		name: "Mason Lee",
		email: "mason.lee@example.com",
	},
	{
		name: "Layla Harris",
		email: "layla.harris@example.com",
	},
	{
		name: "William Anderson",
		email: "william.anderson@example.com",
	},
	{
		name: "Ella White",
		email: "ella.white@example.com",
	},
	{
		name: "James Thomas",
		email: "james.thomas@example.com",
	},
	{
		name: "Harper Lewis",
		email: "harper.lewis@example.com",
	},
	{
		name: "Benjamin Moore",
		email: "benjamin.moore@example.com",
	},
	{
		name: "Aria Hall",
		email: "aria.hall@example.com",
	},
	{
		name: "Henry Turner",
		email: "henry.turner@example.com",
	},
	{
		name: "Scarlett Adams",
		email: "scarlett.adams@example.com",
	},
];

export type Contact = (typeof contacts)[number];
