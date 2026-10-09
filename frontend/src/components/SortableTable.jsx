import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';

export const SortableTable = ({
  columns = [],
  data = [],
  sortBy,
  sortOrder = 'ASC',
  onSort,
  emptyMessage = 'No data available',
}) => {
  const handleHeaderClick = (key) => {
    if (!key || !onSort) return;
    if (sortBy === key) {
      onSort(key, sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      onSort(key, 'ASC');
    }
  };

  const getSortIcon = (key) => {
    if (sortBy !== key) return <ArrowUpDown size={14} style={{ opacity: 0.4, marginLeft: 6 }} />;
    return sortOrder === 'ASC' ? (
      <ArrowUp size={14} style={{ color: '#6366f1', marginLeft: 6 }} />
    ) : (
      <ArrowDown size={14} style={{ color: '#6366f1', marginLeft: 6 }} />
    );
  };

  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.sortable ? 'sortable' : ''}
                onClick={() => col.sortable && handleHeaderClick(col.key)}
                style={{ width: col.width || 'auto' }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {col.label}
                  {col.sortable && getSortIcon(col.key)}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem 1rem', color: '#9ca3af' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={row.id || rowIndex}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
