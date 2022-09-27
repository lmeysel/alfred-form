import { createApp } from 'vue';
import TheApp from './components/TheApp';
import { AlfredForm } from '../../src/alfred-form';
import { MockFormModel } from '../../test/helpers/mock-form-model';
import { MockValidationSchema } from '../helpers/mock-validation-schema';

const translations = {
  'form.label_firstname': 'Firstname',
  'form.label_lastname': 'Lastname',
};
const plugin = AlfredForm({
  formModelFactory: () => new MockFormModel(),
  validationSchemaBuilderFactory: () => new MockValidationSchema(),
  validationAutoRule: (builder, field) => {
    if (field.required) {
      return builder.required(); // builder === rule unless rule is not undefined
    }
    return builder;
  },
  translate(key) {
    if (key in translations) return translations[key] as string;
    return key;
  },
});
createApp(TheApp).use(plugin).mount('#app');
