import { FormModel } from './form-model';
import { ValidationAutoRuleBuilder, ValidationSchemaBuilder } from './validation';

export interface I18nConfiguration {
  /**
   * Derives a translation key for the label. A key "name" could e.g be derived to "label_name" by being prefixed.
   */
  labelKey(key: string): string;

  /**
   * Derives a translation key for the helptext. A key "name" could e.g. be derived to "help_name".
   */
  helptextKey(key: string): string;

  /**
   * True to enable the helptext by default.
   */
  defaultEnableHelptext: boolean;

  /**
   * Gets the translation for the given translation key.
   */
  translate?(key: string): string;
}
export interface PluginConfiguration extends I18nConfiguration {
  /**
   * The default form model to use.
   */
  formModelFactory?: () => FormModel;

  /**
   * The default validation schema to use.
   */
  validationSchemaBuilderFactory?: () => ValidationSchemaBuilder;

  /**
   * Defines a function which refines validation rules (even if not specified in input elements). This might be used to automatically
   * add a "required" rule for  required fields. Also, some schema validation libraries require each field explicitly to be defined,
   * even if it is not actually validated.
   */
  validationAutoRule?: ValidationAutoRuleBuilder;
}

export type PluginOptions = Partial<PluginConfiguration>;
