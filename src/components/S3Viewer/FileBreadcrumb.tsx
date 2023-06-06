import { Breadcrumbs, Button } from '@mui/material';
import { FC } from 'react';
import { useS3Context } from '../../contexts/s3-context';
import StorageIcon from '@mui/icons-material/Storage';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export const FileBreadCrumb: FC = () => {
  const ctx = useS3Context();

  // ########################################
  // #### Handler functions for actions #####
  // ########################################
  const handleHome = () => {
    ctx.setCurrentPath('');
  };

  return (
    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb" sx={{ flex: '1 1 100%' }}>
      <Button startIcon={<StorageIcon />} onClick={handleHome}>
        {/* TODO: Change it to bucket name */}
        Home
      </Button>
      {ctx.currentPath.split('/').map((path, index) => (
        <Button
          key={index}
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
