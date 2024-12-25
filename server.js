const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  const server = http.createServer();
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (socket, req) => {
    const token = req.url.split('token=')[1];
    if (!token) {
      socket.close();
      return;
    }

    jwt.verify(token, 'your_secret_key', (err, decoded) => {
      if (err) {
        socket.close();
        return;
      }

      console.log('User authenticated:', decoded);

      socket.on('message', (message) => {
        console.log(`Received: ${message}`);
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message);
          }
        });
      });

      socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      socket.on('close', () => {
        console.log('Client disconnected');
      });
    });
  });

  server.listen(8080, () => {
    console.log(`Server running on port 8080, process ${process.pid}`);
  });
}
