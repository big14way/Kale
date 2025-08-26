import React from 'react';
import './App.css';

const App: React.FC = () => {
  console.log('Simple App rendering');

  return (
    <div style={{ padding: '20px', background: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#333' }}>🌿 KALE Pension Fund - Test</h1>
      <p style={{ color: '#666' }}>If you can see this, React is working!</p>
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '10px', 
        marginTop: '20px',
        border: '1px solid #ddd'
      }}>
        <h2>Frontend Status: ✅ Working</h2>
        <p>React TypeScript app is loading successfully.</p>
        <p>Next step: Test wallet integration and components.</p>
      </div>
    </div>
  );
};

export default App;