# Vouch graph research

Collected 2026-09-29 from public X pages, with Grok used for discovery.

## Graph contract

- Person and organization nodes can both render as circles, using public avatars/logos.
- User preference: use X profile images for companies as well as people. Do not search for separate brand logo assets.
- Directed `vouch` edges run from the person making an endorsement to its recipient.
- Undirected `affiliation` edges connect a person and an organization, with role and current/historical/unknown status. A shared company does not prove direct collaboration.
- Preserve each source post as a separate event. Multiple events may render as one edge with multiple receipts.
- Clicking a person can show their bio, affiliations, incoming/outgoing vouches, original posts and dates. Clicking a company can show sourced affiliated people.
- No inferred hireability, availability, ranking, or negative inference from missing endorsements.
- Missing images and dates remain null; do not invent image URLs or employment dates.

## Evidence standard

Grok-discovered records are candidates until their original source is reviewed. Keep `verification_status` on each event. `source_reviewed` means the public source supports the attributed statement, not that the statement is objectively true.

Separate explicit hiring recommendations, firsthand work endorsements, specific professional praise, general professional endorsements, and career-support acknowledgments. Gratitude that someone took a chance on the author is not an endorsement in the reverse direction.

User's own public profile: https://x.com/rahulmfg
Observed bio: founding engineer at HeroStuff, formerly Product Hunt; building Bakd.work, Maaa.app, and KofeFlow.com. Projects are not automatically employers.

Research conversation: https://x.com/i/grok?conversation=44974f64-04bd-4325-bd9a-ba5739f2f255

## Proposed relationship display

- Purple directed arrow: explicit vouch / recommendation.
- Teal directed arrow: praise for a specific professional contribution.
- Blue undirected line: explicitly evidenced direct collaboration. Never derive this from shared company affiliation.
- Gray undirected line: person–company affiliation; role and current/historical status appear on selection.
- Amber directed arrow: mentorship / career support. For an acknowledgment by A that B helped A, the source statement is A → B with the label `credits with career support`. If rendering the actual support direction B → A, label it `supported (reported by A)` and preserve A as the evidence author. Never silently reverse a vouch.
- Labels, a legend, hover/focus details and filters accompany color; do not rely on color alone.
- Default view: recommendations, specific work praise and affiliations. Highlight a selected node's neighborhood and fade other connections.
