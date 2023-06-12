import { ReactElement } from 'react';

/**
 * Definition of a Plugin. Represents the expected form of all plugins that
 * are under the PluginManager
 */
export interface Plugin {
  /** The name of the plugin in a human readable format */
  name: string;
  /** Description of the plugin in a human readable format */
  description: string;
  /** The React view of the plugin */
  component: ReactElement;
  /** File extensions the plugin is associated with */
  fileExtensions: string[];
}
