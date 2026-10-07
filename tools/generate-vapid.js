#!/usr/bin/env node
// تولید کلید VAPID برای Web Push — بدون نیاز به پکیج
const { generateKeyPairSync } = require('crypto');
const b64u = (b) => Buffer.from(b).toString('base64url');
const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' });
const pub = publicKey.export({ format: 'jwk' });
const prv = privateKey.export({ format: 'jwk' });
const raw = Buffer.concat([Buffer.from([4]), Buffer.from(pub.x, 'base64url'), Buffer.from(pub.y, 'base64url')]);
console.log('VAPID_PUBLIC_KEY  (برای site-config.js → vapidPublicKey):\n' + b64u(raw) + '\n');
console.log('VAPID_PRIVATE_JWK (Secret در Worker، به کسی نشون نده):\n' + JSON.stringify(prv) + '\n');
