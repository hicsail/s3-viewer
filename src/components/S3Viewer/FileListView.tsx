import { FC, MouseEvent, useState } from 'react';
import { S3Object } from '../../types/S3Object';
import { Table, TableBody, TableContainer } from '@mui/material';
import EnhancedTableHead from '../EnhancedTableHead';
import { ObjectRow } from './ObjectRow';

interface FileListViewProps {
  objects: S3Object[];
  permissions: any;
}

const FileListView: FC<FileListViewProps> = (props) => {
  const { objects, permissions } = props;

  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');

  const columns = [
    { label: 'Name', id: 'name' },
    { label: 'Date Modified', id: 'date' },
    { label: 'Size', id: 'size' }
  ];
  if (props.permissions.actions) {
    columns.push({ label: 'Actions', id: 'actions' });
  }

  const handleRequestSort = (_event: MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  return (
    <TableContainer>
      <Table>
        <EnhancedTableHead onRequestSort={handleRequestSort} columns={columns} sortableIds={['name', 'date', 'size']} order={order} orderBy={orderBy} />
        <TableBody>
          {objects.map((object) => (
            <ObjectRow key={object.location + object.name} object={object} permissions={props.permissions} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
