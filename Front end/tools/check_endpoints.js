const https = require('https');
const http = require('http');

function head(url){
  return new Promise((resolve) => {
    const lib = url.startsWith('https') ? https : http;
    try {
      const req = lib.request(url, { method: 'HEAD', timeout: 10000 }, (res) => {
        console.log(url, 'STATUS', res.statusCode);
        resolve();
      });
      req.on('error', (e) => { console.log(url, 'ERR', e.message); resolve(); });
      req.on('timeout', () => { console.log(url, 'ERR', 'timeout'); req.destroy(); resolve(); });
      req.end();
    } catch (e) {
      console.log(url, 'ERR', e.message);
      resolve();
    }
  });
}

(async () => {
  await head('https://swdp54wg-5022.uks1.devtunnels.ms/swagger/index.html');
  await head('https://swdp54wg-5022.uks1.devtunnels.ms/api/Notifications');
  await head('http://localhost:3000/api/Notifications');
})();
