import { Plugin } from './plugin';

export class PluginManager {
  /**
   * Mapping between file extensions and the plugins that can operate on that
   * file type
   */
  private readonly pluginMapping = new Map<string, Plugin[]>;

  /**
   * Add the plugins to the plugin manager and updating the mapping between
   * file type and plugin.
   *
   * Calling this method will clear out already registered plugins
   */
  registerPlugins(plugins: Plugin[]) {
    // Clear out any present plugins
    this.pluginMapping.clear();

    // Go through each plugin and add it to the plugin map. If the file
    // extension is already supported, add to the list of plugins, otherwise
    // make a new list
    for (const plugin of plugins) {
      for (const fileExtension of plugin.fileExtensions) {
        if (this.pluginMapping.has(fileExtension)) {
          this.pluginMapping.set(fileExtension, [plugin]);
        } else {
          this.pluginMapping.get(fileExtension)!.push(plugin);
        }
      }
    }
  }

  getPlugins(fileExtension: string): Plugin[] | undefined {
    return this.pluginMapping.get(fileExtension);
  }
}
