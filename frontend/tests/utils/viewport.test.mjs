import test from 'node:test';
import assert from 'node:assert/strict';
import { wheelCamera, zoomCamera } from '../../utils/viewport.ts';
const v = { x: 100, y: 80, k: 0.8 };
const event = {
  deltaX: 30,
  deltaY: 50,
  deltaMode: 0,
  ctrlKey: false,
  metaKey: false,
  shiftKey: false,
  x: 300,
  y: 200,
};
test('two-finger scroll pans both axes without zooming', () =>
  assert.deepEqual(wheelCamera(v, event, 600), { x: 70, y: 30, k: 0.8 }));
test('pinch zoom preserves the world point under the pointer', () => {
  const next = wheelCamera(v, { ...event, ctrlKey: true, deltaY: -8 }, 600);
  assert.ok(next.k > v.k);
  assert.ok(Math.abs((300 - next.x) / next.k - (300 - v.x) / v.k) < 1e-9);
  assert.ok(Math.abs((200 - next.y) / next.k - (200 - v.y) / v.k) < 1e-9);
});
test('reversing a pinch immediately restores scale and position', () => {
  const next = wheelCamera(v, { ...event, ctrlKey: true, deltaY: -8 }, 600);
  const back = wheelCamera(next, { ...event, ctrlKey: true, deltaY: 8 }, 600);
  for (const key of ['x', 'y', 'k'])
    assert.ok(Math.abs(back[key] - v[key]) < 1e-9);
});
test('Cmd-wheel zoom and line-mode scrolling remain supported', () => {
  assert.ok(wheelCamera(v, { ...event, metaKey: true }, 600).k < v.k);
  assert.equal(
    wheelCamera(v, { ...event, deltaX: 0, deltaY: 2, deltaMode: 1 }, 600).y,
    48,
  );
});
test('native pinch clamps at the same bounds as wheel zoom', () => {
  assert.equal(zoomCamera(v, 100, event).k, 3);
  assert.equal(zoomCamera(v, 0.001, event).k, 0.15);
});

test('selection framing keeps all connected nodes and labels above controls and beside the card', async () => {
  const { fitConnections } = await import('../../utils/viewport.ts');
  const points = [
    { x: -800, y: -300 },
    { x: 300, y: 450 },
    { x: 0, y: 0 },
  ];
  for (const area of [
    { left: 20, right: 900, top: 120, bottom: 500 },
    { left: 16, right: 350, top: 105, bottom: 210 },
  ]) {
    const camera = fitConnections(points, area);
    for (const p of points) {
      assert.ok((p.x - 140) * camera.k + camera.x >= area.left - 1e-8);
      assert.ok((p.x + 140) * camera.k + camera.x <= area.right + 1e-8);
      assert.ok((p.y - 36) * camera.k + camera.y >= area.top - 1e-8);
      assert.ok((p.y + 76) * camera.k + camera.y <= area.bottom + 1e-8);
    }
  }
});
test('a small neighborhood does not cause excessive selection zoom', async () => {
  const { fitConnections } = await import('../../utils/viewport.ts');
  assert.equal(
    fitConnections([{ x: 0, y: 0 }], {
      left: 20,
      right: 1100,
      top: 100,
      bottom: 700,
    }).k,
    1.1,
  );
});
