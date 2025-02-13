import React from 'react';
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
    return (
        <div className="flex flex-col h-full w-7/12 max-h-[80%]">
            <div className="flex-grow overflow-y-auto p-16">
                {messages.map((message) => (
                    <Message
                        key={message.id}
                        content={message.content}
                        isUser={message.isUser}
                        timestamp={message.timestamp}
                    />
                ))}
            </div>
            <MessageInput
                onSendMessage={onSendMessage}
                onSendVoice={onSendVoice}
                onSendFiles={onSendFiles}
            />
        </div>
    );
};
