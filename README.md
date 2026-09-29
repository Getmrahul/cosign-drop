# The Network

[Explore the live graph](https://the-network.patch-dev.workers.dev) · [Read the build conversation](frontend/docs/conversation-transcript.md)

## What the Social Graph *Knows*

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

The challenge asks for the agent conversation used to build the drop. The [conversation transcript](frontend/docs/conversation-transcript.md) preserves the actual user and assistant messages, including research, raw ideas, design iterations, data corrections, and deployment work. Shared screenshots are included. Its introduction documents the export scope and omissions.

## Development

Built with Next.js, React, and Tailwind CSS. Development is pinned to Node **24.12.0** and npm **11.6.2**.

```sh
nvm install
nvm use
npm install --global npm@11.6.2
cd frontend
npm ci
npm run dev
```

The setup commands assume [nvm](https://github.com/nvm-sh/nvm) is installed; another version manager is fine if it selects these exact versions. `frontend/.npmrc` rejects installs with mismatched Node or npm versions. Use `npm ci` for a fresh checkout; use `npm install` when intentionally changing dependencies and commit the updated lockfile. Update the version pins together when upgrading the toolchain.

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
