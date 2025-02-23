import React from 'react';
import { Copy, Volume2 } from 'lucide-react';
import { TextMessage } from './TextMessage';
import { MessageContent } from '../lib/supabase';
import { AudioMessage } from './AudioMessage';
import { FilePreview } from './FilePreview';
import {
    copyToClipboard,
    speakText,
    formatTimestamp,
} from '../utils/messageUtils';
import { Tooltip } from './Tooltip';
import toast from 'react-hot-toast';

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
    const handleCopy = async () => {
        const textToCopy = content.text || '';
        const success = await copyToClipboard(textToCopy);
        if (success) {
            toast.success('Copied to clipboard');
        } else {
            toast.error('Failed to copy');
        }
    };

    const handleSpeak = () => {
        if (content.text) {
            speakText(content.text);
        }
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[70%] min-w-[15%] rounded-2xl px-4 py-3 ${
                    isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                }`}
            >
                <div className="space-y-2">
                    {/* Always show text content if it exists */}
                    {content.text && <TextMessage content={content.text} />}

                    {/* Show voice message if it exists */}
                    {content.voice_url && (
                        <AudioMessage
                            url={content.voice_url}
                            name="Voice Message"
                        />
                    )}

                    {/* Show file attachments if they exist */}
                    {((content.file_urls?.length ?? 0) > 0 ||
                        (content.files?.length ?? 0) > 0) && (
                        <div className="space-y-2">
                            {/* Handle file_urls array */}
                            {content.file_urls?.map((url, index) => (
                                <FilePreview
                                    key={`file-url-${index}`}
                                    name={content.file_names?.[index] || 'File'}
                                    url={url}
                                />
                            ))}
                            {/* Handle files array */}
                            {content.files?.map((file, index) => (
                                <FilePreview
                                    key={`file-${index}`}
                                    name={file.name}
                                    url={file.url}
                                />
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-between text-xs mt-2 opacity-50 hover:opacity-100 transition-opacity">
                        <span>{formatTimestamp(timestamp)}</span>
                        <div className="flex gap-2">
                            <Tooltip content="Copy message">
                                <button
                                    onClick={handleCopy}
                                    className="p-1 hover:bg-black/10 rounded"
                                >
                                    <Copy size={12} />
                                </button>
                            </Tooltip>
                            {!isUser && (
                                <Tooltip content="Speak message">
                                    <button
                                        onClick={handleSpeak}
                                        className="p-1 hover:bg-black/10 rounded"
                                    >
                                        <Volume2 size={12} />
                                    </button>
                                </Tooltip>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
