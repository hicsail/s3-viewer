import { Dispatch, FC, SetStateAction, useState } from 'react';
import { FileMain } from './FileMain';
import { S3Client } from '@aws-sdk/client-s3';
import { S3Provider } from '../../contexts/s3-context';
import { PluginManagerProvider } from '../../contexts/plugins.context';
import { Plugin } from './../../types/Plugin';
import { EventBusProvider } from '../../contexts/event-bus.context';

interface S3ViewerProps {
  client: S3Client;
  bucket: string;
  pathControl?: {
    setCurrentPath: Dispatch<SetStateAction<string>>;
    currentPath: string;
  };
  getSignedUrl: (bucket: string, key: string, expires: number) => Promise<string>;
  plugins?: Plugin[];
  bucketDisplayedName?: string;
  onCurrentPathChange?: (currentPath: string) => void;
  sideNavTopPadding?: string;
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

  // By default, have a useState for the current path
  let [currentPath, setCurrentPath] = useState<string>('');
  // Otherwise use the state provided
  if (props.pathControl) {
    currentPath = props.pathControl.currentPath;
    setCurrentPath = props.pathControl.setCurrentPath;
  }

  return (
    <S3Provider client={props.client} bucket={props.bucket} currentPath={currentPath} setCurrentPath={setCurrentPath} getSignedUrl={props.getSignedUrl}>
      <EventBusProvider>
        <PluginManagerProvider plugins={props.plugins || []}>
          <FileMain
            client={props.client}
            bucket={props.bucket}
            bucketDisplayedName={props.bucketDisplayedName}
            permissions={permissions}
            sideNavTopPadding={props.sideNavTopPadding}
            onCurrentPathChange={props.onCurrentPathChange}
          />
        </PluginManagerProvider>
      </EventBusProvider>
    </S3Provider>
  );
};
