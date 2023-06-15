import { FC, useState } from 'react';
import { Permission } from '../../types/Permission';
import { S3Object } from '../../types/S3Object';
import { useS3Context } from '../../contexts/s3-context';
import { formatBytes } from '../../utils/ObjectUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Box, Card, CardActionArea, CardActions, CardContent, Divider, Grid, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Typography } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import PreviewIcon from '@mui/icons-material/Preview';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoIcon from '@mui/icons-material/Info';
import { faFile, faFolder } from '@fortawesome/free-solid-svg-icons';

interface ObjectCardProps {
  object: S3Object;
  permissions: Permission;
  onDelete: (object: S3Object) => void;
  onDownload: (object: S3Object) => void;
  onRename: (object: S3Object) => void;
}

export const ObjectCard: FC<ObjectCardProps> = (props) => {
  const { object, permissions } = props;
  const { onDelete: handleDelete, onDownload: handleDownload, onRename: handleRename } = props;
  const ctx = useS3Context();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const name = object.name;
  const size = formatBytes(object.size);

  // ########################################
  // #### Handler functions for actions #####
  // ########################################
  const handleClickCard = (event: any) => {
    if (!object.isFolder) {
      event.stopPropagation();
      return;
    }

    const newPath = ctx.currentPath ? ctx.currentPath + '/' + name : name;
    ctx.setCurrentPath(newPath);
  };

  const handleClickMore = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMore = () => {
    setAnchorEl(null);
  };

  const actions = (
    <Menu id="view-type-menu" anchorEl={anchorEl} open={open} onClose={handleCloseMore}>
      {permissions.preview && (
        <MenuItem>
          <ListItemIcon>
            <PreviewIcon />
          </ListItemIcon>
          <ListItemText primary="Preview" />
        </MenuItem>
      )}
      {permissions.rename && (
        <MenuItem
          onClick={() => {
            handleCloseMore();
            handleRename(object);
          }}
        >
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText primary="Rename" />
        </MenuItem>
      )}
      {permissions.download && (
        <MenuItem
          onClick={() => {
            handleCloseMore();
            handleDownload(object);
          }}
        >
          <ListItemIcon>
            <FileDownloadIcon />
          </ListItemIcon>
          <ListItemText primary="Download" />
        </MenuItem>
      )}
      {permissions.delete && (
        <MenuItem
          onClick={() => {
            handleCloseMore();
            handleDelete(object);
          }}
        >
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
      )}
      <MenuItem>
        <ListItemIcon>
          <InfoIcon />
        </ListItemIcon>
        <ListItemText primary="Details" />
      </MenuItem>
    </Menu>
  );

  return (
    <Grid item>
      <Card sx={{ width: 140, height: 170 }}>
        <CardActionArea onClick={handleClickCard}>
          <CardContent sx={{ paddingBottom: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <Box>{object.isFolder ? <FontAwesomeIcon icon={faFolder} style={{ fontSize: '60px' }} /> : <FontAwesomeIcon icon={faFile} style={{ fontSize: '60px' }} />}</Box>
              <Typography
                variant="body1"
                maxWidth={120}
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {name}
              </Typography>
              <Typography color="text.secondary" variant="caption">
                {size}
              </Typography>
            </Box>
            <Divider sx={{ m: 0.5 }} />
          </CardContent>
        </CardActionArea>
        <CardActions disableSpacing sx={{ paddingTop: 0, justifyContent: 'end' }}>
          <IconButton onClick={handleClickMore}>
            <MoreHorizIcon />
          </IconButton>
          {actions}
        </CardActions>
      </Card>
    </Grid>
  );
};
