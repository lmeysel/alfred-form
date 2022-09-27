import { provide } from 'vue';
import { AlfredForm, PluginOptions } from '../src/alfred-form';
import { getPluginConfig } from '../src/plugin';

vi.mock('vue');

describe('plugin', () => {
  function config(config: PluginOptions = {}) {
    AlfredForm(config).install({ provide } as any);
    return getPluginConfig();
  }

  it('derives default label key', () => {
    const options = config();
    expect(options.labelKey('name')).toEqual('label_name');
  });
  it('derives default helptext key', () => {
    const options = config();
    expect(options.helptextKey('name')).toEqual('help_name');
  });
});
