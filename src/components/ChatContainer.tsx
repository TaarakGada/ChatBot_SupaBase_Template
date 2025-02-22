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
        console.log('Starting handleMessageSubmit with:', {
            content,
            filesCount: files?.length,
        });

        if (!activeChatId || !isValidUUID(activeChatId)) {
            console.error('Invalid chat session:', { activeChatId });
            toast.error('Invalid chat session');
            return;
        }

        setIsLoading(true);
        try {
            // Clean up the content by removing system-generated text
            const cleanContent = content
                .replace(/\[Voice Recording:.*?\]/g, '')
                .replace(/\[Attached files:.*?\]/g, '')
                .trim();

            console.log('Preparing message data...');

            // Handle files if present
            if (files && files.length > 0) {
                console.log(
                    'Processing files:',
                    files.map((f) => f.name)
                );
                try {
                    const uploadedFiles = await Promise.all(
                        files.map(async (file) => {
                            const fileUrl = await chatService.uploadFile(
                                file,
                                userId
                            );
                            return { url: fileUrl, name: file.name };
                        })
                    );

                    // Save file message
                    const fileMessage = await chatService.saveMessage({
                        chat_id: activeChatId,
                        content: files.map((f) => f.name).join(', '),
                        message_type: 'file',
                        files: uploadedFiles,
                        is_user: true,
                    });
                    setMessages((prev) => [...prev, fileMessage]);
                } catch (fileError) {
                    console.error('Error uploading files:', fileError);
                    throw fileError;
                }
            }

            // If there's actual text content, save it as a separate text message
            if (cleanContent) {
                const textMessage = await chatService.saveMessage({
                    chat_id: activeChatId,
                    content: cleanContent,
                    message_type: 'text',
                    is_user: true,
                });
                setMessages((prev) => [...prev, textMessage]);

                // Handle AI response only for text messages
                console.log('Sending to AI:', cleanContent);
                const aiResponse = await sendToAI(cleanContent, files);
                if (aiResponse.status === 'success' && aiResponse.result) {
                    const aiMessageContent =
                        typeof aiResponse.result === 'string'
                            ? aiResponse.result
                            : aiResponse.result.message ||
                              JSON.stringify(aiResponse.result);

                    const aiMessage = await chatService.saveMessage({
                        chat_id: activeChatId,
                        content: aiMessageContent,
                        message_type: 'text',
                        is_user: false,
                    });
                    setMessages((prev) => [...prev, aiMessage]);
                }
            }
        } catch (error) {
            console.error('Error in handleMessageSubmit:', error);
            toast.error(
                error instanceof Error
                    ? error.message
                    : 'Failed to send message'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleVoiceMessage = async (blob: Blob) => {
        console.log('Starting handleVoiceMessage');
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
                voice_url: fileUrl,
                is_user: true,
            });
            setMessages((prev) => [...prev, message]);
        } catch (error) {
            console.error('Error saving voice message:', error);
            toast.error('Failed to save voice message');
        }
    };

    const handleFiles = async (files: File[]) => {
        console.log(
            'Starting handleFiles with:',
            files.map((f) => f.name)
        );
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

    const formatMessageContent = (message: MessageType): MessageContent => {
        if (message.message_type === 'text') {
            return {
                text: message.content,
            };
        }
        if (message.message_type === 'voice') {
            return {
                text: message.content,
                voice_url: message.voice_url,
            };
        }
        return {
            text: message.content,
            file_urls: message.file_urls,
            file_names: message.file_names,
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
