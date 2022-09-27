import { FormValues } from '../types';
import { FormElementModel } from './form-field';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ValidationHelper {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ValidationRule {}

export interface ValidationError {
  key: string;
  fieldPath: string;
  meta?: Record<string, unknown>;
}

export interface ValidationSchema<T extends FormValues = FormValues> {
  validate(values: T): ValidationResult<T> | Promise<ValidationResult<T>>;
}

export type ValidationRuleBuilder = (helper: ValidationHelper) => ValidationRule;
export type ValidationAutoRuleBuilder = (
  helper: ValidationHelper,
  field: FormElementModel,
  currentRule?: ValidationRule
) => ValidationRule;

export type ValidationResult<T extends FormValues = FormValues> = { errors: ValidationError[] } | { values: T };

export interface ValidationSchemaBuilder<T extends FormValues = FormValues> {
  register(fieldPath: string, builder: ValidationRuleBuilder): void;
  unregister(fieldPath: string): void;
  getSchema(): ValidationSchema<T>;
}

export abstract class GenericValidationSchemaBuilder<T extends FormValues = FormValues>
  implements ValidationSchemaBuilder<T>
{
  protected readonly rules: Record<string, ValidationRuleBuilder> = {};
  protected requiresRebuild = true;
  protected schema: ValidationSchema<T> | null = null;

  constructor(private readonly helper?: ValidationHelper) {}

  register(fieldPath: string, builder: ValidationRuleBuilder): void {
    this.rules[fieldPath] = builder;
    this.requiresRebuild = true;
  }
  unregister(fieldPath: string): void {
    delete this.rules[fieldPath];
    this.requiresRebuild = true;
  }
  protected getRule(builder: ValidationRuleBuilder): ValidationRule {
    return builder(this.helper || {});
  }
  protected abstract buildSchema(): ValidationSchema<T>;

  public getSchema(): ValidationSchema<T> {
    if (this.requiresRebuild || !this.schema) {
      this.schema = this.buildSchema();
    }
    return this.schema;
  }
}
