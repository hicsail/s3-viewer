import { S3Client } from '@aws-sdk/client-s3';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Toolbar,
  Tooltip,
  Typography
} from '@mui/material';
import { FC, MouseEvent, useEffect, useState } from 'react';
import { S3Object } from '../../types/S3Object';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import UploadIcon from '@mui/icons-material/Upload';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { FileListView } from './FileListView';
import { useS3Context } from '../../contexts/s3-context';

interface DirectoryMainProps {
  client: S3Client;
  bucket: string;
  permissions: any;
  onCurrentPathChange?: (currentPath: string) => void;
}

export const FileMain: FC<DirectoryMainProps> = (props) => {
  const { client, bucket, permissions } = props;
  const ctx = useS3Context();

  // ########################################
  // #### State and variables definitions ###
  // ########################################
  const [listView, setListView] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const fetchObjects = async (path: string) => {
    // TODO: fetch objects from S3
    console.log(`fetching objects for path [${path}]`);
    const objects = await fetchTempObjects();
    setObjects(objects);
  };

  // ########################################
  // #### Handler functions for actions #####
  // ########################################

  // open the menu for switching between list and grid view
  const handleClickSwitchView = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseSwitchView = () => {
    setAnchorEl(null);
  };

  const handleClickListView = () => {
    setListView(true);
    handleCloseSwitchView();
  };

  const handleClickGridView = () => {
    setListView(false);
    handleCloseSwitchView();
  };

  // handler for uploading files
  const handleClickUpload = () => {
    // TODO: handle upload action
    alert('uploading');
  };

  // handlers for creating new folders
  const handleClickNewFolder = () => {
    setNewFolderDialogOpen(true);
  };

  const handleCloseNewFolder = () => {
    setNewFolderDialogOpen(false);
  };

  const handleNewFolderNameChange = (event: any) => {
    setNewFolderName(event.target.value);
  };

  const handleNewFolder = () => {
    // TODO: handle new folder creation
    alert(`creating new folder ${newFolderName}`);
  };

  // initial fetching for files and folders upon opening the page
  useEffect(() => {
    fetchObjects(ctx.currentPath);
  }, []);

  useEffect(() => {
    fetchObjects(ctx.currentPath);
    props.onCurrentPathChange && props.onCurrentPathChange(ctx.currentPath);
  }, [ctx.currentPath]);

  return (
    <Paper>
      <Toolbar>
        <Typography sx={{ flex: '1 1 100%' }} variant="h6" id="tableTitle" component="div">
          Current Folder
        </Typography>
        <Grid container spacing={1} justifyContent="end">
          {permissions.upload && (
            <Grid item>
              <Button onClick={handleClickUpload} startIcon={<UploadIcon />}>
                Upload
              </Button>
            </Grid>
          )}
          {permissions.createFolder && (
            <Grid item>
              <Button onClick={handleClickNewFolder} startIcon={<CreateNewFolderIcon />}>
                New Folder
              </Button>
              <Dialog open={newFolderDialogOpen} fullWidth>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogContent>
                  <TextField style={{ marginTop: '10px' }} label="Folder Name" value={newFolderName} onChange={handleNewFolderNameChange} fullWidth />
                </DialogContent>
                <DialogActions>
                  <Button variant="contained" onClick={handleNewFolder}>
                    Create
                  </Button>
                  <Button variant="outlined" color="error" onClick={handleCloseNewFolder}>
                    Cancel
                  </Button>
                </DialogActions>
              </Dialog>
            </Grid>
          )}
        </Grid>
        <Tooltip title="Switch View" placement="top-end">
          <IconButton onClick={handleClickSwitchView}>{listView ? <FormatListBulletedIcon /> : <GridViewIcon />}</IconButton>
        </Tooltip>
        <Menu id="view-type-menu" anchorEl={anchorEl} open={open} onClose={handleCloseSwitchView}>
          <MenuItem onClick={handleClickListView}>
            <ListItemIcon>
              <FormatListBulletedIcon />
            </ListItemIcon>
            <ListItemText>List View</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleClickGridView}>
            <ListItemIcon>
              <GridViewIcon />
            </ListItemIcon>
            <ListItemText>Grid View</ListItemText>
          </MenuItem>
        </Menu>
      </Toolbar>
      {listView && <FileListView objects={objects} permissions={permissions} />}
    </Paper>
  );
};

// ########################################
// ########### Helper Functions ###########
// ########################################
const fetchTempObjects = async (): Promise<S3Object[]> => {
  // create a list of dummy objects with random date and size, all fields are required
  const objects: S3Object[] = [];

  const generateRandomName = (): string => {
    const firstName = ['John', 'Jane', 'Michael', 'Emma', 'David', 'Olivia']; // List of possible first names
    const lastName = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis']; // List of possible last names

    const randomFirstName = firstName[Math.floor(Math.random() * firstName.length)];
    const randomLastName = lastName[Math.floor(Math.random() * lastName.length)];

    return `${randomFirstName} ${randomLastName}`;
  };

  for (let i = 0; i < 50; i++) {
    const lastModified = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
    const size = Math.floor(Math.random() * 1000000000);
    const location = `path/to/`;
    const isFolder = Math.random() > 0.5;
    const ext = isFolder ? '' : `${['txt', 'pdf', 'doc', 'jpg', 'png'][Math.floor(Math.random() * 5)]}`;
    const name = isFolder ? `object-${i}` : `object-${i}.${ext}`;
    const owner = {
      id: Math.random().toString(36).substring(7),
      name: generateRandomName()
    };
    objects.push({ name, location, lastModified, size, isFolder, owner, $raw: {} });
  }

  return objects;
};
