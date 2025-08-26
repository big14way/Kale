// Test if Stellar Wallets Kit import is causing the issue
console.log('=== TESTING STELLAR WALLETS KIT IMPORT ===');

try {
  console.log('Attempting to import StellarWalletsKit...');
  
  const {
    StellarWalletsKit,
    WalletNetwork,
    FreighterModule,
    xBullModule,
    AlbedoModule,
    FREIGHTER_ID
  } = require('@creit.tech/stellar-wallets-kit');
  
  console.log('Import successful!');
  console.log('StellarWalletsKit:', StellarWalletsKit);
  console.log('WalletNetwork:', WalletNetwork);
  console.log('FreighterModule:', FreighterModule);
  console.log('xBullModule:', xBullModule);
  console.log('AlbedoModule:', AlbedoModule);
  console.log('FREIGHTER_ID:', FREIGHTER_ID);
  
  // Try to create an instance
  console.log('Creating StellarWalletsKit instance...');
  const kit = new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    selectedWalletId: FREIGHTER_ID,
    modules: [
      new FreighterModule(),
      new xBullModule(),
      new AlbedoModule(),
    ],
  });
  
  console.log('Kit created successfully:', kit);
  
} catch (error) {
  console.error('ERROR IMPORTING STELLAR WALLETS KIT:', error);
  console.error('Error details:', {
    message: error.message,
    stack: error.stack,
    name: error.name
  });
}

console.log('=== IMPORT TEST COMPLETE ===');