export interface FormFieldModel<T = any> {
  error: string | undefined;
  value: T;
}
export interface FormField<T = any> {
  model: FormFieldModel<T>;
  store(): void;
  reset(): void;
}

export interface FormElementModel<T = any> {
  readonly path: string;
  readonly identifier: string;
  readonly label: string;
  readonly helptext: string | null;
  readonly error: string;
  readonly required: boolean;
  value: T;
}
