# The Network

[Explore the live graph](https://the-network.patch-dev.workers.dev) · [Read the build conversation](frontend/docs/conversation-transcript.md)

## What the Social Graph Knows?

*A note from Rahul*

The social graph is such a powerful thing. It holds so many signals that can be useful for hiring, investing, and so much more in the startup world.

Wanna hire someone, say Rahul? Just click on his node. You’ll see his work, the people who vouch for him, and who he’s worked with. Those connections can be powerful signals for hiring. Or even for investment.

And it works the other way too. Wanna work at a company like OpenAI? Explore its connections to see whether someone you know works there, and who you could reach out to for an introduction. A company starts to feel a little closer when you can see the people connecting you to it.

What I love is that I didn’t have to ask people for testimonials to build this. These posts already existed. They came from how people naturally interact with each other on X: recommending someone, appreciating their work, or talking about building together.

I used Grok to find and export these posts from X, then checked the sources and connected the people and companies into this graph. You can follow each connection back to the original source.

Even with this limited data, you can see how cool the graph is, and how useful it could be. This is how I think about Cosign, and it’s the same idea behind [bakd.work](https://bakd.work), my pet project.

I believe these signals can be more powerful than a résumé alone. Startups already hire through referrals and word of mouth; they often don’t have time for multiple rounds of interviews. This could help them find real talent faster, filter applications, or explore someone’s network before reaching out.

So many possibilities, but I just love this graph <3

## The build conversation

The challenge asks for the agent conversation used to build the drop. The [conversation transcript](frontend/docs/conversation-transcript.md) preserves the actual user and assistant messages, including research, raw ideas, design iterations, data corrections, and deployment work. Shared screenshots are included. Its introduction documents the export scope and omissions.

## Development

Built with Next.js, React, and Tailwind CSS. Use Node 22.18+ (Node 24 recommended).

```sh
cd frontend
npm ci
npm run dev
```

Open http://127.0.0.1:3000.

## Project layout

- `frontend/`: Next.js app, tracked as a regular folder in this root Git repository.
- `data/`: source observations, reviewed graph data, and quality summaries.
- `scripts/`: reproducible dataset preparation.
- `RESEARCH.md`: research notes.

## Refresh the graph

From this directory:

```sh
python3 scripts/build_dataset.py
cp data/graph.json frontend/public/graph.json
```

## Check and build

```sh
cd frontend
npm run check:deploy
npm start
```

`npm start` previews the production export at http://127.0.0.1:8787.

## Deploy to Cloudflare Workers

```sh
cd frontend
npm run deploy
```

Deployment runs the local checks and builds before publishing the static export. Workers Static Assets hosting requires no paid tier or server runtime. See `frontend/README.md` for setup and cost details.
