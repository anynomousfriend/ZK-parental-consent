// Midnight Network Configuration for Local Docker Testnet
export const MIDNIGHT_CONFIG = {
  node: 'http://127.0.0.1:9944',
  indexer: 'http://127.0.0.1:8088/api/v3/graphql',
  indexerWS: 'ws://127.0.0.1:8088/api/v3/graphql/ws',
  proofServer: 'http://127.0.0.1:6300',
  contractAddress: '826827cd05cbd054e3df19010ae3a30f57dc50cf6c77f5280635a2cba03ab423',
  networkId: 'undeployed' as const,
};

export const APP_CONFIG = {
  appName: 'ZK Parental Consent Gateway',
  appDescription: 'Privacy-preserving parental consent system',
  apiUrl: 'http://localhost:3001',
};
