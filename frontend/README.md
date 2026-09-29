# The Network

[Explore the live graph](https://the-network.patch-dev.workers.dev) · [Read the build conversation](docs/conversation-transcript.md)

## What the Social Graph _Knows_

_A note from Rahul_

**People already vouch for each other online. Connecting those moments reveals a lot.**

The social graph is such a powerful thing. There are so many useful signals hidden in who we know, who we’ve worked with, and what people have said about us.

Wanna hire someone, say Rahul? Click on his **node**. You can see his work, the people who vouch for him, who he’s worked with, and the companies he’s connected to. That can be useful for hiring, investing, and a bunch of other things in the startup world.

It works the other way too. Wanna work at a company like OpenAI? Explore its connections. Maybe someone you know works there. Maybe someone in your network knows someone there. Suddenly the company feels a little closer.

The part I find really interesting is that I didn’t have to ask anyone for testimonials to build this.

These posts already existed.

People naturally recommend each other on X, appreciate someone’s work, talk about things they built together, or tell others they should hire someone.

I used Grok to find and export some of these posts from X, checked the sources, and connected the people and companies into this graph. You can follow each connection back to its source.

And this is with pretty limited data. Imagine what the graph starts looking like when you connect more of these moments.

That’s partly how I think about Cosign, and it’s also the idea behind [bakd.work](https://bakd.work/), my little pet project.

I think these signals can tell you things a résumé alone can’t. Startups already hire through referrals and word of mouth all the time. A graph like this could help you discover people, filter applications, understand someone’s network, or find a path to someone you want to meet.

There are so many directions you could take this.

But mostly, I just love this graph <3

## The build conversation

The challenge asks for the agent conversation used to build the drop. The [conversation transcript](docs/conversation-transcript.md) preserves the actual user and assistant messages, including research, raw ideas, design iterations, data corrections, and deployment work. Shared screenshots are included. Its introduction documents the export scope and omissions.

To refresh it after more work, run `python3 scripts/export-transcript.py` from this directory. It discovers the known challenge discussions and all local Codex chats in this repository, and labels every message by its source chat. To export selected chats instead, pass one or more session JSONL paths. The export contains public-facing messages only, not the raw session log. Transcript files live in `docs/`, outside the deployed `public/` assets.

## Development

Built with Next.js, React, and Tailwind CSS. Use Node 22.18+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:3000. Run `npm run build` followed by `npm start` to preview the production export with Cloudflare's local runtime at http://127.0.0.1:8787. Next.js builds the HTML, JavaScript, CSS, and images into `out/`.

## Data

`public/graph.json` is copied from `../data/graph.json`. The graph includes all 74 nodes and displays only source-reviewed relationships. Vouches, praise, career support and company affiliation remain distinct. Sources are linked in the detail cards. Two companies use initials because no confirmed X avatar is available.

## Interaction

Two-finger scroll to pan; pinch or Command/Ctrl-scroll to zoom. Drag the background to pan, drag a node to move it, or click to inspect. Search finds people and companies. Relationship buttons filter edges. Keyboard: `/` searches, Escape closes details, and focused graph supports +, -, 0 and arrow keys. Nodes support Enter and Space.

## Structure

Following the conventions in Hero's frontend:

- `app/`: Next.js route and layout entry points; global resets.
- `screens/Network/`: composes the network page and connects its state to UI.
- `components/`: named component folders for graph rendering, search, controls, profile cards, receipts, avatars, and the story dialog.
- `hooks/`: graph selection and dragging, camera animation, trackpad gestures, keyboard shortcuts, and story dialog lifecycle.
- `types/`: shared graph and camera declarations.
- `utils/`: pure layout, viewport math, relationship grouping, and formatting.
- `styles/`: network presentation, preserving the existing cascade.
- `tests/utils/`: behavior tests for viewport gestures and relationship direction/grouping.

## Local checks

Use Node 22.18+ (Node 24 recommended).

```sh
npm run format        # Apply formatting
npm run ci            # Check formatting, lint, TypeScript, and tests
npm run check:deploy  # All checks, then a production build; does not deploy
```

`npm run lint` rejects unused code, invalid hooks, and missing effect dependencies. There is no hosted CI or automatic deployment. The deployment check also validates the Cloudflare configuration with a dry run.

## Cloudflare Workers deployment

Live: https://the-network.patch-dev.workers.dev

```sh
npx wrangler login   # Only when not already authenticated
npm run deploy      # All checks, build, dry run, then publish
```

`wrangler.jsonc` deploys only the Next.js static export from `out/`. The graph, search, cards, and animations run in the browser. There is no server Worker script, database, paid binding, or paid image service. Workers Static Assets requests and storage are free; this app does not require a Workers Paid upgrade. See [Cloudflare's asset pricing](https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/).

If server actions, authenticated server rendering, or API routes are added later, reassess the deployment architecture and free-tier limits before enabling them. The current export intentionally needs no server runtime.

App dependency versions are pinned for reproducible builds. The Miniflare Undici override applies the patched 7.29.1 release to Wrangler's local development tooling; remove it when the upstream dependency includes that fix.
