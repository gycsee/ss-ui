import assert from 'node:assert/strict';
import test from 'node:test';

import {
  injectFormDataValues,
  injectInfoToRules,
  normalizePreviewRules,
} from '../src/utils.ts';

test('injectInfoToRules prefers custom formatter output', () => {
  const rules = [{ type: 'input', field: 'name', title: '名称' }];
  const [result] = injectInfoToRules(rules, (rule) => `字段: ${rule.field}`);

  assert.deepEqual(result.info, {
    type: 'popover',
    info: '字段: name',
    content: '字段: name',
    overlayStyle: { whiteSpace: 'pre-line', maxWidth: '300px' },
  });
});

test('normalizePreviewRules renders select labels from injected formData', () => {
  const rules = [
    {
      type: 'select',
      field: 'status',
      options: [
        { label: '启用', value: 'enabled' },
        { label: '停用', value: 'disabled' },
      ],
    },
  ];

  const [result] = normalizePreviewRules(
    injectFormDataValues(rules, { status: 'enabled' }),
  );

  assert.equal(result.type, 'input');
  assert.equal(result.value, '启用');
  assert.deepEqual(result.props, {
    bordered: false,
    allowClear: false,
    readonly: true,
  });
});

test('normalizePreviewRules renders switch values as readable text', () => {
  const rules = [
    {
      type: 'switch',
      field: 'visible',
      value: true,
      props: {
        checkedChildren: '开',
        unCheckedChildren: '关',
      },
    },
  ];

  const [result] = normalizePreviewRules(rules);

  assert.equal(result.type, 'input');
  assert.equal(result.value, '开');
});
