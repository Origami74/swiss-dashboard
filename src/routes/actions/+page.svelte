<script lang="ts">

import {Button} from "$lib/components/ui/button/index.js";
import {Input} from "@/components/ui/input";
import LocalWallet from "./local-wallet"
import {getDecodedToken, getEncodedToken, PaymentRequest} from "@cashu/cashu-ts";
import { NPool, NRelay1, NSecSigner, type NostrEvent } from "@nostrify/nostrify";
import {getParams, getTag, nostrNow} from "@/utils/nostrUtils";
import {Textarea} from "@/components/ui/textarea";

let balance = "0"
let unit = ""

let depositValue = ""
let withDrawToken = ""
let logs = ""

let wallet = new LocalWallet();

let jobRequests: NostrEvent[] = $state([])
let jobFeedbacks: NostrEvent[] = $state([])

let randomPrivateKey = "4e007801c927832ebfe06e57ef08dba5aefe44076a0add96b1700c9061313490"
let tollgatePriceUnit = "sat"
let mint = "https://mint.minibits.cash/Bitcoin"
let tollgatePrice = 3

let repositoryAddress = "naddr1qvzqqqrhnypzpwa4mkswz4t8j70s2s6q00wzqv7k7zamxrmj2y4fs88aktcfuf68qy88wumn8ghj7mn0wvhxcmmv9uq32amnwvaz7tmjv4kxz7fwv3sk6atn9e5k7tcpz9mhxue69uhkummnw3ezuamfdejj7qq0v3mx6ttrd93kgttjw4hxuetj4ux9zv"
let repositoryRef = "main"
let pipelineFilePath = ".github/workflows/ci.yaml"

let productAmount = 1
let paymentAmount = $derived(productAmount * tollgatePrice)
const relayUrl = "wss://soloco.nl/";
let relay: NRelay1;

function log(message: string) {
    logs += message + "\n";
    console.log(message)
}


async function init() {
    relay = new NRelay1(relayUrl)

    const filters = [
        {
            kinds: [6900],
            since: nostrNow()
        }
    ]
    console.log("init")
    for await (const msg of relay.req(filters, {})) {
        if (msg[0] === 'EVENT') {
            console.log(`[${msg[0]}] ${msg[1]}`)

            if(jobFeedbacks.find(jfb => jfb.id === msg[2].id) === undefined) {
                jobFeedbacks.push(msg[2])
            }

            continue;
        }
        if (msg[0] !== 'EOSE') {
            console.log(`No more historic messages`)
        }
    }
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

async function runPipeline() {
    const signer = new NSecSigner(randomPrivateKey);

    const note = {
        kind: 5900,
        pubkey: signer.getPublicKey(),
        content: "",
        created_at: nostrNow(),
        tags: [
            ["param", "git_address", repositoryAddress],
            ["param", "git_ref", repositoryRef],
            ["param", "pipeline_filepath", pipelineFilePath],
        ],
    };
    const event = await signer.signEvent(note);

    log(`sending: ${JSON.stringify(event)}`);
    jobRequests.push(event);
    await relay.event(event);
}

</script>

{#await init()}
{/await}

<div class="flex-1 space-y-4 p-8 pt-6">
    <div class="flex items-center justify-between space-y-2">
        <h2 class="text-3xl font-bold tracking-tight">GitHub Actions</h2>
    </div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div class="bg-card text-card-foreground rounded-xl border shadow col-span-4">
            <div class="flex flex-col space-y-1.5 p-6 pb-0">
                <h3 class="font-semibold leading-none tracking-tight">Information</h3>
                <div class="flex items-center space-x-2">
                    <strong>relay: </strong> {relayUrl}
                </div>
            </div>
            <div class="flex flex-col space-y-1.5 p-6 pb-0">
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-3 gap-2" >Repository</div>
                    <div class="flex col-span-5 gap-2" ><Input bind:value={repositoryAddress} placeholder="naddr... / https://github.com/example/repo"></Input></div>
                </div>
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-3 gap-2" >Repository ref (branch)</div>
                    <div class="flex col-span-5 gap-2" ><Input bind:value={repositoryRef} placeholder="main"></Input></div>
                </div>
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-3 gap-2" >Pipeline (path)</div>
                    <div class="flex col-span-5 gap-2" ><Input bind:value={pipelineFilePath} placeholder=".github/workflows/pipeline.yaml"></Input></div>
                </div>
                <div class="grid md:grid-cols-8">
                    <div class="flex col-span-5 gap-2" >Buy</div>
                    <div class="flex col-span-1 gap-2" >minutes</div>
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
                        <Input disabled="{true}" placeholder="{paymentAmount.toString()}"></Input>
                    </div>
                    <div class="flex col-span-1 gap-2  pl-2" >
                        <Button on:click={runPipeline}>Run</Button>
                    </div>
                </div>
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
    <div class="grid md:grid-cols-1 col-span-12 gap-4">
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {#each jobRequests as jobRequest}
            <div class="bg-card text-card-foreground rounded-xl border shadow col-span-7">
                <div class="flex flex-col space-y-1.5 p-6 pb-0">
                    <h3 class="font-semibold leading-none tracking-tight">Pipeline run</h3>
                </div>

                    <div class="flex flex-col space-y-1.5 p-6 pb-0">
                        <h3 class="font-semibold leading-none tracking-tight">Parameters</h3>
                    </div>
                    <div class="flex flex-col space-y-1.5 p-6 pb-0">
                        {#each getParams(jobRequest) as param}
                            <div class="grid md:grid-cols-8">
                                <div class="flex col-span-3 gap-2">{param[0]}</div>
                                <div class="flex col-span-5 gap-2"><Input disabled="{true}"value="{param[1]}"></Input></div>
                            </div>
                        {/each}
                    </div>
                    <div class="flex flex-col space-y-1.5 p-6 pb-0">
                        <h3 class="font-semibold leading-none tracking-tight">Run Output</h3>
                        {#each jobFeedbacks as jobFeedback}
                            {#if getTag(jobFeedback, 'e')?.[1] === jobRequest.id}
                                <div class="flex flex-col space-y-1.5 p-6 pb-0">
                                    <div class="grid md:grid-cols-8">
                                        <div class="flex col-span-3 gap-2">Status</div>
                                        <div class="flex col-span-5 gap-2"><Input disabled="{true}"value="{getTag(jobFeedback, 'status')[1] ?? '??'}"></Input></div>
                                    </div>
                                    <div class="grid md:grid-cols-8">
                                        <div class="flex col-span-3 gap-2">Message</div>
                                        <div class="flex col-span-5 gap-2"><Input disabled="{true}"value="{getTag(jobFeedback, 'status')[2] ?? '??'}"></Input></div>
                                    </div>
                                    {#if jobFeedback.content !== ""}
                                        <div class="grid md:grid-cols-8 gap-2">
                                            <Textarea id="content" placeholder="Write down your feedback here" class="flex col-span-8 gap-2" value="{jobFeedback.content}"></Textarea>
                                        </div>
                                    {/if}
                                </div>
                            {/if}
                        {/each}
                    </div>


            </div>
            {/each}
        </div>

    </div>

</div>