import { S3Client } from '@aws-sdk/client-s3';
import { Autocomplete, TextField } from '@mui/material';
import { FC } from 'react';

interface FileSearchProps {
  client: S3Client;
  bucket: string;
}

export const FileSearch: FC<FileSearchProps> = () => {
  return <Autocomplete onFocus={() => {}} onChange={() => {}} options={[]} value={''} renderInput={(params) => <TextField {...params} label="Search" sx={{ margin: 0 }} />} />;
};
