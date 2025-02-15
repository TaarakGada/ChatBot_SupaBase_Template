import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { Tooltip } from './common/Tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { SidebarHeader } from './SidebarHeader';
import { ChatListItem } from './ChatListItem';
import { SidebarFooter } from './SidebarFooter';

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
            setChats(newChats);
            setActiveChatId(newChats[0].id);
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
        <TooltipProvider>
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
        </TooltipProvider>
    );
};

export default Sidebar;
