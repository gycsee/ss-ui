import { Button, Card, Divider, Space, Tag, Typography } from 'antd';
import { useRef, useState } from 'react';

import FcCreateAlgoReact from '@cardinal-odp/algo-params-react';
import '@cardinal-odp/algo-params-react/style.css';

const rule = [
  {
    type: 'input',
    field: 'name',
    title: 'Strategy Name',
    $required: 'Please input a strategy name',
    props: {
      placeholder: 'Mean Reversion v1',
    },
  },
  {
    type: 'select',
    field: 'market',
    title: 'Market',
    options: [
      { label: 'US Equities', value: 'us' },
      { label: 'Crypto', value: 'crypto' },
      { label: 'Futures', value: 'futures' },
    ],
  },
  {
    type: 'switch',
    field: 'enabled',
    title: 'Enabled',
    value: true,
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
      { label: 'RSI', value: 'rsi' },
      { label: 'MACD', value: 'macd' },
      { label: 'Volume Spike', value: 'volume' },
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
      max: 100,
    },
  },
  {
    type: 'div',
    title: 'Notes',
    children: ['This block verifies layout and preview rendering.'],
  },
];

const option = {
  form: {
    layout: 'horizontal',
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  },
  formData: {
    market: 'crypto',
    enabled: true,
    signals: ['rsi', 'volume'],
    maxPosition: 20,
  },
  onSubmit(formData, api) {
    api.submitResult = {
      ...formData,
      submittedAt: new Date().toISOString(),
    };
  },
};

function pretty(value) {
  return JSON.stringify(value, null, 2);
}

export default function AlgoParamsReactDemo() {
  const formRef = useRef(null);
  const [mode, setMode] = useState('edit');
  const [latestChange, setLatestChange] = useState(option.formData);
  const [latestSubmit, setLatestSubmit] = useState(null);
  const [latestSchema, setLatestSchema] = useState(null);

  const handleValidate = async () => {
    const valid = await formRef.current?.validate();
    window.alert(valid ? 'Validation passed' : 'Validation failed');
  };

  const handleSubmit = async () => {
    const result = await formRef.current?.submit();
    setLatestSubmit(result ?? null);
    setLatestSchema(formRef.current?.getFormData() ?? null);
  };

  const handleReset = () => {
    formRef.current?.reset();
    setLatestSubmit(null);
  };

  return (
    <div className="package-demo">
      <div className="package-demo__hero">
        <div>
          <Typography.Title level={3}>algo-params-react demo</Typography.Title>
          <Typography.Paragraph>
            验证 schema 渲染、校验、提交、重置和 preview 模式切换。
          </Typography.Paragraph>
        </div>
        <div className="package-demo__tags">
          <Tag color={mode === 'edit' ? 'blue' : 'gold'}>{mode}</Tag>
        </div>
      </div>

      <Space wrap size="middle" className="package-demo__actions">
        <Button type="primary" onClick={handleSubmit}>
          Submit
        </Button>
        <Button onClick={handleValidate}>Validate</Button>
        <Button onClick={handleReset}>Reset</Button>
        <Button onClick={() => setLatestSchema(formRef.current?.getFormData() ?? null)}>
          Snapshot Schema
        </Button>
        <Button onClick={() => setMode((current) => (current === 'edit' ? 'preview' : 'edit'))}>
          Toggle Preview
        </Button>
      </Space>

      <div className="package-demo__grid package-demo__grid--form">
        <Card className="package-demo__card-span-2" title="Form Demo">
          <FcCreateAlgoReact
            ref={formRef}
            mode={mode}
            option={option}
            rule={rule}
            onChange={setLatestChange}
            onSubmit={setLatestSubmit}
            onValidate={(valid) => {
              console.log('react demo validate', valid);
            }}
          />
        </Card>

        <Card title="Live Form Data">
          <pre>{pretty(latestChange)}</pre>
        </Card>

        <Card title="Latest Submit Result">
          <pre>{pretty(latestSubmit)}</pre>
        </Card>

        <Card title="Schema Snapshot">
          <pre>{pretty(latestSchema)}</pre>
        </Card>
      </div>

      <Divider />

      <Typography.Paragraph type="secondary">
        Package under test: <code>@cardinal-odp/algo-params-react</code>
      </Typography.Paragraph>
    </div>
  );
}
