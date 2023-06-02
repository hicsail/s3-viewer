import { TableCell, TableRow } from '@mui/material';
import { S3Object } from '../../types/S3Object';
import { FC } from 'react';

interface ObjectRowProps {
  object: S3Object;
  permissions: any;
}

export const ObjectRow: FC<ObjectRowProps> = (props) => {
  const { object, permissions } = props;

  const name = object.name;
  const owner = object.owner;
  const lastModified = object.lastModified.toLocaleDateString();
  const size = formatBytes(object.size);

  return (
    <TableRow>
      <TableCell>{name}</TableCell>
      <TableCell>{owner.name}</TableCell>
      <TableCell>{lastModified}</TableCell>
      <TableCell>{size}</TableCell>
      {permissions.actions && <TableCell></TableCell>}
    </TableRow>
  );
};

// ########################################
// ########### Helper Functions ###########
// ########################################
const formatBytes = (size: number | undefined): string => {
  if (!size || size == 0) {
    return '-';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let n = 0;
  while (size >= 1024 && n < units.length - 1) {
    size /= 1024;
    n++;
  }
  return `${size.toFixed(2)} ${units[n]}`;
};
