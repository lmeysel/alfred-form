import { config } from '@vue/test-utils';
import { AlfredForm, PluginOptions } from '../../src/alfred-form';

export function initPlugin(options: Partial<PluginOptions> = {}) {
  const plugin = AlfredForm(options);
  config.global.plugins.push(plugin);
}
