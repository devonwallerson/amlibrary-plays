const jwt = require('jsonwebtoken');
const fs = require('fs');

// Load the private key
const privateKey = fs.readFileSync("AuthKey_B69RF7L2T5.p8");

// Define the team ID and key ID
const teamId = 'BXPXV7XH4P';
const keyId = 'B69RF7L2T5';

// Create the token
const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d', // Token validity period (up to 6 months)
  issuer: teamId,
  header: {
    alg: 'ES256',
    kid: keyId
  }
});

// Print the token
console.log('Developer Token:', token);
