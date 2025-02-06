# Printer Chatbot

A real-time printer management chatbot interface built with Next.js, Socket.IO, and Express.

## Features

- Real-time bidirectional communication with printers using WebSocket
- Printer status monitoring
- Message history persistence using localStorage
- File upload capability for specific printers
- Responsive UI with Tailwind CSS
- Connection status indicators

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vchimania/chatbot.git
cd printer-chatbot
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

## Running the Project

1. Start both the Next.js frontend and Socket.IO server concurrently:
```bash
npm run dev
# or
yarn dev
```

This will start:
- Frontend server at `http://localhost:3000`
- WebSocket server at `http://localhost:3001`

To run servers separately:
- For frontend only: `npm run next dev`
- For WebSocket server only: `npm run socket`

## How It Works

### WebSocket Connection

The application uses Socket.IO for real-time communication between the client and server:

1. **Connection Initialization**:
   - The client establishes a WebSocket connection to the server on port 3001
   - Connection status is monitored and displayed in the UI
   - Automatic reconnection is implemented with 5 attempts

2. **Message Flow**:
   - Client sends print commands through the `print_command` event
   - Server processes commands and responds via `printer_response` event
   - Printer status updates are broadcast through the `printers` event

3. **State Management**:
   - Chat history is persisted in localStorage
   - Printer status is maintained in real-time
   - Connection state is reflected in the UI

## Additional Features

1. **Message Persistence**:
   - Chat history survives page refreshes
   - Messages include timestamps
   - Automatic storage synchronization

2. **File Upload System**:
   - Available for specific printers (Office Printer)
   - File upload status feedback
   - Custom upload notifications

3. **Printer Status Monitoring**:
   - Real-time status updates
   - Visual status indicators
   - Different states: Online, Offline, Busy

4. **Error Handling**:
   - Connection error notifications
   - Printer-specific error messages
   - Graceful disconnection handling

## Project Structure

```
├── page.tsx          # Main chat interface
├── server.js         # WebSocket server
└── package.json      # Project dependencies
```