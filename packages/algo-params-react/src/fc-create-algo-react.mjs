import React, {
  createElement as h,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Card,
  Cascader,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Select,
  Slider,
  Space,
  Switch,
  TimePicker,
  Tooltip,
  theme,
} from 'antd';

import {
  hasSerializedFunctionMarker,
  injectFormDataValues,
  injectInfoToRules,
  normalizePreviewRules,
  reviveSerializedFunctions,
} from './utils.mjs';

function getDefaultPopupContainer(triggerNode) {
  if (triggerNode?.parentNode) {
    return triggerNode.parentNode;
  }

  if (typeof document !== 'undefined') {
    return document.body;
  }

  return triggerNode;
}

function resolvePopupContainer(popupContainer, triggerNode) {
  if (typeof popupContainer === 'function') {
    return popupContainer(triggerNode) || getDefaultPopupContainer(triggerNode);
  }

  return popupContainer || getDefaultPopupContainer(triggerNode);
}

function getTooltipPopupContainer(popupContainer, triggerNode) {
  if (popupContainer) {
    return resolvePopupContainer(popupContainer, triggerNode);
  }

  if (typeof document !== 'undefined') {
    return document.body;
  }

  return getDefaultPopupContainer(triggerNode);
}

function parseSchemaValue(value) {
  if (!value || !hasSerializedFunctionMarker(value)) {
    return value;
  }

  return reviveSerializedFunctions(value);
}

function getFieldOptions(rule) {
  return rule.options || rule.props?.options || [];
}

function buildValidateRules(rule) {
  const rules = [];

  if (rule.$required) {
    rules.push({ required: true, message: rule.$required });
  }

  for (const item of rule.validate || []) {
    if (item?.pattern) {
      rules.push({
        pattern: new RegExp(item.pattern),
        message: item.message,
      });
      continue;
    }

    if (item?.type === 'email') {
      rules.push({ type: 'email', message: item.message });
      continue;
    }

    if (item?.type === 'url') {
      rules.push({ type: 'url', message: item.message });
      continue;
    }

    if (item?.minLen) {
      rules.push({ min: item.minLen, message: item.message });
    }
  }

  return rules;
}

function getLabel(rule) {
  return rule.title || rule.field || '';
}

function getInfoContent(rule, infoFormatter) {
  if (infoFormatter && (rule.field || (rule.type === 'div' && rule.title))) {
    return infoFormatter(rule);
  }

  if (typeof rule.info === 'string') {
    return rule.info;
  }

  if (rule.info?.content) {
    return rule.info.content;
  }

  if (rule.info?.info) {
    return rule.info.info;
  }

  if (rule.field) {
    return rule.field;
  }

  if (rule.type === 'div' && rule.title) {
    return rule.title;
  }

  return '';
}

function renderLabel(rule, infoFormatter, popupContainer) {
  const labelText = getLabel(rule);
  const infoContent = getInfoContent(rule, infoFormatter);

  if (!infoContent) {
    return labelText;
  }

  return h(
    'span',
    { className: 'fc-create-algo-react__label' },
    h('span', { className: 'fc-create-algo-react__label-text' }, labelText),
    h(
      Tooltip,
      {
        title: h(
          'span',
          { style: { whiteSpace: 'pre-line' } },
          String(infoContent),
        ),
        getPopupContainer: (triggerNode) =>
          getTooltipPopupContainer(popupContainer, triggerNode),
      },
      h('span', { className: 'fc-create-algo-react__info' }, '?'),
    ),
  );
}

function renderDivContent(rule, key, renderRules) {
  if (Array.isArray(rule.children) && rule.children.length > 0) {
    if (typeof rule.children[0] === 'string') {
      return h(
        'div',
        { key, style: rule.style },
        rule.title ? h('div', null, rule.title) : null,
        rule.children.join(''),
      );
    }

    return h('div', { key, style: rule.style }, renderRules(rule.children));
  }

  return h('div', { key, style: rule.style }, rule.title || null);
}

function renderPreviewInput(rule, component, extraProps = {}) {
  return h(component, {
    ...rule.props,
    ...extraProps,
    value: rule.value,
    readOnly: true,
    bordered: false,
    allowClear: false,
  });
}

