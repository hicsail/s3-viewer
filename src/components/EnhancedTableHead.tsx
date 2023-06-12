import { TableCell, TableHead, TableRow, TableSortLabel } from '@mui/material';

export type Order = 'asc' | 'desc';

interface EnhancedTableProps {
  onRequestSort: (event: React.MouseEvent<unknown>, property: string) => void;
  columns: { label: string; id: string }[];
  sortableIds: string[];
  order: Order;
  orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
  const { columns, sortableIds, order, orderBy } = props;
  const sortableIdsSet = new Set(sortableIds);

  const createSortHandler = (property: string) => (event: React.MouseEvent<unknown>) => {
    props.onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {columns.map((column) => (
          <TableCell key={column.id}>
            {sortableIdsSet.has(column.id) ? (
              <TableSortLabel active={orderBy === column.id} direction={orderBy === column.id ? order : 'asc'} onClick={createSortHandler(column.id)}>
                {column.label}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export default EnhancedTableHead;
