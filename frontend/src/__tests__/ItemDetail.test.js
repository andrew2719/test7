import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';
import ItemDetail from '../pages/ItemDetail';

// Mock fetch
global.fetch = jest.fn();

const MockWrapper = ({ children, initialEntries = ['/items/1'] }) => (
  <MemoryRouter initialEntries={initialEntries}>
    <Routes>
      <Route path="/items/:id" element={children} />
    </Routes>
  </MemoryRouter>
);

describe('ItemDetail Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('renders loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(
      <MockWrapper>
        <ItemDetail />
      </MockWrapper>
    );

    expect(screen.getByText('Loading item details...')).toBeInTheDocument();
  });

  it('renders item details when loaded successfully', async () => {
    const mockItem = {
      id: 1,
      name: 'Test Laptop',
      category: 'Electronics',
      price: 1500
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItem
    });

    render(
      <MockWrapper>
        <ItemDetail />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Laptop')).toBeInTheDocument();
      expect(screen.getByText('Electronics')).toBeInTheDocument();
      expect(screen.getByText('$1500')).toBeInTheDocument();
    });
  });

  it('handles 404 error', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Item not found' })
    });

    render(
      <MockWrapper>
        <ItemDetail />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load item/)).toBeInTheDocument();
    });
  });

  it('handles network error', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(
      <MockWrapper>
        <ItemDetail />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText(/Failed to load item/)).toBeInTheDocument();
    });
  });

  it('displays back navigation link', async () => {
    const mockItem = {
      id: 1,
      name: 'Test Item',
      category: 'Test',
      price: 100
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockItem
    });

    render(
      <MockWrapper>
        <ItemDetail />
      </MockWrapper>
    );

    await waitFor(() => {
      expect(screen.getByText('← Back to Items')).toBeInTheDocument();
      expect(screen.getByText('View All Items')).toBeInTheDocument();
    });
  });
});
