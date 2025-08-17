import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SearchIcon } from 'lucide-react';
import { FaRegUser } from "react-icons/fa";
import Avatar from '@mui/material/Avatar';
import { RiUserAddFill } from "react-icons/ri";
import { BackgroundWaves, FloatingParticles } from '../AllComponents';
import { useNavigate } from 'react-router-dom';
import { TiEdit } from "react-icons/ti";
import { useSelector } from 'react-redux';


const ChatList = ({ chats, onSelectChat, width, onWidthChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isResizing, setIsResizing] = useState(false);
  const [allChats, setAllChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const token = useSelector((state) => state.authReducer.token)

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate()

  // Filter based on fetched chat data, not the original chats prop
  const filteredChats = allChats.filter(chat =>
    chat.chatRoomName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.participants?.some(participant =>
      participant.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  useEffect(() => {
    const fetchAllChats = async () => {
      // The guard clause now checks the length of the original array
      if (!chats || chats.length === 0) {
        setAllChats([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        // CORRECTION 1: Use .join(',') for clarity and explicit conversion.
        params.append('ids', chats.join(','));

        const res = await fetch(`${backendUrl}/chat-room/allChats?${params.toString()}`, {
          method: "GET",
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
          },
          mode: "cors"
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Fetch failed: ${res.status} ${text}`);
        }

        const fetchedChats = await res.json();
        console.log('Fetched chats:', fetchedChats);
        setAllChats(fetchedChats);

      } catch (e) {
        console.error("Failed to load chats:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllChats();
    // CORRECTION 2: Depend on the joined string to prevent unnecessary re-fetches.
  }, [backendUrl, chats, token]);

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      // Set min and max width constraints
      if (newWidth >= 250 && newWidth <= 600) {
        onWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };


    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, onWidthChange]);




  const getChatDisplayName = (chat) => {
    if (chat.chatRoomName) return chat.chatRoomName;
    if (chat.participants && chat.participants.length > 0) {
      return chat.participants.map(p => p.fullName || p.name).join(', ');
    }
    return 'Unknown Chat';
  };

  function stringToColor(string) {
    let hash = 0;
    let i;


    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }

    return color;
  }

  function stringAvatar(name) {
    // Handle null, undefined, or empty string
    if (!name || typeof name !== 'string') {
      return {
        sx: {
          bgcolor: '#666666', // default color
        },
        children: '?', // default character
      };
    }

    const words = name.trim().split(' ');
    let initials = '';

    if (words.length === 1) {
      // Single word: use first two characters or just first character
      initials = words[0].length >= 2 ? words[0][0] + words[0][1] : words[0][0];
    } else {
      // Multiple words: use first character of first two words
      initials = words[0][0] + words[1][0];
    }

    return {
      sx: {
        bgcolor: stringToColor(name),
      },
      children: initials.toUpperCase(),
    };
  }

  return (
    <div className="relative flex">
      <BackgroundWaves />
      <FloatingParticles />
      <div
        className="h-screen bg-gradient-to-b from-gray-800 to-gray-600 border-r border-white text-white flex flex-col"
        style={{ width: `${width}px` }}
      >
        {/* Header */}
        <header className="bg-[#f0f2f5] p-6 flex justify-between items-center bg-gradient-to-b from-black to-gray-700">
          <motion.div
            className='relative bg-gray-300 p-4 rounded-full overflow-hidden'
            whileHover={{ scale: 1.2 }}
          >
            <FaRegUser size={60} className='text-black' />

            {/* Pencil icon positioned in front/center */}
            <TiEdit
              className='absolute top-3/4 left-3/4 transform -translate-x-1/2 -translate-y-1/2 text-black bg-white bg-opacity-80 rounded-full p-1 hover:bg-black hover:text-white '
              size={35}
              onClick={() => navigate('/editProfile')}
            />
          </motion.div>


          <div className="flex items-center space-x-4 text-white">
            <motion.div whileHover={{ scale: 1.2 }} className='hover:text-blue-400'>
              <RiUserAddFill size={30} onClick={() => navigate('/addFriends')} name='Add Friends' />
            </motion.div>

          </div>
        </header>

        {/* Search Bar */}
        <div className="bg-gradient-to-b from-gray-700 to-gray-600 p-2 border-b border-white">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white" />
            <input
              type="text"
              placeholder="Search or start new chat"
              className="w-full bg-gradient-to-b from-gray-600 to-gray-500 border-white border-2 rounded-lg pl-10 pr-4 py-4 text-sm focus:outline-none text-white font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-grow overflow-y-auto">
          {loading && (
            <div className="flex items-center justify-center p-4">
              <div className="text-white">Loading chats...</div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center p-4">
              <div className="text-red-400">Error: {error}</div>
            </div>
          )}

          {!loading && !error && filteredChats.length === 0 && (
            <div className="flex items-center justify-center p-4">
              <div className="text-gray-400">No chats found</div>
            </div>
          )}

          {!loading && filteredChats.map(chat => (
            <div
              key={chat.chatRoomId}
              className="flex items-center p-3 hover:bg-gray-500 cursor-pointer border-b border-gray-100 text-white"
              onClick={() => onSelectChat(chat)}
            >
              <Avatar {...stringAvatar(`${chat.chatRoomName}`)} className='border-2' />
              <div className="flex-grow min-w-0 mx-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold truncate text-white text-lg ">
                    {getChatDisplayName(chat)}
                  </h3>
                  <p className="text-xs whitespace-nowrap ml-2 flex-shrink-0 text-gray-100">
                    {new Date(chat.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-200 truncate">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                  {/* You can add unread count logic here if your backend provides it */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Resize Handle */}
      <div
        className={`w-1 bg-gray-300 hover:bg-green-500 cursor-col-resize transition-colors duration-200 ${isResizing ? 'bg-green-500' : ''
          }`}
        onMouseDown={handleMouseDown}
        title="Drag to resize"
      />
    </div>
  );
};

export default ChatList;