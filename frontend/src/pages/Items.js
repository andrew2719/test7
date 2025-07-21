import React, { useEffect, useRef, useState } from 'react';
import { useData } from '../state/DataContext';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';
import VirtualizedItemList from '../components/VirtualizedItemList';

function Items() {
  const { 
    items, 
    loading, 
    error, 
    pagination, 
    searchQuery,
    fetchItems, 
    searchItems, 
    changePage, 
    changeLimit,
    cleanup 
  } = useData();
  const isMountedRef = useRef(true);
  const [useVirtualization, setUseVirtualization] = useState(false);

  useEffect(() => {
    // Set mounted ref to true on mount
    isMountedRef.current = true;

    // Fetch initial items
    fetchItems();

    // Cleanup function to prevent memory leaks
    return () => {
      isMountedRef.current = false;
      cleanup(); // Cancel any ongoing requests
    };
  }, [fetchItems, cleanup]);

  // Auto-enable virtualization for large lists
  useEffect(() => {
    if (items.length > 50) {
      setUseVirtualization(true);
    } else {
      setUseVirtualization(false);
    }
  }, [items.length]);

  const handleSearch = (query) => {
    searchItems(query);
  };

  const handlePageChange = (newPage) => {
    changePage(newPage);
  };

  const handleLimitChange = (newLimit) => {
    changeLimit(newLimit);
  };

  const regularItemsList = () => (
    <div style={{ display: 'grid', gap: '15px' }}>
      {items.map(item => (
        <div
          key={item.id}
          style={{
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            transition: 'box-shadow 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'}
          onMouseLeave={(e) => e.target.style.boxShadow = 'none'}
        >
          <Link 
            to={'/items/' + item.id} 
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'block'
            }}
          >
            <h3 style={{ margin: '0 0 8px 0', color: '#007bff' }}>
              {item.name}
            </h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ 
                backgroundColor: '#e9ecef', 
                padding: '4px 8px', 
                borderRadius: '12px',
                fontSize: '12px',
                color: '#495057'
              }}>
                {item.category}
              </span>
              <span style={{ 
                fontWeight: 'bold', 
                fontSize: '18px',
                color: '#28a745'
              }}>
                ${item.price}
              </span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );

  if (error) {
    return (
      <div style={{ color: 'red', padding: '20px' }}>
        <h2>Error</h2>
        <p>Failed to load items: {error}</p>
        <button onClick={() => fetchItems()} style={{ padding: '8px 16px', marginTop: '10px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Items</h1>
      
      <SearchBar 
        onSearch={handleSearch} 
        initialValue={searchQuery}
        placeholder="Search by name or category..."
      />

      {/* Virtualization toggle for user preference */}
      {items.length > 10 && (
        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={useVirtualization}
              onChange={(e) => setUseVirtualization(e.target.checked)}
              style={{ marginRight: '5px' }}
            />
            Use virtualization (recommended for large lists)
          </label>
          {useVirtualization && (
            <span style={{ fontSize: '12px', color: '#6c757d' }}>
              (Better performance for {items.length} items)
            </span>
          )}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div>Loading items...</div>
        </div>
      )}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
          {searchQuery ? `No items found for "${searchQuery}"` : 'No items found.'}
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <div style={{ marginBottom: '20px' }}>
            {searchQuery && (
              <p style={{ color: '#6c757d', fontSize: '14px' }}>
                Search results for: "{searchQuery}"
              </p>
            )}
          </div>

          {useVirtualization ? (
            <VirtualizedItemList 
              items={items} 
              height={Math.min(600, items.length * 80)}
            />
          ) : (
            regularItemsList()
          )}

          <Pagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
          />
        </>
      )}
    </div>
  );
}

export default Items;