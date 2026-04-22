<script setup lang="ts">
import { computed, ref, watch } from 'vue';

// @ts-ignore
import FormCreate from '@form-create/ant-design-vue';

import type {
  FcCreateAlgoExpose,
  FcCreateAlgoProps,
  FcCreateAlgoPopupContainer,
  FormCreateSchema,
} from './types';

import {
  hasSerializedFunctionMarker,
  injectFormDataValues,
  injectInfoToRules,
  normalizePreviewRules,
} from './utils';

defineOptions({
  name: 'FcCreateAlgo',
});

const props = withDefaults(defineProps<FcCreateAlgoProps>(), {
  controlMaxWidth: '500px',
  emptyText: '暂无表单配置',
  infoFormatter: undefined,
  mode: 'preview',
  option: undefined,
  popupContainer: undefined,
  rule: () => [],
  showInfo: true,
});

const emit = defineEmits<{
  (event: 'change', formData: Record<string, any>): void;
  (event: 'ready', api: any): void;
  (event: 'submit', result: any): void;
  (event: 'validate', valid: boolean): void;
}>();

const formApi = ref<any>(null);
const formData = ref<Record<string, any>>({});
const schemaRule = ref<any[]>(props.rule ?? []);
const schemaOption = ref<Record<string, any> | undefined>(props.option);
const formKey = ref(0);

const defaultPopupContainer = (triggerNode: any) => {
  if (triggerNode?.parentNode) {
    return triggerNode.parentNode;
  }

  if (typeof document !== 'undefined') {
    return document.body;
  }

  return triggerNode;
};

const resolvePopupContainer = (
  popupContainer: FcCreateAlgoPopupContainer,
  triggerNode: any,
) => {
  if (typeof popupContainer === 'function') {
    return popupContainer(triggerNode) || defaultPopupContainer(triggerNode);
  }

  return popupContainer || defaultPopupContainer(triggerNode);
};

const parseSchemaValue = <T,>(value: T): T => {
  if (!value || !FormCreate.parseJson || !hasSerializedFunctionMarker(value)) {
    return value;
  }

  return FormCreate.parseJson(JSON.stringify(value)) as T;
};

const processedRule = computed(() => {
  const rawRule = parseSchemaValue(
    Array.isArray(schemaRule.value) ? schemaRule.value : [],
  );
  const formDataMap = schemaOption.value?.formData || {};
  const ruleWithValues = injectFormDataValues(rawRule, formDataMap);
  const ruleWithInfo = props.showInfo
    ? injectInfoToRules(ruleWithValues, props.infoFormatter)
    : ruleWithValues;

  return props.mode === 'preview'
    ? normalizePreviewRules(ruleWithInfo)
    : ruleWithInfo;
});

const processedOption = computed(() => {
  const parsedOption = (parseSchemaValue(schemaOption.value) || {}) as Record<
    string,
    any
  >;
  const nextOption: Record<string, any> = {
    ...parsedOption,
    global: {
      ...parsedOption.global,
      '*': {
        ...parsedOption.global?.['*'],
        props: {
          ...parsedOption.global?.['*']?.props,
          getPopupContainer: (triggerNode: any) =>
            resolvePopupContainer(props.popupContainer, triggerNode),
        },
      },
    },
    resetBtn: parsedOption.resetBtn ?? false,
    submitBtn: parsedOption.submitBtn ?? false,
  };

  if (props.mode === 'preview' && nextOption.formData) {
    nextOption.formData = {};
  }

  return nextOption;
});

const containerStyle = computed(() => ({
  '--fc-create-control-max-width':
    typeof props.controlMaxWidth === 'number'
      ? `${props.controlMaxWidth}px`
      : props.controlMaxWidth,
}));

watch(
  () => props.rule,
  (value) => {
    schemaRule.value = Array.isArray(value) ? value : [];
  },
  { deep: true },
);

watch(
  () => props.option,
  (value) => {
    schemaOption.value = value;
  },
  { deep: true },
);

watch(
  [
    schemaRule,
    schemaOption,
    () => props.mode,
    () => props.showInfo,
    () => props.infoFormatter,
    () => props.popupContainer,
    () => props.controlMaxWidth,
  ],
  () => {
    formKey.value += 1;
    formData.value = {};
  },
  { deep: true, immediate: true },
);

watch(
  formData,
  (value) => {
    emit('change', value);
  },
  { deep: true },
);

const handleMounted = (api: any) => {
  formApi.value = api;
  emit('ready', api);
};

const getApi: FcCreateAlgoExpose['getApi'] = () => formApi.value;

const getFormData: FcCreateAlgoExpose['getFormData'] = () => {
  if (!Array.isArray(schemaRule.value) || schemaRule.value.length === 0) {
    return null;
  }

  const currentFormData = formApi.value ? formApi.value.formData() : {};
  const latestOption = {
    ...(schemaOption.value || {}),
    formData: {
      ...(schemaOption.value?.formData || {}),
      ...currentFormData,
    },
  };

  return {
    rule: schemaRule.value,
    option: latestOption,
  } satisfies FormCreateSchema;
};

const setSchema: FcCreateAlgoExpose['setSchema'] = (rule = [], option) => {
  schemaRule.value = Array.isArray(rule) ? rule : [];
  schemaOption.value = option;
};

const reset: FcCreateAlgoExpose['reset'] = () => {
  formData.value = {};
  if (formApi.value) {
    formApi.value.resetFields();
  }
};

const validate: FcCreateAlgoExpose['validate'] = async () => {
  if (!formApi.value) {
    emit('validate', false);
    return false;
  }

  try {
    await formApi.value.validate();
    emit('validate', true);
    return true;
  } catch {
    emit('validate', false);
    return false;
  }
};

const submit: FcCreateAlgoExpose['submit'] = async () => {
  if (!formApi.value) return undefined;

  try {
    await formApi.value.submit();
    const result = formApi.value.submitResult;
    emit('submit', result);
    return result;
  } catch (error: any) {
    if (
      error?.outOfDate === true &&
      Array.isArray(error.errorFields) &&
      error.errorFields.length === 0
    ) {
      try {
        await formApi.value.submit(true);
        const result = formApi.value.submitResult;
        emit('submit', result);
        return result;
      } catch {
        return undefined;
      }
    }

    return undefined;
  }
};

defineExpose<FcCreateAlgoExpose>({
  getApi,
  getFormData,
  reset,
  setSchema,
  submit,
  validate,
});
</script>

<template>
  <div
    class="fc-create-algo"
    :class="{ 'is-edit-mode': mode === 'edit' }"
    :style="containerStyle"
  >
    <div class="fc-create-algo__scroll">
      <FormCreate
        v-if="processedRule.length > 0"
        :key="formKey"
        v-model="formData"
        v-model:api="formApi"
        :option="processedOption"
        :rule="processedRule"
        @mounted="handleMounted"
      />
      <div v-else class="fc-create-algo__empty">
        {{ emptyText }}
      </div>
    </div>
  </div>
</template>
