"""Build graph data from retained discovery rows and manually reviewed evidence.

No external requests. Run with Python 3 from any directory.
"""
import csv
import json
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data'
load = lambda path: json.loads((DATA / path).read_text())
batch1 = load('raw/grok-batch-1.json')
enrichment = load('research/enrichment.json')
observed = load('research/direct-observations.json')
rows = [dict(zip(batch1['columns'], row)) for row in batch1['rows']]
with (DATA / 'raw/grok-batch-2.tsv').open() as f:
    for r in csv.DictReader(f, delimiter='\t'):
        rows.append(dict(id=r['id'], giver=r['giver_handle'].lower(), recipient=r['recipient_handle'].lower(), excerpt=r['exact_excerpt'], url=r['source_url'], date=r['date'], classification=r['category'], context=r['explicit_relationship']))

nodes = {}
for handle, name, bio, claims in batch1['people']:
    nodes['person:'+handle] = dict(id='person:'+handle, type='person', handle=handle, name=name, bio=bio, bio_verification_status='candidate', profile_url='https://x.com/'+handle, image_url=None)
for handle, name, bio in enrichment['people']:
    nodes['person:'+handle] = dict(id='person:'+handle, type='person', handle=handle, name=name, bio=bio, bio_verification_status='candidate', profile_url='https://x.com/'+handle, image_url=None)
for handle, path in enrichment['images'].items():
    if 'person:'+handle in nodes:
        nodes['person:'+handle]['image_url'] = 'https://pbs.twimg.com/profile_images/'+path
        nodes['person:'+handle]['image_provenance'] = 'Public X DOM; exact observed URL, not an inferred asset path'
for p in observed['people']:
    if p.get('bio'):
        nodes['person:'+p['handle']]['bio'] = p['bio']
        nodes['person:'+p['handle']]['bio_verification_status'] = 'source_reviewed'
for handle in enrichment.get('reviewed_bios', []):
    nodes['person:'+handle]['bio_verification_status'] = 'source_reviewed'
for handle, bio in enrichment.get('person_bio_overrides', {}).items():
    nodes['person:'+handle]['bio'] = bio
for org_id, name, handle, website, image in enrichment['companies']:
    nodes['org:'+org_id] = dict(id='org:'+org_id, type='organization', name=name, handle=handle, website=website, profile_url='https://x.com/'+handle if handle else None, image_url='https://pbs.twimg.com/profile_images/'+image if image else None)
    if org_id in enrichment.get('company_notes', {}):
        nodes['org:'+org_id]['notes'] = enrichment['company_notes'][org_id]

sources, edges = {}, []
reviewed = set(enrichment['reviewed_event_ids'])
source_by_url = {}
for r in rows:
    sid = 'x:'+r['url'].split('/status/')[-1]
    source_by_url[r['url']] = sid
    excerpt = enrichment['excerpt_overrides'].get(r['id'], r['excerpt'])
    # Normalize whitespace but preserve attribution and wording.
    excerpt = ' '.join(excerpt.split())
    if len(excerpt.split()) > 25:
        excerpt = ' '.join(excerpt.split()[:25])+' …'
    status = 'source_reviewed' if r['id'] in reviewed else 'candidate'
    if sid not in sources:
        sources[sid] = dict(id=sid, url=r['url'], author_id='person:'+r['giver'], date=r['date'], date_basis='UTC calendar date reported by Grok, checked where source timestamp was captured', excerpt=excerpt, retrieved_on='2026-09-29', verification_status=status)
    if status == 'source_reviewed':
        sources[sid]['verification_status'] = status
    timestamp = enrichment.get('timestamps', {}).get(sid.split(':', 1)[1])
    if timestamp:
        sources[sid]['published_at'] = timestamp
        sources[sid]['date'] = timestamp[:10]
        sources[sid]['date_basis'] = 'Original X post time element, UTC'
    cat = r['classification']
    kind = ('career_support' if cat in ['career_support_acknowledgment','mentorship_endorsement'] else 'praise' if cat in ['specific_contribution_praise','specific_skill_praise','leadership_praise','hiring_praise'] else 'vouch')
    if r['id']=='E08':
        kind='acknowledgment'
    edges.append(dict(id=r['id'], source='person:'+r['giver'], target='person:'+r['recipient'], type=kind, category=cat, directed=True, source_ids=[sid], context=r['context'], verification_status=status, default_visible=kind in ['praise','vouch']))

for n, (person, org, role, temporal, url, status) in enumerate(enrichment['affiliations'], 1):
    sid=source_by_url.get(url, 'profile:'+url.rsplit('/',1)[-1].lower())
    if sid not in sources:
        sources[sid]=dict(id=sid,url=url,retrieved_on='2026-09-29',verification_status=status,kind='profile_bio',observation_method='Public profile or relevant-people bio card in an inspected X thread' if status=='source_reviewed' else 'Grok profile discovery; independent review pending')
    edges.append(dict(id=f'A{n:03}',source='person:'+person,target='org:'+org,type='affiliation',directed=False,role=role,temporal_status=temporal,start_date=None,end_date=None,source_ids=[sid],verification_status=status,default_visible=status=='source_reviewed'))

