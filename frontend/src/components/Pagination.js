import React from 'react';

function Pagination({ pagination, onPageChange, onLimitChange }) {
  const { page, limit, total, totalPages } = pagination;

  if (totalPages <= 1) return null;

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust startPage if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const pageStyle = {
    padding: '8px 12px',
    margin: '0 2px',
    border: '1px solid #ddd',
    backgroundColor: 'white',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px'
  };

  const activePageStyle = {
    ...pageStyle,
    backgroundColor: '#007bff',
    color: 'white',
    border: '1px solid #007bff'
  };

  const disabledPageStyle = {
    ...pageStyle,
    backgroundColor: '#f8f9fa',
    color: '#6c757d',
    cursor: 'not-allowed'
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
      <div style={{ fontSize: '14px', color: '#6c757d' }}>
        Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} items
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <label htmlFor="limit-select" style={{ fontSize: '14px' }}>Items per page:</label>
          <select
            id="limit-select"
            value={limit}
            onChange={(e) => onLimitChange(parseInt(e.target.value))}
            style={{ padding: '4px', fontSize: '14px' }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            style={page <= 1 ? disabledPageStyle : pageStyle}
          >
            Previous
          </button>

          {generatePageNumbers().map(pageNum => (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={pageNum === page ? activePageStyle : pageStyle}
            >
              {pageNum}
            </button>
          ))}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            style={page >= totalPages ? disabledPageStyle : pageStyle}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default Pagination;
