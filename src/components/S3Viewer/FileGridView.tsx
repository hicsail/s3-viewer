import { S3Client } from '@aws-sdk/client-s3';
import { FC, useEffect, useMemo, useState } from 'react';
import { S3Object } from '../../types/S3Object';
import { Permission } from '../../types/Permission';
import { Box, Divider, Grid, Typography } from '@mui/material';
import { ObjectCard } from './ObjectCard';

interface FileGridViewProps {
  client: S3Client;
  bucket: string;
  objects: S3Object[];
  permissions: Permission;
  onDelete: (object: S3Object) => void;
  onDownload: (object: S3Object) => void;
  onRename: (object: S3Object) => void;
}

export const FileGridView: FC<FileGridViewProps> = (props) => {
  // ########################################
  // #### State and variables definitions ###
  // ########################################
  const [objects, setObjects] = useState<S3Object[]>(props.objects);
  const folders = useMemo(() => {
    return objects.filter((object) => object.isFolder);
  }, [objects]);
  const files = useMemo(() => {
    return objects.filter((object) => !object.isFolder);
  }, [objects]);

  // update the objects when the props change
  useEffect(() => {
    setObjects(props.objects);
  }, [props.objects]);

  return (
    <>
      <Divider />
      <Box sx={{ padding: 2, width: 'calc(100% - 2)', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(250, 250, 250, 1)' }}>
        <Divider sx={{ m: 1 }}>
          <Typography color="text.secondary" variant="body2">
            Folders
          </Typography>
        </Divider>
        <Grid container spacing={3}>
          {folders.map((folder) => (
            <ObjectCard
              key={folder.location + folder.name}
              object={folder}
              permissions={props.permissions}
              onDelete={props.onDelete}
              onDownload={props.onDownload}
              onRename={props.onRename}
            />
          ))}
        </Grid>
        <Divider sx={{ m: 1 }}>
          <Typography color="text.secondary" variant="body2">
            Files
          </Typography>
        </Divider>
        <Grid container spacing={3}>
          {files.map((file) => (
            <ObjectCard
              key={file.location + file.name}
              object={file}
              permissions={props.permissions}
              onDelete={props.onDelete}
              onDownload={props.onDownload}
              onRename={props.onRename}
            />
          ))}
        </Grid>
      </Box>
    </>
  );
};