# Collaboration is only derived from explicit first-person work statements.
# These represent another facet of the SAME source, not independent vouches.
for event_id in ['E01','E02','E03','E11','E12','E29']:
    e=next(e for e in edges if e['id']==event_id)
    if e['verification_status']=='source_reviewed':
        edges.append(dict(id='W-'+event_id,source=e['source'],target=e['target'],type='worked_with',directed=False,source_ids=e['source_ids'],derived_from_event=event_id,verification_status='source_reviewed',default_visible=False,context='Direct collaboration explicitly stated in the source. This is not an additional endorsement event.'))

# Reviewed expansion is maintained separately so rebuilding preserves all sources.
expansion = load('research/expansion.json')
for node in expansion['nodes']:
    assert node['id'] not in nodes, node['id']
    nodes[node['id']] = node
for source in expansion['sources']:
    assert source['id'] not in sources, source['id']
    sources[source['id']] = source
edges.extend(expansion['edges'])
for source_id, details in enrichment.get('source_overrides', {}).items():
    sources[source_id].update(details)


graph=dict(schema_version=1,collected_on='2026-09-29',description='Public professional relationship sample discovered with Grok and reviewed against X sources. Not exhaustive; no hireability scores.',nodes=list(nodes.values()),edges=edges,sources=list(sources.values()),display=dict(node_shape='circle',company_image_source='X profile image',colors=dict(vouch='#7c3aed',praise='#0d9488',worked_with='#2563eb',affiliation='#94a3b8',career_support='#d97706',acknowledgment='#a8a29e'),default_types=['vouch','praise','affiliation'],career_support_direction='Evidence author credits target with support; do not reverse into an endorsement of the author.'),limitations=['Candidate rows require source review before being presented as verified.','Public endorsements are attributed opinions, not assessments of hireability.','An affiliation does not establish direct collaboration.','Current means stated in the bio at collection; hiring announcements use at_source_date unless refreshed.','Some image URLs are missing and X-hosted images can change or fail.','Sampling is centered on Rahul, Product Hunt, Cosign and related public networks; coverage is uneven.'])

ids=set(nodes)
assert len(ids)==len(graph['nodes'])
assert len({e['id'] for e in edges})==len(edges)
for e in edges:
    assert e['source'] in ids and e['target'] in ids, e
    assert all(s in sources for s in e['source_ids']), e
    assert e['source'] != e['target'], e
assert len({(e['source'],e['target'],e['source_ids'][0]) for e in edges if e['id'].startswith('E')})==len(rows)

for filename, obj in [('graph.json',graph),('people.json',[n for n in graph['nodes'] if n['type']=='person']),('companies.json',[n for n in graph['nodes'] if n['type']=='organization'])]:
    (DATA/filename).write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n')

reviewed_edges=[e for e in edges if e['verification_status']=='source_reviewed']
used={e[k] for e in reviewed_edges for k in ['source','target']}
used_sources={s for e in reviewed_edges for s in e['source_ids']}
verified=dict(graph,nodes=[n for n in graph['nodes'] if n['id'] in used],edges=reviewed_edges,sources=[s for s in sources.values() if s['id'] in used_sources])
(DATA/'graph.reviewed.json').write_text(json.dumps(verified,indent=2,ensure_ascii=False)+'\n')

adj=defaultdict(set)
for e in edges:
    adj[e['source']].add(e['target']);adj[e['target']].add(e['source'])
unseen=set(ids);components=[]
while unseen:
    todo=[next(iter(unseen))]; seen=set()
    while todo:
        n=todo.pop()
        if n in seen:continue
        seen.add(n);todo.extend(adj[n]-seen)
    unseen-=seen;components.append(len(seen))
stats=dict(people=sum(n['type']=='person' for n in nodes.values()),companies=sum(n['type']=='organization' for n in nodes.values()),person_relationship_events=sum(e['type'] in ['vouch','praise','career_support','acknowledgment'] for e in edges),distinct_post_sources=sum(s.startswith('x:') for s in sources),edge_types=dict(Counter(e['type'] for e in edges)),verification=dict(Counter(e['verification_status'] for e in edges)),person_event_verification=dict(Counter(e['verification_status'] for e in edges if e['type'] in ['vouch','praise','career_support','acknowledgment'])),nodes_with_images=sum(bool(n['image_url']) for n in nodes.values()),connected_component_sizes=sorted(components,reverse=True),checks={'unique_node_ids':True,'unique_edge_ids':True,'no_orphan_edges':True,'source_references_resolve':True,'no_duplicate_person_post_edges':True})
(DATA/'quality-summary.json').write_text(json.dumps(stats,indent=2)+'\n')
with (DATA/'relationships.csv').open('w', newline='') as f:
    writer=csv.DictWriter(f,fieldnames=['id','source','target','type','category','role','temporal_status','verification_status','source_urls'])
    writer.writeheader()
    for e in edges:
        writer.writerow({**{k:e.get(k) for k in writer.fieldnames if k!='source_urls'},'source_urls':' | '.join(sources[s]['url'] for s in e['source_ids'])})
print(json.dumps(stats,indent=2))
