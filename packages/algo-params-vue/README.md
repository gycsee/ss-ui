# `@cardinal-odp/algo-params-vue`

Vue 3 renderer for the `FcCreateAlgo` schema used in this repo.

This package is a thin wrapper around `@form-create/ant-design-vue`, with a stable API for:

- rendering `rule + option`
- edit / preview mode switching
- field info tooltip injection
- schema round-tripping with `option.formData`

## Install

```bash
npm install @cardinal-odp/algo-params-vue vue ant-design-vue @form-create/ant-design-vue
```

Then import the bundled styles:

```ts
import '@cardinal-odp/algo-params-vue/style.css';
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';

import FcCreateAlgo, {
  type FcCreateAlgoExpose,
} from '@cardinal-odp/algo-params-vue';
import '@cardinal-odp/algo-params-vue/style.css';

const fcRef = ref<FcCreateAlgoExpose>();

const rule = [
  {
    type: 'input',
    field: 'name',
    title: '名称',
    props: {
      placeholder: '请输入名称',
    },
    validate: [{ required: true }],
  },
  {
    type: 'select',
    field: 'status',
    title: '状态',
    options: [
      { label: '启用', value: 'enabled' },
      { label: '停用', value: 'disabled' },
    ],
  },
];

const option = {
  form: {
    colon: true,
    labelCol: { span: 8 },
    wrapperCol: { span: 16 },
  },
  formData: {
    status: 'enabled',
  },
};

const handleSubmit = async () => {
  const result = await fcRef.value?.submit();
  console.log('submit result', result);
};
</script>

<template>
  <FcCreateAlgo
    ref="fcRef"
    :option="option"
    :rule="rule"
    mode="edit"
    @submit="handleSubmit"
  />
</template>
```

## Props

`FcCreateAlgo` accepts these props:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rule` | `any[]` | `[]` | Form schema rules |
| `option` | `Record<string, any>` | `undefined` | Form options, including `form` and `formData` |
| `mode` | `'edit' \| 'preview'` | `'preview'` | Render editable controls or readonly preview |
| `showInfo` | `boolean` | `true` | Whether to inject field info tooltip |
| `infoFormatter` | `(rule) => string` | `undefined` | Custom tooltip content builder |
| `emptyText` | `string` | `'暂无表单配置'` | Empty state content |
| `popupContainer` | `HTMLElement \| ((trigger) => HTMLElement)` | `undefined` | Popup mount target for dropdown-like controls |
| `controlMaxWidth` | `number \| string` | `'500px'` | Max width for controls in edit mode |

## Events

The component emits:

| Event | Payload | Description |
| --- | --- | --- |
| `ready` | `api` | Called when the underlying FormCreate API is ready |
| `change` | `formData` | Called when form values change |
| `submit` | `result` | Called after `submit()` resolves |
| `validate` | `boolean` | Called after validation |

## Exposed Methods

Use `ref` to access the imperative API:

```ts
await fcRef.value?.validate();
await fcRef.value?.submit();
fcRef.value?.reset();
const formData = fcRef.value?.getFormData();
const api = fcRef.value?.getApi();
fcRef.value?.setSchema(nextRule, nextOption);
```

Methods:

| Method | Description |
| --- | --- |
| `validate()` | Runs field validation and returns `Promise<boolean>` |
| `submit()` | Triggers FormCreate submit and returns submit result |
| `reset()` | Resets the current form |
| `getFormData()` | Returns `{ rule, option }` with the latest `formData` merged in |
| `getApi()` | Returns the underlying FormCreate API |
| `setSchema(rule, option)` | Imperatively replaces schema |

## Schema Compatibility

This package is intended to consume the same schema shape already used in the current Vue app.

Supported behavior:

- Native rendering through `@form-create/ant-design-vue`
- `option.formData` backfill into `rule`
- Preview-mode normalization for:
  - `select`
  - `cascader`
  - `switch`
  - `radio`
  - `checkbox`
  - `datePicker` / `timePicker`
  - `slider`
- Info tooltip injection for:
  - fields with `field`
  - content blocks with `type: 'div'` and `title`
- Serialized function restoration for schema values containing the `FORM-CREATE-PREFIX-function` marker

## Utilities

The package also exports pure helpers:

```ts
import {
  injectInfoToRules,
  normalizePreviewRules,
} from '@cardinal-odp/algo-params-vue';
```

These are useful if you need to preprocess schema data outside the component.

## Styling

The package ships a minimal standalone stylesheet and does not depend on this repo's Tailwind classes or theme variables.

Available CSS variables:

```css
--fc-create-control-max-width
--fc-create-shadow-color
```

## Important Notes

- This package does not generate schema from raw business JSON.
- It only renders and manages an existing `rule + option` schema.
- Business concerns such as API requests, dirty checks, workflow control, and JSON-to-schema generation should stay outside this package.

## Validation

Current local verification for this package:

- `./node_modules/.bin/vue-tsc --noEmit -p packages/algo-params-vue/tsconfig.json`
- `node --test packages/algo-params-vue/__tests__/utils.test.mjs`
- `./node_modules/.bin/unbuild packages/algo-params-vue`
