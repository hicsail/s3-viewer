import { FC } from 'react';
import { Plugin } from './plugin';
import { Modal } from '@mui/material';

export interface PluginViewProps {
  plugin: Plugin;
  open: boolean;
}

export const PluginView: FC<PluginViewProps> = (props) => {

  const onClose = () => {

  };

  return (
    <Modal open={props.open} onClose={onClose}>
      <>
        {props.plugin.getView()}
      </>
    </Modal>
  );
};
