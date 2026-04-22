import type { FcCreateAlgoInfoFormatter } from './types';

const PREVIEW_LAYOUT_TYPES = new Set([
  'aalert',
  'acard',
  'acollapse',
  'acollapsepanel',
  'adivider',
  'arow',
  'aspace',
  'atabpane',
  'atabs',
  'col',
  'divider',
  'div',
  'row',
  'space',
]);

function cloneChildren<T>(children: T, mapper: (items: any[]) => any[]): T {
  if (Array.isArray(children)) {
    return mapper(children) as T;
  }
  return children;
}

export function injectFormDataValues(
  rules: any[],
  formDataMap: Record<string, any> = {},
): any[] {
  if (!Array.isArray(rules) || Object.keys(formDataMap).length === 0) {
    return Array.isArray(rules) ? rules : [];
  }

  return rules.map((item) => {
    if (typeof item !== 'object' || item === null) return item;

    const nextItem = { ...item };

    if (nextItem.field && formDataMap[nextItem.field] !== undefined) {
      nextItem.value = formDataMap[nextItem.field];
    }

    if (Array.isArray(nextItem.children) && nextItem.children.length > 0) {
      nextItem.children = injectFormDataValues(nextItem.children, formDataMap);
    }

    return nextItem;
  });
}

export function injectInfoToRules(
  rules: any[],
  infoFormatter?: FcCreateAlgoInfoFormatter,
): any[] {
  if (!Array.isArray(rules)) return [];

  return rules.map((item) => {
    if (typeof item !== 'object' || item === null) return item;

    const nextItem = { ...item };
    const isTitleBlock = nextItem.type === 'div' && nextItem.title;

    if (infoFormatter) {
      if (nextItem.field || isTitleBlock) {
        const content = infoFormatter(nextItem);
        nextItem.info = {
          type: 'popover',
          info: content,
          content,
          overlayStyle: { whiteSpace: 'pre-line', maxWidth: '300px' },
        };
      }
    } else if (nextItem.field) {
      nextItem.info = nextItem.field;
    } else if (isTitleBlock) {
      nextItem.info = nextItem.title;
    }

    if (Array.isArray(nextItem.children) && nextItem.children.length > 0) {
      nextItem.children = injectInfoToRules(nextItem.children, infoFormatter);
    }

    return nextItem;
  });
}

export function normalizePreviewRules(rules: any[]): any[] {
  if (!Array.isArray(rules)) return [];

  return rules.map((item) => {
    if (typeof item !== 'object' || item === null) return item;

    const nextItem = { ...item };
    const type = String(nextItem.type || '').toLowerCase();
    const itemProps = { ...nextItem.props };
    const hasField = !!nextItem.field;
    const value = nextItem.value;
    const isEmpty =
      value === undefined ||
      value === null ||
      value === '' ||
      (Array.isArray(value) && value.length === 0);

    if (hasField && isEmpty) {
      nextItem.type = 'input';
      nextItem.value = '-';
      nextItem.props = { bordered: false, allowClear: false, readonly: true };
      return nextItem;
    }

    if (type === 'select') {
      const optionList: any[] = nextItem.options || itemProps.options || [];
      const values = Array.isArray(value)
        ? value
        : value !== undefined && value !== null && value !== ''
          ? [value]
          : [];

      nextItem.type = 'input';
      nextItem.value = values
        .map((currentValue: any) => {
          const matched = optionList.find(
            (option: any) => option.value === currentValue,
          );
          return matched ? matched.label : currentValue;
        })
        .join('、');
      nextItem.props = { bordered: false, allowClear: false, readonly: true };
      return nextItem;
    }

    if (type === 'cascader' || type === 'acascader') {
      const optionList: any[] = nextItem.options || itemProps.options || [];

      const findLabels = (options: any[], values: any[]): string[] => {
        if (!values.length) return [];

        const matched = options.find((option: any) => option.value === values[0]);
        if (!matched) return [String(values[0])];

        if (values.length > 1 && Array.isArray(matched.children)) {
          return [matched.label, ...findLabels(matched.children, values.slice(1))];
        }

        return [matched.label];
      };

      let displayText = '';
      if (Array.isArray(value) && value.length > 0) {
        displayText = Array.isArray(value[0])
          ? value
              .map((currentValue: any[]) =>
                findLabels(optionList, currentValue).join(' / '),
              )
              .join('、')
          : findLabels(optionList, value).join(' / ');
      } else if (value !== undefined && value !== null && value !== '') {
        displayText = String(value);
      }

      nextItem.type = 'input';
      nextItem.value = displayText;
      nextItem.props = { bordered: false, allowClear: false, readonly: true };
      return nextItem;
    }

    if (type === 'switch') {
      const checkedLabel = itemProps.checkedChildren || '是';
      const uncheckedLabel = itemProps.unCheckedChildren || '否';
      const checkedValue =
        itemProps.checkedValue === undefined ? true : itemProps.checkedValue;

      nextItem.type = 'input';
      nextItem.value = nextItem.value === checkedValue ? checkedLabel : uncheckedLabel;
      nextItem.props = { bordered: false, allowClear: false, readonly: true };
      return nextItem;
    }

    if (type === 'radio' || type === 'aradio') {
      const optionList: any[] = nextItem.options || itemProps.options || [];
      const matched = optionList.find((option: any) => option.value === value);

      nextItem.type = 'input';
      nextItem.value = matched ? matched.label : (value ?? '');
      nextItem.props = { bordered: false, allowClear: false, readonly: true };
      return nextItem;
    }

    if (type === 'checkbox' || type === 'acheckbox') {
      const optionList: any[] = nextItem.options || itemProps.options || [];
      const values = Array.isArray(value)
        ? value
        : value !== undefined && value !== null
          ? [value]
          : [];

      nextItem.type = 'input';
      nextItem.value = values
        .map((currentValue: any) => {
          const matched = optionList.find(
            (option: any) => option.value === currentValue,
          );
          return matched ? matched.label : currentValue;
        })
        .join('、');
      nextItem.props = { bordered: false, allowClear: false, readonly: true };
      return nextItem;
    }

    if (
      ['adatepicker', 'atimepicker', 'datepicker', 'timepicker'].includes(type)
    ) {
      nextItem.props = {
        ...itemProps,
        bordered: false,
        allowClear: false,
        open: false,
        inputReadOnly: true,
      };
      nextItem.children = cloneChildren(nextItem.children, normalizePreviewRules);
      return nextItem;
    }

    if (type === 'slider' || type === 'aslider') {
      nextItem.props = { ...itemProps, disabled: true };
      return nextItem;
    }

    if (PREVIEW_LAYOUT_TYPES.has(type)) {
      nextItem.children = cloneChildren(nextItem.children, normalizePreviewRules);
      return nextItem;
    }

    nextItem.props = {
      ...itemProps,
      bordered: false,
      allowClear: false,
      readonly: true,
    };
    nextItem.children = cloneChildren(nextItem.children, normalizePreviewRules);

    return nextItem;
  });
}

export function hasSerializedFunctionMarker(value: unknown): boolean {
  if (typeof value === 'string') {
    return value.includes('FORM-CREATE-PREFIX-function');
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasSerializedFunctionMarker(item));
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some((item) => hasSerializedFunctionMarker(item));
  }

  return false;
}
