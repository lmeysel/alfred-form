import { inject, InjectionKey, Plugin } from 'vue';
import { PluginConfiguration, PluginOptions } from './interfaces/options';

const PluginConfigurationInjectionKey: InjectionKey<PluginConfiguration> = Symbol();

export function getPluginConfig(): PluginConfiguration {
  const config = inject(PluginConfigurationInjectionKey);
  if (!config) throw new Error('Cannot retrieve plugin configuration. Did you install AlfredForm plugin?');
  return config;
}

export const AlfredForm = function (options: PluginOptions = {}): Plugin {
  const {
    labelKey = (key) => `label_${key}`,
    helptextKey = (key) => `help_${key}`,
    translate,
    validationSchemaBuilderFactory,
    validationAutoRule,
    defaultEnableHelptext: defaultEnableHelpdesk = false,
    formModelFactory,
  } = options;

  const plugin: Plugin = {
    install(app) {
      app.provide(PluginConfigurationInjectionKey, {
        labelKey,
        helptextKey,
        translate,
        defaultEnableHelptext: defaultEnableHelpdesk,
        formModelFactory,
        validationSchemaBuilderFactory,
        validationAutoRule,
      });
    },
  };
  return plugin;
};
