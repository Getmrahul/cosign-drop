# MVP data collected

Public X research collected on 29 September 2026. Grok performed two discovery passes; the 27 original posts behind all 33 person-to-person relationship rows were then independently read in Chrome (including complete posts rendered in X search results).

| Item | Count |
|---|---:|
| People | 32 |
| Companies / organizations | 18 |
| Vouch / recommendation events | 12 |
| Specific work, skill, leadership or hiring praise events | 11 |
| Career support / mentorship events | 9 |
| Brief acknowledgment, hidden by default | 1 |
| Company affiliation records | 47 |
| Explicit worked-with relations | 6 |
| Distinct original relationship posts | 27 |
| Nodes with observed X profile-image URLs | 48 / 50 |

The six worked-with relations reuse endorsement evidence; they are not six additional endorsements. Team shoutouts can produce multiple recipient edges from one post. Repeated receipts between the same two people should appear under one visual connection when useful.

## Files to use

- `graph.reviewed.json`: recommended MVP input; 49 nodes, 85 reviewed edges. Excludes one unresolved affiliation and its otherwise unconnected person. Person bios retain their own verification flags.
- `graph.json`: complete research graph; 50 nodes, 86 edges, including one clearly marked candidate affiliation.
- `relationships.csv`: inspectable edge list with source URLs and relation types.
- `people.json` and `companies.json`: separate node lists.
- `quality-summary.json`: counts and integrity checks.
- `raw/`: Grok discovery rows, retained separately from the reviewed graph. Batch 1 includes editorial reclassifications and flags; it is not a verbatim chat transcript.
- `research/enrichment.json`: reviewed-event list, excerpt corrections, source timestamps, affiliations, and image references.
- `../scripts/build_dataset.py`: deterministic build and integrity checks; Python standard library only.

## The useful starting network

Rahul connects to Ryan Hoover, Andreas Klinger, Radoslav Stankov, Sarah Wright, Kevin William David, Product Hunt and HeroStuff. The graph expands through Julie Chabin, Ashley Higgins, Rajiv Ayyangar, Jamie Peak and Philipp Spiess, and through shared company history into On Deck / a16z / Cosign.

Examples of original receipts:

- Ryan → Rahul: https://x.com/rrhoover/status/1986817190813647119
- Andreas → Rahul: https://x.com/andreasklinger/status/1726852451444346976
- Radoslav → Rahul: https://x.com/rstankov/status/1779169370406547867
- Sarah → Product Hunt Chrome-extension team: https://x.com/sarmariewright/status/1628041744922316800
- Ryan → Jamie, explicit rehire recommendation: https://x.com/rrhoover/status/2084666290745303271
- David → Minn, worked together at On Deck: https://x.com/david__booth/status/1772324925963125009

The complete graph has a main connected component of 42 nodes and smaller components of 3, 3 and 2. The reviewed main component has 41 nodes. Connectivity uses all relation types; it must not be described as a chain of endorsements or transferred trust.

## Specific gaps and corrections

- Joshua Voydik → HeroStuff cofounder/CEO remains a candidate from Grok. His inspected X profile links HeroStuff but does not state that title. The reviewed graph omits the edge and Joshua node.
- LIVO: no official X handle/profile image resolved. Sword Health: the handle referenced by Kevin Wang's bio, `@swordhealth`, displayed an account-not-found message. Those two organization images are null.
- On Deck's `@beondeck` profile now says “On Deck now ODF” and points to `@joinodf`; keep historical employment context distinct from present branding.
- Avatar URLs were observed directly in X's visible DOM, with their original size suffixes. They have not been downloaded or checked for future hotlink availability.
- Exact UTC timestamps were captured from 22 post time elements. Other post records retain calendar dates from research and visible source context, with the date basis stated.
- Several Grok excerpts were noncontiguous or too long. The graph uses shorter source-checked excerpts; the original discovery rows retain their warning context.
- Career-support acknowledgments are directed from the person giving credit to the person credited. They must not turn into a fabricated reverse hiring vouch.
- Company affiliation means the role/association actually stated; Product Hunt hunter/community participation is not employee status. Shared company history never creates a worked-with edge automatically.
- This is a deliberately sampled public network, not a complete directory or a hiring score. Missing public praise is unknown, not negative evidence.

## Collection approach

Grok was asked for source-backed events, exact handles, original status URLs, dates, contiguous short excerpts, explicit relationship context, separately sourced affiliations and unmodified image URLs. The second prompt expanded connected Product Hunt / Cosign / On Deck hops, searched older posts and removed gratitude padding. Target counts were explicitly subordinate to actual evidence.

Research chat: https://x.com/i/grok?conversation=44974f64-04bd-4325-bd9a-ba5739f2f255

Independent seed search: `@rahulmfg (hire OR recommend OR worked OR talented)` on X, Latest. Grok-reported additional search families included named giver `from:` queries with hire/recommend/worked/talented phrases, earlier Product Hunt departure threads, and quoted Cosign career-support threads. These searches are not exhaustive.
