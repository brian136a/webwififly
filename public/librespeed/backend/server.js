const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const MB = 1048576;
const GARBAGE_SIZE = 100 * MB; // 100MB for 900 Mbps testing
const GARBAGE_FILE = path.join(__dirname, 'garbage.bin');

// Generate garbage file at startup if it doesn't exist
if (!fs.existsSync(GARBAGE_FILE)) {
  console.log('[Init] Generating 100MB garbage file for 900 Mbps testing...');
  const buffer = crypto.randomBytes(GARBAGE_SIZE);
  fs.writeFileSync(GARBAGE_FILE, buffer);
  console.log('[Init] Garbage file created:', GARBAGE_FILE);
} else {
  console.log('[Init] Using existing garbage file:', GARBAGE_FILE);
  const stats = fs.statSync(GARBAGE_FILE);
  console.log(`[Init] File size: ${Math.round(stats.size / MB)}MB`);
}

const server = http.createServer((req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    const url = req.url.split('?')[0];
    const ip = req.socket.remoteAddress || '127.0.0.1';
    const hasCors = req.url.includes('cors');

    // Base headers - matching PHP reference exactly
    // Always include CORS headers for local testing (cross-port communication)
    const baseHeaders = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0, s-maxage=0, post-check=0, pre-check=0',
      'Pragma': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Encoding, Content-Type'
    };

    if (req.method === 'OPTIONS') {
      // Always send CORS headers for OPTIONS preflight requests
      const optionsHeaders = {
        ...baseHeaders,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Encoding, Content-Type'
      };
      res.writeHead(200, optionsHeaders);
      res.end();
      return;
    }

    if (url === '/empty.php') {
      // Match the proper application's empty.php behavior exactly
      console.log(`[empty.php] ${req.method} - CORS: ${hasCors}`);
      
      res.writeHead(200, {
        ...baseHeaders,
        'Content-Type': 'text/plain',
        'Content-Length': 0
      });
      res.end();
    } else if (url === '/garbage.php') {
      // Match the proper application's garbage.php behavior exactly
      // Disable compression (matching PHP reference @ini_set calls)
      
      // Get chunk size from query parameters (default: 4, max: 1024)
      const ckSize = req.url.match(/[?&]ckSize=(\d+)/);
      let chunks = ckSize ? Math.min(parseInt(ckSize[1], 10), 1024) : 4;
      chunks = Math.max(chunks, 1); // Minimum 1 chunk
      
      console.log(`[garbage.php] Sending ${chunks} chunks (1MB each) - CORS: ${hasCors}`);
      
      // Prepare headers exactly like the proper PHP application
      const garbageHeaders = {
        'Content-Description': 'File Transfer',
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename=random.dat',
        'Content-Transfer-Encoding': 'binary',
        'Content-Length': chunks * MB,
        ...baseHeaders
      };
      
      res.writeHead(200, garbageHeaders);
      
      // Generate random data once (1MB) - matching PHP: openssl_random_pseudo_bytes(1048576)
      const data = crypto.randomBytes(MB);
      
      // Send chunks - matching PHP: for ($i = 0; $i < $chunks; $i++) { echo $data; flush(); }
      for (let i = 0; i < chunks; i++) {
        res.write(data);
      }
      res.end();
    } else if (url === '/getIP.php') {
      const json = JSON.stringify({ processedString: ip, rawIspInfo: '' });
      console.log('[getIP.php] Sending:', json);
      res.writeHead(200, { ...baseHeaders, 'Content-Type': 'application/json', 'Content-Length': json.length });
      res.end(json);
    } else {
      res.writeHead(404, baseHeaders);
      res.end('Not Found');
    }
  } catch (err) {
    console.error('[ERROR]', err.message, err.stack);
    try {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    } catch (e) {
      console.error('[ERROR] Failed to send error response:', e.message);
    }
  }
});

server.on('error', (err) => {
  console.error('[SERVER ERROR]', err.message);
});

server.on('clientError', (err, socket) => {
  console.error('[CLIENT ERROR]', err.message);
  socket.destroy();
});

server.maxConnections = 200; // Allow many concurrent connections
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Local: http://127.0.0.1:${PORT}`);
  console.log(`LAN: http://192.168.50.10:${PORT}`);
  console.log('Endpoints: /empty.php, /garbage.php, /getIP.php');
  console.log('Max Connections: 200');
});
