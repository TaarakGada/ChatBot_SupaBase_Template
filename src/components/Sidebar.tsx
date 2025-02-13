import React, { useState } from 'react';
import { ChevronLeft, Plus, LogOut, Trash2, Edit2, Menu } from 'lucide-react';

interface Chat {
    id: string;
    name: string;
}

interface SidebarProps {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    activeChatId: string;
    setActiveChatId: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    isCollapsed,
    setIsCollapsed,
    activeChatId,
    setActiveChatId,
    onDeleteChat,
}) => {
    const [chats, setChats] = useState<Chat[]>([
        { id: '1', name: 'General Chat' },
        { id: '2', name: 'Project Discussion' },
    ]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const addNewChat = () => {
        const newChat = {
            id: crypto.randomUUID(),
            name: `New Chat ${chats.length + 1}`,
        };
        setChats([...chats, newChat]);
        setActiveChatId(newChat.id);
    };

    const deleteChat = (id: string) => {
        onDeleteChat(id);
        const newChats = chats.filter((chat) => chat.id !== id);
        if (newChats.length === 0) {
            const newChat = { id: crypto.randomUUID(), name: 'New Chat' };
            setChats([newChat]);
            setActiveChatId(newChat.id);
        } else {
            const nextChat = newChats[0];
            setActiveChatId(nextChat.id);
            setChats(newChats);
        }
    };

    const renameChat = (id: string, newName: string) => {
        setChats(
            chats.map((chat) =>
                chat.id === id ? { ...chat, name: newName } : chat
            )
        );
        setEditingId(null);
    };

    return (
        <div className="relative">
            {/* Glassmorphic Sidebar */}
            <div
                className={`fixed top-0 left-0 h-screen w-64 rounded-r-xl
                bg-gradient-to-b from-white/30 to-white/10 dark:from-gray-800/30 dark:to-gray-900/10
                backdrop-blur-xl backdrop-saturate-150
                border-r border-white/20 dark:border-gray-700/30
                shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]
                transition-transform duration-300 ease-in-out
                ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}
            >
                <div className="flex flex-col h-full p-4">
                    {/* Toggle Button */}
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 dark:bg-gray-800/30 dark:hover:bg-gray-700/50 backdrop-blur-sm transition-all"
                        >
                            <ChevronLeft
                                size={24}
                                className="text-gray-700 dark:text-gray-200"
                            />
                        </button>
                        <button
                            onClick={addNewChat}
                            className="flex items-center px-4 py-2 rounded-lg 
                            bg-blue-500/20 hover:bg-blue-500/30 
                            dark:bg-blue-500/10 dark:hover:bg-blue-500/20 
                            backdrop-blur-sm transition-all"
                        >
                            <Plus
                                size={20}
                                className="mr-2"
                            />
                            <span className="text-gray-700 dark:text-gray-200">
                                New Chat
                            </span>
                        </button>
                    </div>

                    {/* Chat List */}
                    <div className="flex-grow overflow-y-auto">
                        {chats.map((chat) => (
                            <div
                                key={chat.id}
                                className={`flex items-center mb-2 p-2 rounded-lg group transition-all cursor-pointer
                                ${
                                    chat.id === activeChatId
                                        ? 'bg-blue-500/20 dark:bg-blue-500/10 backdrop-blur-sm'
                                        : 'hover:bg-white/10 dark:hover:bg-gray-800/30'
                                }`}
                                onClick={() => setActiveChatId(chat.id)}
                            >
                                {editingId === chat.id ? (
                                    <input
                                        type="text"
                                        defaultValue={chat.name}
                                        onBlur={(e) =>
                                            renameChat(chat.id, e.target.value)
                                        }
                                        onKeyPress={(e) =>
                                            e.key === 'Enter' &&
                                            renameChat(
                                                chat.id,
                                                e.currentTarget.value
                                            )
                                        }
                                        className="flex-grow px-2 py-1 bg-white/20 dark:bg-gray-800/50 
                                        rounded border border-white/30 dark:border-gray-700/30 
                                        backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        autoFocus
                                    />
                                ) : (
                                    <>
                                        <span className="flex-grow truncate text-gray-700 dark:text-gray-200">
                                            {chat.name}
                                        </span>
                                        <div className="hidden group-hover:flex items-center">
                                            <button
                                                onClick={() =>
                                                    setEditingId(chat.id)
                                                }
                                                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 
                                                dark:bg-gray-800/30 dark:hover:bg-gray-700/50 mr-1 transition-all"
                                            >
                                                <Edit2
                                                    size={16}
                                                    className="text-gray-600 dark:text-gray-300"
                                                />
                                            </button>
                                            <button
                                                onClick={() =>
                                                    deleteChat(chat.id)
                                                }
                                                className="p-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 
                                                dark:bg-red-500/5 dark:hover:bg-red-500/10 transition-all"
                                            >
                                                <Trash2
                                                    size={16}
                                                    className="text-red-500 dark:text-red-400"
                                                />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-white/20 dark:border-gray-700/30">
                        <div className="flex justify-between items-center">
                            <button
                                onClick={() => {
                                    /* Add logout logic */
                                }}
                                className="flex items-center justify-center p-2 rounded-lg
                                bg-white/10 hover:bg-white/20 dark:bg-gray-800/30 dark:hover:bg-gray-700/50
                                backdrop-blur-sm transition-all"
                            >
                                <LogOut
                                    size={20}
                                    className="text-gray-700 dark:text-gray-200"
                                />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Collapsed Button (When Sidebar is Hidden) */}
            {isCollapsed && (
                <div className="fixed top-5 left-2">
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="p-2 rounded-lg 
                        bg-white/30 hover:bg-white/40 
                        dark:bg-gray-800/30 dark:hover:bg-gray-700/50 
                        backdrop-blur-sm transition-all"
                    >
                        <Menu
                            size={24}
                            className="text-gray-700 dark:text-gray-200"
                        />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
