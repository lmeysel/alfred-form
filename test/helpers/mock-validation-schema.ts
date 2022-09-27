import {
  FormErrors,
  FormValues,
  GenericValidationSchemaBuilder,
  ValidationRuleBuilder,
  ValidationSchema,
} from '../../src/alfred-form';
import { MockValidationError, MockValidationRuleBuilder } from '../demo/rule-builder';

function mapValues(obj: Record<string, any>, callback: (value: any) => any) {
  const keys = Object.keys(obj);
  const result: Record<string, any> = {};
  for (const key of keys) {
    result[key] = callback(obj[key]);
  }
  return result;
}

export class MockValidationSchema extends GenericValidationSchemaBuilder {
  constructor() {
    super(null);
  }

  protected override getRule(builder: ValidationRuleBuilder) {
    return builder(new MockValidationRuleBuilder());
  }
  protected override buildSchema(): ValidationSchema {
    const cb = (value) => (typeof value === 'object' ? mapValues(value, cb) : this.getRule(value));
    const schema = mapValues(this.rules, cb);
    return {
      validate: (values: FormValues) => this.validate(values, schema),
    };
  }

  validate(values: FormValues, schema: Record<string, any>) {
    const entries = Object.entries(schema);
    const errors: FormErrors = [];
    const result: FormValues = {};
    for (const [fieldPath, rule] of entries) {
      try {
        const value = fieldPath.split('.').reduce((obj, key) => obj[key], values);
        result[fieldPath] = MockValidationRuleBuilder.validate(rule, value);
      } catch (err) {
        if (err instanceof MockValidationError) {
          errors.push({ fieldPath, key: err.key });
          continue;
        }
        throw err;
      }
    }
    if (errors.length) return { errors };
    return { values: result };
  }
}
