<script setup>
import { computed, ref } from 'vue';
import { Button, Card, Divider, Space, Tag, TypographyParagraph, TypographyTitle } from 'ant-design-vue';

import FcCreateAlgo from '@cardinal-odp/algo-params-vue';
import '@cardinal-odp/algo-params-vue/style.css';

const formRef = ref();
const mode = ref('edit');
const latestChange = ref({
  market: 'us',
  enabled: false,
  signals: ['breakout'],
  maxPosition: 10,
});
const latestSubmit = ref(null);
const latestSchema = ref(null);
const initialFormData = {
  market: 'us',
  enabled: false,
  signals: ['breakout'],
  maxPosition: 10,
};
latestChange.value = initialFormData;

const rule = [
  {
    type: 'input',
    field: 'name',
    title: 'Strategy Name',
    props: {
      placeholder: 'Momentum Catcher',
    },
    validate: [{ required: true, message: 'Please input a strategy name' }],
  },
  {
    type: 'select',
    field: 'market',
    title: 'Market',
    options: [
      { label: 'US Equities', value: 'us' },
      { label: 'Options', value: 'options' },
      { label: 'Futures', value: 'futures' },
    ],
  },
  {
    type: 'switch',
    field: 'enabled',
    title: 'Enabled',
    props: {
      checkedChildren: 'On',
      unCheckedChildren: 'Off',
    },
  },
  {
    type: 'checkbox',
    field: 'signals',
    title: 'Signals',
    options: [
      { label: 'Breakout', value: 'breakout' },
      { label: 'Reversal', value: 'reversal' },
      { label: 'Volatility', value: 'volatility' },
    ],
  },
  {
    type: 'aDivider',
    title: 'Risk Limits',
  },
  {
    type: 'inputNumber',
    field: 'maxPosition',
    title: 'Max Position',
    props: {
      min: 1,
      max: 50,
    },
  },
  {
    type: 'div',
    title: 'Notes',
    children: ['This block verifies the Vue wrapper and preview normalization.'],
  },
];

const option = {
  form: {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  formData: initialFormData,
};

const modeColor = computed(() => (mode.value === 'edit' ? 'blue' : 'gold'));

const handleSubmit = async () => {
  const result = await formRef.value?.submit();
  latestSubmit.value = result ?? null;
  latestSchema.value = formRef.value?.getFormData() ?? null;
};

const handleValidate = async () => {
  const valid = await formRef.value?.validate();
  window.alert(valid ? 'Validation passed' : 'Validation failed');
};

const handleReset = () => {
  formRef.value?.reset();
  latestSubmit.value = null;
};

const handleChange = (value) => {
  latestChange.value = value;
};

const handleSubmitEvent = (value) => {
  latestSubmit.value = value;
};

const handleSnapshot = () => {
  latestSchema.value = formRef.value?.getFormData() ?? null;
};

const pretty = (value) => JSON.stringify(value, null, 2);
</script>

<template>
  <div class="demo-shell">
    <div class="demo-header">
      <div>
        <TypographyTitle :level="2">algo-params-vue demo</TypographyTitle>
        <TypographyParagraph>
          Workspace demo for verifying schema rendering, validation, submit, reset, and preview mode.
        </TypographyParagraph>
      </div>
      <Tag :color="modeColor">{{ mode }}</Tag>
    </div>

    <Space wrap size="middle" class="demo-actions">
      <Button type="primary" @click="handleSubmit">Submit</Button>
      <Button @click="handleValidate">Validate</Button>
      <Button @click="handleReset">Reset</Button>
      <Button @click="handleSnapshot">Snapshot Schema</Button>
      <Button @click="mode = mode === 'edit' ? 'preview' : 'edit'">Toggle Preview</Button>
    </Space>

    <div class="demo-grid">
      <Card title="Form Demo">
        <FcCreateAlgo
          ref="formRef"
          :mode="mode"
          :option="option"
          :rule="rule"
          @change="handleChange"
          @submit="handleSubmitEvent"
          @validate="(valid) => console.log('vue demo validate', valid)"
        />
      </Card>

      <Card title="Live Form Data">
        <pre>{{ pretty(latestChange) }}</pre>
      </Card>

      <Card title="Latest Submit Result">
        <pre>{{ pretty(latestSubmit) }}</pre>
      </Card>

      <Card title="Schema Snapshot">
        <pre>{{ pretty(latestSchema) }}</pre>
      </Card>
    </div>

    <Divider />

    <TypographyParagraph type="secondary">
      Package under test: <code>@cardinal-odp/algo-params-vue</code>
    </TypographyParagraph>
  </div>
</template>
