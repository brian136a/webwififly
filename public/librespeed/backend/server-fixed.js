const http = require('http');
const crypto = require('crypto');

const PORT = 3001;

// Pre-generated buffer cache
const bufferCache = {};

function getRandomBuffer(size) {
  if (!bufferCache[size]) {
    bufferCache[size] = crypto.randomBytes(size);
  }
  return bufferCache[size];
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  return forwarded ? forwarded.split(',')[0].trim() : req.socket.remoteAddress || '127.0.0.1';
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    return;
  }

  if (path === '/empty.php') {
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      ...corsHeaders
    });
    res.end('');
  } else if (path === '/garbage.php') {
    const chunks = 4;
    const chunkSize = 1048576;
    const totalSize = chunks * chunkSize;

    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': totalSize,
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      ...corsHeaders
    });

    const buffer = getRandomBuffer(chunkSize);
    for (let i = 0; i < chunks; i++) {
      res.write(buffer);
    }
    res.end();
  } else if (path === '/getIP.php') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      'Pragma': 'no-cache',
      ...corsHeaders
    });
    res.end(JSON.stringify({ processedString: getClientIp(req), rawIspInfo: '' }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`LibreSpeed Backend running on http://127.0.0.1:${PORT}`);
  console.log(`Endpoints: /empty.php, /garbage.php, /getIP.php`);
});
