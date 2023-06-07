import { Breadcrumbs, Button } from '@mui/material';
import { FC } from 'react';
import { useS3Context } from '../../contexts/s3-context';
import StorageIcon from '@mui/icons-material/Storage';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

interface FileBreadCrumbProps {
  bucketName?: string;
}

export const FileBreadCrumb: FC<FileBreadCrumbProps> = (props) => {
  const ctx = useS3Context();

  const { bucketName } = props;

  // ########################################
  // #### Handler functions for actions #####
  // ########################################
  const handleHome = () => {
    ctx.setCurrentPath('');
  };

  return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ flex: '1 1 100%' }}>
      <Button size="large" startIcon={<StorageIcon />} onClick={handleHome} sx={{ textTransform: 'none' }}>
        {bucketName}
      </Button>
      {ctx.currentPath &&
        ctx.currentPath.split('/').map((path, index) => (
          <Button
            key={index}
            size="large"
            sx={{ textTransform: 'none' }}
            onClick={() => {
              ctx.setCurrentPath(
                ctx.currentPath
                  .split('/')
                  .slice(0, index + 1)
                  .join('/')
              );
            }}
          >
            {path}
          </Button>
        ))}
    </Breadcrumbs>
  );
};
