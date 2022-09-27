import { ComponentObjectPropsOptions, defineComponent, Prop, PropType } from 'vue';
import { createFormContext, CreateFormContextOptions, FormValues } from '../alfred-form';
import { useFormContext, __provideFormContext } from '../composables/form-context';
import { FormContextModel } from '../interfaces/form-config';

type _Props = CreateFormContextOptions<FormValues>;

const props: ComponentObjectPropsOptions<_Props> = {
  submitHandler: { type: Function, required: false } as Prop<_Props['submitHandler']>,
  values: { type: Object, required: false } as Prop<FormValues>,
  defaultEnableHelptext: { type: Boolean, required: false },
  formModelFactory: { type: Function, required: false } as Prop<_Props['formModelFactory']>,
  helptextKey: { type: Function, required: false } as Prop<_Props['helptextKey']>,
  labelKey: { type: Function, required: false } as Prop<_Props['labelKey']>,
  i18nBase: { type: String, required: false },
};

export const FormContext = defineComponent({
  props: {
    ...props,
    renderless: { type: Boolean, default: false },
    context: { type: Object as PropType<FormContextModel>, required: false },
  },
  setup(props, { slots }) {
    let context: FormContextModel;
    if (props.context) {
      context = props.context as FormContextModel;
    } else {
      if (props.submitHandler && props.values) {
        context = createFormContext(props as unknown as _Props);
      } else {
        try {
          context = useFormContext();
        } catch {
          throw new Error('When using FormContext either a context or onSubmit and values prop must be given.');
        }
      }
    }
    __provideFormContext(context);

    const { submit, form } = context;
    function handleSubmit(event: Event) {
      event.preventDefault();
      submit();
    }
    function handleReset(event: Event) {
      event.preventDefault();
      form.reset();
    }

    function slot() {
      return slots.default ? slots.default() : '';
    }

    return () =>
      props.renderless ? (
        slot()
      ) : (
        <form onSubmit={handleSubmit} onReset={handleReset} novalidate>
          {slot()}
        </form>
      );
  },
});
