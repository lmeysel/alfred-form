import { defineComponent, reactive, Ref, ref } from 'vue';
import { createFormContext, FormContext, UpdateFormContext } from '../../../src/alfred-form';
import InputField from './InputField';

export default defineComponent({
  setup() {
    const submitted: Ref<ReturnType<typeof setTimeout> | null> = ref(null);
    const currentValues = reactive({
      firstname: 'Jane',
      lastname: 'Doe',
      contact: {
        mail: 'jane.doe@example.org',
        mobile: '123456789',
      },
      relations: {
        husband: 'John Doe',
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { handle } = createFormContext({
      i18nBase: 'form',
      submitHandler(values) {
        if (submitted.value) clearTimeout(submitted.value);
        submitted.value = setTimeout(() => (submitted.value = null), 3000);
        Object.assign(currentValues, values);
        return Promise.resolve();
      },
      values: currentValues,
    });

    return () => (
      <div>
        {submitted.value && <div>✅ Form Submitted</div>}
        <FormContext handle={handle}>
          <h3>Some translated labels</h3>
          <p>
            <InputField name="firstname" required />
            <InputField name="lastname" required rule={(builder) => builder.chars()} />
          </p>

          <h3>Translationkey based on object nesting</h3>
          <p>
            <UpdateFormContext subkey="contact">
              <InputField name="mail" />
              <InputField name="mobile" />
            </UpdateFormContext>
          </p>

          <h3>Translationkey based on i18nBase, neglecting subkey</h3>
          <p>
            <UpdateFormContext subkey="relations" i18nBase="relation_form">
              <InputField name="husband" />
            </UpdateFormContext>
          </p>
          <div>
            <button type="submit">Submit</button>
            <button type="reset">Reset</button>
          </div>
        </FormContext>

        <h3>Submitted data</h3>
        <p>
          <div>Firstname: {currentValues.firstname}</div>
          <div>Lastname: {currentValues.lastname}</div>
          <div>E-Mail: {currentValues.contact.mail}</div>
          <div>Mobile: {currentValues.contact.mobile}</div>
          <div>Husband: {currentValues.relations.husband}</div>
        </p>
      </div>
    );
  },
});
