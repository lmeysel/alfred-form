import { ExtractPropTypes, onUnmounted, PropType, Ref, shallowReactive, shallowRef, watchEffect } from 'vue';
import { FormElementModel, FormField, Mutable, ValidationRule, ValidationRuleBuilder } from '../alfred-form';
import { useFormContext } from './form-context';

let idGen = 0;

export function withFormElementProps() {
  return {
    name: { type: String as PropType<string>, required: true as const },
    label: { type: String },
    rule: { type: Function as PropType<ValidationRuleBuilder>, required: false as const },
    helptext: { type: [Boolean, String] },
    required: { type: [Boolean] },
  };
}
type FormElementProps = Readonly<ExtractPropTypes<ReturnType<typeof withFormElementProps>>>;

export function useFormElement(props: FormElementProps) {
  const formContext = useFormContext();
  const id = ++idGen;

  const formField: Ref<FormField> = shallowRef() as any;
  const field: Mutable<FormElementModel> = shallowReactive({
    path: '',
    identifier: '',
    label: '',
    helptext: null as string | null,
    get value() {
      return formField.value.model.value;
    },
    set value(value) {
      formField.value.model.value = value;
    },
    get error() {
      return formField.value.model.error;
    },
    get required() {
      return !!props.required;
    },
  });

  watchEffect(() => {
    const path = (field.path = formContext.fieldPath(props.name));
    formField.value = formContext.form.field(path);
    field.identifier = `${id}$${formContext.identifier(path)}`;
  });

  watchEffect(() => {
    const labelKey = props.label ?? formContext.labelKey(props.name);
    field.label = formContext.translate(labelKey);
  });

  watchEffect(() => {
    let helptextKey = props.helptext ?? formContext.defaultEnableHelptext;
    if (helptextKey) {
      if (helptextKey === true) helptextKey = formContext.helptextKey(props.name);
      field.helptext = formContext.translate(helptextKey);
    } else field.helptext = null;
  });
  let unregisterRule: undefined | (() => void);
  watchEffect(() => {
    const { rule } = props;
    if (unregisterRule) unregisterRule();
    if (rule || formContext.validationAutoRule) {
      unregisterRule = formContext.registerRule(field.path, (helper) => {
        let ret = rule ? rule(helper) : undefined;
        if (formContext.validationAutoRule) {
          ret = formContext.validationAutoRule(helper, field, ret);
        }
        return ret as ValidationRule;
      });
    }
  });
  onUnmounted(() => unregisterRule && unregisterRule());

  return {
    field: field as FormElementModel,
    store: () => formField.value.store(),
    reset: () => formField.value.reset(),
  };
}
