import { ReactNode } from 'react';
import { Plugin } from '..';
import { EventType } from './Event';

export interface SideNavPlugin extends Plugin {
  icon: ReactNode;

  subscriptions: { [key in EventType]?: (data: any) => void };
}
