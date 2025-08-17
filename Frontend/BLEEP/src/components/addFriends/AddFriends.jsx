import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SearchIcon, X } from 'lucide-react';
import { useSelector } from 'react-redux';

// Avatar component (mock)
const Avatar = ({ sx, children, className }) => (
    <div
        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${className}`}
        style={{ backgroundColor: sx?.bgcolor }}
    >
        {children}
    </div>
);

const AddFriends = () => {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [friend, setFriend] = useState(null); // Initialize as null instead of undefined
    const [hasSearched, setHasSearched] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [chatRoomName, setChatRoomName] = useState('');
    const [chatRoomType, setChatRoomType] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [chatRoom, setChatRoom] = useState({})

    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const navigate = useNavigate();
    const user = useSelector((state) => state.authReducer.user)
    const userId = user?.userId
    const token = useSelector((state) => state.authReducer.token)


    const fetchFriend = async (e) => {
        e.preventDefault();
        if (!searchTerm.trim()) {
            setError('Please enter a search term');
            return;
        }

        setLoading(true);
        setError('');
        setHasSearched(true);
        setFriend(null); // Reset friend data

        try {
            const res = await fetch(`${backendUrl}/user/find/${searchTerm}`, {
                method: "GET",
                headers: {
                    "Accept": "application/json",
                    "Authorization": `Bearer ${token}`
                },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || `Fetch failed: ${res.status}`);
            }

            const friendData = await res.json();
            setFriend(friendData);

        } catch (e) {
            console.error("Failed to load Friend:", e);
            setError(e.message);
            setFriend(null); // Ensure friend is null on error
        } finally {
            setLoading(false);
        }
    };

    const handleChatButtonClick = (friend) => {
        setSelectedFriend(friend);
        setIsModalOpen(true);
    };

    const handleModalSubmit = async (e) => {
        e.preventDefault();
        if (!chatRoomName.trim()) return;

        setIsSubmitting(true);

        try {
            const roomDetails = {
                "chatRoomName": chatRoomName.trim(),
                "chatRoomProfileURL": "",
                "chatRoomType": chatRoomType.trim() || "PRIVATE", // Fallback value
                "isGroupChatting": true,
                "participants": [selectedFriend.userId, userId],
                "createdBy": userId
            }

            console.log("Room Details:", roomDetails)

            const response = await fetch(`${backendUrl}/chat-room/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    "Authorization":`Bearer ${token}`
                },
                body: JSON.stringify(roomDetails),
                mode: 'cors'
            });

            if (!response.ok) {
                const errorData = await response.text(); // Use text() first to see raw response
                console.error("Error response:", errorData);
                throw new Error(`HTTP ${response.status}: ${errorData}`);
            }

            const result = await response.json();
            console.log("Success:", result);

            navigate('/profile');

            // Close modal and reset
            setIsModalOpen(false);
            setSelectedFriend(null);
            setChatRoomName('');

        } catch (error) {
            console.error('Failed to create chat room:', error);
            // Show error to user
            setError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedFriend(null);
        setChatRoomName('');
    };

    const getChatDisplayName = (friend) => {
        if (!friend) return 'Unknown';
        return friend.fullName || friend.userName || 'Unknown'; // Note: API returns userName, not username
    };

    function stringToColor(string) {
        let hash = 0;
        for (let i = 0; i < string.length; i += 1) {
            hash = string.charCodeAt(i) + ((hash << 5) - hash);
        }
        let color = '#';
        for (let i = 0; i < 3; i += 1) {
            const value = (hash >> (i * 8)) & 0xff;
            color += `00${value.toString(16)}`.slice(-2);
        }
        return color;
    }

    function stringAvatar(name) {
        if (!name) return { sx: { bgcolor: '#666' }, children: '?' };
        const nameParts = name.split(' ');
        const initials = nameParts.length > 1
            ? `${nameParts[0][0]}${nameParts[1][0]}`
            : name.substring(0, 2).toUpperCase();
        return {
            sx: { bgcolor: stringToColor(name) },
            children: initials,
        };
    }

    return (
        <div className="flex flex-col h-full bg-gray-800 text-white">
            <div className="p-4">
                <h1 className="text-2xl font-bold mb-4">Add Friends</h1>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-gray-700">
                <motion.form className="relative" onSubmit={fetchFriend}>
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or username"
                        className="w-full bg-gray-600 border-gray-500 border-2 rounded-lg pl-10 pr-24 py-3 text-sm focus:outline-none focus:border-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? '...' : 'Search'}
                    </button>
                </motion.form>
            </div>

            {/* Results List */}
            <div className="flex-grow overflow-y-auto">
                {loading && <div className="p-4 text-center text-gray-400">Searching...</div>}

                {error && <div className="p-4 text-center text-red-400">Error: {error}</div>}

                {!loading && !error && hasSearched && !friend && (
                    <div className="p-4 text-center text-gray-400">No users found.</div>
                )}

                {!loading && !hasSearched && (
                    <div className="p-4 text-center text-gray-400">Enter a name to search for friends.</div>
                )}

                {/* Only render friend data if friend exists */}
                {!loading && !error && friend && (
                    <div className="flex items-center p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-600">
                        <Avatar {...stringAvatar(getChatDisplayName(friend))} />
                        <div className="flex-grow min-w-0 mx-3">
                            <h3 className="font-bold truncate text-lg">
                                {getChatDisplayName(friend)}
                            </h3>
                            {friend.userName && friend.userName !== friend.fullName && (
                                <p className="text-sm text-gray-400">@{friend.userName}</p>
                            )}
                        </div>
                        <button
                            onClick={() => handleChatButtonClick(friend)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg font-medium transition-colors flex-shrink-0"
                        >
                            Chat
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4 border border-gray-600"
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-white">Create Chat Room</h2>
                            <button
                                onClick={handleModalClose}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-gray-300 text-sm">
                                Starting a chat with <span className="font-semibold text-white">
                                    {selectedFriend ? getChatDisplayName(selectedFriend) : ''}
                                </span>
                            </p>
                        </div>

                        <form onSubmit={handleModalSubmit}>
                            <div className="mb-4">
                                <label htmlFor="chatRoomName" className="block text-sm font-medium text-gray-300 mb-2">
                                    Chat Room Name
                                </label>
                                <input
                                    id="chatRoomName"
                                    type="text"
                                    placeholder="Enter chat room name..."
                                    value={chatRoomName}
                                    onChange={(e) => setChatRoomName(e.target.value)}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    required
                                    autoFocus
                                />
                            </div>
                            <div className="mb-4">
                                <label htmlFor="chatRoomType" className="block text-sm font-medium text-gray-300 mb-2">
                                    Chat Room Type
                                </label>
                                <select
                                    name="chatRoomType"
                                    id="chatRoomType"
                                    value={chatRoomType}
                                    onChange={(e) => setChatRoomType(e.target.value)}
                                    className='w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500'
                                    required
                                >
                                    <option value="">Select type...</option>
                                    <option value="GROUP">GROUP</option>
                                    <option value="PRIVATE">PRIVATE</option>
                                </select>
                            </div>

                            <div className="flex gap-3 justify-end">
                                <button
                                    type="button"
                                    onClick={handleModalClose}
                                    className="px-4 py-2 text-gray-300 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!chatRoomName.trim() || isSubmitting}
                                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Chat'}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default AddFriends;