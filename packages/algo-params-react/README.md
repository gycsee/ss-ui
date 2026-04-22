# `@cardinal-odp/algo-params-react`

React renderer for the `rule + option` schema used by `FcCreateAlgo`.

This package targets `React + Ant Design` projects that need to render the same schema shape as the Vue package. It is not an official `form-create` React renderer; it implements the subset used in this repo.

## Install

```bash
npm install @cardinal-odp/algo-params-react react react-dom antd
```

```ts
import '@cardinal-odp/algo-params-react/style.css';
```

## Usage

```tsx
import { Button, Space } from 'antd';
import { useRef } from 'react';

import FcCreateAlgoReact, {
  type FcCreateAlgoReactExpose,
} from '@cardinal-odp/algo-params-react';
import '@cardinal-odp/algo-params-react/style.css';

const rule = [
  {
    type: 'input',
    field: 'name',
    title: '名称',
    $required: '请输入名称',
    props: {
      placeholder: '请输入名称',
    },
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
  onSubmit(formData, api) {
    api.submitResult = {
      formData,
      submittedAt: Date.now(),
    };
  },
};

export default function Demo() {
  const formRef = useRef<FcCreateAlgoReactExpose>(null);

  const handleSubmit = async () => {
    const result = await formRef.current?.submit();
    console.log('submit result', result);
  };

  const handleInspect = () => {
    console.log(formRef.current?.getFormData());
  };

  return (
    <>
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={handleSubmit}>
          Submit
        </Button>
        <Button onClick={handleInspect}>Get Schema</Button>
      </Space>

      <FcCreateAlgoReact
        ref={formRef}
        mode="edit"
        option={option}
        rule={rule}
        onChange={(formData) => {
          console.log('change', formData);
        }}
        onSubmit={(result) => {
          console.log('onSubmit callback', result);
        }}
      />
    </>
  );
}
```

`submit()` first validates the form. If `option.onSubmit` exists, set `api.submitResult` inside that handler; otherwise `submit()` returns the current form values.

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rule` | `any[]` | `[]` | Schema rules |
| `option` | `Record<string, any>` | `undefined` | Schema option object. `option.form` and `option.formData` are used directly |
| `mode` | `'edit' \| 'preview'` | `'preview'` | Editable form or readonly preview |
| `showInfo` | `boolean` | `true` | Inject tooltip info for fields and `div` title blocks |
| `infoFormatter` | `(rule) => string` | `undefined` | Custom tooltip content |
| `emptyText` | `string` | `'暂无表单配置'` | Empty state text |
| `popupContainer` | `HTMLElement \| ((triggerNode) => HTMLElement \| null \| undefined)` | `undefined` | Popup mount target for label tooltips and popup controls such as `select` / `cascader` / pickers |
| `controlMaxWidth` | `number \| string` | `'500px'` | Max width CSS variable for form controls |
| `onReady` | `(api) => void` | `undefined` | Called when the internal form API is ready |
| `onChange` | `(formData) => void` | `undefined` | Called on value change |
| `onSubmit` | `(result) => void` | `undefined` | Called after `submit()` resolves |
| `onValidate` | `(valid) => void` | `undefined` | Called after `validate()` completes |

## Ref API

```tsx
const ref = useRef<FcCreateAlgoReactExpose>(null);

await ref.current?.validate();
await ref.current?.submit();
ref.current?.reset();
ref.current?.setSchema(nextRule, nextOption);

const schema = ref.current?.getFormData();
const api = ref.current?.getApi();
```

| Method | Description |
| --- | --- |
| `validate()` | Runs `form.validateFields()` and returns `Promise<boolean>` |
| `submit()` | Validates first, then runs `option.onSubmit(formData, api)` when present |
| `reset()` | Resets the form and reapplies `option.formData` |
| `getFormData()` | Returns `{ rule, option }` with latest `option.formData` merged in |
| `getApi()` | Returns the lightweight internal API wrapper |
| `setSchema(rule, option)` | Replaces the current schema |

## Exported Utilities

```ts
import {
  hasSerializedFunctionMarker,
  injectFormDataValues,
  injectInfoToRules,
  normalizePreviewRules,
  reviveSerializedFunctions,
} from '@cardinal-odp/algo-params-react';
```

These helpers are pure functions and can be used outside the component.

## Supported Schema Subset

Currently implemented render types:

- Fields: `input`, `password`, `textarea`, `inputNumber`, `select`, `radio`, `checkbox`, `switch`, `slider`, `cascader`, `datePicker`, `timePicker`
- Layout / content: `aCard`, `aAlert`, `aDivider`, `aRow`, `row`, `col`, `aSpace`, `space`, `div`
- Shared behaviors: `option.formData` backfill, info tooltip injection, preview normalization, serialized function revival

The React renderer also reads `option.form.layout`, `option.form.labelCol`, and `option.form.wrapperCol`.

## Limitations

- This package does not embed Vue `form-create`; it only mirrors part of the schema behavior.
- Validation support is intentionally narrow. Required validation currently uses `$required`, and `rule.validate` only covers common items such as `pattern`, `email`, `url`, and `minLen`.
- Advanced `form-create` features such as custom components, slots, linkage, tabs/collapse containers, and framework-specific runtime extensions are not fully implemented.

## Styling

The package ships a standalone stylesheet.

Custom colors now follow the active Ant Design theme token by default. You can still override them with CSS variables.

```css
--fc-create-control-max-width
--fc-create-empty-color
--fc-create-info-border-color
--fc-create-info-color
--fc-create-card-hover-shadow
--fc-create-shadow-color
```
