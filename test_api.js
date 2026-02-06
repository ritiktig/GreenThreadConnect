const http = require('http');

const data = JSON.stringify({
  name: 'Bamboo Basket',
  material: 'Bamboo',
  region: 'India'
});

const options = {
  hostname: 'localhost',
  port: 4004,
  path: '/product/predictPrice',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`StatusCode: ${res.statusCode}`);
  
  let body = '';
  res.on('data', (d) => {
    body += d;
  });
  
  res.on('end', () => {
    console.log('Response:', body);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(data);
req.end();
