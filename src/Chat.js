import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const socket = io('http://localhost:5000');  // Adjust to your backend URL

const Chat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);  // Holds all chat messages
  const [userId, setUserId] = useState(null);    // Unique user ID (UUID)

  // Run this when the component mounts (on initial load)
  useEffect(() => {
    let storedUserId = localStorage.getItem('userId');

    // Generate a new UUID for the user if one doesn't exist
    if (!storedUserId) {
      storedUserId = uuidv4();
      localStorage.setItem('userId', storedUserId);
    }

    setUserId(storedUserId);

    // Join the private chat room using the UUID
    socket.emit('join', storedUserId);

    // Listen for previous messages (sent from server when the user joins)
    socket.on('load_previous_messages', (previousMessages) => {
      setMessages(previousMessages); // Set previous messages into state
    });

    // Listen for new messages in real-time
    socket.on('new_message', (msg) => {
      setMessages((prevMessages) => [...prevMessages, msg]);  // Add new message to state
    });

    // Clean up event listeners when component unmounts
    return () => {
      socket.off('new_message');
      socket.off('load_previous_messages');
    };
  }, []);

  // Function to send a new message
  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const newMessage = { userId, message, sender: 'Anonymous' };
      socket.emit('message', newMessage);  // Send the message to the server
      setMessage('');  // Clear the message input after sending
    }
  };

  return (
    <div className="chat-container">
      <div className='w-[70%] mx-auto border-[2px] p-4 mt-10 shadow-md rounded-md'>
        <div className="chat-messages">
          {messages?.map((msg, idx) => (
            <p key={idx}><strong>{msg.sender}:</strong> {msg.message}</p>
          ))}
        </div>

        {/* Input form for sending a new message */}
        <form onSubmit={sendMessage} className='mt-3'>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="border p-2 rounded-md w-full"
          />
          <button type="submit" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">Send</button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
