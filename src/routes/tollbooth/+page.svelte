<script lang="ts">

import {Button} from "$lib/components/ui/button/index.js";
import {Input} from "@/components/ui/input";
import LocalWallet from "./local-wallet"
import {getDecodedToken, getEncodedToken, PaymentRequest} from "@cashu/cashu-ts";
import { NPool, NRelay1, NSecSigner, type NostrEvent } from "@nostrify/nostrify";
import {nostrNow} from "@/utils/nostrUtils";

let balance = "0"
let unit = ""

let depositValue = ""
let withDrawToken = ""

let logs = ""

let wallet = new LocalWallet();

async function onPaymentRequest(request: PaymentRequest) {
    try {
        const amountStr = prompt(
            [`Payment required (${request.amount}${request.unit ?? ""}/Min)`].join("\n"),
        );
        if (!amountStr) return null;
        const amount = parseInt(amountStr);
        const token = await wallet.send(amount);
        updateWallet();

        if (amount) {
            console.log(`+ Paid ${amount} ${request.unit}`);
            return getEncodedToken({ token: [token] });
        }
    } catch (error) {
        console.log(error)
        if (error instanceof Error) alert(error.message);
    }
    return null;
}

let randomPrivateKey = "4e007801c927832ebfe06e57ef08dba5aefe44076a0add96b1700c9061313490"

let tollgatePubkey = "c1f4c025e746fd307203ac3d1a1886e343bea76ceec5e286c96fb353be6cadea"
let tollgateRelay = "ws://192.168.21.21:2121/"
// let tollgateRelay = "ws://localhost:3334"
let tollgateProduct = "min"
let tollgatePriceUnit = "sat"
let tollgateMint = "https://mint.minibits.cash/Bitcoin"
let tollgatePrice = 3

let myMacAddress = "74:a6:cd:cc:ef:e0"

let productAmount = 1
$:paymentAmount = productAmount * tollgatePrice

let relay: NRelay1;
$:relayReachable = relay !== undefined && relay?.socket.readyState == WebSocket.OPEN;

async function getRelayStatus(){
    log("getting relay status")
    try{
        relay = new NRelay1(tollgateRelay)
        relay.socket.addEventListener("open", () => {
            relayReachable = true;
        })
        relay.socket.addEventListener("close", () => {
            relayReachable = false;
        })
        for await (const msg of relay.req([{ kinds: [1], limit: 1 }])) {
            if (msg[0] === 'EVENT') console.log(msg[2]);
            if (msg[0] === 'EOSE') break; // Sends a `CLOSE` message to the relay.
        }
    } catch (error) {
        log(`Error connecting to relay: ${error.message}`);
    }
}

function log(message: string) {
    logs += message + "\n";
    console.log(message)
}

function updateWallet() {
    const total = wallet.getBalance();

    balance = String(total);
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

async function connect() {
    const signer = new NSecSigner(randomPrivateKey);

    const note = {
        kind: 21000,
        pubkey: signer.getPublicKey(),
        content: "cashuAbcde",
        created_at: nostrNow(),
        tags: [
            ["p", tollgatePubkey],
            ["mac", myMacAddress],
        ],
    };
    const event = await signer.signEvent(note);

    log(`sending: ${JSON.stringify(event)}`);
    await relay.event(event);
}

</script>

{#await getRelayStatus()}

{/await}

<div class="flex-1 space-y-4 p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">Toll Booth</h2>
        <div class="flex items-center space-x-2">

        </div>
    </div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div class="bg-card text-card-foreground rounded-xl border shadow col-span-4">
            <div class="flex flex-col space-y-1.5 p-6 pb-0">
                <h3 class="font-semibold leading-none tracking-tight">Information</h3>
            </div>
            <div class="flex flex-col space-y-1.5 p-6 pb-0">
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-1 gap-2" >Router IP</div>
                    <div class="flex col-span-7 gap-2 pl-2">???</div>
                </div>
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-1 gap-2" >Public Key</div>
                    <div class="flex col-span-7 gap-2 pl-2">{tollgatePubkey}</div>
                </div>
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-1 gap-2" >Relay</div>
                    <div class="flex col-span-7 gap-2 pl-2">{tollgateRelay} ({relayReachable ? "online" : "unreachable"})</div>
                </div>
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-1 gap-2" >Price</div>
                    <div class="flex col-span-7 gap-2 pl-2">{tollgatePrice}/{tollgateProduct} ({tollgatePriceUnit})</div>
                </div>
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-5 gap-2" >MAC address</div>
                    <div class="flex col-span-3 gap-2" ><Input bind:value={myMacAddress} placeholder="00:25:96:FF:FE:12:34:56"></Input></div>
                </div>
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-5 gap-2" >Buy</div>
                    <div class="flex col-span-1 gap-2" >amount</div>
                    <div class="flex col-span-1 gap-2" ><Input bind:value={productAmount} placeholder="21"></Input></div>
                    <div class="flex col-span-1 gap-2 pl-2">
                        <Button on:click={() => {productAmount--}}>-</Button>
                        <Button on:click={() => {productAmount++}}>+</Button>
                    </div>
                </div>
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-5 gap-2" >Total:</div>
                    <div class="flex col-span-1 gap-2" >{tollgatePriceUnit}</div>
                    <div class="flex col-span-1 gap-2" >
                        <Input disabled="{true}" bind:value={paymentAmount} placeholder="21 sats"></Input>
                    </div>
                    <div class="flex col-span-1 gap-2  pl-2" >
                        <Button on:click={connect}>Connect</Button>
                    </div>
                </div>

            </div>
            <div class="grid md:grid-cols-8 p-2">
<!--                <div class="flex flex-col col-start-8 col-span-1 gap-2 pl-2">-->
<!--                    <Button >Connect</Button>-->
<!--                </div>-->
<!--                <div class="flex flex-col col-start-0 col-span-8 gap-2 pl-2">-->
<!--                    {#if logs !== ''}<Textarea value="{logs}"></Textarea>{/if}-->
<!--                </div>-->
            </div>
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
        </div>
    </div>

</div>