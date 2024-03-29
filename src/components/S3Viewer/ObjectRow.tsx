import { FC, MouseEvent, useState, useContext } from 'react';
import { Grid, IconButton, TableCell, TableRow } from '@mui/material';
import { S3Object } from '../../types/S3Object';
import PreviewIcon from '@mui/icons-material/Preview';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { useS3Context } from '../../contexts/s3-context';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile } from '@fortawesome/free-regular-svg-icons';
import { faFolder } from '@fortawesome/free-solid-svg-icons';
import { Permission } from '../../types/Permission';
import { PluginManagerContext } from '../../contexts/plugins.context';
import { PluginView } from '../Plugin/PluginView';
import { formatBytes } from '../../utils/ObjectUtils';
import { SideNavPlugin } from '../../types/SideNavPlugin';

interface ObjectRowProps {
  object: S3Object;
  permissions: Permission;
  onDelete: (object: S3Object) => void;
  onDownload: (object: S3Object) => void;
  onRename: (object: S3Object) => void;
  onDetails: (object: S3Object) => void;
  onPlugin: (object: S3Object, tabId: number) => void;
}

export const ObjectRow: FC<ObjectRowProps> = (props) => {
  const { object, permissions } = props;
  const { onDelete: handleDelete, onDownload: handleDownload, onRename: handleRename, onDetails: handleDetails, onPlugin: handlePlugin } = props;
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
      {permissions.preview && !object.isFolder && pluginManager.hasPlugin(props.object.ext) && (
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
      {permissions.download && !object.isFolder && (
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
      {!object.isFolder &&
        (pluginManager.getPlugins('*') as SideNavPlugin[])?.map(
          (plugin, index) =>
            !object.isFolder && (
              <Grid key={plugin.name} item xs={2}>
                <IconButton onClick={() => handlePlugin(object, index + 1)} sx={displayActions ? {} : { visibility: 'hidden' }}>
                  {plugin.icon}
                </IconButton>
              </Grid>
            )
        )}
      {!object.isFolder && (
        <Grid item xs={2}>
          <IconButton onClick={() => handleDetails(object)} sx={displayActions ? {} : { visibility: 'hidden' }}>
            <InfoIcon />
          </IconButton>
        </Grid>
      )}
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
