<script lang="ts">
    import {
        Button,
        buttonVariants
    } from "$lib/components/ui/button/index.js";
    import * as Dialog from "$lib/components/ui/dialog/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import Terminal from "lucide-svelte/icons/terminal";
    import * as Alert from "$lib/components/ui/alert/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import {Checkbox} from "@/components/ui/checkbox";
    import * as Select from "$lib/components/ui/select/index.js";
    import {Textarea} from "@/components/ui/textarea";
    import { type NostrEvent, NSecSigner } from "@nostrify/nostrify";
    import {nostrNow} from "@/utils/nostrUtils";
    import {pool} from "@/index";
    import {PartyPopper} from "lucide-svelte";

    type Category = {
        value: string;
        label: string;
    }

    const categories: Category[] = [
        { value: "bug", label: "Report a bug" },
        { value: "feature", label: "Request a Feature" },
        { value: "other", label: "Other" }
    ];

    let sendAnonymously  = true;
    let category: Category;
    let subject: string = ""
    let message: string = ""

    let dialogOpen: boolean = false;
    let thankYouVisible: boolean = false;

    async function submit() {
        console.log("submit");
        console.log(sendAnonymously);
        console.log(category);
        console.log(message);
        console.log(subject);


        const content = {
            category: category?.value ?? categories[2],
            subject: subject,
            message: message,
            hostname: window.location.origin,
            path: window.location.pathname,
        }
        const signer = new NSecSigner("4e007801c927832ebfe06e57ef08dba5aefe44076a0add96b1700c9061313490");

        const note = {
            kind: 1111,
            pubkey: signer.getPublicKey(),
            content: message,
            created_at: nostrNow(),
            tags: [
                ["p", "dad27bfb79b5e8aea20af096e10a44df9b29739d8f30d7033a66f607d4323c0d"],
                ["A", "naddr1qvzqqqrhnypzpwa4mkswz4t8j70s2s6q00wzqv7k7zamxrmj2y4fs88aktcfuf68qy88wumn8ghj7mn0wvhxcmmv9uqq7umhd9ehxttyv9ekscn0v9exg6vhflj"],
                ["K", "30617"],
                ["subject", content.subject],
                ["host", content.hostname],
                ["path", content.path],
                ["category", content.category.toString()]
            ],
        };
        const event = await signer.signEvent(note);

        await pool.event(event);

        thankYouMessage()
        resetDialog();
    }

    function thankYouMessage(){
        thankYouVisible = true;

        setTimeout( () => thankYouVisible = false, 5000);
    }
    function setOpen(isOpen: boolean) {
        dialogOpen = isOpen;
    }

    function resetDialog(){
        sendAnonymously = true;
        subject = ""
        message = ""
        dialogOpen = false;
    }

</script>

<Dialog.Root open={dialogOpen} onOpenChange={setOpen}>
    <Dialog.Trigger class={buttonVariants({ variant: "default" })}>Send Feedback</Dialog.Trigger>
    <Dialog.Content class="sm:max-w-[425px]">
        <Dialog.Header>
            <Dialog.Title>Send Feedback</Dialog.Title>
            <Dialog.Description>
                Send feedback to the developer of this application.
            </Dialog.Description>
        </Dialog.Header>
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
                <Checkbox class="text-right" checked={sendAnonymously} />
                <Label for="name" class="text-left col-span-3">Send anonymously</Label>
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="category" class="text-right">Category</Label>
                <Select.Root portal={null} bind:selected={category}>
                    <Select.Trigger class="col-span-3">
                        <Select.Value placeholder="Select a category"></Select.Value>
                    </Select.Trigger>
                    <Select.Content>
                        <Select.Group>
                            <Select.Label>Categories</Select.Label>
                            {#each categories as category}
                                <Select.Item value={category.value} label={category.label}>{category.label}</Select.Item>
                            {/each}
                        </Select.Group>
                    </Select.Content>
                    <Select.Input name="favoriteFruit" />
                </Select.Root>
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="subject" class="text-right">Subject</Label>
                <Input id="subject" placeholder="Subject" class="col-span-3" bind:value="{subject}"></Input>
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
                <Label for="message" class="text-right">Message</Label>
                <Textarea id="message" placeholder="Write down your feedback here" class="col-span-3" bind:value="{message}"></Textarea>
            </div>
        </div>
        <Dialog.Footer>
            <Dialog.Close asChild>
                <Button on:click={async () => await submit()}>Save changes</Button>
            </Dialog.Close>
<!--            <Button type="submit" on:click={async () => await submit()}>Send feedback</Button>-->
        </Dialog.Footer>
    </Dialog.Content>
</Dialog.Root>

<Alert.Root hidden="{!thankYouVisible}">
    <PartyPopper class="h-4 w-4" />
    <Alert.Title>Thank You!</Alert.Title>
    <Alert.Description>Your feedback has been sent</Alert.Description>
</Alert.Root>


