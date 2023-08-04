import { S3Client } from '@aws-sdk/client-s3';
import { Autocomplete, Grid, TextField, Typography } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { S3Object } from '../../types/S3Object';
import { searchFoldersAndFiles } from '../../utils/S3Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFolder } from '@fortawesome/free-regular-svg-icons';
import { useS3Context } from '../../contexts/s3-context';

interface FileSearchProps {
  client: S3Client;
  bucket: string;
}

export const FileSearch: FC<FileSearchProps> = (props) => {
  const ctx = useS3Context();

  const [input, setInput] = useState<string>('');
  const [options, setOptions] = useState<S3Object[]>([]);

  const fetchSearchResults = async () => {
    if (input.length > 0) {
      const results = await searchFoldersAndFiles(props.client, props.bucket, input);
      setOptions(results);
    } else {
      setOptions([]);
    }
  };

  // ########################################
  // #### Handler functions for actions #####
  // ########################################
  const handleInputChange = (event: any) => {
    setInput(event.target.value);
  };

  const handleChange = (event: any, value: any) => {
    event.preventDefault();
    if (value) {
      ctx.setCurrentPath(value.location);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [input]);

  return (
    <Autocomplete
      sx={{ width: 300 }}
      getOptionLabel={(option) => `${option.location}/${option.name}`}
      options={options}
      onChange={handleChange}
      filterOptions={(x) => x}
      renderInput={(params) => <TextField {...params} size="small" label="Search" variant="outlined" value={input} onChange={handleInputChange} fullWidth />}
      renderOption={(props, option) => {
        return (
          <li {...props}>
            <Grid container alignItems="center" key={`${option.location}/${option.name}`}>
              <Grid item sx={{ display: 'flex', width: 30 }}>
                {option.isFolder ? <FontAwesomeIcon icon={faFolder} /> : <FontAwesomeIcon icon={faFile} />}
              </Grid>
              <Grid item sx={{ width: 'calc(100% - 44)', wordWrap: 'break-word' }}>
                <Typography variant="body1">{option.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {option.location ? `/${option.location}` : ''}
                </Typography>
              </Grid>
            </Grid>
          </li>
        );
      }}
    />
  );
};
