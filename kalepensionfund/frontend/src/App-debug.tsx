import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ 
      padding: '50px', 
      backgroundColor: '#f0f0f0', 
      minHeight: '100vh',
      fontSize: '20px',
      color: '#333'
    }}>
      <h1 style={{ color: 'red', fontSize: '48px' }}>DEBUG: FRONTEND IS WORKING</h1>
      <p>If you can see this, React is rendering correctly.</p>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        margin: '20px 0',
        border: '2px solid red'
      }}>
        <h2>🌿 KALE Pension Fund</h2>
        <p>Frontend is loading successfully!</p>
        <button style={{ 
          padding: '10px 20px', 
          fontSize: '16px',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '5px'
        }}>
          Test Button
        </button>
      </div>
    </div>
  );
};

export default App;