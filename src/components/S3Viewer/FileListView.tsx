import { FC, MouseEvent, useEffect, useState } from 'react';
import { S3Object } from '../../types/S3Object';
import { Table, TableBody, TableContainer } from '@mui/material';
import EnhancedTableHead from '../EnhancedTableHead';
import { ObjectRow } from './ObjectRow';

interface FileListViewProps {
  objects: S3Object[];
  permissions: any;
}

export const FileListView: FC<FileListViewProps> = (props) => {
  const { permissions } = props;

  const [objects, setObjects] = useState<S3Object[]>(props.objects);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');

  const columns = [
    { label: 'Name', id: 'name' },
    { label: 'Owner', id: 'owner' },
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

  // update the objects when the props change
  useEffect(() => {
    console.log('updating objects');
    setObjects(props.objects);
  }, [props.objects]);

  // sort the objects by the selected column
  useEffect(() => {
    const sortedObjects = [...objects].sort((a, b) => {
      const isAsc = order === 'asc';
      switch (orderBy) {
        case 'name':
          return isAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
        case 'owner':
          return isAsc ? a.owner.name.localeCompare(b.owner.name) : b.owner.name.localeCompare(a.owner.name);
        case 'date':
          return isAsc ? a.lastModified.getTime() - b.lastModified.getTime() : b.lastModified.getTime() - a.lastModified.getTime();
        case 'size':
          return isAsc ? a.size - b.size : b.size - a.size;
        default:
          throw new Error('Unknown column');
      }
    });
    setObjects(sortedObjects);
  }, [order, orderBy]);

  return (
    <TableContainer>
      <Table>
        <EnhancedTableHead onRequestSort={handleRequestSort} columns={columns} sortableIds={['name', 'owner', 'date', 'size']} order={order} orderBy={orderBy} />
        <TableBody>
          {objects.map((object) => (
            <ObjectRow key={object.location + object.name} object={object} permissions={props.permissions} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
