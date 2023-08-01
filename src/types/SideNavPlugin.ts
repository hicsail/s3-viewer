import { ReactNode } from 'react';
import { Plugin } from '..';

export interface SideNavPlugin extends Plugin {
  icon: ReactNode;
}
