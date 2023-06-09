import { S3Client } from '@aws-sdk/client-s3';
import {
  Alert,
  AlertColor,
  Backdrop,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Toolbar,
  Tooltip
} from '@mui/material';
import { FC, MouseEvent, useEffect, useState } from 'react';
import { S3Object } from '../../types/S3Object';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import GridViewIcon from '@mui/icons-material/GridView';
import UploadIcon from '@mui/icons-material/Upload';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { FileListView } from './FileListView';
import { useS3Context } from '../../contexts/s3-context';
import { createFolder, deleteFileOrFolder, downloadFile, getFoldersAndFiles, renameFileOrFolder, uploadFile } from '../../utils/S3Utils';
import { FileBreadCrumb } from './FileBreadcrumb';

const objectSets = new Set<string>();

interface FileMainProps {
  client: S3Client;
  bucket: string;
  bucketDisplayedName?: string;
  permissions: any;
  onCurrentPathChange?: (currentPath: string) => void;
}

export const FileMain: FC<FileMainProps> = (props) => {
  const { client, bucket, bucketDisplayedName, permissions } = props;
  const ctx = useS3Context();

  // ########################################
  // #### State and variables definitions ###
  // ########################################
  const [listView, setListView] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const [loading, setLoading] = useState(false);
  const [objects, setObjects] = useState<S3Object[]>([]);
  const [snackBarSettings, setSnackBarSettings] = useState<{ message: string; open: boolean; severity: AlertColor }>({
    message: '',
    open: false,
    severity: 'success'
  });

  const [selectedObjects, setSelectedObjects] = useState<S3Object[]>([]);

  // state for dialogs
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [textFieldError, setTextFieldError] = useState(false);
  const [textFieldHelperText, setTextFieldHelperText] = useState('');

  const fetchObjects = async (path: string) => {
    setLoading(true);
    // const objects = await fetchTempObjects(client, bucket, path);
    if (path) {
      path += '/';
    }

    const objects = await fetchTestObjects(client, bucket, path);
    setObjects(objects);
    objectSets.clear();
    objects.forEach((object) => {
      objectSets.add(object.name);
    });
    setLoading(false);
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
  const handleClickUpload = async (event: any) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    let success = true;
    const failedFiles: string[] = [];
    for (let i = 0; i < files.length; i++) {
      // TODO: pop up overwrite warning if the file already exists

      const file = files[i];
      const status = await uploadFile(client, bucket, ctx.currentPath, file);

      success &&= status;
      if (!status) {
        failedFiles.push(file.name);
      }
    }

    if (success) {
      setSnackBarSettings({
        message: `Successfully uploaded ${files.length} files`,
        open: true,
        severity: 'success'
      });

      fetchObjects(ctx.currentPath);
    } else if (failedFiles.length < files.length) {
      setSnackBarSettings({
        message: `Successfully uploaded ${files.length - failedFiles.length} with ${failedFiles.length} ${failedFiles.length === 1 ? 'failure' : 'failures'}`,
        open: true,
        severity: 'warning'
      });

      fetchObjects(ctx.currentPath);
    } else {
      setSnackBarSettings({
        message: `Failed to upload all files`,
        open: true,
        severity: 'error'
      });
    }
  };

  // handlers for creating new folders
  const handleClickNewFolder = () => {
    setNewFolderDialogOpen(true);
  };

  const handleCloseNewFolder = () => {
    setNewName('');
    setNewFolderDialogOpen(false);
  };

  const handleNewNameChange = (event: any) => {
    const newFolderName = event.target.value;
    setTextFieldError(false);
    setTextFieldHelperText('');

    setNewName(newFolderName);
  };

  const handleNewFolder = async () => {
    // check if the folder name is valid
    if (newName === '') {
      setTextFieldError(true);
      setTextFieldHelperText('Folder name cannot be empty');
    } else if (objectSets.has(newName)) {
      setTextFieldError(true);
      setTextFieldHelperText('Folder name already exists');
    } else if (!isValidS3Key(newName)) {
      setTextFieldError(true);
      setTextFieldHelperText('Illegal folder name');
    } else {
      try {
        await createFolder(client, bucket, ctx.currentPath, newName);
        setNewFolderDialogOpen(false);
        setNewName('');

        fetchObjects(ctx.currentPath);
      } catch (err) {
        alert("Couldn't create folder: " + err);
      }
    }
  };

  // handlers for downloading
  const handleDownload = async (object: S3Object) => {
    await downloadFile(client, bucket, object);
  };

  // handlers for deleting
  const handleClickDelete = (object: S3Object) => {
    setDeleteDialogOpen(true);
    setSelectedObjects([object]);
  };

  const handleDelete = async () => {
    await deleteFileOrFolder(client, bucket, selectedObjects[0]);
    setDeleteDialogOpen(false);
    setSelectedObjects([]);
    fetchObjects(ctx.currentPath);
  };

  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setSelectedObjects([]);
  };

  // handlers for renaming
  const handleRename = async () => {
    await renameFileOrFolder(client, bucket, selectedObjects[0], newName);
    setNewName('');
    setRenameDialogOpen(false);
    setSelectedObjects([]);
    fetchObjects(ctx.currentPath);
  };

  const handleClickRename = (object: S3Object) => {
    setSelectedObjects([object]);
    setRenameDialogOpen(true);
  };

  const handleCloseRename = () => {
    setRenameDialogOpen(false);
    setSelectedObjects([]);
    setNewName('');
  };

  // initial fetching for files and folders upon opening the page
  useEffect(() => {
    fetchObjects(ctx.currentPath);
  }, []);

  useEffect(() => {
    fetchObjects(ctx.currentPath);
    props.onCurrentPathChange && props.onCurrentPathChange(ctx.currentPath);
  }, [ctx.currentPath]);

  // ########################################
  // ####### Components for rendering #######
  // ########################################
  const createFolderDialog = (
    <Dialog open={newFolderDialogOpen} fullWidth>
      <DialogTitle>Create New Folder</DialogTitle>
      <DialogContent>
        <TextField
          style={{ marginTop: '10px' }}
          label="Folder Name"
          value={newName}
          onChange={handleNewNameChange}
          error={textFieldError}
          helperText={textFieldHelperText}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleNewFolder} disabled={!Boolean(newName)}>
          Create
        </Button>
        <Button variant="outlined" color="error" onClick={handleCloseNewFolder}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renameDialog = (
    <Dialog open={renameDialogOpen} fullWidth>
      <DialogTitle>Rename {selectedObjects[0]?.isFolder ? 'Folder' : 'File'}</DialogTitle>
      <DialogContent>
        <TextField
          style={{ marginTop: '10px' }}
          label="Folder Name"
          InputLabelProps={{ shrink: true }}
          placeholder={selectedObjects[0]?.name}
          value={newName}
          onChange={handleNewNameChange}
          error={textFieldError}
          helperText={textFieldHelperText}
          fullWidth
        />
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleRename} disabled={!Boolean(newName)}>
          Rename
        </Button>
        <Button variant="outlined" color="error" onClick={handleCloseRename}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );

  const deleteDialog = (
    <Dialog open={deleteDialogOpen} fullWidth>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to permanently delete {selectedObjects[0]?.name}?{' '}
          <b>{selectedObjects[0]?.isFolder ? 'All files and folders inside will be deleted as well.' : ''}</b>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" color="error" onClick={handleDelete}>
          Delete
        </Button>
        <Button variant="outlined" color="secondary" onClick={handleCloseDelete}>
          Abort
        </Button>
      </DialogActions>
    </Dialog>
  );

  const uploadPopup = (
    <Snackbar
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      open={snackBarSettings.open}
      autoHideDuration={5000}
      onClose={() => setSnackBarSettings({ ...snackBarSettings, open: false })}
    >
      <Alert severity={snackBarSettings.severity} sx={{ width: '100%' }}>
        {snackBarSettings.message}
      </Alert>
    </Snackbar>
  );

  return (
    <Paper>
      <Toolbar>
        <FileBreadCrumb bucketName={bucketDisplayedName ? bucketDisplayedName : bucket} />
        <Grid container spacing={1} justifyContent="end">
          {permissions.upload && (
            <Grid item>
              <Button startIcon={<UploadIcon />} component="label">
                Upload
                <input hidden multiple type="file" onChange={handleClickUpload} />
              </Button>
            </Grid>
          )}
          {permissions.createFolder && (
            <Grid item>
              <Button onClick={handleClickNewFolder} startIcon={<CreateNewFolderIcon />}>
                New Folder
              </Button>
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
      <div style={{ position: 'relative' }}>
        <Backdrop open={loading} sx={{ position: 'absolute', zIndex: 9999 }}>
          <CircularProgress color="inherit" />
        </Backdrop>
        {listView && (
          <FileListView
            client={client}
            bucket={bucket}
            objects={objects}
            permissions={permissions}
            onDelete={handleClickDelete}
            onDownload={handleDownload}
            onRename={handleClickRename}
          />
        )}
      </div>
      {createFolderDialog}
      {renameDialog}
      {deleteDialog}
      {uploadPopup}
    </Paper>
  );
};

// ########################################
// ########### Helper Functions ###########
// ########################################
// const fetchTempObjects = async (client: S3Client, bucket: string, path: string): Promise<S3Object[]> => {
//   // create a list of dummy objects with random date and size, all fields are required
//   const objects: S3Object[] = [];

//   const generateRandomName = (): string => {
//     const firstName = ['John', 'Jane', 'Michael', 'Emma', 'David', 'Olivia']; // List of possible first names
//     const lastName = ['Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis']; // List of possible last names

//     const randomFirstName = firstName[Math.floor(Math.random() * firstName.length)];
//     const randomLastName = lastName[Math.floor(Math.random() * lastName.length)];

//     return `${randomFirstName} ${randomLastName}`;
//   };

//   for (let i = 0; i < 50; i++) {
//     const lastModified = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
//     const size = Math.floor(Math.random() * 1000000000);
//     const location = `path/to/`;
//     const isFolder = Math.random() > 0.5;
//     const ext = isFolder ? '' : `${['txt', 'pdf', 'doc', 'jpg', 'png'][Math.floor(Math.random() * 5)]}`;
//     const name = isFolder ? `object-${i}` : `object-${i}.${ext}`;
//     const owner = {
//       id: Math.random().toString(36).substring(7),
//       name: generateRandomName()
//     };
//     objects.push({ name, location, lastModified, size, isFolder, owner, $raw: {} });
//   }

//   return objects;
// };

const fetchTestObjects = async (client: S3Client, bucket: string, path: string): Promise<S3Object[]> => {
  return getFoldersAndFiles(client, bucket, path);
};

const isValidS3Key = (key: string): boolean => {
  // No leading or trailing whitespace
  if (key.trim() !== key) {
    console.log('leading or trailing whitespace');
    return false;
  }

  // No non-printable ASCII characters
  if (/[^\x20-\x7E]/.test(key)) {
    console.log('non-printable ASCII characters');
    return false;
  }

  // Forbidden characters
  if (/[\\"{}^%`[\]>~<#|]/.test(key)) {
    console.log('forbidden characters');
    return false;
  }

  // No longer than 1024 bytes when UTF-8 encoded
  if (new TextEncoder().encode(key).length > 1024) {
    console.log('longer than 1024 bytes');
    return false;
  }

  return true;
};
