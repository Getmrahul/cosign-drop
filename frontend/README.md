# The Network

[Explore the live graph](https://the-network.patch-dev.workers.dev) · [Read the build conversation](docs/conversation-transcript.md)

## What the Social Graph Knows?

_A note from Rahul_

The social graph is such a powerful thing. It holds so many signals that can be useful for hiring, investing, and so much more in the startup world.

Wanna hire someone, say Rahul? Just click on his node. You’ll see his work, the people who vouch for him, and who he’s worked with. Those connections can be powerful signals for hiring. Or even for investment.

And it works the other way too. Wanna work at a company like OpenAI? Explore its connections to see whether someone you know works there, and who you could reach out to for an introduction. A company starts to feel a little closer when you can see the people connecting you to it.

What I love is that I didn’t have to ask people for testimonials to build this. These posts already existed. They came from how people naturally interact with each other on X: recommending someone, appreciating their work, or talking about building together.

I used Grok to find and export these posts from X, then checked the sources and connected the people and companies into this graph. You can follow each connection back to the original source.

Even with this limited data, you can see how cool the graph is, and how useful it could be. This is how I think about Cosign, and it’s the same idea behind [bakd.work](https://bakd.work), my pet project.

I believe these signals can be more powerful than a résumé alone. Startups already hire through referrals and word of mouth; they often don’t have time for multiple rounds of interviews. This could help them find real talent faster, filter applications, or explore someone’s network before reaching out.

So many possibilities, but I just love this graph <3

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
