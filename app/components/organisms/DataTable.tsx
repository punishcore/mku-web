import { ReactNode } from 'react';
import { Badge } from '../atoms';
import { Pencil, Trash2 } from 'lucide-react';

interface Column<T> {
  key: keyof T | 'actions';
  header: string;
  align?: 'left' | 'right' | 'center';
  render?: (item: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  emptyMessage?: string;
  footer?: ReactNode;
}

export function DataTable<T>({ columns, data, keyField, onEdit, onDelete, emptyMessage = 'Tidak ada data', footer }: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th key={String(col.key)} className={`py-3 lg:py-4 px-3 lg:px-6 text-[10px] lg:text-xs font-semibold text-slate-500 uppercase tracking-wider text-${col.align || 'left'}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((item) => (
              <tr key={String(item[keyField])} className="hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td key={String(col.key)} className={`py-3 lg:py-4 px-3 lg:px-6 text-${col.align || 'left'}`}>
                    {col.key === 'actions' ? (
                      <div className="flex items-center justify-center gap-1 lg:gap-2">
                        {onEdit && (
                          <button onClick={() => onEdit(item)} className="p-1.5 lg:p-2 rounded-lg text-blue-600 hover:bg-blue-50">
                            <Pencil className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item)} className="p-1.5 lg:p-2 rounded-lg text-red-600 hover:bg-red-50">
                            <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                          </button>
                        )}
                      </div>
                    ) : col.render ? (
                      col.render(item)
                    ) : (
                      String(item[col.key as keyof T])
                    )}
                  </td>
                ))}
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-8 lg:py-12 text-center text-slate-500 text-sm">{emptyMessage}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {footer && <div className="bg-slate-50 border-t border-slate-200 px-3 lg:px-6 py-2 lg:py-3">{footer}</div>}
    </div>
  );
}

export function StokBadge({ stok }: { stok: number }) {
  const variant = stok < 10 ? 'danger' : stok < 50 ? 'warning' : 'success';
  return <Badge variant={variant}>{stok}</Badge>;
}