function renderFieldControl(rule, context) {
  const type = String(rule.type || '').toLowerCase();
  const commonPopupProps = {
    getPopupContainer: (triggerNode) =>
      resolvePopupContainer(context.popupContainer, triggerNode),
  };

  switch (type) {
    case 'input':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input)
        : h(Input, { ...rule.props });

    case 'password':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input.Password)
        : h(Input.Password, { ...rule.props });

    case 'textarea':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input.TextArea)
        : h(Input.TextArea, { ...rule.props });

    case 'inputnumber':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input)
        : h(InputNumber, {
            ...rule.props,
            style: { width: '100%', ...rule.props?.style },
          });

    case 'select':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input)
        : h(Select, {
            ...rule.props,
            ...commonPopupProps,
            options: getFieldOptions(rule),
          });

    case 'radio':
    case 'aradio':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input)
        : h(
            Radio.Group,
            { ...rule.props, options: getFieldOptions(rule) },
            null,
          );

    case 'checkbox':
    case 'acheckbox':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input)
        : h(Checkbox.Group, {
            ...rule.props,
            options: getFieldOptions(rule),
          });

    case 'switch':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input)
        : h(Switch, { ...rule.props });

    case 'slider':
    case 'aslider':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input)
        : h(Slider, { ...rule.props });

    case 'cascader':
    case 'acascader':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input)
        : h(Cascader, {
            ...rule.props,
            ...commonPopupProps,
            options: getFieldOptions(rule),
          });

    case 'datepicker':
    case 'adatepicker':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input)
        : h(DatePicker, {
            ...rule.props,
            ...commonPopupProps,
            style: { width: '100%', ...rule.props?.style },
          });

    case 'timepicker':
    case 'atimepicker':
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input)
        : h(TimePicker, {
            ...rule.props,
            ...commonPopupProps,
            style: { width: '100%', ...rule.props?.style },
          });

    default:
      return context.mode === 'preview'
        ? renderPreviewInput(rule, Input)
        : h(Input, { ...rule.props });
  }
}

function renderRule(rule, key, context, renderRules) {
  if (typeof rule === 'string') {
    return rule;
  }

  if (!rule || typeof rule !== 'object') {
    return null;
  }

  const type = String(rule.type || '').toLowerCase();

  if (type === 'acard') {
    return h(
      Card,
      {
        key,
        title: rule.props?.title || rule.title,
        size: rule.props?.size,
        bordered: rule.props?.bordered !== false,
        hoverable: rule.props?.hoverable,
        style: rule.style,
      },
      renderRules(rule.children || []),
    );
  }

  if (type === 'arow' || type === 'row') {
    return h(
      Row,
      { key, ...rule.props, style: rule.style },
      renderRules(rule.children || []),
    );
  }

  if (type === 'col') {
    return h(
      Col,
      { key, ...rule.props, style: rule.style },
      renderRules(rule.children || []),
    );
  }

  if (type === 'aspace' || type === 'space') {
    return h(
      Space,
      { key, ...rule.props, style: rule.style },
      renderRules(rule.children || []),
    );
  }

  if (type === 'adivider' || type === 'divider') {
    return h(
      Divider,
      { key, ...rule.props, style: rule.style },
      rule.title || rule.props?.title || null,
    );
  }

  if (type === 'aalert' || type === 'alert') {
    return h(Alert, {
      key,
      ...rule.props,
      message: rule.title || rule.props?.message,
      style: rule.style,
    });
  }

  if (type === 'div') {
    return renderDivContent(rule, key, renderRules);
  }

  if (!rule.field) {
    return null;
  }

  const itemProps = {
    key,
    name: rule.field,
    label: renderLabel(rule, context.infoFormatter, context.popupContainer),
    rules: buildValidateRules(rule),
    style: rule.style,
  };

  if (type === 'switch' && context.mode !== 'preview') {
    itemProps.valuePropName = 'checked';
  }

  return h(
    Form.Item,
    itemProps,
    renderFieldControl(rule, context),
  );
}

