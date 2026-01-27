import { ReactNode } from 'react';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => ReactNode);
  className?: string;
  mobileLabel?: string;
  hideOnMobile?: boolean;
}

interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: (item: T) => ReactNode;
  keyExtractor: (item: T) => string | number;
  emptyMessage?: string;
}

export function ResponsiveTable<T>({
  data,
  columns,
  actions,
  keyExtractor,
  emptyMessage = 'No hay datos disponibles'
}: ResponsiveTableProps<T>) {
  const getCellValue = (item: T, column: Column<T>) => {
    if (typeof column.accessor === 'function') {
      return column.accessor(item);
    }
    return item[column.accessor] as ReactNode;
  };

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 border rounded-lg">
        {emptyMessage}
      </div>
    );
  }

  return (
    <>
      {/* Vista Desktop - Tabla tradicional */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index} className={column.className}>
                  {column.header}
                </TableHead>
              ))}
              {actions && <TableHead className="text-right">Acciones</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={keyExtractor(item)}>
                {columns.map((column, index) => (
                  <TableCell key={index} className={column.className}>
                    {getCellValue(item, column)}
                  </TableCell>
                ))}
                {actions && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {actions(item)}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Vista Móvil - Cards */}
      <div className="md:hidden space-y-3">
        {data.map((item) => (
          <Card key={keyExtractor(item)} className="p-4">
            <div className="space-y-3">
              {columns.filter(col => !col.hideOnMobile).map((column, index) => (
                <div key={index} className="flex justify-between items-start gap-3">
                  <span className="text-sm text-gray-600 flex-shrink-0">
                    {column.mobileLabel || column.header}:
                  </span>
                  <span className="text-sm text-gray-900 text-right flex-1">
                    {getCellValue(item, column)}
                  </span>
                </div>
              ))}
              {actions && (
                <div className="pt-3 border-t flex gap-2 justify-end">
                  {actions(item)}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
