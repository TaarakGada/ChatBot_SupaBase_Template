import React from 'react';
import { TextMessage } from './TextMessage';
import { MessageProps } from '../types/message';

export const Message: React.FC<MessageProps> = ({
    content,
    isUser,
    timestamp,
}) => {
    const messageContent =
        typeof content === 'string' ? content : content.text || '';
    const uniqueKey = `message-${timestamp}-${isUser ? 'user' : 'ai'}`;

    return (
        <div
            key={uniqueKey}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                    isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                }`}
            >
                <TextMessage
                    key={`text-${uniqueKey}`}
                    content={messageContent}
                />
                <div className="text-xs mt-1 opacity-50">{timestamp}</div>
            </div>
        </div>
    );
};
