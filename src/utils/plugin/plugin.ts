import { ReactNode } from 'react';
import { S3Object } from '../../types/S3Object';

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
