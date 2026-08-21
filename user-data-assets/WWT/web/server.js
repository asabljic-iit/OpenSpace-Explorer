const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Server configuration and target OpenSpace WebSocket endpoint
const APP_PORT = 5000;
const OPENSPACE_WS_URL = 'ws://localhost:4682';
const CONNECT_TIMEOUT_MS = 3000;

const app = express();
const server = http.createServer(app);

// Disable browser caching for static web files
app.use(express.static(__dirname, {
  setHeaders: (res, path) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// WebSocket server handling guest tablet connections
const tabletWss = new WebSocket.Server({ server });
let openspaceWs = null;
let isConnecting = false;

// Manages connection attempts and timeouts to the target OpenSpace server
function connectToOpenSpace() {
  if (isConnecting) return;
  isConnecting = true;

  console.log(`Connecting Node.js backend to OpenSpace at ${OPENSPACE_WS_URL}...`);
  
  const ws = new WebSocket(OPENSPACE_WS_URL);

  // Terminates pending connection attempt if OpenSpace does not respond in time
  const connectionTimer = setTimeout(() => {
    if (ws.readyState !== WebSocket.OPEN) {
      console.log('OpenSpace connection timed out! Terminating attempt and refreshing tablets...');
      
      ws.terminate();
      openspaceWs = null;
      isConnecting = false;

      // Force connected tablets to reload and re-synchronize
      tabletWss.clients.forEach((client) => {
        client.terminate();
      });

      setTimeout(connectToOpenSpace, 3000);
    }
  }, CONNECT_TIMEOUT_MS);

  // Clears timeout and resets tablet sessions upon successful connection
  ws.on('open', () => {
    clearTimeout(connectionTimer);
    console.log('Node.js successfully connected to OpenSpace!');
    
    tabletWss.clients.forEach((client) => {
      client.terminate();
    });
    
    openspaceWs = ws;
    isConnecting = false;
  });

  // Relays messages from OpenSpace back to all connected guest tablets
  ws.on('message', (data) => {
    tabletWss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data.toString());
      }
    });
  });

  // Handles OpenSpace disconnection and schedules a retry
  const handleDisconnect = () => {
    clearTimeout(connectionTimer);
    if (openspaceWs === ws) {
      console.log('OpenSpace connection lost! Terminating tablet sockets...');
      openspaceWs = null;

      tabletWss.clients.forEach((client) => {
        client.terminate();
      });
    }

    isConnecting = false;
    setTimeout(connectToOpenSpace, 3000);
  };

  ws.on('close', handleDisconnect);
  ws.on('error', (err) => {
    clearTimeout(connectionTimer);
  });
}

connectToOpenSpace();

// Listens for incoming tablet clients and proxies messages forward to OpenSpace
tabletWss.on('connection', (tabletWs) => {
  tabletWs.on('message', (message) => {
    if (openspaceWs && openspaceWs.readyState === WebSocket.OPEN) {
      openspaceWs.send(message.toString());
    }
  });
});

// Starts the HTTP server on the configured port
server.listen(APP_PORT, () => {
  console.log(`Guest Interface Server running at http://localhost:${APP_PORT}`);
});