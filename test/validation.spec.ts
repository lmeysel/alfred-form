import { FormValues, GenericValidationSchemaBuilder, ValidationSchema } from '../src/alfred-form';

class MockSchemaBuilder extends GenericValidationSchemaBuilder {
  get rebuild() {
    return this.requiresRebuild;
  }
  set rebuild(value: boolean) {
    this.requiresRebuild = value;
  }
  protected buildSchema(): ValidationSchema<FormValues> {
    throw new Error('Method not implemented.');
  }
}

describe('validation', () => {
  it('sets requiresRebuild flag on register and unregister', () => {
    const helper: any = {};
    const schema = new MockSchemaBuilder(helper);

    expect(schema.rebuild).toBeTruthy();

    schema.rebuild = false;
    schema.register('foo.bar', vi.fn());
    expect(schema.rebuild).toBeTruthy();

    schema.rebuild = false;
    schema.unregister('foo.bar');
    expect(schema.rebuild).toBeTruthy();
  });

  it('passes helper to the builder function', () => {
    const helper: any = {};
    const schema = new MockSchemaBuilder(helper);

    const builder = vi.fn();
    (schema as any).getRule(builder);

    expect(builder).toBeCalledWith(helper);
  });

  it('calls validation implementation', () => {
    const helper: any = {};
    const schema = new MockSchemaBuilder(helper);

    expect(() => schema.getSchema()).toThrowError();
  });
});
