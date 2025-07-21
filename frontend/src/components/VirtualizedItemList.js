import React, { useMemo } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Link } from 'react-router-dom';

function VirtualizedItemList({ items, height = 400, itemHeight = 80 }) {
  const itemData = useMemo(() => ({ items }), [items]);

  const ItemRow = ({ index, style, data }) => {
    const item = data.items[index];
    
    return (
      <div style={style}>
        <div
          style={{
            padding: '15px',
            margin: '5px 10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            height: itemHeight - 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Link 
            to={'/items/' + item.id} 
            style={{ 
              textDecoration: 'none', 
              color: 'inherit',
              display: 'flex',
              alignItems: 'center',
              flex: 1
            }}
          >
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#007bff', fontSize: '16px' }}>
                {item.name}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
                  fontSize: '16px',
                  color: '#28a745'
                }}>
                  ${item.price}
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    );
  };

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <List
      height={height}
      itemCount={items.length}
      itemSize={itemHeight}
      itemData={itemData}
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: 'white'
      }}
    >
      {ItemRow}
    </List>
  );
}

export default VirtualizedItemList;
