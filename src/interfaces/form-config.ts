import { FormValues } from '../types';
import { FormModel } from './form-model';
import { PluginOptions } from './options';
import { ValidationAutoRuleBuilder, ValidationRuleBuilder } from './validation';

export interface CreateFormContextOptions<T extends FormValues> extends Partial<Omit<PluginOptions, 'translate'>> {
  values: T;
  i18nBase?: string;
  submitHandler(values: T, form: FormModel<T>): void | Promise<void>;
}

export interface UpdateFormContextOptions {
  i18nBase?: string;
  subkey?: string;
  defaultEnableHelptext?: boolean;
}

export interface FormContextModel<T extends FormValues = FormValues> {
  readonly form: FormModel<T>;
  readonly handle: symbol;
  readonly defaultEnableHelptext: boolean;

  translate(key: string): string;
  fieldPath(field: string): string;
  identifier(fieldPath: string): string;
  registerRule(fieldPath: string, builder: ValidationRuleBuilder): () => void;
  validationAutoRule?: ValidationAutoRuleBuilder;
  translationKey(key: string): string;
  labelKey(key: string): string;
  helptextKey(key: string): string;
  submit(): Promise<void>;
}
