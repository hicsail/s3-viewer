import { FC, useContext } from 'react';
import { Box, Drawer, IconButton, Tab, Tabs, Typography } from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { S3Object } from '../..';
import { formatBytes } from '../../utils/ObjectUtils';
import { PluginManagerContext } from '../../contexts/plugins.context';

interface SideNavProps {
  open: boolean;
  defaultTab: number;
  onSetOpen: (open: boolean) => void;
  onDefaultTab: (tab: number) => void;
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
  const { open, onSetOpen, onDefaultTab, object, defaultTab } = props;
  const pluginManager = useContext(PluginManagerContext);
  const plugins = pluginManager.getPlugins('*');

  const handleDrawerClose = () => {
    onSetOpen(false);
  };

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    onDefaultTab(newValue);
  };

  return (
    <Drawer variant="persistent" anchor="right" open={open}>
      <Box component="div" width="20vw" minWidth={350}>
        <Box sx={{ position: 'fixed', height: '120px', width: '20vw', minWidth: 350, zIndex: 1, backgroundColor: 'white' }}>
          <Box display="flex" padding={2}>
            <IconButton onClick={handleDrawerClose}>
              <ChevronRightIcon />
            </IconButton>
            <Typography variant="h6" marginY="auto" lineHeight="normal" sx={{ wordBreak: 'break-word' }}>
              {object?.name}
            </Typography>
          </Box>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={defaultTab} onChange={handleChange} variant="scrollable">
              <Tab label="Info" />
              {plugins?.map((plugin) => (
                <Tab key={plugin.name} label={plugin.name} />
              ))}
            </Tabs>
          </Box>
        </Box>
        <Box sx={{ position: 'fixed', bottom: 0, height: 'calc(100vh - 120px)', width: '20vw', minWidth: 350 }}>
          <TabPanel value={defaultTab} index={0}>
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
          {plugins?.map((plugin, index) => (
            <TabPanel key={plugin.name} value={defaultTab} index={index + 1}>
              {plugin.getView(object)}
            </TabPanel>
          ))}
        </Box>
      </Box>
    </Drawer>
  );
};
