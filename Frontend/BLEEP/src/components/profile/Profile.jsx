import { useEffect, useState } from "react";
import { ChatList, Chat } from "../AllComponents";
import { useSelector } from "react-redux";

export default function Profile() {
    const userId = useSelector((state)=>state.authReducer.userId)
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [chatListWidth, setChatListWidth] = useState(410); // Default width
    const [error, setError] = useState(null);
    

    const handleSelectChat = (chat) => {
        setSelectedChat(chat);
    };

    const handleWidthChange = (newWidth) => {
        setChatListWidth(newWidth);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("UserId:", userId)
                if (!backendUrl) throw new Error("Backend URL not defined");

                const res = await fetch(`${backendUrl}/user/${userId}/allChats`, {
                    method: "GET",
                    headers: { "Accept": "application/json" },
                });

                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(`Fetch failed: ${res.status} ${text}`);
                }

                const raw = await res.json();
                console.log(raw)
                setChats(raw);
            } catch (e) {
                console.error("Failed to load chats:", e);
                setError(e.message);
            }
        };

        fetchData();
    }, [backendUrl, userId]);

    return (
        <div className="font-sans w-full h-screen flex antialiased text-gray-800">
            {error && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-4 py-2 rounded z-10">
                    Error loading chats: {error}
                </div>
            )}
            <ChatList
                chats={chats}
                onSelectChat={handleSelectChat}
                width={chatListWidth}
                onWidthChange={handleWidthChange}
            />
            {console.log("selectedChat:",selectedChat)}
            <Chat chat={selectedChat} />
        </div>
    );
}
