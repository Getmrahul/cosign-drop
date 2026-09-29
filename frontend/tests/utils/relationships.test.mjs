import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getNodeRelationships,
  groupReceipts,
} from '../../utils/relationships.ts';
const edge = (id, source, target, type, post = 'post:1') => ({
  id,
  source,
  target,
  type,
  directed: true,
  source_ids: [post],
  verification_status: 'source_reviewed',
});

test('career support keeps the person credited distinct from the author', () => {
  const edges = [
    edge('support', 'rahul', 'dane', 'career_support'),
    edge('praise', 'dane', 'rahul', 'praise'),
  ];
  const rahul = getNodeRelationships(edges, 'rahul'),
    dane = getNodeRelationships(edges, 'dane');
  assert.deepEqual(
    rahul.support.map((e) => e.id),
    ['support'],
  );
  assert.deepEqual(
    rahul.received.map((e) => e.id),
    ['praise'],
  );
  assert.deepEqual(
    dane.creditedBy.map((e) => e.id),
    ['support'],
  );
  assert.deepEqual(
    dane.given.map((e) => e.id),
    ['praise'],
  );
  assert.equal(dane.support.length, 0);
});
test('shared work and affiliations can be explored from either endpoint', () => {
  const edges = [
    edge('work', 'a', 'b', 'worked_with'),
    edge('company', 'a', 'hero', 'affiliation'),
  ];
  assert.equal(getNodeRelationships(edges, 'b').worked[0].id, 'work');
  assert.equal(
    getNodeRelationships(edges, 'hero').affiliations[0].id,
    'company',
  );
  assert.equal(getNodeRelationships(edges, 'hero').given.length, 0);
});
test('one post with multiple recipients becomes one receipt, distinct evidence stays separate', () => {
  const edges = [
    edge('a', 'erik', 'gaby', 'praise'),
    edge('b', 'erik', 'rahul', 'praise'),
    edge('c', 'erik', 'gaby', 'praise', 'post:2'),
    edge('d', 'erik', 'gaby', 'worked_with'),
  ];
  assert.deepEqual(
    groupReceipts(edges).map((group) => group.map((e) => e.id)),
    [['a', 'b'], ['c'], ['d']],
  );
});
