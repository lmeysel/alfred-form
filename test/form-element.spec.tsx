import { flushPromises, shallowMount } from '@vue/test-utils';
import { defineComponent, provide } from 'vue';
import {
  AlfredForm,
  createFormContext,
  FormValues,
  GenericValidationSchemaBuilder,
  PluginOptions,
  updateFormContext,
  useFormContext,
  useFormElement,
  ValidationSchema,
  withFormElementProps,
} from '../src/alfred-form';
import { getPluginConfig } from '../src/plugin';
import { MockFormModel } from './helpers/mock-form-model';

vi.mock('vue');

const MockComponent = defineComponent({
  props: { ...withFormElementProps() },
  setup(props) {
    const { field } = useFormElement(props);
    return () => (
      <div>
        <label>{field.label}</label>
        <input id={field.identifier} value={field.value} />
        {field.helptext && <small>{field.helptext}</small>}
      </div>
    );
  },
});
class MockValidationSchemaBuilder extends GenericValidationSchemaBuilder<FormValues> {
  public validate = vi.fn();
  protected override buildSchema(): ValidationSchema<FormValues> {
    Object.values(this.rules).forEach((_) => this.getRule(_));
    return { validate: this.validate };
  }
}

describe('form-element composable', () => {
  function config(config: PluginOptions = {}) {
    config = { ...config, formModelFactory: () => new MockFormModel(), translate: (_) => _ };
    AlfredForm(config).install({ provide } as any);
    return getPluginConfig();
  }
  beforeEach(() => {
    config();
    createFormContext({
      i18nBase: 'user-form',
      values: { firstname: 'John', lastname: 'Doe', contact: { email: 'john.doe@example.org' } },
      submitHandler: vi.fn(),
    });
  });

  it('provides common field information', () => {
    const {
      field: { error, helptext, identifier, label, path, value, required },
    } = useFormElement({ name: 'firstname', required: true });

    expect(error).toBeNull();
    expect(identifier).toMatch(/\d+\$firstname/);
    expect(helptext).toBeNull();
    expect(label).toEqual('user-form.label_firstname');
    expect(path).toEqual('firstname');
    expect(value).toEqual('John');
    expect(required).toBe(true);
  });

  it('considers updated field context', () => {
    updateFormContext({ defaultEnableHelptext: true, subkey: 'contact', i18nBase: 'contact-form' });
    const {
      field: { error, helptext, identifier, label, path, value },
    } = useFormElement({ name: 'email' });

    expect(error).toBeNull();
    expect(identifier).toMatch(/\d+\$contact\$email/);
    expect(helptext).toEqual('contact-form.help_email');
    expect(label).toEqual('contact-form.label_email');
    expect(path).toEqual('contact.email');
    expect(value).toEqual('john.doe@example.org');
  });

  it('updates field after storing', () => {
    const { form } = useFormContext();
    const { field, store } = useFormElement({ name: 'firstname' });

    field.value = 'Jane';
    expect((form.field('firstname') as any).model.originalValue).toEqual('John');
    store();
    expect((form.field('firstname') as any).model.originalValue).toEqual('Jane');

    const {
      field: { value },
    } = useFormElement({ name: 'firstname' });
    expect(value).toEqual('Jane');
  });

  it('resets field', () => {
    const { field, reset } = useFormElement({ name: 'firstname' });
    field.value = 'Jane';
    reset();
    expect(field.value).toEqual('John');
  });

  it('reflects changes reactively', async () => {
    const wrapper = shallowMount(MockComponent, { props: { name: 'firstname' } });
    const input = wrapper.find('input'),
      label = wrapper.find('label');
    expect(label.text()).toEqual('user-form.label_firstname');
    expect(input.element.value).toEqual('John');
    expect(input.element.id).toMatch(/\d+\$firstname/);
    expect(wrapper.text()).not.toContain('user-form.help_firstname');

    // update field and then see if everything updates properly
    wrapper.setProps({ name: 'lastname', helptext: true });
    await flushPromises();

    expect(label.text()).toEqual('user-form.label_lastname');
    expect(input.element.value).toEqual('Doe');
    expect(input.element.id).toMatch(/\d+\$lastname/);
    expect(wrapper.text()).toContain('user-form.help_lastname');
  });

  describe('form-validation', () => {
    let mockSchemaBuilder: MockValidationSchemaBuilder;
    beforeEach(() => {
      config({
        validationSchemaBuilderFactory: () => (mockSchemaBuilder = new MockValidationSchemaBuilder()),
      });
      createFormContext({ i18nBase: 'user-form', values: { firstname: 'John' }, submitHandler: vi.fn() });
    });

    it('uses validation rules if available', () => {
      const mockValidationRule = vi.fn();
      shallowMount(MockComponent, { props: { name: 'firstname', rule: mockValidationRule } });

      mockSchemaBuilder.validate.mockReturnValue({ values: { firstname: 'John' } });

      expect(mockValidationRule).not.toBeCalled();
      const { submit } = useFormContext();
      submit();
      expect(mockValidationRule).toBeCalled();
    });

    it('forwards error to form field', () => {
      shallowMount(MockComponent, { props: { name: 'firstname', rule: vi.fn() } });
      mockSchemaBuilder.validate.mockReturnValue({ errors: [{ fieldPath: 'firstname', key: 'required' }] });

      const { submit, form } = useFormContext();
      submit();
      const { model } = form.field('firstname');
      expect(model.error).toEqual('required');
    });

    it('forwards error from async validation to form fields', async () => {
      shallowMount(MockComponent, { props: { name: 'firstname', rule: vi.fn() } });
      mockSchemaBuilder.validate.mockResolvedValue({ errors: [{ fieldPath: 'firstname', key: 'required' }] });

      const { submit, form } = useFormContext();
      await submit();
      const { model } = form.field('firstname');
      expect(model.error).toEqual('required');
    });
  });
});
