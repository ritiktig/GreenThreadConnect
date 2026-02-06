const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4004,
  path: '/product/Products?$expand=seller',
  method: 'GET',
};

const req = http.request(options, (res) => {
  let data = '';

  console.log(`StatusCode: ${res.statusCode}`);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log(JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
