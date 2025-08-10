import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, MoreHorizontal, Paperclip, Mic, Send, Check, Smile } from 'lucide-react';
import { BleepLoader } from '../AllComponents'; // Assuming these are your custom components
import { GeometricShapes, BackgroundWaves, FloatingParticles } from '../AllComponents';
import { useSelector } from 'react-redux';

// Helper function to format ISO date strings into a readable time
const formatTimestamp = (isoString) => {
  if (!isoString) return '';
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (error) {
    // Fallback for potentially invalid date strings from temporary messages
    return isoString;
  }
};

// --- MessageBubble Component ---
const MessageBubble = ({ message, isMe }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-3`}
    >
      <div className={`relative rounded-3xl px-5 py-3 max-w-sm overflow-hidden ${isMe
        ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600'
        : 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800'
        }`}>
        {/* Decorative elements */}
        {isMe && (
          <div className="absolute inset-0 opacity-20">
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{ x: [-100, 100] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, ease: "easeInOut" }}
            />
          </div>
        )}

        <p className="text-md text-white relative z-10">{message.content}</p>
        <div className="flex justify-end items-center mt-1 relative z-10">
          <p className="text-xs text-gray-200 mr-1">{formatTimestamp(message.timeStamp)}</p>
          {isMe && (
            message.isTemporary ? (
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" title="Sending..." />
            ) : (
              <Check className="text-green-400" size={16} title="Sent" />
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};


// --- Main Chat Component ---
const Chat = ({ chat }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  
  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);

  const websocketBackendUrl = import.meta.env.VITE_WEBSOCKET_BACKEND_URL;
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const userId = useSelector((state) => state.authReducer.userId);

  // Effect 1: Fetch initial messages when the selected chat changes
  useEffect(() => {
    const fetchAllMessages = async () => {
      if (!chat?.chatRoomId) {
        setMessages([]); // Clear messages if no chat is selected
        return;
      }

      setIsInitialLoad(true);
      try {
        const res = await fetch(`${backendUrl}/message/chat-room-id/${chat.chatRoomId}`);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const allMessages = await res.json();
        setMessages(allMessages);
      } catch (e) {
        console.error("Failed to load messages:", e);
      } finally {
        // Scroll to bottom instantly after the initial fetch
        setTimeout(() => {
          if (messagesContainerRef.current) {
            messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
          }
          setIsInitialLoad(false);
        }, 100);
      }
    };

    fetchAllMessages();
  }, [backendUrl, chat?.chatRoomId]); // Re-run only when the chat ID changes

  // Effect 2: Manage the WebSocket connection
  useEffect(() => {
    // Only connect if we have the necessary info
    if (!userId || !websocketBackendUrl || !chat?.chatRoomId) {
      return;
    }

    const socket = new WebSocket(`${websocketBackendUrl}/chat?userId=${userId}`);
    socketRef.current = socket;

    socket.onopen = () => setIsConnected(true);
    socket.onerror = (error) => console.error('WebSocket error:', error);
    socket.onclose = () => setIsConnected(false);

    socket.onmessage = (event) => {
      const receivedMessage = JSON.parse(event.data);

      // IMPORTANT: Only process messages for the currently active chat
      if (receivedMessage.chatRoomId !== chat.chatRoomId) {
        return;
      }

      setMessages((prevMessages) => {
        // --- CORRECTED LOGIC TO PREVENT DUPLICATES ---

        // Case 1: Check if this is a confirmation of our temporary message
        // Look for temporary message by matching content, senderId, and chatRoomId
        const tempMessageIndex = prevMessages.findIndex(
          (msg) => 
            msg.isTemporary && 
            msg.sendersId === receivedMessage.sendersId &&
            msg.content === receivedMessage.content &&
            msg.chatRoomId === receivedMessage.chatRoomId
        );

        if (tempMessageIndex !== -1) {
          // Replace the temporary message with the real one
          const updatedMessages = [...prevMessages];
          updatedMessages[tempMessageIndex] = { 
            ...receivedMessage, 
            isTemporary: false 
          };
          return updatedMessages;
        }

        // Case 2: Check if this message already exists (prevent duplicates)
        const existingMessageIndex = prevMessages.findIndex(
          msg => msg.messageId === receivedMessage.messageId
        );

        if (existingMessageIndex !== -1) {
          // Message already exists, don't add it again
          return prevMessages;
        }

        // Case 3: This is a new message from another user
        // Only add if sender is different from current user OR if no temporary message was found
        if (receivedMessage.sendersId !== userId) {
          return [...prevMessages, receivedMessage];
        }

        // Case 4: This is our own message but no temporary message was found
        // This could happen if there was a connection issue - add it
        return [...prevMessages, receivedMessage];
      });
    };

    // Cleanup function to close the socket when the component unmounts or chat changes
    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [userId, websocketBackendUrl, chat?.chatRoomId]); // Reconnect if the user or chat changes

  // Function to handle sending a message
  const sendMessage = () => {
    if (socketRef.current?.readyState === WebSocket.OPEN && newMessage.trim()) {
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const tempMessage = {
        messageId: tempId,
        chatRoomId: chat.chatRoomId,
        sendersId: userId,
        content: newMessage.trim(),
        timeStamp: new Date().toISOString(),
        isTemporary: true,
      };

      // Add temporary message to state
      setMessages(prev => [...prev, tempMessage]);
      setShouldAutoScroll(true);

      const messagePayload = {
        tempId: tempId, // Send the temporary ID to the backend
        chatRoomId: chat.chatRoomId,
        sendersId: userId,
        contentType: "text",
        content: newMessage.trim(),
        participants: chat.participants || [],
        readBy: [],
      };

      socketRef.current.send(JSON.stringify(messagePayload));
      setNewMessage('');
    }
  };

  // Effect 3: Handle auto-scrolling
  useEffect(() => {
    if (!isInitialLoad && shouldAutoScroll && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isInitialLoad, shouldAutoScroll]);

  // Handler to disable auto-scroll if user scrolls up
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      setShouldAutoScroll(isNearBottom);
    }
  };

  // --- Render Logic ---
  if (!chat) {
    return (
      <div className="flex-1 h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 flex flex-col items-center justify-center text-center relative overflow-hidden">
        <BackgroundWaves />
        <FloatingParticles />
        <BleepLoader />
        <p className="text-white mt-4 text-lg z-10">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-screen flex flex-col bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800 relative overflow-hidden">
      {/* Header */}
      <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-r from-gray-700/80 via-gray-600/80 to-gray-700/80 backdrop-blur-sm p-4 flex justify-between items-center border-b border-gray-500/30 z-10">
        <div className="flex items-center">
            <motion.img whileHover={{ scale: 1.05 }} src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full mr-4 border-2 border-white/20" />
            <div>
                <h3 className="font-semibold text-lg text-white">{chat.name}</h3>
                <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} className="text-xs text-green-400 font-medium">
                ● {isConnected ? 'Online' : 'Offline'}
                </motion.p>
            </div>
        </div>
        <div className="flex items-center space-x-4 text-gray-200">
            <motion.div whileHover={{ scale: 1.1 }}><Search size={22} className="cursor-pointer hover:text-white" /></motion.div>
            <motion.div whileHover={{ scale: 1.1 }}><MoreHorizontal size={22} className="cursor-pointer hover:text-white" /></motion.div>
        </div>
      </motion.header>

      {/* Messages Area */}
      <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-grow p-4 overflow-y-auto z-10">
        {messages.map((msg) => (
          <MessageBubble key={msg.messageId} message={msg} isMe={msg.sendersId === userId} />
        ))}
      </div>

      {/* Message Input */}
      <motion.footer initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-r from-gray-700/80 via-gray-600/80 to-gray-700/80 backdrop-blur-sm p-4 flex items-center z-10 border-t border-gray-500/30">

        <motion.div whileHover={{ scale: 1.1 }}><Smile className="w-6 h-6 text-white mx-2 cursor-pointer hover:text-green-400" /></motion.div>

        <motion.div whileHover={{ scale: 1.1 }}><Paperclip className="w-6 h-6 text-white mx-2 cursor-pointer hover:text-green-400" /></motion.div>
        
        <form className="flex-grow relative" onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
            <motion.input
                whileFocus={{ scale: 1.02 }}
                type="text"
                placeholder="Type a message..."
                className="w-full text-white font-medium bg-gray-600/50 rounded-full px-6 py-3 focus:outline-none border border-gray-500/30 focus:border-green-400/50 transition-all"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
            />
        </form>
        <motion.div whileHover={{ scale: 1.1 }} className="ml-2">
            <button onClick={sendMessage} title="Send Message">
                {newMessage ? (
                    <Send className="w-6 h-6 text-white cursor-pointer hover:text-green-400" />
                ) : (
                    <Mic className="w-6 h-6 text-white cursor-pointer hover:text-green-400" />
                )}
            </button>
        </motion.div>
      </motion.footer>
    </div>
  );
};

export default Chat;