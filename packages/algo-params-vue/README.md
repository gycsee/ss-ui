# `@cardinal-odp/algo-params-vue`

Vue 3 wrapper around `@form-create/ant-design-vue` for the `FcCreateAlgo` schema used in this repo.

It adds a stable wrapper API around:

- rendering `rule + option`
- edit / preview mode switching
- field info tooltip injection
- schema round-tripping through `option.formData`

## Install

```bash
npm install @cardinal-odp/algo-params-vue vue ant-design-vue @form-create/ant-design-vue
```

```ts
import '@cardinal-odp/algo-params-vue/style.css';
```

## Usage

```vue
<script setup lang="ts">
import { ref } from 'vue';

import { Button, Space } from 'ant-design-vue';

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
    validate: [{ required: true, message: '请输入名称' }],
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
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  formData: {
    status: 'enabled',
  },
};

const handleValidate = async () => {
  const valid = await fcRef.value?.validate();
  if (!valid) return;

  console.log(fcRef.value?.getFormData());
};

const handleSubmit = async () => {
  const result = await fcRef.value?.submit();
  console.log('submit result', result);
};
</script>

<template>
  <Space style="margin-bottom: 16px">
    <Button type="primary" @click="handleSubmit">Submit</Button>
    <Button @click="handleValidate">Validate + Inspect</Button>
  </Space>

  <FcCreateAlgo
    ref="fcRef"
    :option="option"
    :rule="rule"
    mode="edit"
    @change="(formData) => console.log('change', formData)"
    @submit="(result) => console.log('submit event', result)"
  />
</template>
```

`@submit` is emitted after calling `fcRef.value?.submit()` and the wrapper receives a submit result. It is not a click event for a built-in submit button.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rule` | `any[]` | `[]` | Schema rules |
| `option` | `Record<string, any>` | `undefined` | Schema option object passed to `form-create` |
| `mode` | `'edit' \| 'preview'` | `'preview'` | Editable form or readonly preview |
| `showInfo` | `boolean` | `true` | Inject tooltip info for fields and `div` title blocks |
| `infoFormatter` | `(rule) => string` | `undefined` | Custom tooltip content |
| `emptyText` | `string` | `'暂无表单配置'` | Empty state text |
| `popupContainer` | `HTMLElement \| ((triggerNode) => HTMLElement \| null \| undefined)` | `undefined` | Popup mount target for label tooltips and popup controls such as dropdowns |
| `controlMaxWidth` | `number \| string` | `'500px'` | Max width CSS variable for form controls |

## Events

| Event | Payload | Description |
| --- | --- | --- |
| `ready` | `api` | Emitted when the underlying FormCreate API is ready |
| `change` | `formData` | Emitted when form values change |
| `submit` | `result` | Emitted after `submit()` resolves successfully |
| `validate` | `boolean` | Emitted after `validate()` completes |

## Exposed Methods

```ts
await fcRef.value?.validate();
await fcRef.value?.submit();
fcRef.value?.reset();
fcRef.value?.setSchema(nextRule, nextOption);

const schema = fcRef.value?.getFormData();
const api = fcRef.value?.getApi();
```

| Method | Description |
| --- | --- |
| `validate()` | Runs validation and returns `Promise<boolean>` |
| `submit()` | Calls the underlying FormCreate submit flow and returns `submitResult` when available |
| `reset()` | Resets fields through the underlying FormCreate API |
| `getFormData()` | Returns `{ rule, option }` with latest `option.formData` merged in |
| `getApi()` | Returns the underlying FormCreate API |
| `setSchema(rule, option)` | Replaces the current schema |

If the underlying submit flow does not produce `submitResult`, or validation fails, `submit()` returns `undefined`.

## Exported Utilities

```ts
import {
  injectInfoToRules,
  normalizePreviewRules,
} from '@cardinal-odp/algo-params-vue';
```

These helpers are pure functions and can be used outside the component.

## Wrapper Behavior

This package keeps native rendering on top of `@form-create/ant-design-vue`, and adds:

- `option.formData` backfill into `rule`
- preview normalization for `select`, `cascader`, `switch`, `radio`, `checkbox`, `datePicker`, `timePicker`, and `slider`
- info tooltip injection for fields and `type: 'div'` title blocks
- serialized function restoration for schema values exported from `form-create`

## Styling

The package ships a standalone stylesheet.

Custom colors now follow the active Ant Design Vue theme token by default. You can still override them with CSS variables.

```css
--fc-create-control-max-width
--fc-create-empty-color
--fc-create-card-hover-shadow
--fc-create-shadow-color
```

## Notes

- This package renders an existing schema; it does not generate schema from business JSON.
- Business-specific submit requests, dirty-state handling, and schema generation should stay outside the package.
