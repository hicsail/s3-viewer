import { FC, MouseEvent, useEffect, useMemo, useState } from 'react';
import { S3Object } from '../../types/S3Object';
import { Table, TableBody, TableContainer, TablePagination } from '@mui/material';
import EnhancedTableHead from './EnhancedTableHead';
import { ObjectRow } from './ObjectRow';
import { S3Client } from '@aws-sdk/client-s3';
import { Permission } from '../../types/Permission';

interface FileListViewProps {
  client: S3Client;
  bucket: string;
  objects: S3Object[];
  permissions: Permission;
  onDelete: (object: S3Object) => void;
  onDownload: (object: S3Object) => void;
  onRename: (object: S3Object) => void;
  onDetails: (object: S3Object) => void;
  onPlugin: (object: S3Object, tabId: number) => void;
}

export const FileListView: FC<FileListViewProps> = (props) => {
  // ########################################
  // #### State and variables definitions ###
  // ########################################
  const [objects, setObjects] = useState<S3Object[]>(props.objects);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [orderBy, setOrderBy] = useState<string>('name');
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const visibleRows = useMemo(() => {
    return objects.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [objects, page, rowsPerPage]);

  const columns = [
    { label: '', id: 'isFolder' },
    { label: 'Name', id: 'name' },
    { label: 'Owner', id: 'owner' },
    { label: 'Date Modified', id: 'date' },
    { label: 'Size', id: 'size' },
    { label: '', id: 'actions' }
  ];

  // ########################################
  // #### Handler functions for actions #####
  // ########################################
  const handleRequestSort = (_event: MouseEvent<unknown>, property: string) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: any) => {
    if (event) {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    }
  };

  // update the objects when the props change
  useEffect(() => {
    setObjects(props.objects);
  }, [props.objects]);

  // sort the objects by the selected column
  useEffect(() => {
    const sortedObjects = [...objects].sort((a, b) => {
      const isAsc = order === 'asc';
      switch (orderBy) {
        case 'isFolder':
          return isAsc ? (a.isFolder ? -1 : 1) : b.isFolder ? -1 : 1;
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
    <>
      <TableContainer>
        <Table>
          <EnhancedTableHead onRequestSort={handleRequestSort} columns={columns} sortableIds={['isFolder', 'name', 'date', 'size']} order={order} orderBy={orderBy} />
          <TableBody>
            {visibleRows.map((object) => (
              <ObjectRow
                key={object.location + object.name}
                object={object}
                permissions={props.permissions}
                onDelete={props.onDelete}
                onDownload={props.onDownload}
                onRename={props.onRename}
                onDetails={props.onDetails}
                onPlugin={props.onPlugin}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50, { label: 'All', value: -1 }]}
        component="div"
        count={objects.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
};
