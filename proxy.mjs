import http from 'http';
import httpProxy from 'http-proxy';

const BACKEND_PORT = 3000;
const METRO_PORT = 8081;
const GATEWAY_PORT = 5000;

const proxy = httpProxy.createProxyServer({ ws: true });

proxy.on('error', (err, req, res) => {
  if (res && res.writeHead) {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Proxy error: ' + err.message);
  }
});

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  if (url.startsWith('/api/') || url.startsWith('/health')) {
    proxy.web(req, res, { target: `http://localhost:${BACKEND_PORT}` });
  } else {
    proxy.web(req, res, { target: `http://localhost:${METRO_PORT}` });
  }
});

// Upgrade WebSocket: socket.io → backend, Metro HMR → metro
server.on('upgrade', (req, socket, head) => {
  const url = req.url || '/';
  if (url.startsWith('/socket.io/')) {
    proxy.ws(req, socket, head, { target: `ws://localhost:${BACKEND_PORT}` });
  } else {
    proxy.ws(req, socket, head, { target: `ws://localhost:${METRO_PORT}` });
  }
});

server.listen(GATEWAY_PORT, '0.0.0.0', () => {
  console.log(`🔀 Gateway proxy on :${GATEWAY_PORT}  →  API :${BACKEND_PORT}  |  Metro :${METRO_PORT}`);
});
