import React, { useState, useRef, useEffect } from 'react';
import { Message } from './Message';
import { MessageInput } from './MessageInput';
import { chatService } from '../services/chatService';
import { Message as MessageType, MessageContent } from '../lib/supabase';
import { sendToAI } from '../services/api';
import toast from 'react-hot-toast';
import { LoadingSkeleton } from './LoadingSkeleton';

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
    const [isAILoading, setIsAILoading] = useState(false);
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

    const handleMessageSubmit = async (
        content: string,
        files?: File[],
        voiceBlob?: Blob
    ) => {
        if (!activeChatId || !isValidUUID(activeChatId)) {
            toast.error('Invalid chat session');
            return;
        }

        // Clean up the content
        const cleanContent = content
            .replace(/\[Voice Recording:.*?\]/g, '')
            .replace(/\[Attached files:.*?\]/g, '')
            .trim();

        // Create temporary message for optimistic update
        const tempMessage: MessageType = {
            id: crypto.randomUUID(),
            created_at: new Date().toISOString(),
            chat_id: activeChatId,
            content: cleanContent || 'Shared content',
            message_type: 'text',
            is_user: true,
            files: [],
            file_urls: [],
            file_names: [],
        };

        // Optimistically add message to UI
        setMessages((prev) => [...prev, tempMessage]);
        setIsLoading(true);
        setIsAILoading(true);

        try {
            // Handle uploads in background
            const uploadPromises: Promise<any>[] = [];
            let uploadedFiles: { url: string; name: string }[] = [];

            if (files?.length) {
                uploadPromises.push(
                    Promise.all(
                        files.map(async (file) => {
                            const fileUrl = await chatService.uploadFile(
                                file,
                                userId
                            );
                            return { url: fileUrl, name: file.name };
                        })
                    ).then((results) => {
                        uploadedFiles = results;
                    })
                );
            }

            let voiceUrl: string | null = null;
            if (voiceBlob) {
                const voiceFile = new File([voiceBlob], 'voice-message.wav', {
                    type: 'audio/wav',
                });
                uploadPromises.push(
                    chatService.uploadFile(voiceFile, userId).then((url) => {
                        voiceUrl = url;
                    })
                );
            }

            // Wait for all uploads to complete
            await Promise.all(uploadPromises);

            // Save message to database with uploaded files
            const savedMessage = await chatService.saveMessage({
                ...tempMessage,
                files: uploadedFiles,
                voice_url: voiceUrl,
                file_urls: uploadedFiles.map((f) => f.url),
                file_names: uploadedFiles.map((f) => f.name),
            });

            // Update the temporary message with the saved one
            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === tempMessage.id ? savedMessage : msg
                )
            );

            // Handle AI response
            const aiResponse = await sendToAI(cleanContent, files, voiceBlob);
            if (aiResponse.result) {
                const aiMessage = await chatService.saveMessage({
                    chat_id: activeChatId,
                    content:
                        typeof aiResponse.result === 'string'
                            ? aiResponse.result
                            : JSON.stringify(aiResponse.result),
                    message_type: 'text',
                    is_user: false,
                });
                setMessages((prev) => [...prev, aiMessage]);
            }

            if (aiResponse.error) {
                toast.error(aiResponse.error);
            }
        } catch (error) {
            // Remove temporary message on error
            setMessages((prev) =>
                prev.filter((msg) => msg.id !== tempMessage.id)
            );
            console.error('Error in handleMessageSubmit:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to send message'
            );
        } finally {
            setIsLoading(false);
            setIsAILoading(false);
        }
    };

    const formatMessageContent = (message: MessageType): MessageContent => {
        return {
            text: message.content,
            voice_url: message.voice_url,
            file_urls: message.file_urls,
            file_names: message.file_names,
            files: message.files,
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
                        timestamp={message.created_at}
                    />
                ))}
                {isAILoading && <LoadingSkeleton />}
            </div>
            <MessageInput
                onSendMessage={handleMessageSubmit}
                isLoading={isLoading}
            />
        </div>
    );
};
