import { S3Client } from '@aws-sdk/client-s3';
import { createContext, useContext } from 'react';

interface S3ContextProps {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  client: S3Client;
  bucket: string;
  getSignedUrl: (bucket: string, key: string, expires: number) => Promise<string>;
}

interface S3ProviderProps {
  children?: React.ReactNode;
  client: S3Client;
  bucket: string;
  setCurrentPath: (path: string) => void;
  currentPath: string;
  getSignedUrl: (bucket: string, key: string, expires: number) => Promise<string>;
}

const S3Context = createContext<S3ContextProps>({
  currentPath: '',
  setCurrentPath: () => {},
  client: {} as any,
  bucket: '',
  getSignedUrl: {} as any
});

export const useS3Context = () => useContext(S3Context);

export const S3Provider: React.FC<S3ProviderProps> = (props) => {
  return (
    <S3Context.Provider
      value={{
        client: props.client,
        bucket: props.bucket,
        setCurrentPath: props.setCurrentPath,
        currentPath: props.currentPath,
        getSignedUrl: props.getSignedUrl
      }}
    >
      {props.children}
    </S3Context.Provider>
  );
};
