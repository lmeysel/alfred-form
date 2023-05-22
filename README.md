[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
![GitHub Actions](https://img.shields.io/github/actions/workflow/status/lmeysel/alfred-form/nodejs.yml?style=flat-square&logo=github)
[![Coveralls](https://img.shields.io/coveralls/lmeysel/alfred-form.svg?style=flat-square&logo=coveralls)](https://coveralls.io/github/lmeysel/alfred-form)
[![Donate](https://img.shields.io/badge/donate-paypal-blue.svg?style=flat-square)](https://paypal.me/lmeysel)

# Getting started

## Installation and setup

```bash
# Using npm
npm i alfred-form

# Using pnpm
pnpm add alfred-form
```

After installation of the package, install the vue plugin.

```typescript
import { createApp } from 'vue';
import { AlfredForm, PluginOptions } from 'alfred-form';

const config: PluginOptions = { ... };

const app = createApp(TheApp).use(AlfredForm(config))
```

# Usage

Each form needs to create its own form context. This can be done using the `createFormContext`-composable and/or the `FormContext`-component.

The form context can be configured with nearly the same options like the plugin itself (few exceptions are explained later). Technically the plugin options configure the defaults within application scope, while the context options mostly act as optional overrides.

## Creating form components

The power of alfred-form unfolds when creating components which render the label, optional helptext, input and the error message. I18n is supported by enforcing customizable conventions.

The boilerplate for a typical component is defined as following:

```typescript
// BasicInput.vue

defineProps({
  // add additional props if required
  someProp: { type: String }

  // add standard props required for each input
  ...withFormElementProps(),
})

const { field } = useFormElement(props);
```

```html
<template>
  <label>{{ field.label }}</label>
  <input v-model="field.value" />
  <small v-if="field.error">{{ field.error }}</small>
</template>
```

The field provides a reactive object containing all the relevant information for the input element. As it is reactive, it should not be destructured.

## Using custom form model

alfred-form builds an interface to an arbitrary form model. Thus, any form model can be plugged in when implementing the `FormModel`-interface. Each form context creates it's own instance. To configure the `FormModel` globally, pass the `formModelFactory` to the plugin configuration:

```typescript
import { PluginConfiguration } from 'alfred-form';

class MyFormModelImplementation implements FormModel {
  // ...
}

const config: PluginConfiguration = {
  formModelFactory: () => new MyFormModelImplementation(),
};
```

A form model must be provided either in global options or while creating context.

## Providing form validation

The validation consists of some types which you first should get familiar with:

- `ValidationRule`: A composed rule applied to one specific field.
- `ValidationHelper`: Helps you to build a validation rule (esp. contains the available rules for composition). This can be e.g. `Joi`.
- `ValidationRuleBuilder`: A callback passed to the form elements taking the `ValidationHelper` as argument and returning a `ValidationRule`.
- `ValidationSchema`: Built from `ValidationRule`s and allows performing the validation of the whole ruleset.
- `ValidationSchemaBuilder`: Tracks the registered form fields and adds or removes `ValidationRules`. The first time, the validation is required it builds `ValidationSchema` to perform the validation against. At this time the registered `ValidationRuleBuilder`s are called.

As rule of thumb: `rule` relates to a single field, wheres `schema` relates to the whole form context.

To get started, an adapter for your favorite schema-validation library must be provided. It must implement `ValidationSchemaBuilder`-interface. A basic implementation is provided with the abstract `GenericValidationSchemaBuilder`-class which only requires to override the `buildSchema` method. The `GenericValidationSchemaBuilder` takes care for tracking if the registered fields are changed and makes sure the schema is rebuilt accordingly.

<a name="validation-joi-schema"></a>The form validation adapter must be passed to the `validationSchemaFactory` in plugin configuration:

```typescript
import { GenericValidationSchemaBuilder } from 'alfred-form';
import Joi from 'joi';

/**
 * Traverse object and run all registered builders
 * TODO: Add example implementation
 */
declare function createJoiSchema(plain: object): Joi.Schema<Object>;

class JoiValidationSchemaBuilder extends GenericValidationSchemaBuilder {
  constructor() {
    super(Joi);
  }

  public override buildSchema() {
    const rules = super.rules;
    return createJoiSchema(rules);
  }
}

const config: PluginConfiguration = {
  validationSchemaFactory: () => new JoiValidationSchemaBuilder(),
};
```

### Configuring validation rules

When creating form elements using `withFormElementProps()` (which should be almost always be the case), the form element have a `rule`-prop:

```html
<BasicInput rule="<function>" />
```

whereas the rule function is defined as follows

```typescript
type ValidationRuleBuilder = (helper: ValidationHelper) => ValidationRule;
```

The `ValidationHelper` and `ValidationRule` are empty interfaces by default but you may utilize interface augmentation to make your editor's intellisense aware of your implementation. The implementation above passes the `Joi` instance to each `rule`-callback:

```typescript
// globals.d.ts
declare module 'alfred-form' {
  import Joi, { Schema } from 'joi';
  interface ValidationHelper extends typeof Joi {}
  interface ValidationRule<T = any> extends Schema<T> {}
}
```

Now it is possible to write validation rules as follows by being supported by the intellisense (considering helper actually is the `Joi` instance)

```html
<BasicInput :rule="(helper) => helper.string().required()" />
```

### Configuring "standard" rules

To keep the form markup clean and intuitive, it is possible to add automatic validation rules, which may depend on the field configuration. Consider the following:

```html
<BasicInput :rule="(helper) => helper.string().required()" :required="true" />
```

The `BasicInput` might be defined to automatically add an asterisk to the label, if the `required`-prop is set. But since `alfred-form` has no idea which kind of validation tooling you are using, it also cannot append a corresponding `required`-rule. This will make markup duplicating the information, once in the validation rule and once in the prop, both serving the same meaning but different purposes.

Configuring the `validationAutoRuleBuilder`-prop, you can make sure such kind of things are handled automatically:

```typescript
const config: PluginConfiguration = {
  validationAutoRule(helper: ValidationHelper, field: FormElementModel, currentRule?: ValidationRule) {
    if (field.required) {
      return currentRule ? currentRule.required() : helper.required();
    }
  },
};
```

The field parameter takes the actual field-configuration, e.g. providing the translated label, value, required, ...

The form element's `ValidationRuleBuilder` is called before the `validationAutoRule`. The result is given in `currentRule`. As the form element's `rule`-prop is optional, the same counts for `currentRule` (since there is not necessarily a rule to be built).
