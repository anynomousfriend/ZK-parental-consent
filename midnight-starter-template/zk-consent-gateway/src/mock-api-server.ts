/**
 * Mock API Server for ZK Consent Gateway
 * 
 * Simulates blockchain operations without requiring wallet sync or contract deployment.
 * Uses in-memory storage to test the complete frontend flow.
 */

import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3001;

// In-memory consent registry (simulates on-chain storage)
// Maps child ID hash (hex string) -> boolean (consent granted)
const consentRegistry = new Map<string, boolean>();

// Track when consents were granted (for logging)
const consentLog: Array<{ hash: string; timestamp: Date; }> = [];

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    network: 'mock-simulated',
    mode: 'in-memory',
    timestamp: new Date().toISOString(),
    totalConsents: consentRegistry.size
  });
});

/**
 * Grant consent for a child
 * POST /api/consent/grant
 * Body: { childIdHash: "hex-string" }
 */
app.post('/api/consent/grant', (req, res) => {
  try {
    const { childIdHash } = req.body;

    if (!childIdHash || typeof childIdHash !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'childIdHash is required and must be a string' 
      });
    }

    // Validate hex format (optional, but good practice)
    if (!/^[0-9a-fA-F]+$/.test(childIdHash)) {
      return res.status(400).json({ 
        success: false, 
        error: 'childIdHash must be a valid hex string' 
      });
    }

    // Store consent in registry
    consentRegistry.set(childIdHash.toLowerCase(), true);
    
    // Log the consent
    consentLog.push({
      hash: childIdHash.toLowerCase(),
      timestamp: new Date()
    });

    // Generate a fake transaction hash
    const txHash = '0xmock' + Math.random().toString(16).slice(2, 18).padStart(16, '0');

    console.log(`✅ Consent granted for hash: ${childIdHash.substring(0, 16)}...`);
    console.log(`   Transaction: ${txHash}`);
    console.log(`   Total consents in registry: ${consentRegistry.size}`);

    res.json({
      success: true,
      txHash,
      message: 'Consent granted successfully (simulated)'
    });
  } catch (error) {
    console.error('Error granting consent:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Verify if a child has consent
 * GET /api/consent/verify/:childIdHash
 */
app.get('/api/consent/verify/:childIdHash', (req, res) => {
  try {
    const { childIdHash } = req.params;

    if (!childIdHash) {
      return res.status(400).json({ 
        isAuthorized: false, 
        error: 'childIdHash parameter is required' 
      });
    }

    // Check if consent exists in registry
    const isAuthorized = consentRegistry.has(childIdHash.toLowerCase());

    console.log(`🔍 Verify consent for hash: ${childIdHash.substring(0, 16)}...`);
    console.log(`   Result: ${isAuthorized ? '✅ Authorized' : '❌ Not authorized'}`);

    res.json({
      isAuthorized,
      hash: childIdHash.toLowerCase()
    });
  } catch (error) {
    console.error('Error verifying consent:', error);
    res.status(500).json({
      isAuthorized: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Revoke consent for a child (bonus feature)
 * POST /api/consent/revoke
 * Body: { childIdHash: "hex-string" }
 */
app.post('/api/consent/revoke', (req, res) => {
  try {
    const { childIdHash } = req.body;

    if (!childIdHash || typeof childIdHash !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'childIdHash is required and must be a string' 
      });
    }

    const existed = consentRegistry.delete(childIdHash.toLowerCase());
    
    if (existed) {
      console.log(`🗑️  Consent revoked for hash: ${childIdHash.substring(0, 16)}...`);
      res.json({
        success: true,
        message: 'Consent revoked successfully (simulated)'
      });
    } else {
      res.json({
        success: false,
        error: 'No consent found for this hash'
      });
    }
  } catch (error) {
    console.error('Error revoking consent:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * Debug endpoint - list all consents (for testing)
 * GET /api/consent/list
 */
app.get('/api/consent/list', (req, res) => {
  const consents = Array.from(consentRegistry.keys()).map((hash, index) => {
    const logEntry = consentLog[index];
    return {
      hash: hash.substring(0, 16) + '...',
      fullHash: hash,
      grantedAt: logEntry?.timestamp || 'unknown'
    };
  });

  res.json({
    total: consentRegistry.size,
    consents
  });
});

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║        ZK Consent Gateway - Mock API Server            ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('  🚀 Server running at: http://localhost:' + PORT);
  console.log('  📝 Mode: In-Memory Simulation');
  console.log('  ⚡ No blockchain required!');
  console.log('');
  console.log('  Endpoints:');
  console.log('    GET  /health');
  console.log('    POST /api/consent/grant');
  console.log('    GET  /api/consent/verify/:childIdHash');
  console.log('    POST /api/consent/revoke');
  console.log('    GET  /api/consent/list (debug)');
  console.log('');
  console.log('  Ready to test the frontend! 🎉');
  console.log('');
});
