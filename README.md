# sv

The everything dashboard

##
Visit [this site](http://npub1dmj6nks3tey4mpj32wcepvrjswqlush5dx3x3m77kh0yjl3h3s8qhhrlhz.nsite.lol).

## Build

```bash
npm run build
```

## Publishing nsite

```bash
npx nsite-cli@0.1.12 upload \
--relays 'wss://nos.lol,wss://relay.primal.net,wss://relay.nostr.band,wss://relay.damus.io' \
--servers 'https://cdn.satellite.earth,https://files.v0l.io' \
--privatekey NSITE_PRIVATEKEY \
  build
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://svelte.dev/docs/kit/adapters) for your target environment.
