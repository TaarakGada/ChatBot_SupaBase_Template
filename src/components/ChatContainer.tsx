import React, { useState, useRef, useEffect } from 'react';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { chatService } from '../services/chatService';
import { Message as MessageType } from '../lib/supabase';
import { sendToAI } from '../services/api';

interface ChatContainerProps {
    activeChatId: string;
    userId: string;
}

export const ChatContainer: React.FC<ChatContainerProps> = ({
    activeChatId,
    userId,
}) => {
    const [messages, setMessages] = useState<MessageType[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeChatId) {
            loadMessages();
        }
    }, [activeChatId]);

    const loadMessages = async () => {
        try {
            const chatMessages = await chatService.fetchMessages(activeChatId);
            setMessages(chatMessages);
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    };

    const handleMessageSubmit = async (content: string) => {
        setIsLoading(true);
        try {
            // Save user message
            const userMessage = await chatService.saveMessage({
                chat_id: activeChatId,
                content: {
                    text: content,
                    type: 'text',
                },
                is_user: true,
                user_id: userId,
            });
            setMessages((prev) => [...prev, userMessage]);

            // Create FormData with text field
            const formData = new FormData();
            formData.append('text', content);

            // Get AI response
            const aiResponse = await sendToAI(formData);

            if (aiResponse.status === 'error') {
                throw new Error(
                    aiResponse.error || 'Failed to get AI response'
                );
            }

            // Save AI response
            const aiMessage = await chatService.saveMessage({
                chat_id: activeChatId,
                content: {
                    text: aiResponse.text,
                    type: 'text',
                },
                is_user: false,
                user_id: userId,
            });
            setMessages((prev) => [...prev, aiMessage]);

            // Update chat's last message
            await chatService.updateChat(activeChatId, {
                last_message: content,
                last_message_at: new Date().toISOString(),
            });
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsLoading(false);
        }
    };

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
    }, [messages]);

    return (
        <div className="flex flex-col h-full w-7/12 max-h-[80%] bg-transparent rounded-2xl overflow-hidden">
            <div
                ref={messagesContainerRef}
                className="flex-grow overflow-y-auto scroll-smooth custom-scrollbar p-16 space-y-6"
            >
                {messages.map((message, index) => (
                    <Message
                        key={`${message.id || index}-${message.created_at}`}
                        content={
                            typeof message.content === 'string'
                                ? message.content
                                : {
                                      text: message.content.text,
                                      type: message.content.type || 'text',
                                      url: message.content.url,
                                      name: message.content.name,
                                  }
                        }
                        isUser={message.is_user}
                        timestamp={new Date(
                            message.created_at
                        ).toLocaleTimeString()}
                    />
                ))}
            </div>
            <MessageInput
                onSendMessage={handleMessageSubmit}
                onSendVoice={async (blob) => {
                    const file = new File([blob], 'voice-message.wav', {
                        type: 'audio/wav',
                    });
                    const url = await chatService.uploadFile(file, userId);
                    const message = await chatService.saveMessage({
                        chat_id: activeChatId,
                        content: {
                            type: 'audio',
                            url,
                            name: 'Voice Message',
                        },
                        is_user: true,
                        user_id: userId,
                    });
                    setMessages((prev) => [...prev, message]);
                }}
                onSendFiles={async (files) => {
                    for (const file of files) {
                        const url = await chatService.uploadFile(file, userId);
                        const message = await chatService.saveMessage({
                            chat_id: activeChatId,
                            content: {
                                type: 'file',
                                url,
                                name: file.name,
                            },
                            is_user: true,
                            user_id: userId,
                        });
                        setMessages((prev) => [...prev, message]);
                    }
                }}
                isLoading={isLoading}
            />
        </div>
    );
};
