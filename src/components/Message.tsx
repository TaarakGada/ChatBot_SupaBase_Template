import React from 'react';
import { TextMessage } from './TextMessage';
import { MessageContent } from '../lib/supabase';
import { AudioMessage } from './AudioMessage';
import { FilePreview } from './FilePreview';

interface MessageProps {
    content: string | MessageContent;
    isUser: boolean;
    timestamp: string;
}

export const Message: React.FC<MessageProps> = ({
    content,
    isUser,
    timestamp,
}) => {
    const renderMessageContent = () => {
        if (typeof content === 'string') {
            return <TextMessage content={content} />;
        }

        switch (content.type) {
            case 'voice':
                return (
                    <AudioMessage
                        url={content.url!}
                        name="Voice Message"
                    />
                );
            case 'file':
                return (
                    <FilePreview
                        name={content.name!}
                        url={content.url!}
                    />
                );
            default:
                return <TextMessage content={content.text || ''} />;
        }
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
                {renderMessageContent()}
                <div className="text-xs mt-1 opacity-50">{timestamp}</div>
            </div>
        </div>
    );
};
