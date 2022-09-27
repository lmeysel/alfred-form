import { ComponentObjectPropsOptions, defineComponent } from 'vue';
import { updateFormContext, UpdateFormContextOptions } from '../alfred-form';

type _Props = UpdateFormContextOptions;

const props: ComponentObjectPropsOptions<Required<_Props>> = {
  subkey: { type: String, required: false },
  defaultEnableHelptext: { type: Boolean, default: undefined },
  i18nBase: { type: String, required: false },
};

export const UpdateFormContext = defineComponent({
  props,
  setup(props, { slots }) {
    updateFormContext(props as _Props);

    return () => (slots.default ? slots.default() : '');
  },
});
