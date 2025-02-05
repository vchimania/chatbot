import { Server } from 'socket.io';

const io = new Server({
  path: '/api/socket',
  transports: ['websocket'],
});

const printers = [
  { id: 'printer1', status: 'online', name: 'Printer 1' },
  { id: 'printer2', status: 'offline', name: 'Printer 2' },
  { id: 'printer3', status: 'busy', name: 'Printer 3' },
];

const handleConnection = (socket: any) => {
  console.log('Client connected:', socket.id);

  // Emit a list of printers when a client connects
  socket.emit('printers', printers);

  socket.on('sendCommand', (printerId: string, command: string) => {
    const printer = printers.find(p => p.id === printerId);

    if (!printer) {
      socket.emit('error', 'Printer not found');
      return;
    }

    // Simulate printer status change and response
    if (printer.status === 'offline') {
      socket.emit('response', `${printer.name} is offline`);
    } else if (printer.status === 'busy') {
      socket.emit('response', `${printer.name} is currently busy`);
    } else if (command === 'Print Document') {
      socket.emit('response', 'Printing started');
      setTimeout(() => {
        socket.emit('response', 'Printing completed');
      }, 5000); // simulate printing time
    } else if (command === 'Check Status') {
      socket.emit('response', `${printer.name} status: ${printer.status}`);
    } else if (command === 'Cancel Print') {
      socket.emit('response', 'Print canceled');
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
};

io.on('connection', handleConnection);

export default io;
