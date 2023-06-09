import { FC, MouseEvent, useState } from 'react';
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

interface ObjectRowProps {
  object: S3Object;
  permissions: any;
  onDelete: (object: S3Object) => void;
  onDownload: (object: S3Object) => void;
  onRename: (object: S3Object) => void;
}

export const ObjectRow: FC<ObjectRowProps> = (props) => {
  const { object, permissions } = props;
  const { onDelete: handleDelete, onDownload: handleDownload, onRename: handleRename } = props;
  const ctx = useS3Context();

  const name = object.name;
  const owner = object.owner;
  const lastModified = object.lastModified.toLocaleString();
  const size = formatBytes(object.size);

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
    // TODO: implement preview action
    alert('preview');
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
      {permissions.preview && (
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
    </Grid>
  );

  return (
    <TableRow hover onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} onDoubleClick={handleDoubleClickRow}>
      <TableCell align="right" padding="none">
        {object.isFolder ? <FontAwesomeIcon icon={faFolder} size="xl" /> : <FontAwesomeIcon icon={faFile} size="xl" />}
      </TableCell>
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
