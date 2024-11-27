# [SwissDash.site](https://swissdash.site)

A dashboard site for various experimental Nostr projects.

## Features
### 1) Epoxy proxy explorer
Find [Epoxy proxies](https://github.com/ArjenStens/nostr-epoxy-reverse-proxy) that advertise their services. Go to [Dashboard](https://npub1dmj6nks3tey4mpj32wcepvrjswqlush5dx3x3m77kh0yjl3h3s8qhhrlhz.nsite.lol/).

### 2) Epoxy route builder
Build proxy routes with multiple hops and query the target. Go to [Route Builder](https://npub1dmj6nks3tey4mpj32wcepvrjswqlush5dx3x3m77kh0yjl3h3s8qhhrlhz.nsite.lol/route-builder).

### 3) Tollgate Tollbooth
A PWA app for managing connections to [Tollgate routers](https://github.com/OpenTollGate). Acts as an alternative to Captive portals. Go to [Toll Booth](https://npub1dmj6nks3tey4mpj32wcepvrjswqlush5dx3x3m77kh0yjl3h3s8qhhrlhz.nsite.lol/tollbooth)

### 4) Feedback Dashboard
A very experiment feature for processing user feedback for a website (tied to git repository) and being able to triage these events and create [NIP-34](https://github.com/nostr-protocol/nips/blob/master/34.md) git issues out of them. Go to [Feedback](https://npub1dmj6nks3tey4mpj32wcepvrjswqlush5dx3x3m77kh0yjl3h3s8qhhrlhz.nsite.lol/feedback).

## Build & Run
```bash
pnpm install

pnpm run dev

# Available on http://localhost:5173/
```

## Publishing nsite

```bash
npx nsite-cli@0.1.12 upload \
--relays 'wss://nos.lol,wss://relay.primal.net,wss://relay.nostr.band,wss://relay.damus.io' \
--servers 'https://files.v0l.io' \
--privatekey $NSITE_PRIVATEKEY \
  build
```