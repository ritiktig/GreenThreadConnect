const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 4004,
  path: '/product/Products?$expand=seller',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('Success! Data length:', data.length);
    console.log('Sample:', data.substring(0, 200));
  });
});

req.on('error', (error) => {
  console.error('Connection failed:', error.message);
});

req.end();
