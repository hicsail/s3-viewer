import { FC } from 'react';
import { FileMain } from './FileMain';
import { S3Client } from '@aws-sdk/client-s3';

interface S3ViewerProps {
  client: S3Client;
  bucket: string;
  disableActions?: boolean;
  disableRead?: boolean;
  disableWrite?: boolean;
  disableUpload?: boolean;
  disablePreview?: boolean;
  disableDelete?: boolean;
  disableDownload?: boolean;
  disableRename?: boolean;
  disableCreateFolder?: boolean;
}

export const S3Viewer: FC<S3ViewerProps> = (props) => {
  const action = !props.disableActions;
  const read = !props.disableRead && action;
  const write = !props.disableWrite && action;

  const permissions = {
    actions: action,
    upload: !props.disableUpload && write,
    preview: !props.disablePreview && read,
    delete: !props.disableDelete && action,
    download: !props.disableDownload && read,
    rename: !props.disableRename && write,
    createFolder: !props.disableCreateFolder && write
  };

  return <FileMain client={props.client} bucket={props.bucket} permissions={permissions} />;
};
