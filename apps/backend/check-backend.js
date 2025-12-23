const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3002,
  path: '/api/auth/me',
  method: 'GET',
  timeout: 2000
};

const req = http.request(options, (res) => {
  console.log(`✅ Backend is running - Status: ${res.statusCode}`);
  process.exit(0);
});

req.on('error', (e) => {
  console.log(`❌ Backend is not running: ${e.message}`);
  process.exit(1);
});

req.on('timeout', () => {
  console.log('❌ Backend connection timeout');
  req.destroy();
  process.exit(1);
});

req.end();
