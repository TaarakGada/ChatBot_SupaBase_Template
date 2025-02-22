import React, { useState, useRef, useEffect } from 'react';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { chatService } from '../services/chatService';
import { Message as MessageType, MessageContent } from '../lib/supabase';
import { sendToAI } from '../services/api';
import toast from 'react-hot-toast';

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

    const isValidUUID = (uuid: string) => {
        const uuidRegex =
            /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        return uuidRegex.test(uuid);
    };

    useEffect(() => {
        if (activeChatId && isValidUUID(activeChatId)) {
            loadMessages();
        }
    }, [activeChatId]);

    const loadMessages = async () => {
        if (!activeChatId || !isValidUUID(activeChatId)) {
            console.error('Invalid chat ID');
            return;
        }

        try {
            const chatMessages = await chatService.fetchMessages(activeChatId);
            setMessages(chatMessages);
        } catch (error) {
            console.error('Error loading messages:', error);
            toast.error('Failed to load messages');
        }
    };

    const handleMessageSubmit = async (content: string, files?: File[]) => {
        if (!activeChatId || !isValidUUID(activeChatId)) {
            toast.error('Invalid chat session');
            return;
        }

        if (!content.trim() && (!files || files.length === 0)) {
            return;
        }

        setIsLoading(true);
        try {
            // Handle files if present
            if (files?.length) {
                const file = files[0]; // Handle first file
                const fileUrl = await chatService.uploadFile(file, userId);

                // Save file message
                const userMessage = await chatService.saveMessage({
                    chat_id: activeChatId,
                    content: file.name, // Store filename as content
                    message_type: 'file',
                    file_url: fileUrl,
                    is_user: true,
                });
                setMessages((prev) => [...prev, userMessage]);
            }
            // Handle text message if present
            else if (content.trim()) {
                const userMessage = await chatService.saveMessage({
                    chat_id: activeChatId,
                    content: content,
                    message_type: 'text',
                    is_user: true,
                });
                setMessages((prev) => [...prev, userMessage]);
            }

            // Send to AI and handle response
            const aiResponse = await sendToAI(content, files);
            if (aiResponse.status === 'success') {
                const aiMessage = await chatService.saveMessage({
                    chat_id: activeChatId,
                    content: aiResponse.result,
                    message_type: 'text',
                    is_user: false,
                });
                setMessages((prev) => [...prev, aiMessage]);
            } else {
                throw new Error(
                    aiResponse.error || 'Failed to get AI response'
                );
            }
        } catch (error) {
            console.error('Error:', error);
            toast.error('Failed to process message');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceMessage = async (blob: Blob) => {
        if (!activeChatId || !isValidUUID(activeChatId)) {
            toast.error('Invalid chat session');
            return;
        }

        try {
            const file = new File([blob], 'voice-message.wav', {
                type: 'audio/wav',
            });
            const fileUrl = await chatService.uploadFile(file, userId);

            const message = await chatService.saveMessage({
                chat_id: activeChatId,
                content: 'Voice Message', // Description as content
                message_type: 'voice',
                file_url: fileUrl,
                is_user: true,
            });
            setMessages((prev) => [...prev, message]);
        } catch (error) {
            console.error('Error saving voice message:', error);
            toast.error('Failed to save voice message');
        }
    };

    const handleFiles = async (files: File[]) => {
        if (!activeChatId || !isValidUUID(activeChatId)) {
            toast.error('Invalid chat session');
            return;
        }

        try {
            const fileUrls: string[] = [];
            const fileNames: string[] = [];

            for (const file of files) {
                const fileUrl = await chatService.uploadFile(file, userId);
                fileUrls.push(fileUrl);
                fileNames.push(file.name);
            }

            const message = await chatService.saveMessage({
                chat_id: activeChatId,
                content: fileNames.join(', '),
                message_type: 'file',
                file_urls: fileUrls,
                file_names: fileNames,
                is_user: true,
            });
            setMessages((prev) => [...prev, message]);
        } catch (error) {
            console.error('Error saving files:', error);
            toast.error('Failed to save files');
        }
    };

    const formatMessageContent = (
        message: MessageType
    ): string | MessageContent => {
        if (message.message_type === 'text') {
            return message.content;
        }
        if (message.message_type === 'voice') {
            return {
                type: 'voice',
                text: message.content,
                url: message.file_url,
                name: message.content,
            };
        }
        return {
            type: message.message_type,
            text: message.content,
            urls:
                message.file_urls ||
                (message.file_url ? [message.file_url] : []),
            names:
                message.file_names ||
                (message.content ? [message.content] : []),
        };
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
        <div className="flex flex-col h-full w-full max-h-screen bg-transparent">
            <div
                ref={messagesContainerRef}
                className="flex-grow overflow-y-auto scroll-smooth custom-scrollbar p-16 pb-48 space-y-6" // Added pb-40
            >
                {messages.map((message, index) => (
                    <Message
                        key={`${message.id || index}-${message.created_at}`}
                        content={formatMessageContent(message)}
                        isUser={message.is_user}
                        timestamp={new Date(
                            message.created_at
                        ).toLocaleTimeString()}
                    />
                ))}
            </div>
            <MessageInput
                onSendMessage={handleMessageSubmit}
                onSendVoice={handleVoiceMessage}
                onSendFiles={handleFiles}
                isLoading={isLoading}
            />
        </div>
    );
};
