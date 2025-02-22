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
    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                    isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                }`}
            >
                {/* Text content */}
                {content.text && (
                    <div className="mb-2">
                        <TextMessage content={content.text} />
                    </div>
                )}

                {/* Voice message */}
                {content.voice_url && (
                    <div className="mb-2">
                        <AudioMessage
                            url={content.voice_url}
                            name="Voice Message"
                        />
                    </div>
                )}

                {/* File attachments */}
                {content.file_urls && content.file_urls.length > 0 && (
                    <div className="space-y-2">
                        {content.file_urls.map((url, index) => (
                            <FilePreview
                                key={`file-${index}`}
                                name={content.file_names?.[index] || 'File'}
                                url={url}
                            />
                        ))}
                    </div>
                )}

                <div className="text-xs mt-2 opacity-50">{timestamp}</div>
            </div>
        </div>
    );
};
