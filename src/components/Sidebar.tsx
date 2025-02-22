import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { SidebarHeader } from './SidebarHeader';
import { ChatListItem } from './ChatListItem';
import { SidebarFooter } from './SidebarFooter';
import { chatService } from '@/services/chatService';

interface Chat {
    id: string;
    name: string;
}

interface SidebarProps {
    userId: string;
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    activeChatId: string;
    setActiveChatId: (chatId: string) => void;
    onDeleteChat: (chatId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
    userId,
    isCollapsed,
    setIsCollapsed,
    activeChatId,
    setActiveChatId,
    onDeleteChat,
}) => {
    const [chats, setChats] = useState<Chat[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);

    const isValidUUID = (uuid: string) => {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    };

    useEffect(() => {
        if (userId) {
            loadChats();
        }
    }, [userId]);

    const loadChats = async () => {
        try {
            const userChats = await chatService.fetchChats(userId);
            setChats(userChats);
            if (
                userChats.length > 0 &&
                (!activeChatId || !isValidUUID(activeChatId))
            ) {
                setActiveChatId(userChats[0].id);
            }
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    };

    const addNewChat = async () => {
        try {
            const newChat = await chatService.createChat(
                userId,
                `New Chat ${chats.length + 1}`
            );
            setChats((prev) => [newChat, ...prev]);
            setActiveChatId(newChat.id);
        } catch (error) {
            console.error('Error creating chat:', error);
        }
    };

    const deleteChat = async (id: string) => {
        try {
            await chatService.deleteChat(id);
            onDeleteChat(id);
            const newChats = chats.filter((chat) => chat.id !== id);
            setChats(newChats);

            if (newChats.length === 0) {
                const newChat = await chatService.createChat(
                    userId,
                    'New Chat'
                );
                setChats([newChat]);
                setActiveChatId(newChat.id);
            } else {
                setActiveChatId(newChats[0].id);
            }
        } catch (error) {
            console.error('Error deleting chat:', error);
        }
    };

    const renameChat = async (id: string, newName: string) => {
        try {
            await chatService.updateChat(id, { name: newName });
            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === id ? { ...chat, name: newName } : chat
                )
            );
            setEditingId(null);
        } catch (error) {
            console.error('Error renaming chat:', error);
        }
    };

    return (
        <div className="relative">
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
                    <SidebarHeader
                        onCollapse={() => setIsCollapsed(!isCollapsed)}
                        onNewChat={addNewChat}
                    />

                    <div className="flex-grow overflow-y-auto space-y-2">
                        {chats.map((chat) => (
                            <ChatListItem
                                key={chat.id}
                                id={chat.id}
                                name={chat.name}
                                isActive={chat.id === activeChatId}
                                editingId={editingId}
                                onSelect={() => setActiveChatId(chat.id)}
                                onDelete={() => deleteChat(chat.id)}
                                onEdit={() => setEditingId(chat.id)}
                                onRename={(newName) =>
                                    renameChat(chat.id, newName)
                                }
                            />
                        ))}
                    </div>

                    <SidebarFooter />
                </div>
            </div>

            {isCollapsed && (
                <Tooltip content="Expand Sidebar">
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
                </Tooltip>
            )}
        </div>
    );
};

export default Sidebar;
