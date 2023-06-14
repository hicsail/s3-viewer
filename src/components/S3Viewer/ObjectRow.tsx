import { FC, MouseEvent, useState, useContext } from 'react';
import { Grid, IconButton, TableCell, TableRow } from '@mui/material';
import { S3Object } from '../../types/S3Object';
import PreviewIcon from '@mui/icons-material/Preview';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { useS3Context } from '../../contexts/s3-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { Permission } from '../../types/Permission';
import { PluginManagerContext } from '../../context/plugins.context';
import { PluginView } from '../Plugin/PluginView';

interface ObjectRowProps {
  object: S3Object;
  permissions: Permission;
  onDelete: (object: S3Object) => void;
  onDownload: (object: S3Object) => void;
  onRename: (object: S3Object) => void;
}

export const ObjectRow: FC<ObjectRowProps> = (props) => {
  const { object, permissions } = props;
  const { onDelete: handleDelete, onDownload: handleDownload, onRename: handleRename } = props;
  const ctx = useS3Context();
  const pluginManager = useContext(PluginManagerContext);

  const name = object.name;
  const owner = object.owner;
  const lastModified = object.lastModified.toLocaleString();
  const size = formatBytes(object.size);

  const [openModal, setOpenModal] = useState<boolean>(false);

  const [displayActions, setDisplayActions] = useState<boolean>(false);

  // ########################################
  // #### Handler functions for actions #####
  // ########################################
  const handleMouseEnter = () => {
    setDisplayActions(true);
  };

  const handleMouseLeave = () => {
    setDisplayActions(false);
  };

  const handlePreview = () => {
    setOpenModal(true);
  };

  const handleDetails = () => {
    // TODO: implement details action
    alert('details');
  };

  const handleDoubleClickRow = (event: MouseEvent) => {
    if (!object.isFolder) {
      event.stopPropagation();
      return;
    }

    const newPath = ctx.currentPath ? ctx.currentPath + '/' + name : name;
    ctx.setCurrentPath(newPath);
  };

  const handleEscapeDoubleClick = (event: MouseEvent) => {
    event.stopPropagation();
  };

  const actions = (
    <Grid container justifyContent="center" alignItems="center">
      {permissions.preview && pluginManager.hasPlugin(props.object.ext) && (
        <Grid item xs={2}>
          <IconButton onClick={handlePreview} sx={displayActions ? {} : { visibility: 'hidden' }}>
            <PreviewIcon />
          </IconButton>
        </Grid>
      )}
      {permissions.rename && (
        <Grid item xs={2}>
          <IconButton onClick={() => handleRename(object)} sx={displayActions ? {} : { visibility: 'hidden' }}>
            <EditIcon />
          </IconButton>
        </Grid>
      )}
      {permissions.download && (
        <Grid item xs={2}>
          <IconButton onClick={() => handleDownload(object)} sx={displayActions ? {} : { visibility: 'hidden' }}>
            <FileDownloadIcon />
          </IconButton>
        </Grid>
      )}
      {permissions.delete && (
        <Grid item xs={2}>
          <IconButton onClick={() => handleDelete(object)} sx={displayActions ? {} : { visibility: 'hidden' }}>
            <DeleteIcon />
          </IconButton>
        </Grid>
      )}
      <Grid item xs={2}>
        <IconButton onClick={handleDetails} sx={displayActions ? {} : { visibility: 'hidden' }}>
          <MoreHorizIcon />
        </IconButton>
      </Grid>
      {
        // TODO: In the future support multiple plugins
        pluginManager.hasPlugin(props.object.ext) && <PluginView plugin={pluginManager.getPlugins(props.object.ext!)![0]} open={openModal} setOpen={setOpenModal} object={object} />
      }
    </Grid>
  );

  return (
    <TableRow hover onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onDoubleClick={handleDoubleClickRow}>
      <TableCell align="center">{object.isFolder ? <FontAwesomeIcon icon={faFolder} size="xl" /> : <FontAwesomeIcon icon={faFile} size="xl" />}</TableCell>
      <TableCell>{name}</TableCell>
      <TableCell>{owner?.name}</TableCell>
      <TableCell>{lastModified}</TableCell>
      <TableCell>{size}</TableCell>
      <TableCell onDoubleClick={handleEscapeDoubleClick}>{actions}</TableCell>
    </TableRow>
  );
};

// ########################################
// ########### Helper Functions ###########
// ########################################
const formatBytes = (size: number | undefined): string => {
  if (!size || size == 0) {
    return '-';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let n = 0;
  while (size >= 1024 && n < units.length - 1) {
    size /= 1024;
    n++;
  }
  return `${size.toFixed(2)} ${units[n]}`;
};
