import { provide } from 'vue';
import { AlfredForm, createFormContext, PluginOptions, updateFormContext, useFormContext } from '../src/alfred-form';
import { getPluginConfig } from '../src/plugin';
import { MockFormModel } from './helpers/mock-form-model';

vi.mock('vue');

describe('form-context', () => {
  const formModelFactory = vi.fn(() => new MockFormModel());
  function config(config: PluginOptions = { formModelFactory, translate: (_) => _ }) {
    AlfredForm(config).install({ provide } as any);
    return getPluginConfig();
  }

  it('throws if there no form context is available', () => {
    config();
    expect(() => useFormContext()).toThrowError();
  });

  it('uses global configured validation factory', () => {
    const validationSchemaFactory = vi.fn();
    config({ validationSchemaBuilderFactory: validationSchemaFactory, formModelFactory });
    createFormContext({ values: {}, submitHandler: vi.fn() });

    expect(validationSchemaFactory).toBeCalled();
  });

  it('prefers local configured validation factory', () => {
    const validationSchemaFactory = vi.fn();
    const globalValidationSchemaFactory = vi.fn();
    config({ validationSchemaBuilderFactory: globalValidationSchemaFactory, formModelFactory });
    createFormContext({ values: {}, submitHandler: vi.fn(), validationSchemaBuilderFactory: validationSchemaFactory });

    expect(globalValidationSchemaFactory).not.toBeCalled();
    expect(validationSchemaFactory).toBeCalled();
  });

  it('default translation is identity function', () => {
    const pluginConfig = config({ formModelFactory });
    const { translate } = createFormContext({ values: {}, submitHandler: vi.fn() });

    expect(pluginConfig.translate).toBeUndefined();
    expect(translate('foo.bar')).toEqual('foo.bar');
  });

  it('derives translation-keys only when translation function is configured', () => {
    config({ formModelFactory });
    const { labelKey, helptextKey, translationKey } = createFormContext({ values: {}, submitHandler: vi.fn() });

    expect(translationKey('foo')).toEqual('foo');
    expect(labelKey('foo')).toEqual('foo');
    expect(helptextKey('foo')).toEqual('foo');
  });

  it('uses custom form model factory', () => {
    const globalFormModelFactory = vi.fn();
    config({ formModelFactory: globalFormModelFactory });
    createFormContext({ values: {}, submitHandler: vi.fn(), formModelFactory });
    expect(formModelFactory).toBeCalled();
    expect(globalFormModelFactory).not.toBeCalled();
  });

  it('uses custom form model factory', () => {
    config();
    createFormContext({ values: {}, submitHandler: vi.fn() });
    expect(formModelFactory).toBeCalled();
  });

  it('throws when missing form model factory', () => {
    config({});
    expect(() => createFormContext({ values: {}, submitHandler: vi.fn() })).toThrowError();
  });

  it('calls submit function', async () => {
    config();
    const onSubmit = vi.fn();
    const { submit } = createFormContext({ values: {}, submitHandler: onSubmit });

    await submit();
    expect(onSubmit).toBeCalled();
  });

  it('forwards errors during submit', async () => {
    config();
    const onSubmit = vi.fn();
    onSubmit.mockRejectedValue(new Error());
    const context = createFormContext({ values: {}, submitHandler: onSubmit });

    vi.spyOn(context, 'submit');
    await expect(context.submit()).rejects.toThrowError();
  });

  it('properly derives translation keys', () => {
    config();
    const { labelKey, helptextKey, translationKey } = createFormContext({
      values: {},
      submitHandler: vi.fn(),
      i18nBase: 'root-form',
    });

    expect(translationKey('foo')).toEqual('root-form.foo');
    expect(labelKey('foo')).toEqual('root-form.label_foo');
    expect(helptextKey('foo')).toEqual('root-form.help_foo');
  });

  it('generates dollar-separated field identifiers', () => {
    config();
    const { identifier } = createFormContext({ values: {}, submitHandler: vi.fn() });

    expect(identifier('bar.foo')).toEqual('bar$foo');
  });

  describe('updated form context', () => {
    it('update i18n-key', () => {
      config();
      createFormContext({ values: {}, submitHandler: vi.fn(), i18nBase: 'root-form' });
      const { labelKey, helptextKey, translationKey } = updateFormContext({ i18nBase: 'child-form' });

      expect(translationKey('foo')).toEqual('child-form.foo');
      expect(labelKey('foo')).toEqual('child-form.label_foo');
      expect(helptextKey('foo')).toEqual('child-form.help_foo');
    });

    it('update subkey', () => {
      config();
      createFormContext({ values: {}, submitHandler: vi.fn(), i18nBase: 'root-form' });
      const { labelKey, helptextKey, translationKey, fieldPath } = updateFormContext({ subkey: 'bar' });

      expect(translationKey('foo')).toEqual('root-form.bar.foo');
      expect(labelKey('foo')).toEqual('root-form.bar.label_foo');
      expect(helptextKey('foo')).toEqual('root-form.bar.help_foo');
      expect(fieldPath('foo')).toEqual('bar.foo');
    });

    it('update i18n-key takes precedence over subkey', () => {
      config();
      createFormContext({ values: {}, submitHandler: vi.fn(), i18nBase: 'root-form' });
      const { labelKey, helptextKey, translationKey, fieldPath } = updateFormContext({
        subkey: 'bar',
        i18nBase: 'child-form',
      });

      expect(translationKey('foo')).toEqual('child-form.foo');
      expect(labelKey('foo')).toEqual('child-form.label_foo');
      expect(helptextKey('foo')).toEqual('child-form.help_foo');
      expect(fieldPath('foo')).toEqual('bar.foo');
    });
    it('update i18n-key takes precedence over subkey', () => {
      config();
      createFormContext({ values: {}, submitHandler: vi.fn(), i18nBase: 'root-form' });
      const { defaultEnableHelptext } = updateFormContext({ defaultEnableHelptext: true });

      expect(defaultEnableHelptext).toBe(true);
    });
  });
});
