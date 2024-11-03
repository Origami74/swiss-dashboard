<script lang="ts">

import {Button} from "$lib/components/ui/button/index.js";
import {Input} from "@/components/ui/input";
import LocalWallet from "./local-wallet"
import {getDecodedToken, getEncodedToken} from "@cashu/cashu-ts";
import {Textarea} from "@/components/ui/textarea";

import { ProxyWebSocket} from "./ws";
import {CopyIcon} from "lucide-svelte";

let ws: ProxyWebSocket | WebSocket | undefined = undefined;

let balance = "0"
let mint = ""
let unit = ""

let depositValue = ""
let withDrawToken = ""

let logs = ""

let wallet = new LocalWallet();

let setupLocked = false
let showFilter = false
let defaultFilter = "[\"REQ\", \"testing\", {\"kinds\": [0]}]"
let hops = ["wss://proxy.stens.dev", "wss://relay.damus.io"]

function removeHop(index: number) {
    hops = hops.toSpliced(index, 1);
}

function addHop(afterIndex: number) {
    hops = hops.toSpliced(afterIndex + 1, 0, "");
}

function log(message: string) {
    logs += message + "\n";
    console.log(message)
}

function relayRequest(){
    console.log("relayRequest");
    try{
        ws.send(defaultFilter)
    } catch (e) {
        console.log(`error sending relayRequest: ${e}`)
    }
}

let incomingEvents: string[] = []
function incomingEvent(eventData: string){
    incomingEvents = incomingEvents.concat(eventData)
}

function connect(){
    setupLocked = true;

    ws?.close();
    try {
        setupLocked = true;

        const proxyUrl = hops[0];
        const otherHops = hops.slice(1);

        log("+ Connecting...");

        if (otherHops.length > 0) {
            const proxy = (ws = new ProxyWebSocket(proxyUrl, otherHops));

            proxy.onPaymentRequest = async (socket, hop, request) => {
                try {
                    log(`+ Payment Required`);
                    const amountStr = prompt(
                        [`Payment required (${request.price}${request.unit ?? ""}/KiB)`, `To relay: ${hop}`].join("\n"),
                    );
                    if (!amountStr) return null;
                    const amount = parseInt(amountStr);
                    const token = await wallet.send(amount);
                    updateWallet();

                    if (amount) {
                        log("+ Paid");
                        return token.proofs;
                    }
                } catch (error) {
                    console.log(error)
                    if (error instanceof Error) alert(error.message);
                }
                return null;
            };

            proxy.onproxy = (hop) => {
                log(`+ Connected to ${hop}`);
            };
        } else {
            ws = new WebSocket(proxyUrl);
        }

        ws.onopen = () => {
            log("+ Connected");
            showFilter = true;
        };

        ws.onerror = (e) => {
            // @ts-expect-error
            log("+ Error " + e.message);
        };

        ws.onclose = () => {
            log("+ Closed");
            showFilter = false;
        };

        ws.onmessage = (event) => {
            incomingEvent(event.data);
        };
    } catch (error) {
        console.log(error)
        if (error instanceof Error) alert(error.message);
    }

    setupLocked = false;
}

function updateWallet() {
    const total = wallet.getBalance();

    balance = String(total);
    mint = "";
}

async function deposit() {
    console.log(`deposit: ${depositValue}`);

    try{
        const parsed = getDecodedToken(depositValue);
        unit = parsed.unit ?? "?unit"
        for (const entry of parsed.token) {
            await wallet.receive(entry);
            updateWallet();
        }
    } catch (error) {
        console.log(error)
    }

    depositValue = ""
}

async function withdraw() {
    const entry = await wallet.send(wallet.getBalance());
    withDrawToken = getEncodedToken({ token: [entry] });
}

</script>


