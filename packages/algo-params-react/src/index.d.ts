import type { ForwardRefExoticComponent, RefAttributes } from 'react';

import type {
  FcCreateAlgoReactExpose,
  FcCreateAlgoReactProps,
} from './types';

declare const FcCreateAlgoReact: ForwardRefExoticComponent<
  FcCreateAlgoReactProps & RefAttributes<FcCreateAlgoReactExpose>
>;

export default FcCreateAlgoReact;
export { FcCreateAlgoReact };

export type {
  FcCreateAlgoInfoFormatter,
  FcCreateAlgoMode,
  FcCreateAlgoPopupContainer,
  FcCreateAlgoReactExpose,
  FcCreateAlgoReactProps,
  FormCreateSchema,
} from './types';

export {
  hasSerializedFunctionMarker,
  injectFormDataValues,
  injectInfoToRules,
  normalizePreviewRules,
  reviveSerializedFunctions,
} from './utils.js';
