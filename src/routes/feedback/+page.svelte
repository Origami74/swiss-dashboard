<script lang="ts">
	import { accounts, mails } from "./data.js";
	import Mail from "./(components)/mail.svelte";
	import {pool} from "@/index";
	import { NRelay1, NPool, type NostrEvent, NCache } from "@nostrify/nostrify";

	import {writable, type Writable} from "svelte/store";
	import {getTag} from "@/utils/nostrUtils";
	import {Address} from "@welshman/util";

	export let data;

	const cache = new NCache({ max: 1000 });
	let reactions: Writable<Mail[]> = writable([]);

	const filters = [
		{
			kinds: [1111],
			// "#A": ["naddr1qvzqqqrhnypzpwa4mkswz4t8j70s2s6q00wzqv7k7zamxrmj2y4fs88aktcfuf68qy88wumn8ghj7mn0wvhxcmmv9uqq7umhd9ehxttyv9ekscn0v9exg6vhflj"],
			limit: 10,
			since: Math.round(Date.now() / 1000) - 5 * 60
		}
	]

	async function init() {
		for await (const msg of pool.req(filters, {})) {

			if (msg[0] === 'EVENT') {
				await handle(msg[2])
				continue;
			}
			if (msg[0] !== 'EOSE') {
				console.log(`No more historic messages`)
			}
		}
	}

	async function handle(nostrEvent: NostrEvent) {
		if (cache.has(nostrEvent)) {
			return;
		}

		cache.add(nostrEvent);

		console.log(nostrEvent);

		const mail = {
			id: nostrEvent.id,
			senderPubkey: nostrEvent.pubkey,
			name: nostrEvent.pubkey,
			subject: getTag(nostrEvent, 'subject')?.[1] ?? "n/a",
			host: getTag(nostrEvent, 'host')?.[1] ?? "n/a",
			path: getTag(nostrEvent, 'path')?.[1] ?? "n/a",
			category: getTag(nostrEvent, 'category')?.[1] ?? "n/a",
			repoAddress: Address.fromNaddr(getTag(nostrEvent, 'A')?.[1]) ?? null,
			email: "williamsmith@example.com",
			text: nostrEvent.content,
			date: "2023-10-22T09:00:00",
			read: true,
			labels: ["meeting", "work", "important"],
		}

		console.log(mail.repoAddress)
		mails.push(mail);

		reactions.update(reactions => reactions.concat([mail]))
		console.log("added")
	}

</script>

{#await init()}
{/await}
<Mail
	{accounts}
	{mails}
	bind:reactions="{$reactions}"
	defaultLayout={data.layout}
	defaultCollapsed={data.collapsed}
	navCollapsedSize={4}
/>
