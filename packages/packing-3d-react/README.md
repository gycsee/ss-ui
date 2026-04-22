# `@cardinal-odp/packing-3d-react`

React component for 3D bin-packing scene visualization based on `three`, `@react-three/fiber`, and `@react-three/drei`.

The package only ships the React-side scene component and related types / palette helpers. Runtime dependencies are expected to be installed by the host application.

## Install

```bash
npm install @cardinal-odp/packing-3d-react react react-dom three @react-three/fiber @react-three/drei
```

## Peer Dependencies

- `react`
- `react-dom`
- `three`
- `@react-three/fiber`
- `@react-three/drei`

`three`, `@react-three/fiber`, and `@react-three/drei` are declared as optional peers so the package can stay host-driven in monorepo and app integration scenarios.

## Usage

```tsx
import Packing3DScene from '@cardinal-odp/packing-3d-react';

const container = {
  innerLength: 12,
  innerWidth: 2.35,
  innerHeight: 2.69,
};

const items = [
  {
    id: 'cargo-1',
    groupKey: 'A',
    seq: 1,
    posX: 0,
    posY: 0,
    posZ: 0,
    xLength: 120,
    yLength: 100,
    zLength: 80,
    meta: {
      title: 'SKU-A-01',
      lines: ['批次: B001', '客户: North Hub'],
    },
  },
];

export default function Demo() {
  return (
    <Packing3DScene
      container={container}
      items={items}
      height={560}
      theme="light"
    />
  );
}
```

## Data Model

`container` uses meters. Item position and dimensions use centimeters.

```ts
type SceneContainer = {
  innerLength: number;
  innerWidth: number;
  innerHeight: number;
};

type SceneItem = {
  id: string;
  groupKey: string;
  seq: number;
  posX: number;
  posY: number;
  posZ: number;
  xLength: number;
  yLength: number;
  zLength: number;
  meta?: {
    title?: string;
    lines?: string[];
  };
};
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `container` | `SceneContainer` | - | Scene container dimensions in meters |
| `items` | `SceneItem[]` | - | Packed items rendered inside the container |
| `allItems` | `SceneItem[]` | `items` | Optional source list for stable group color ordering |
| `unloadedItems` | `SceneItem[]` | `[]` | Items rendered in the unloaded area |
| `highlightedIds` | `Set<string>` | `new Set()` | When non-empty, only render items whose ids are included |
| `opacity` | `number` | `0.75` | Opacity used for the unloaded zone overlay |
| `theme` | `'light' \| 'dark'` | `'light'` | Built-in scene theme |
| `paletteTokens` | `Partial<ScenePalette>` | `undefined` | Override scene palette tokens |
| `tooltipTokens` | `Partial<SceneTooltipTokens>` | `undefined` | Override default tooltip tokens |
| `renderTooltip` | `(item, unloaded) => ReactNode` | `undefined` | Custom tooltip renderer |
| `getItemColor` | `(item, groupKeys, theme) => string` | default palette mapping | Custom item color resolver |
| `width` | `CSSProperties['width']` | `'100%'` | Root width |
| `height` | `CSSProperties['height']` | `'100%'` | Root height |
| `minHeight` | `CSSProperties['minHeight']` | `500` | Root min-height |

## Exports

```ts
import Packing3DCore, {
  Packing3DScene,
  DARK_GROUP_COLORS,
  DARK_SCENE_PALETTE,
  DARK_SCENE_TOOLTIP_TOKENS,
  LIGHT_GROUP_COLORS,
  LIGHT_SCENE_PALETTE,
  LIGHT_SCENE_TOOLTIP_TOKENS,
  getDefaultGroupColor,
  getDefaultGroupColors,
  getDefaultScenePalette,
  getDefaultSceneTooltipTokens,
  getGroupColorByKey,
  resolveScenePalette,
  resolveSceneTooltipTokens,
  type Packing3DCoreProps,
  type SceneContainer,
  type SceneItem,
} from '@cardinal-odp/packing-3d-react';
```

`Packing3DScene` and `Packing3DCore` are the same component export.

## Notes

- The component includes a container wireframe, packed cargo cubes, and an unloaded-item zone.
- Hover and filtered-highlight states share the same tooltip rendering pipeline.
- The package is intentionally presentation-focused. Packing calculation, sorting, and business data mapping should stay outside.
