import { inject, InjectionKey, provide } from 'vue';
import { I18nConfiguration, ValidationResult, ValidationRuleBuilder } from '../alfred-form';
import { CreateFormContextOptions, FormContextModel, UpdateFormContextOptions } from '../interfaces/form-config';
import { FormModel } from '../interfaces/form-model';
import { getPluginConfig } from '../plugin';
import { FormValues, Transform } from '../types';

const FormContextInjectionKey: InjectionKey<FormContextModel> = Symbol('Form context');

function i18nContext(baseKey: string, { labelKey, helptextKey, translate }: I18nConfiguration) {
  function derive(key: string, derivative: Transform<string>) {
    const seg = key.split('.');
    const last = seg.pop();
    if (baseKey) seg.unshift(baseKey);
    return [...seg, derivative(last as string)].join('.');
  }
  return {
    translationKey: (key: string) => (translate ? derive(key, (_) => _) : key),
    labelKey: (key: string) => (translate ? derive(key, labelKey) : key),
    helptextKey: (key: string) => (translate ? derive(key, helptextKey) : key),
  };
}
function identifier(fieldpath: string) {
  return fieldpath.replace(/\./, '$');
}
export function createFormContext<T extends FormValues>({
  values,
  i18nBase = '',
  defaultEnableHelptext: defaultEnableHelpdesk,
  validationSchemaBuilderFactory,
  validationAutoRule,
  formModelFactory,
  submitHandler,
}: CreateFormContextOptions<T>): FormContextModel<T> {
  const pluginConfig = getPluginConfig();

  // setup form
  if (!formModelFactory) {
    if (!pluginConfig.formModelFactory)
      throw new Error('The formModelClass must be specified in plugin config or when creating form context.');
    formModelFactory = pluginConfig.formModelFactory;
  }

  // form validation
  const validationSchemaBuilder = validationSchemaBuilderFactory
    ? validationSchemaBuilderFactory()
    : pluginConfig.validationSchemaBuilderFactory
    ? pluginConfig.validationSchemaBuilderFactory()
    : null;

  function registerRule(fieldPath: string, builder: ValidationRuleBuilder) {
    if (validationSchemaBuilder) {
      validationSchemaBuilder.register(fieldPath, builder);
      return () => validationSchemaBuilder.unregister(fieldPath);
    }
    return () => undefined;
  }
  if (!validationAutoRule) validationAutoRule = pluginConfig.validationAutoRule;

  const form = formModelFactory() as FormModel<T>;
  form.initialize(values);

  // field path
  function fieldPath(field: string): string {
    return field;
  }

  // submit handler
  async function submit(): Promise<void> {
    // maybe handle errors etc. here...
    try {
      let values = form.getValues();
      if (validationSchemaBuilder) {
        const schema = validationSchemaBuilder.getSchema();
        const maybePromise = schema.validate(values);
        const validationResult = (
          maybePromise instanceof Promise ? await maybePromise : maybePromise
        ) as ValidationResult<T>;

        if ('errors' in validationResult) {
          form.setErrors(validationResult.errors);
          return;
        } else {
          ({ values } = validationResult);
        }
      }
      form.clearErrors();
      const maybePromise = submitHandler(values, form);
      if (maybePromise instanceof Promise) {
        await maybePromise;
      }
      form.store();
    } catch (x) {
      throw x;
    }
  }

  // assemble form context
  const context: FormContextModel<T> = {
    form,
    defaultEnableHelptext: defaultEnableHelpdesk ?? pluginConfig.defaultEnableHelptext,
    identifier,
    fieldPath,
    submit,
    handle: Symbol('form context'),
    translate: pluginConfig.translate ?? ((key) => key),
    registerRule,
    validationAutoRule,
    ...i18nContext(i18nBase, pluginConfig),
  };

  provide(FormContextInjectionKey, context);
  return context;
}

export function updateFormContext<T extends FormValues = FormValues>({
  defaultEnableHelptext,
  subkey,
  i18nBase,
}: UpdateFormContextOptions) {
  const formContext = useFormContext();
  const pluginConfig = getPluginConfig();
  let { fieldPath, labelKey, helptextKey, translationKey, defaultEnableHelptext: enableHelptext } = formContext;

  if (subkey) {
    const path = fieldPath(subkey);
    fieldPath = function (key: string) {
      return [path, key].join('.');
    };
    ({ labelKey, helptextKey, translationKey } = i18nContext(translationKey(subkey), pluginConfig));
  }
  if (i18nBase) {
    ({ labelKey, helptextKey, translationKey } = i18nContext(i18nBase, pluginConfig));
  }
  if (typeof defaultEnableHelptext === 'boolean') {
    enableHelptext = defaultEnableHelptext;
  }
  const context: FormContextModel<T> = {
    ...(formContext as FormContextModel<T>),
    defaultEnableHelptext: enableHelptext,
    fieldPath,
    labelKey,
    helptextKey,
    translationKey,
  };
  provide(FormContextInjectionKey, context);
  return context;
}

export function useFormContext() {
  const context = inject(FormContextInjectionKey);

  if (!context)
    throw new Error('There is no form context. Make sure to use createFormContext in some parent component.');

  return context;
}

/**
 * @internal
 */
export function __provideFormContext(model: FormContextModel) {
  provide(FormContextInjectionKey, model);
}
