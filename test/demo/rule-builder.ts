export {};

export class MockValidationError extends Error {
  constructor(readonly key: string) {
    super();
  }
}

export class MockValidationRuleBuilder {
  private stack: Array<(value: string) => any> = [];

  static validate(rule: MockValidationRuleBuilder, value: string) {
    return rule.stack.reduce((previous, fn) => fn(previous), value);
  }

  chars() {
    this.stack.push((value: string) => {
      if (!/^[a-z]*$/i.test(value)) {
        throw new MockValidationError('chars');
      }
      return value;
    });
    return this;
  }
  required() {
    this.stack.push((value: string) => {
      if (!value.trim()) {
        throw new MockValidationError('required');
      }
      return value;
    });
    return this;
  }
}

declare module '../../src/alfred-form' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ValidationHelper extends MockValidationRuleBuilder {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface ValidationRule extends MockValidationRuleBuilder {}
}
