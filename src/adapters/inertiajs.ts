import { InertiaForm, useForm } from '@inertiajs/vue3';
import { FormField, FormFieldModel } from '../interfaces/form-field';
import { FormModel } from '../interfaces/form-model';
import { FormErrors, FormValues } from '../types';
import { unflatten } from '../util';

export class InertiaFormAdapter<T extends FormValues = FormValues> implements FormModel<T> {
  form!: InertiaForm<T>;
  readonly fields: Record<string, FormField> = {};

  getValues(): T {
    return this.form.data();
  }
  store(): void {
    this.form.defaults();
  }
  reset(): void {
    this.form.reset();
  }
  initialize(values: T): void {
    if (!this.form) {
      this.form = useForm(values);
    } else {
      this.form.defaults(values);
      this.form.reset(...Object.keys(values));
    }
  }
  field(key: keyof T): FormField {
    const { form } = this;
    const model: FormFieldModel = {
      get error() {
        return form.errors[key];
      },
      get value() {
        return form[key as keyof T];
      },
      set value(value) {
        form[key as keyof T] = value;
      },
    };
    return {
      model,
      store: () => this.form.defaults(key, model.value),
      reset: () => this.form.reset(key),
    };
  }
  setErrors(errors: FormErrors): void {
    const map: Record<string, string> = {};
    errors.forEach(({ fieldPath, key }) => (map[fieldPath] = key));
    this.form.setError(unflatten(map) as Record<keyof T, string>);
  }
  clearErrors(): void {
    this.form.clearErrors();
  }
}
