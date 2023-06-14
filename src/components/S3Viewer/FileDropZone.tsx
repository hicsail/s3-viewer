import { Box, Typography } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { FC } from 'react';

export const FileDropZone: FC = () => {
  return (
    <Box
      gap={1}
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px dashed grey'
      }}
    >
      <FileUploadIcon />
      <Typography variant="h6">Drop your files to upload to current directory</Typography>
    </Box>
  );
};
