import { FC } from 'react';
import { Plugin } from './plugin';
import { Modal } from '@mui/material';
import { S3Object } from '../../types/S3Object';

export interface PluginViewProps {
  plugin: Plugin;
  open: boolean;
  object: S3Object;
}

export const PluginView: FC<PluginViewProps> = (props) => {
  const onClose = () => {};

  return (
    <Modal open={props.open} onClose={onClose}>
      <>{props.plugin.getView(props.object)}</>
    </Modal>
  );
};
