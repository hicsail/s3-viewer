import { FC } from 'react';
import { Plugin } from '../../types/Plugin';
import { Box, IconButton, Modal } from '@mui/material';
import { S3Object } from '../../types/S3Object';
import CloseIcon from '@mui/icons-material/Close';

export interface PluginViewProps {
  plugin: Plugin;
  open: boolean;
  setOpen: (isOpen: boolean) => void;
  object: S3Object;
}

export const PluginView: FC<PluginViewProps> = (props) => {
  const close = () => {
    props.setOpen(false);
  };

  return (
    <Modal open={props.open}>
      <Box sx={{ background: 'white' }}>
        <IconButton onClick={close} sx={{ color: 'gray' }}>
          <CloseIcon />
        </IconButton>
        {props.plugin.getView(props.object)}
      </Box>
    </Modal>
  );
};
