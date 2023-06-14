import { ReactNode } from 'react';
import { S3Object } from './S3Object';

/**
 * Definition of a Plugin. Represents the expected form of all plugins that
 * are under the PluginManager
 */
export interface Plugin {
  /** The name of the plugin in a human readable format */
  name: string;
  /** Description of the plugin in a human readable format */
  description: string;
  /** File extensions the plugin is associated with */
  fileExtensions: string[];
  /** Get the view to show up in the modal */
  getView(object: S3Object): ReactNode;
}

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
        if (!this.pluginMapping.has(fileExtension)) {
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

  hasPlugin(fileExtension: string | undefined): boolean {
    if (!fileExtension) {
      return false;
    }

    return this.pluginMapping.has(fileExtension);
  }
}
