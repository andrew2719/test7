import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function ItemDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const abortControllerRef = useRef(null);

  useEffect(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);

    fetch(`http://localhost:3001/api/items/${id}`, {
      signal: abortControllerRef.current.signal
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (!abortControllerRef.current.signal.aborted) {
          setItem(data);
          setLoading(false);
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
          setError(err.message);
          setLoading(false);
        }
      });

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', marginBottom: '10px' }}>Loading item details...</div>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <div style={{ color: 'red', marginBottom: '20px' }}>
          <h2>Error</h2>
          <p>Failed to load item: {error}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => window.location.reload()} 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
          <Link 
            to="/" 
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#6c757d',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              display: 'inline-block'
            }}
          >
            Back to Items
          </Link>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h2>Item Not Found</h2>
        <p>The item you're looking for doesn't exist.</p>
        <Link 
          to="/" 
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
            display: 'inline-block',
            marginTop: '10px'
          }}
        >
          Back to Items
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <nav style={{ marginBottom: '20px' }}>
        <Link 
          to="/" 
          style={{ 
            color: '#007bff', 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            fontSize: '14px'
          }}
        >
          ← Back to Items
        </Link>
      </nav>

      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '30px',
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <header style={{ marginBottom: '25px', borderBottom: '2px solid #f8f9fa', paddingBottom: '15px' }}>
          <h1 style={{ margin: '0', color: '#333', fontSize: '28px' }}>
            {item.name}
          </h1>
        </header>

        <div style={{ display: 'grid', gap: '20px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: 'bold', 
              marginBottom: '5px',
              color: '#555',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Category
            </label>
            <span style={{ 
              backgroundColor: '#e9ecef', 
              padding: '8px 12px', 
              borderRadius: '16px',
              fontSize: '14px',
              color: '#495057',
              display: 'inline-block'
            }}>
              {item.category}
            </span>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: 'bold', 
              marginBottom: '5px',
              color: '#555',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Price
            </label>
            <span style={{ 
              fontSize: '32px',
              fontWeight: 'bold',
              color: '#28a745',
              fontFamily: 'monospace'
            }}>
              ${item.price}
            </span>
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontWeight: 'bold', 
              marginBottom: '5px',
              color: '#555',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Item ID
            </label>
            <span style={{ 
              fontSize: '14px',
              color: '#6c757d',
              fontFamily: 'monospace'
            }}>
              #{item.id}
            </span>
          </div>
        </div>

        <footer style={{ marginTop: '30px', paddingTop: '20px', borderTop: '1px solid #f8f9fa' }}>
          <Link 
            to="/" 
            style={{ 
              padding: '12px 24px', 
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              display: 'inline-block',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            View All Items
          </Link>
        </footer>
      </div>
    </div>
  );
}

export default ItemDetail;