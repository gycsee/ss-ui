import test from 'node:test';
import assert from 'node:assert/strict';

import {
  DARK_GROUP_COLORS,
  DARK_SCENE_PALETTE,
  LIGHT_GROUP_COLORS,
  LIGHT_SCENE_PALETTE,
  getGroupColorByKey,
  getDefaultGroupColors,
  resolveScenePalette,
} from '../dist/index.mjs';

test('returns theme group colors', () => {
  assert.deepEqual(getDefaultGroupColors('light'), LIGHT_GROUP_COLORS);
  assert.deepEqual(getDefaultGroupColors('dark'), DARK_GROUP_COLORS);
});

test('returns the first color for unknown groups', () => {
  assert.equal(
    getGroupColorByKey('missing', ['a', 'b'], 'light'),
    LIGHT_GROUP_COLORS[0],
  );
});

test('merges palette overrides on top of theme defaults', () => {
  const palette = resolveScenePalette('dark', {
    axisText: '#ffffff',
  });

  assert.equal(palette.axisText, '#ffffff');
  assert.equal(palette.backgroundFrom, DARK_SCENE_PALETTE.backgroundFrom);
  assert.notEqual(palette.backgroundFrom, LIGHT_SCENE_PALETTE.backgroundFrom);
});
