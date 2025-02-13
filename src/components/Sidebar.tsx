import React, { useState } from 'react';
import { ChevronLeft, Plus, LogOut, Trash2, Edit2, Menu } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';

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
        <Tooltip.Provider delayDuration={200}>
            <div className="relative">
                {/* Glassmorphic Sidebar */}
                <div
                    className={`fixed top-0 left-0 h-screen w-64 
                    bg-white/5 dark:bg-black/10
                    backdrop-blur-2xl backdrop-saturate-200
                    border-r border-white/10
                    shadow-[0_0_40px_-15px_rgba(0,0,0,0.3)]
                    transition-transform duration-300 ease-in-out
                    ${isCollapsed ? '-translate-x-full' : 'translate-x-0'}`}
                >
                    <div className="flex flex-col h-full p-4">
                        {/* Header with buttons */}
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                            >
                                <ChevronLeft
                                    size={20}
                                    className="text-white"
                                />
                            </button>

                            <button
                                onClick={addNewChat}
                                className="flex items-center gap-2 px-3 py-1.5 
                                             bg-white/10 hover:bg-white/20 
                                             rounded-lg transition-all duration-200
                                             border border-white/10"
                            >
                                <Plus
                                    size={16}
                                    className="text-white"
                                />
                                <span className="text-sm font-medium text-white">
                                    New Chat
                                </span>
                            </button>
                        </div>

                        {/* Chat List */}
                        <div className="flex-grow overflow-y-auto space-y-2">
                            {chats.map((chat) => (
                                <div
                                    key={chat.id}
                                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer
                                                ${
                                                    chat.id === activeChatId
                                                        ? 'bg-white/15 border border-white/20'
                                                        : 'hover:bg-white/10'
                                                }`}
                                    onClick={() => setActiveChatId(chat.id)}
                                >
                                    {editingId === chat.id ? (
                                        <input
                                            type="text"
                                            defaultValue={chat.name}
                                            onBlur={(e) =>
                                                renameChat(
                                                    chat.id,
                                                    e.target.value
                                                )
                                            }
                                            onKeyPress={(e) =>
                                                e.key === 'Enter' &&
                                                renameChat(
                                                    chat.id,
                                                    e.currentTarget.value
                                                )
                                            }
                                            className="flex-grow px-2 py-1 bg-white/10 
                                                     text-white placeholder-white/50
                                                     rounded border border-white/20 
                                                     focus:outline-none focus:border-white/30"
                                            autoFocus
                                        />
                                    ) : (
                                        <>
                                            <span className="flex-grow truncate text-white font-medium">
                                                {chat.name}
                                            </span>
                                            <div className="flex items-center gap-1 ml-2">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setEditingId(chat.id);
                                                    }}
                                                    className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                                                >
                                                    <Edit2
                                                        size={14}
                                                        className="text-white/70"
                                                    />
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        deleteChat(chat.id);
                                                    }}
                                                    className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                                                >
                                                    <Trash2
                                                        size={14}
                                                        className="text-red-400"
                                                    />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-4 border-t border-white/10">
                            <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                                <LogOut
                                    size={20}
                                    className="text-white/80 hover:text-white"
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Collapsed Button (When Sidebar is Hidden) */}
                {isCollapsed && (
                    <button
                        onClick={() => setIsCollapsed(false)}
                        className="fixed top-5 left-2 p-2 
                                     bg-white/10 hover:bg-white/20
                                     backdrop-blur-lg rounded-lg 
                                     transition-all duration-200"
                    >
                        <Menu
                            size={20}
                            className="text-white"
                        />
                    </button>
                )}
            </div>
        </Tooltip.Provider>
    );
};

export default Sidebar;