<div class="flex-1 space-y-4 p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Route Builder</h2>
        <div class="flex items-center space-x-2">

        </div>
    </div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div class="bg-card text-card-foreground rounded-xl border shadow col-span-4">
            <div class="flex flex-col space-y-1.5 p-6 pb-0">
                <h3 class="font-semibold leading-none tracking-tight">Overview</h3>
            </div>
            <div class="flex flex-col space-y-1.5 p-6 pb-0">
                {#each hops as hop, index}
                    <div class="grid md:grid-cols-8">
                        <div class="flex col-span-7 gap-2" >
                            <Input disabled="{setupLocked}" bind:value={hop} placeholder="wss://proxy.stens.dev"></Input>
                        </div>
                        <div class="flex col-span-1 gap-2 pl-2">
                            {#if index != 0}<Button on:click={() => removeHop(index)}>-</Button>{/if}
                            <Button disabled="{setupLocked}" on:click={() => addHop(index)}>+</Button>
                        </div>
                    </div>
                {/each}

            </div>
            <div class="grid md:grid-cols-8 p-2">
                <div class="flex flex-col col-start-8 col-span-1 gap-2 pl-2">
                    <Button on:click={connect}>Connect</Button>
                </div>
                <div class="flex flex-col col-start-0 col-span-8 gap-2 pl-2">
                    {#if logs !== ''}<Textarea value="{logs}"></Textarea>{/if}
                </div>
            </div>
            {#if showFilter}
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-7 gap-2" >
                        <Input bind:value={defaultFilter} placeholder="wss://proxy.stens.dev"></Input>
                    </div>
                    <div class="flex col-span-1 gap-2 pl-2">
                        <Button on:click={relayRequest}>Request</Button>
                    </div>
                </div>
            {/if}
        </div>

        <div class="grid md:grid-cols-1 col-span-3 gap-4">
            <div class="bg-card text-card-foreground rounded-xl border shadow col-span-3">
                <div class="flex flex-col space-y-1.5 p-6 pb-0"><h3 class="font-semibold leading-none tracking-tight">Wallet</h3>
                    <p class="text-muted-foreground text-sm">Manage your funds</p></div>
                <div class="grid md:grid-cols-3 gap-2 p-4">

                    <div class="flex bg-card text-card-foreground rounded-xl border shadow col-span-1 gap-2 p-2">
                       <h1 class="">{balance} {unit}</h1>
                    </div>
                    <div class="grid md:grid-cols-3 col-span-2">
                        <div class="flex col-span-2 gap-2" >
                            <Input bind:value={depositValue} placeholder="cashuAeyJ0b2tlb..."></Input>
                        </div>
                        <div class="flex col-span-1 gap-2 pl-2">
                            <Button on:click={deposit}>Deposit</Button>
                        </div>
                        <div class="flex col-span-2 gap-2 pt-2" >
                            <Input bind:value={withDrawToken} placeholder="token will appear here..."></Input>
                        </div>
                        <div class="flex col-span-1 gap-2 pl-2 pt-2">
                            <Button on:click={withdraw}>Withdraw</Button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="bg-card text-card-foreground rounded-xl border shadow col-span-3">
                <div class="flex flex-col space-y-1.5 p-6 pb-0"><h3 class="font-semibold leading-none tracking-tight">Proxy presets</h3>
                    <p class="text-muted-foreground text-sm">copy/paste some of these examples:</p></div>

                <div class="p-2">
                    <Button on:click={() => navigator.clipboard.writeText("wss://proxy.stens.dev")}><CopyIcon class="text-muted-foreground h-4 w-4" /></Button>wss://proxy.stens.dev
                </div>
                <div class="p-2">
                    <Button on:click={() => navigator.clipboard.writeText("wss://relay.damus.io")}><CopyIcon class="text-muted-foreground h-4 w-4" /></Button>wss://relay.damus.io
                </div>
                <div class="p-2">
                    <Button on:click={() => navigator.clipboard.writeText("ws://oxtrdevav64z64yb7x6rjg4ntzqjhedm5b5zjqulugknhzr46ny2qbad.onion")}><CopyIcon class="text-muted-foreground h-4 w-4" /></Button>Epoxy hzrd
                </div>
                <div class="p-2">

                    <Button on:click={() => navigator.clipboard.writeText("ws://437fqnfqtcaquzvs5sd43ugznw7dsoatvtskoowgnpn6q5vqkljcrsyd.onion/")}><CopyIcon class="text-muted-foreground h-4 w-4" /></Button>TOR Sattelite node
                </div>
                <div class="p-2">
                    <Button on:click={() => navigator.clipboard.writeText("6274e64ed65df73d8cdad414fbb67d9ae5d87579d8d4e1a2d19312fadbd23b3b")}><CopyIcon class="text-muted-foreground h-4 w-4" /></Button>Pubkey
                </div>
            </div>
        </div>
    </div>
    {#if incomingEvents.length > 0}
        <div class="bg-card text-card-foreground rounded-xl border shadow">
            {#each incomingEvents as incomingEvent}
             <div class="bg-card text-card-foreground rounded-xl border shadow col-span-4 p-4">{incomingEvent}</div>
            {/each}
        </div>
    {/if}

</div>