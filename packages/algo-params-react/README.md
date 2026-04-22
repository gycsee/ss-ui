# `@cardinal-odp/algo-params-react`

React renderer for the `FcCreateAlgo` schema used in this repo.

This package is intended for **React + Ant Design** projects that want to reuse the same `rule/option` schema shape as the Vue version.

It is **not** an official `form-create` React renderer. The upstream `form-create` project currently documents Vue renderers only, so this package provides a React-compatible implementation for the schema subset we use here.

Official package list: https://www.form-create.com/en/v3/guide/packages

## Install

```bash
npm install @cardinal-odp/algo-params-react react react-dom antd
```

Then import the bundled styles:

```ts
import '@cardinal-odp/algo-params-react/style.css';
```

## Usage

```tsx
import { useMemo, useRef } from 'react';

import FcCreateAlgoReact, {
  type FcCreateAlgoRef,
} from '@cardinal-odp/algo-params-react';
import '@cardinal-odp/algo-params-react/style.css';

export default function Demo() {
  const formRef = useRef<FcCreateAlgoRef>(null);

  const schema = useMemo(
    () => ({
      rule: [
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
      ],
      option: {
        form: {
          colon: true,
          labelCol: { span: 8 },
          wrapperCol: { span: 16 },
        },
        formData: {
          status: 'enabled',
        },
      },
    }),
    [],
  );

  return (
    <FcCreateAlgoReact
      ref={formRef}
      mode="edit"
      option={schema.option}
      rule={schema.rule}
      onSubmit={(result) => {
        console.log('submit result', result);
      }}
    />
  );
}
```

## Props

`FcCreateAlgoReact` accepts these props:

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `rule` | `any[]` | `[]` | Form schema rules |
| `option` | `Record<string, any>` | `undefined` | Form options, including `form` and `formData` |
| `mode` | `'edit' \| 'preview'` | `'preview'` | Render editable controls or readonly preview |
| `showInfo` | `boolean` | `true` | Whether to show field info tooltip |
| `infoFormatter` | `(rule) => string` | `undefined` | Custom tooltip content builder |
| `emptyText` | `ReactNode` | `'暂无表单配置'` | Empty state content |
| `popupContainer` | `HTMLElement \| ((trigger) => HTMLElement)` | `undefined` | Popup mount target for dropdown-like controls |
| `controlMaxWidth` | `number \| string` | `'500px'` | Max width for controls in edit mode |
| `onReady` | `(api) => void` | `undefined` | Called after form API is ready |
| `onChange` | `(formData) => void` | `undefined` | Called when form values change |
| `onSubmit` | `(result) => void` | `undefined` | Called after `submit()` resolves |
| `onValidate` | `(valid) => void` | `undefined` | Called after validation |

## Ref API

Use `ref` to access imperative methods:

```tsx
const ref = useRef<FcCreateAlgoRef>(null);

await ref.current?.validate();
await ref.current?.submit();
ref.current?.reset();
const formData = ref.current?.getFormData();
const api = ref.current?.getApi();
ref.current?.setSchema(nextRule, nextOption);
```

Methods:

| Method | Description |
| --- | --- |
| `validate()` | Runs field validation and returns `Promise<boolean>` |
| `submit()` | Validates, resolves current form data, and returns submit result |
| `reset()` | Resets the form back to current `option.formData` |
| `getFormData()` | Returns `{ rule, option }` with the latest `formData` merged in |
| `getApi()` | Returns the internal lightweight API wrapper |
| `setSchema(rule, option)` | Imperatively replaces schema |

## Schema Compatibility

This renderer is designed to consume the same schema structure used by the Vue package.

Supported today:

- Common fields: `input`, `textarea`, `password`, `inputNumber`, `number`
- Choice controls: `select`, `radio`, `checkbox`, `switch`, `cascader`
- Time controls: `datePicker`, `timePicker`
- Layout/content blocks: `aCard`, `aAlert`, `aDivider`, `aRow`, `col`, `aSpace`, `aCollapse`, `aCollapsePanel`, `aTabs`, `div`
- Preview-mode normalization for `select`, `cascader`, `switch`, `radio`, `checkbox`, `date/time`, `slider`
- `option.formData` backfill
- Serialized function restoration for schema values that use the `FORM-CREATE-PREFIX-function` marker

## Important Limitations

- This package does **not** use `@form-create/ant-design-vue` internally.
- It is **schema-compatible**, not feature-complete with Vue `form-create`.
- Complex custom components, advanced linkage, slots, and framework-specific `form-create` extensions are not fully implemented.
- `option.onSubmit` is supported when provided as a real function or when restored from the serialized function marker, but broader `form-create` runtime behavior is intentionally not replicated.

## Styling

The package ships a minimal standalone stylesheet and does not depend on this repo's Tailwind classes or theme variables.

Available CSS variables:

```css
--fc-create-control-max-width
--fc-create-shadow-color
```

## Development Notes

The React package lives alongside the Vue package:

- Vue: [../algo-params-vue](../algo-params-vue)
- React: current package

Shared behavior is kept aligned at the schema level, especially around:

- info injection
- preview value normalization
- `rule + option.formData` round-tripping
