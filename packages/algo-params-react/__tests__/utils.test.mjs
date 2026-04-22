import assert from 'node:assert/strict';
import test from 'node:test';

import {
  injectFormDataValues,
  injectInfoToRules,
  normalizePreviewRules,
  reviveSerializedFunctions,
} from '../src/utils.mjs';

test('injectInfoToRules prefers formatter content', () => {
  const [result] = injectInfoToRules(
    [{ type: 'input', field: 'name', title: '名称' }],
    (rule) => `字段: ${rule.field}`,
  );

  assert.deepEqual(result.info, {
    type: 'popover',
    info: '字段: name',
    content: '字段: name',
    overlayStyle: { whiteSpace: 'pre-line', maxWidth: '300px' },
  });
});

test('normalizePreviewRules renders select label from formData value', () => {
  const [result] = normalizePreviewRules(
    injectFormDataValues(
      [
        {
          type: 'select',
          field: 'status',
          options: [{ label: '启用', value: 'enabled' }],
        },
      ],
      { status: 'enabled' },
    ),
  );

  assert.equal(result.type, 'input');
  assert.equal(result.value, '启用');
});

test('reviveSerializedFunctions parses serialized function markers', () => {
  const value = reviveSerializedFunctions({
    onSubmit:
      '[[FORM-CREATE-PREFIX-function (formData, api){ api.submitResult = formData; }-FORM-CREATE-SUFFIX]]',
  });

  assert.equal(typeof value.onSubmit, 'function');
});
