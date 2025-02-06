const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

const printers = {
  'printer-1': { id: 'printer-1', name: 'Office Printer', status: 'Online' },
  'printer-2': { id: 'printer-2', name: 'Home Printer', status: 'Offline' },
  'printer-3': { id: 'printer-3', name: 'Conference Printer', status: 'Busy' }
};

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial printers data
  socket.emit('printers', Object.values(printers));

  socket.on('print_command', (data) => {
    console.log('Received command:', data);
    const { printer, command } = data;
    let response;

    const printerObj = Object.values(printers).find(p => p.name === printer);
    if (!printerObj) {
      response = 'Printer not found';
    } else {
      switch (printerObj.status) {
        case 'Offline':
          response = 'Error: Printer is offline';
          break;
        case 'Busy':
          response = 'Printer is busy. Added to queue';
          break;
        default:
          response = `Processing command: ${command}`;
      }
    }

    socket.emit('printer_response', response);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});