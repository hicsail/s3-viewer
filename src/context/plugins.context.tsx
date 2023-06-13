import { createContext, FC, ReactNode } from 'react';
import { PluginManager } from '../utils/plugin/plugin-manager';
import { Plugin } from '../utils/plugin/plugin';

// Create the context, no default value so the provider is needed
export const PluginManagerContext = createContext<PluginManager>({} as any);

export interface PluginManagerProviderProps {
  plugins: Plugin[];
  children: ReactNode;
}

export const PluginManagerProvider: FC<PluginManagerProviderProps> = (props) => {
  // Create the plugin manager
  const pluginManager = new PluginManager();
  pluginManager.registerPlugins(props.plugins);

  return <PluginManagerContext.Provider value={pluginManager}>{props.children}</PluginManagerContext.Provider>;
};
