import { ReactNode } from 'react';
import { Plugin } from '..';

export interface SideNavPlugin extends Plugin {
  getAction(): ReactNode;
}
