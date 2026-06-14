import React from 'react';

const Pagination = ({ currentPage, totalPages, paginate }) => {
  if (totalPages <= 1) return null;

  const pageNumbers = [];
  // Ensure we at least show some pages around current page, keeping it simple
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  const getVisiblePages = () => {
    if (totalPages <= 7) return pageNumbers;
    
    if (currentPage <= 4) return [...pageNumbers.slice(0, 5), '...', totalPages];
    if (currentPage > totalPages - 4) return [1, '...', ...pageNumbers.slice(totalPages - 5)];
    
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  };

  const styles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '8px',
      margin: '20px 0',
      padding: '10px'
    },
    button: {
      padding: '5px 12px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      background: 'white',
      cursor: 'pointer',
      color: '#333'
    },
    activeButton: {
      padding: '5px 12px',
      border: '1px solid #009688',
      borderRadius: '4px',
      background: '#009688',
      color: 'white',
      cursor: 'pointer'
    },
    ellipsis: {
      padding: '5px 12px',
      color: '#666'
    }
  };

  return (
    <div style={styles.container}>
      <button 
        style={styles.button} 
        disabled={currentPage === 1}
        onClick={() => paginate(currentPage - 1)}
      >
        Prev
      </button>

      {getVisiblePages().map((num, i) => (
        num === '...' ? (
          <span key={`dots-${i}`} style={styles.ellipsis}>...</span>
        ) : (
          <button
            key={num}
            style={num === currentPage ? styles.activeButton : styles.button}
            onClick={() => paginate(num)}
          >
            {num}
          </button>
        )
      ))}

      <button 
        style={styles.button} 
        disabled={currentPage === totalPages}
        onClick={() => paginate(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
