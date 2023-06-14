import { S3Client } from '@aws-sdk/client-s3';
import { createContext, useContext, useState } from 'react';

interface S3ContextProps {
  currentPath: string;
  setCurrentPath: (path: string) => void;
  client: S3Client;
  bucket: string;
}

interface S3ProviderProps {
  children?: React.ReactNode;
  client: S3Client;
  bucket: string;
}

const S3Context = createContext<S3ContextProps>({
  currentPath: '',
  setCurrentPath: () => {},
  client: {} as any,
  bucket: ''
});

export const useS3Context = () => useContext(S3Context);

export const S3Provider: React.FC<S3ProviderProps> = ({ children, client, bucket }) => {
  const [currentPath, setCurrentPath] = useState('');

  return <S3Context.Provider value={{ currentPath, setCurrentPath, client, bucket }}>{children}</S3Context.Provider>;
};
