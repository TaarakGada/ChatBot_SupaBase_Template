import React, { useState, useRef, useEffect } from 'react';
import { Message } from './Message';
import { MessageInput } from './MessageInput';

interface ChatContainerProps {
    messages: Array<{
        id: string;
        content: string | { type: 'audio' | 'file'; url: string; name: string };
        isUser: boolean;
        timestamp: string;
    }>;
    onSendMessage: (message: string) => void;
    onSendVoice: (blob: Blob) => void;
    onSendFiles: (files: File[]) => void;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
    messages,
    onSendMessage,
    onSendVoice,
    onSendFiles,
}) => {
    const [chatMessages, setChatMessages] = useState<typeof messages>([]);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    // Auto-scroll effect
    useEffect(() => {
        const scrollToBottom = () => {
            if (messagesContainerRef.current) {
                const scrollElement = messagesContainerRef.current;
                const scrollTop =
                    scrollElement.scrollHeight - scrollElement.clientHeight;
                scrollElement.scrollTo({
                    top: scrollTop,
                    behavior: 'smooth',
                });
            }
        };

        // Scroll when messages change
        scrollToBottom();

        // Also scroll after a small delay to handle dynamic content
        const timeoutId = setTimeout(scrollToBottom, 100);
        return () => clearTimeout(timeoutId);
    }, [chatMessages]);

    const handleNewMessage = (content: string, fromAI: boolean = false) => {
        const newMessage = {
            id: crypto.randomUUID(),
            content,
            isUser: !fromAI, // If fromAI is true, isUser will be false
            timestamp: new Date().toLocaleTimeString(),
        };

        setChatMessages((prev) => [...prev, newMessage]);
    };

    const handleMessageSubmit = async (content: string) => {
        // Add user message
        handleNewMessage(content, false);
        onSendMessage(content);

        // Simulate AI response
        setTimeout(() => {
            handleNewMessage(`AI Response to: ${content}`, true);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-full w-7/12 max-h-[80%] animate-fadeIn">
            <div
                ref={messagesContainerRef}
                className="flex-grow overflow-y-auto scroll-smooth custom-scrollbar p-16 space-y-6"
            >
                {chatMessages.map((message) => (
                    <Message
                        key={message.id}
                        content={message.content}
                        isUser={message.isUser}
                        timestamp={message.timestamp}
                    />
                ))}
            </div>
            <MessageInput
                onSendMessage={handleMessageSubmit}
                onSendVoice={onSendVoice}
                onSendFiles={onSendFiles}
            />
        </div>
    );
};