const FcCreateAlgoReact = forwardRef(function FcCreateAlgoReact(props, ref) {
  const {
    controlMaxWidth = '500px',
    emptyText = '暂无表单配置',
    infoFormatter,
    mode = 'preview',
    onChange,
    onReady,
    onSubmit,
    onValidate,
    option,
    popupContainer,
    rule = [],
    showInfo = true,
  } = props;

  const [form] = Form.useForm();
  const { token } = theme.useToken();
  const [schemaRule, setSchemaRule] = useState(Array.isArray(rule) ? rule : []);
  const [schemaOption, setSchemaOption] = useState(option);
  const apiRef = useRef({ submitResult: undefined });

  useEffect(() => {
    setSchemaRule(Array.isArray(rule) ? rule : []);
  }, [rule]);

  useEffect(() => {
    setSchemaOption(option);
  }, [option]);

  const parsedRule = useMemo(
    () => parseSchemaValue(Array.isArray(schemaRule) ? schemaRule : []),
    [schemaRule],
  );

  const parsedOption = useMemo(
    () => parseSchemaValue(schemaOption || {}),
    [schemaOption],
  );

  const processedRule = useMemo(() => {
    const formDataMap = parsedOption?.formData || {};
    const ruleWithValues = injectFormDataValues(parsedRule, formDataMap);
    const ruleWithInfo = showInfo
      ? injectInfoToRules(ruleWithValues, infoFormatter)
      : ruleWithValues;

    return mode === 'preview'
      ? normalizePreviewRules(ruleWithInfo)
      : ruleWithInfo;
  }, [infoFormatter, mode, parsedOption, parsedRule, showInfo]);

  const externalApi = useMemo(
    () => ({
      getFieldsValue: () => form.getFieldsValue(true),
      resetFields: () => form.resetFields(),
      setFieldsValue: (values) => form.setFieldsValue(values),
      submitResult: apiRef.current.submitResult,
      validateFields: () => form.validateFields(),
    }),
    [form],
  );

  useEffect(() => {
    apiRef.current.submitResult = undefined;
    form.resetFields();
    if (parsedOption?.formData) {
      form.setFieldsValue(parsedOption.formData);
    }
  }, [form, parsedOption, processedRule]);

  useEffect(() => {
    if (onReady) {
      onReady(externalApi);
    }
  }, [externalApi, onReady]);

  const handleValuesChange = (_, allValues) => {
    if (onChange) {
      onChange(allValues);
    }
  };

  const getFormData = () => {
    if (!Array.isArray(schemaRule) || schemaRule.length === 0) {
      return null;
    }

    const currentFormData = form.getFieldsValue(true);
    return {
      rule: schemaRule,
      option: {
        ...(schemaOption || {}),
        formData: {
          ...(schemaOption?.formData || {}),
          ...currentFormData,
        },
      },
    };
  };

  const submit = async () => {
    const values = await form.validateFields();
    const nextApi = {
      ...externalApi,
      submitResult: undefined,
    };

    if (typeof parsedOption?.onSubmit === 'function') {
      await parsedOption.onSubmit(values, nextApi);
    } else {
      nextApi.submitResult = values;
    }

    apiRef.current.submitResult = nextApi.submitResult;
    const result = nextApi.submitResult;

    if (onSubmit) {
      onSubmit(result);
    }

    return result;
  };

  const validate = async () => {
    try {
      await form.validateFields();
      if (onValidate) {
        onValidate(true);
      }
      return true;
    } catch {
      if (onValidate) {
        onValidate(false);
      }
      return false;
    }
  };

  const reset = () => {
    form.resetFields();
    if (parsedOption?.formData) {
      form.setFieldsValue(parsedOption.formData);
    }
  };

  const setSchema = (nextRule = [], nextOption) => {
    setSchemaRule(Array.isArray(nextRule) ? nextRule : []);
    setSchemaOption(nextOption);
  };

  useImperativeHandle(
    ref,
    () => ({
      getApi: () => ({
        ...externalApi,
        submitResult: apiRef.current.submitResult,
      }),
      getFormData,
      reset,
      setSchema,
      submit,
      validate,
    }),
    [externalApi, parsedOption, schemaOption, schemaRule],
  );

  const renderRules = (rules) =>
    (Array.isArray(rules) ? rules : []).map((item, index) =>
      renderRule(
        item,
        `${item?.field || item?.name || item?.type || 'node'}-${index}`,
        { infoFormatter, mode, popupContainer },
        renderRules,
      ),
    );

  const className = `fc-create-algo-react${mode === 'edit' ? ' is-edit-mode' : ''}`;

  return h(
    'div',
    {
      className,
      style: {
        '--fc-create-card-hover-shadow-token':
          token.boxShadowSecondary || token.boxShadow,
        '--fc-create-control-max-width':
          typeof controlMaxWidth === 'number'
            ? `${controlMaxWidth}px`
            : controlMaxWidth,
        '--fc-create-empty-color-token':
          token.colorTextDescription || token.colorTextTertiary,
        '--fc-create-info-border-color-token':
          token.colorBorderSecondary || token.colorBorder,
        '--fc-create-info-color-token':
          token.colorTextDescription || token.colorTextTertiary,
      },
    },
    h(
      'div',
      { className: 'fc-create-algo-react__scroll' },
      processedRule.length > 0
        ? h(
            Form,
            {
              form,
              layout: parsedOption?.form?.layout || 'horizontal',
              labelCol: parsedOption?.form?.labelCol,
              wrapperCol: parsedOption?.form?.wrapperCol,
              onValuesChange: handleValuesChange,
            },
            renderRules(processedRule),
          )
        : h('div', { className: 'fc-create-algo-react__empty' }, emptyText),
    ),
  );
});

export default FcCreateAlgoReact;
