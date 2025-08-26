import React from 'react';
// import './test-import'; // This will test the Stellar Wallets Kit import

console.log('=== SIMPLE TEST APP LOADING ===');

const App: React.FC = () => {
  console.log('=== SIMPLE TEST APP RENDERING ===');
  
  return (
    <div style={{ padding: '20px', background: 'lightblue' }}>
      <h1>🌿 KALE Pension Fund - TEST</h1>
      <p>If you can see this, React is working!</p>
      <div style={{ marginTop: '20px', padding: '10px', background: 'white', border: '1px solid black' }}>
        <h2>Debug Info:</h2>
        <p>React version: {React.version}</p>
        <p>Current time: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

console.log('=== SIMPLE TEST APP LOADED ===');
export default App;