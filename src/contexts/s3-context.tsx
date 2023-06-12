import { createContext, useContext, useState } from 'react';

interface S3ContextProps {
  currentPath: string;
  setCurrentPath: (path: string) => void;
}

interface S3ProviderProps {
  children?: React.ReactNode;
}

const S3Context = createContext<S3ContextProps>({
  currentPath: '',
  setCurrentPath: () => {}
});

export const useS3Context = () => useContext(S3Context);

export const S3Provider: React.FC<S3ProviderProps> = ({ children }) => {
  const [currentPath, setCurrentPath] = useState('');

  return <S3Context.Provider value={{ currentPath, setCurrentPath }}>{children}</S3Context.Provider>;
};
