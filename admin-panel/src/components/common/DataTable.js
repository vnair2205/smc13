import React from 'react';
import styled from 'styled-components';

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #33333e;
    white-space: nowrap;
  }
  th {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-weight: 600;
  }
  td {
    color: ${({ theme }) => theme.colors.text};
  }
  tbody tr:hover {
    background-color: #27273a;
  }
`;

const DataTable = ({ columns, data }) => {
  return (
    <TableWrapper>
      <StyledTable>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr key={row._id || rowIndex}>
                {columns.map((col) => (
                  <td key={`${col.key}-${row._id || rowIndex}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center' }}>
                No Data Found
              </td>
            </tr>
          )}
        </tbody>
      </StyledTable>
    </TableWrapper>
  );
};

export default DataTable;