import { FormErrors, FormValues } from '../types';
import { FormField } from './form-field';

export interface FormModel<T extends FormValues = FormValues> {
  field(key: string): FormField;
  initialize(values: T): void;
  setErrors(values: FormErrors): void;
  clearErrors(): void;
  getValues(): T;
  store(): void;
  reset(): void;
}
