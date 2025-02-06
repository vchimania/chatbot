'use client';

import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'printer';
  timestamp: Date;
}

interface Printer {
  id: string;
  name: string;
  status: string;
}

let socket: Socket;

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedPrinter, setSelectedPrinter] = useState('');
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const initSocket = useCallback(() => {
    if (socket) {
      socket.disconnect();
    }

    socket = io('http://localhost:3001', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError('');
    });

    socket.on('connect_error', () => {
      setIsConnected(false);
      setConnectionError('Failed to connect to server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('printers', (data: Printer[]) => {
      setPrinters(data);
    });

    socket.on('printer_response', (message: string) => {
      addMessage(message, 'printer');
    });
  }, []);

  useEffect(() => {
    initSocket();
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [initSocket]);

  const addMessage = (content: string, sender: 'user' | 'printer') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      sender,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    if (!selectedPrinter || !isConnected) return;

    const printer = printers.find((p) => p.id === selectedPrinter);
    if (!printer) return;

    addMessage(inputMessage, 'user');

    socket.emit('print_command', {
      printer: printer.name,
      command: inputMessage,
    });

    setInputMessage('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || selectedPrinter !== 'printer-1') return;

    addMessage(`Hi, your uploaded file is ${file.name}`, 'user');

    socket.emit('print_command', {
      printer: 'Office Printer',
      command: `Uploaded File: ${file.name}`,
    });

    setTimeout(() => {
      addMessage('Hey, file uploaded successfully!', 'printer');
    }, 1000);
  };

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Printer Chatbot</h1>

      <div className={`mb-4 p-2 rounded ${isConnected ? 'bg-green-100' : 'bg-red-100'}`}>
        Status: {isConnected ? 'Connected' : 'Disconnected'}
        {connectionError && <p className="text-red-500 text-sm">{connectionError}</p>}
      </div>

      <select
        value={selectedPrinter}
        onChange={(e) => setSelectedPrinter(e.target.value)}
        className="mb-4 p-2 border rounded text-black"
        disabled={!isConnected}
      >
        <option value="">Select a printer</option>
        {printers.map((printer) => (
          <option key={printer.id} value={printer.id}>
            {printer.name} - {printer.status}
          </option>
        ))}
      </select>

      <div className="flex-1 overflow-y-auto mb-4 border rounded p-4 bg-white">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`mb-2 p-2 rounded ${
              message.sender === 'user' ? 'bg-blue-100 ml-auto max-w-[80%] text-black' : 'bg-gray-100 mr-auto max-w-[80%] text-black'
            }`}
          >
            <p>{message.content}</p>
            <small className="text-gray-500">
              {new Date(message.timestamp).toLocaleTimeString()}
            </small>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type a command (e.g., Print Document, Check Status)"
          className="flex-1 p-2 border rounded text-black"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!selectedPrinter || !isConnected}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
        >
          Send
        </button>

        {selectedPrinter === 'printer-1' && (
          <label className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer">
            Upload File
            <input type="file" onChange={handleFileUpload} className="hidden" />
          </label>
        )}
      </form>
    </div>
  );
}
