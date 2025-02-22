import React from 'react';
import { TextMessage } from './TextMessage';
import { MessageContent } from '../lib/supabase';
import { AudioMessage } from './AudioMessage';
import { FilePreview } from './FilePreview';

interface MessageProps {
    content: MessageContent;
    isUser: boolean;
    timestamp: string;
}

export const Message: React.FC<MessageProps> = ({
    content,
    isUser,
    timestamp,
}) => {
    const renderContent = () => {
        const elements = [];

        // Add text content if exists
        if (content.text) {
            elements.push(
                <TextMessage
                    key="text"
                    content={content.text}
                />
            );
        }

        // Add voice message if exists
        if (content.voice_url) {
            elements.push(
                <AudioMessage
                    key="voice"
                    url={content.voice_url}
                    name="Voice Message"
                />
            );
        }

        // Add files if they exist
        if (content.file_urls && content.file_urls.length > 0) {
            content.file_urls.forEach((url, index) => {
                elements.push(
                    <FilePreview
                        key={`file-${index}`}
                        name={content.file_names?.[index] || 'File'}
                        url={url}
                    />
                );
            });
        }

        return elements.length > 0 ? (
            <div className="space-y-2">{elements}</div>
        ) : null;
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                }`}
            >
                {renderContent()}
                <div className="text-xs mt-1 opacity-50">{timestamp}</div>
            </div>
        </div>
    );
};
