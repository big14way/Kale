// KALE Pension Fund Configuration

export interface RiskProfile {
  name: string;
  allocation: {
    usdc: number;
    btc: number;
    kale: number;
  };
}

export interface TokenAddresses {
  KALE: string;
  USDC: string;
  BTC: string;
}

export interface ConfigType {
  CONTRACT_ADDRESS: string;
  NETWORK_PASSPHRASE: string;
  HORIZON_URL: string;
  SOROBAN_RPC_URL: string;
  CONTRACT_EXPLORER: string;
  TESTNET_EXPLORER: string;
  TOKENS: TokenAddresses;
  REFLECTOR_ORACLE: string;
  SOROSWAP_ROUTER: string;
  RISK_PROFILES: Record<number, RiskProfile>;
  PRICE_REFRESH_INTERVAL: number;
  TRANSACTION_TIMEOUT: number;
}

export const CONFIG: ConfigType = {
  // Contract Details - Deployed to Stellar testnet (2024/2025)
  CONTRACT_ADDRESS: 'CCIRMCEMLWUSL6UQJVUR6TH4VERFAH537NTCEWC6IA3AFB2MRL76VI65',
  
  // Network Configuration - Testnet with latest RPC endpoints
  NETWORK_PASSPHRASE: 'Test SDF Network ; September 2015',
  HORIZON_URL: 'https://horizon-testnet.stellar.org',
  SOROBAN_RPC_URL: 'https://soroban-testnet.stellar.org:443',
  CONTRACT_EXPLORER: 'https://stellar.expert/explorer/testnet/contract/CCIRMCEMLWUSL6UQJVUR6TH4VERFAH537NTCEWC6IA3AFB2MRL76VI65',
  TESTNET_EXPLORER: 'https://stellar.expert/explorer/testnet',
  
  // Real Testnet Token Addresses
  TOKENS: {
    KALE: 'CAAVU2UQJLMZ3GUZFM56KVNHLPA3ZSSNR4VP2U53YBXFD2GI3QLIVHZZ', // Real KALE SAC testnet from kalepail/KALE-sc
    USDC: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHAGCN6C7', // Stellar Asset Contract for USDC testnet
    BTC: 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQAHHAGCN6C7' // Placeholder - using USDC for now
  },
  
  // Real Testnet Oracle and Router Addresses
  REFLECTOR_ORACLE: 'CAVLP5DH2GJPZMVO7IJY4CVOD5MWEFTJFVPD2YY2FQXOQHRGHK4D6HLP', // Real Reflector Oracle testnet
  SOROSWAP_ROUTER: 'CAG5LRYQ5JVEUI5TEID72EYOVX44TTUJT5BQR2J6J77FH65PCCFAJDDH', // Real Soroswap Router testnet
  
  // Risk Profiles
  RISK_PROFILES: {
    1: { name: 'Conservative', allocation: { usdc: 70, btc: 20, kale: 10 } },
    2: { name: 'Moderate', allocation: { usdc: 50, btc: 30, kale: 20 } },
    3: { name: 'Aggressive', allocation: { usdc: 30, btc: 40, kale: 30 } }
  },
  
  // Price refresh interval (in milliseconds)
  PRICE_REFRESH_INTERVAL: 60000, // 1 minute
  
  // Transaction timeout
  TRANSACTION_TIMEOUT: 30000 // 30 seconds
};

export default CONFIG;