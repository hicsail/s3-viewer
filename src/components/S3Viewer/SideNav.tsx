import { FC, useState } from 'react';
import { Box, Drawer, IconButton, Tab, Tabs, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { S3Object } from '../..';

interface SideNavProps {
  open: boolean;
  onSetOpen: (open: boolean) => void;
  object: S3Object;
}

export const SideNav: FC<SideNavProps> = (props) => {
  const { open, onSetOpen, object } = props;
  const [value, setValue] = useState(0);

  const handleDrawerClose = () => {
    onSetOpen(false);
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Drawer variant="persistent" anchor="right" open={open}>
      <Box component="div" width="20vw" minWidth={300}>
        <Box display="flex" padding={2}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronRightIcon />
          </IconButton>
          <Typography variant="h6" marginY="auto" lineHeight="normal">
            {object?.name}
          </Typography>
        </Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} variant="scrollable">
            <Tab label="Info" />
          </Tabs>
        </Box>
      </Box>
    </Drawer>
  );
};
