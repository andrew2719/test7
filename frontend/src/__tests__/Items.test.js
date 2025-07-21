import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Items from '../pages/Items';
import { DataProvider } from '../state/DataContext';

// Mock fetch
global.fetch = jest.fn();

const MockWrapper = ({ children }) => (
  <MemoryRouter>
    <DataProvider>
      {children}
    </DataProvider>
  </MemoryRouter>
);

describe('Items Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders loading state initially', () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      })
    });

    render(
      <MockWrapper>
        <Items />
      </MockWrapper>
    );

    expect(screen.getByText('Loading items...')).toBeInTheDocument();
  });

  it('renders items when loaded successfully', async () => {
    const mockItems = [
      { id: 1, name: 'Test Item 1', category: 'Electronics', price: 100 },
      { id: 2, name: 'Test Item 2', category: 'Furniture', price: 200 }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: mockItems,
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1 }
      })
    });

    render(
      <MockWrapper>
        <Items />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Item 1')).toBeInTheDocument();
      expect(screen.getByText('Test Item 2')).toBeInTheDocument();
    });
  });

  it('handles search functionality', async () => {
    const mockItems = [
      { id: 1, name: 'Laptop', category: 'Electronics', price: 1000 }
    ];

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      })
    });

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: mockItems,
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1 }
      })
    });

    render(
      <MockWrapper>
        <Items />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Search by name or category...')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText('Search by name or category...');
    const searchButton = screen.getByText('Search');

    fireEvent.change(searchInput, { target: { value: 'Laptop' } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('q=Laptop'),
        expect.any(Object)
      );
    });
  });

  it('renders no items message when list is empty', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      })
    });

    render(
      <MockWrapper>
        <Items />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('No items found.')).toBeInTheDocument();
    });
  });

  it('handles error state', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MockWrapper>
        <Items />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load items/)).toBeInTheDocument();
    });
  });

  it('shows virtualization toggle for large lists', async () => {
    const mockItems = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      name: `Item ${i + 1}`,
      category: 'Test',
      price: 100
    }));

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        items: mockItems,
        pagination: { page: 1, limit: 15, total: 15, totalPages: 1 }
      })
    });

    render(
      <MockWrapper>
        <Items />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText(/Use virtualization/)).toBeInTheDocument();
    });
  });
});
