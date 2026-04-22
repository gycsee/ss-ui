import type { ForwardedRef } from 'react';

export type FcCreateAlgoMode = 'edit' | 'preview';

export type FcCreateAlgoInfoFormatter = (rule: any) => string;

export type FcCreateAlgoPopupContainer =
  | HTMLElement
  | null
  | undefined
  | ((triggerNode: any) => HTMLElement | null | undefined);

export interface FormCreateSchema {
  option?: Record<string, any>;
  rule: any[];
}

export interface FcCreateAlgoReactProps {
  controlMaxWidth?: number | string;
  emptyText?: string;
  infoFormatter?: FcCreateAlgoInfoFormatter;
  mode?: FcCreateAlgoMode;
  onChange?: (formData: Record<string, any>) => void;
  onReady?: (api: any) => void;
  onSubmit?: (result: any) => void;
  onValidate?: (valid: boolean) => void;
  option?: Record<string, any>;
  popupContainer?: FcCreateAlgoPopupContainer;
  rule?: any[];
  showInfo?: boolean;
}

export interface FcCreateAlgoReactExpose {
  getApi: () => any;
  getFormData: () => FormCreateSchema | null;
  reset: () => void;
  setSchema: (rule?: any[], option?: Record<string, any>) => void;
  submit: () => Promise<any>;
  validate: () => Promise<boolean>;
}

export type FcCreateAlgoReactRef = ForwardedRef<FcCreateAlgoReactExpose>;
