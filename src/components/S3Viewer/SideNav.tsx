import { FC, useState } from 'react';
import { Box, Drawer, IconButton, Tab, Tabs, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { S3Object } from '../..';
import { formatBytes } from '../../utils/ObjectUtils';

interface SideNavProps {
  open: boolean;
  onSetOpen: (open: boolean) => void;
  object: S3Object;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: FC<TabPanelProps> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <Box component="div" role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`} {...other}>
      {value === index && <Box>{children}</Box>}
    </Box>
  );
};

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
        <TabPanel value={value} index={0}>
          <Box padding={2}>
            <Typography variant="body1">
              <b>Size: </b>
              {formatBytes(object?.size)}
            </Typography>
            <Typography variant="body1">
              <b>Location: </b>
              {object?.location + '/'}
            </Typography>
            <Typography variant="body1">
              <b>Uploaded At: </b>
              {object?.uploadDate?.toLocaleString()}
            </Typography>
            <Typography variant="body1">
              <b>Last Modified At: </b>
              {object?.lastModified.toLocaleString()}
            </Typography>
          </Box>
        </TabPanel>
      </Box>
    </Drawer>
  );
};
