import { reactive } from 'vue';
import { FormErrors, FormField, FormModel, FormValues } from '../../src/alfred-form';

function deepClone(object: Record<string, any>) {
  const result = {};
  Object.entries(object).forEach(
    ([key, value]) => (result[key] = typeof value === 'object' ? deepClone(value) : value)
  );
  return result;
}
function setNestedValue(key: string, value: any, rootObj: Record<string, any>) {
  const seg = key.split('.');
  const last = seg.pop();
  const obj: Record<string, any> = seg.reduce((obj, value) => obj[value], rootObj);
  obj[last] = value;
}

export class MockFormModel<T extends FormValues = FormValues> implements FormModel<T> {
  private values: Partial<T> = reactive({});
  private fields: Record<string, FormField> = {};

  getValue(key: string) {
    return key.split('.').reduce((obj, value) => obj[value], this.values);
  }
  setValue(key: string, value: any) {
    setNestedValue(key, value, this.values);
  }
  getValues(): T {
    const result = deepClone(this.values);
    Object.entries(this.fields).map(([key, field]) => setNestedValue(key, field.model.value, result));
    return result as T;
  }

  field(key: string): FormField {
    if (key in this.fields) {
      return this.fields[key];
    }

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const _this = this;
    const model = reactive({
      error: null,
      get originalValue() {
        return _this.getValue(key);
      },
      value: this.getValue(key),
    });
    const field = {
      model,
      store: () => this.setValue(key, model.value),
      reset: () => (model.value = model.originalValue),
    };
    this.fields[key] = field;
    return field;
  }
  initialize(values: FormValues): void {
    Object.assign(this.values, values);
  }
  store(): void {
    Object.values(this.fields).forEach(({ store }) => store());
  }
  reset(): void {
    Object.values(this.fields).forEach(({ reset }) => reset());
  }
  setErrors(errors: FormErrors): void {
    this.clearErrors();
    for (const error of errors) {
      if (error.fieldPath in this.fields) {
        const { model } = this.fields[error.fieldPath];
        model.error = error.key;
      }
    }
  }
  clearErrors() {
    Object.values(this.fields).forEach(({ model }) => (model.error = null));
  }
}
