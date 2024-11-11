<script lang="ts">
	import * as DropdownMenu from "@/components/ui/dropdown-menu";
	import * as Avatar from "@/components/ui/avatar";
	import { Button } from "@/components/ui/button";
	import {getProfile, pool} from "@/index";

	type UserProfile = {
		username: string;
		displayName: string;
		about: string;
		picture: string;
		banner: string;
		nip05: string;
	}

	let userProfile: UserProfile | undefined;

	async function logout() {
		userProfile = undefined;
	}

	async function login() {
		if(!window.nostr) {
			console.log("No window.nostr");
			return;
		}

		console.log("Logging in user");
		const userPubkey = await window.nostr.getPublicKey()

		if(!userPubkey){
			console.log("User did not provide pubkey, cannot load profile.");
			return;
		}

		const profileMetaDataEvent = await getProfile(userPubkey);

		if(!profileMetaDataEvent){
			console.log("User profile not found.");
			return;
		}

		try{
			userProfile = JSON.parse(profileMetaDataEvent.content);
		} catch (e) {
			console.error("Unable to parse user profile content", e);
			return;
		}

		console.log(userProfile);
	}

</script>

{#await login()}
{/await}

<DropdownMenu.Root>
	<DropdownMenu.Trigger asChild let:builder>
		<Button variant="ghost" builders={[builder]} class="relative h-8 w-8 rounded-full">
			<Avatar.Root class="h-8 w-8">
				<Avatar.Image src="{userProfile?.picture}" alt="@pf" />
				<Avatar.Fallback>?</Avatar.Fallback>
			</Avatar.Root>
		</Button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="w-56" align="end">
		{#if userProfile}
			<DropdownMenu.Label class="font-normal">
				<div class="flex flex-col space-y-1">
					<p class="text-sm font-medium leading-none">{userProfile?.displayName}</p>
					<p class="text-muted-foreground text-xs leading-none">{userProfile?.nip05}</p>
				</div>
			</DropdownMenu.Label>

			<DropdownMenu.Separator />
			<DropdownMenu.Item on:click={logout}>
				Log out
			</DropdownMenu.Item>
		{:else}
			<DropdownMenu.Item on:click={login}>
				Log in
			</DropdownMenu.Item>
		{/if}
	</DropdownMenu.Content>
</DropdownMenu.Root>
