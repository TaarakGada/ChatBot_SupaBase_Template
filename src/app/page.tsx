'use client';
import React, { useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { ChatContainer } from '@/components/ChatContainer';

type MessageContent =
    | string
    | { type: 'audio' | 'file'; url: string; name: string };

type Message = {
    id: string;
    content: MessageContent;
    isUser: boolean;
    timestamp: string;
};

function App() {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeChatId, setActiveChatId] = useState<string>('1');

    // Store messages for each chat separately
    const [chatMessages, setChatMessages] = useState<{
        [key: string]: Message[];
    }>({
        '1': [
            {
                id: '1',
                content: 'Hello! How can I help you today?',
                isUser: false,
                timestamp: '10:00 AM',
            },
            {
                id: '2',
                content: 'I have a question about the project.',
                isUser: true,
                timestamp: '10:01 AM',
            },
        ],
        '2': [
            {
                id: '3',
                content: 'This is a project discussion chat.',
                isUser: false,
                timestamp: '11:00 AM',
            },
        ],
    });

    const handleSendMessage = (message: string) => {
        setChatMessages((prev) => ({
            ...prev,
            [activeChatId]: [
                ...(prev[activeChatId] || []),
                {
                    id: Date.now().toString(),
                    content: message,
                    isUser: true,
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                },
            ],
        }));
    };

    const handleSendVoice = (blob: Blob) => {
        const url = URL.createObjectURL(blob);
        setChatMessages((prev) => ({
            ...prev,
            [activeChatId]: [
                ...(prev[activeChatId] || []),
                {
                    id: Date.now().toString(),
                    content: { type: 'audio', url, name: 'Voice message' },
                    isUser: true,
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                    }),
                },
            ],
        }));
    };

    const handleSendFiles = (files: File[]) => {
        files.forEach((file) => {
            const url = URL.createObjectURL(file);
            setChatMessages((prev) => ({
                ...prev,
                [activeChatId]: [
                    ...(prev[activeChatId] || []),
                    {
                        id: Date.now().toString(),
                        content: { type: 'file', url, name: file.name },
                        isUser: true,
                        timestamp: new Date().toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        }),
                    },
                ],
            }));
        });
    };

    const handleDeleteChat = (chatId: string) => {
        const newChats = { ...chatMessages };
        delete newChats[chatId];

        const remainingChatIds = Object.keys(newChats);
        if (remainingChatIds.length === 0) {
            const newChatId = crypto.randomUUID();
            newChats[newChatId] = [];
            setActiveChatId(newChatId);
        } else {
            setActiveChatId(remainingChatIds[0]);
        }

        setChatMessages(newChats);
    };

    return (
        <div className="flex h-screen bg-neutral-900 text-white">
            <Sidebar
                isCollapsed={isCollapsed}
                setIsCollapsed={setIsCollapsed}
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
                onDeleteChat={handleDeleteChat}
            />
            <div className="flex-1 flex flex-col items-center ">
                <ChatContainer
                    messages={chatMessages[activeChatId] || []}
                    onSendMessage={handleSendMessage}
                    onSendVoice={handleSendVoice}
                    onSendFiles={handleSendFiles}
                />
            </div>
        </div>
    );
}

export default App;
