import React, { createContext, useCallback, useContext, useState, useRef } from 'react';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use ref to track ongoing requests and cancel them if needed
  const abortControllerRef = useRef(null);

  const fetchItems = useCallback(async (query = '', page = 1, limit = 10) => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (query.trim()) {
        params.append('q', query.trim());
      }

      const response = await fetch(`http://localhost:3001/api/items?${params}`, {
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      
      // Only update state if the request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setItems(json.items || json); // Handle both new and old API responses
        setPagination(json.pagination || {
          page: 1,
          limit: json.length || 0,
          total: json.length || 0,
          totalPages: 1
        });
        setSearchQuery(query);
      }
    } catch (err) {
      // Only set error if the request wasn't aborted (cancelled)
      if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
        setError(err.message);
        console.error('Failed to fetch items:', err);
      }
    } finally {
      // Only update loading state if the request wasn't aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const searchItems = useCallback((query) => {
    fetchItems(query, 1, pagination.limit);
  }, [fetchItems, pagination.limit]);

  const changePage = useCallback((newPage) => {
    fetchItems(searchQuery, newPage, pagination.limit);
  }, [fetchItems, searchQuery, pagination.limit]);

  const changeLimit = useCallback((newLimit) => {
    fetchItems(searchQuery, 1, newLimit);
  }, [fetchItems, searchQuery]);

  // Cleanup function to cancel any ongoing requests
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  const value = {
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
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};