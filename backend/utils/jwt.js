const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

class JWTManager {
  constructor() {
    this.initializeKeys();
  }

  initializeKeys() {
    const keysDir = path.join(__dirname, '../keys');
    const privateKeyPath = path.join(keysDir, 'private.pem');
    const publicKeyPath = path.join(keysDir, 'public.pem');

    // Create keys directory if it doesn't exist
    if (!fs.existsSync(keysDir)) {
      fs.mkdirSync(keysDir, { recursive: true });
    }

    // Generate RSA key pair if keys don't exist
    if (!fs.existsSync(privateKeyPath) || !fs.existsSync(publicKeyPath)) {
      const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: {
          type: 'spki',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem'
        }
      });

      fs.writeFileSync(privateKeyPath, privateKey);
      fs.writeFileSync(publicKeyPath, publicKey);
    }

    this.privateKey = fs.readFileSync(privateKeyPath, 'utf8');
    this.publicKey = fs.readFileSync(publicKeyPath, 'utf8');
  }

  generateAccessToken(payload) {
    return jwt.sign(
      payload,
      this.privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '90d', // Extended access token - 90 days
        issuer: 'creator-agent-backend',
        audience: 'creator-agent-frontend'
      }
    );
  }

  generateRefreshToken(payload) {
    return jwt.sign(
      payload,
      this.privateKey,
      {
        algorithm: 'RS256',
        expiresIn: '90d', // Extended refresh token - 90 days
        issuer: 'creator-agent-backend',
        audience: 'creator-agent-frontend'
      }
    );
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: 'creator-agent-backend',
        audience: 'creator-agent-frontend'
      });
    } catch (error) {
      throw new Error(`Token verification failed: ${error.message}`);
    }
  }

  decodeToken(token) {
    return jwt.decode(token, { complete: true });
  }
}

module.exports = new JWTManager();