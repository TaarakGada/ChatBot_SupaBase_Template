import React from 'react';
import { Copy } from 'lucide-react';

interface MessageProps {
    content:
        | string
        | {
              type: 'audio' | 'file';
              url: string;
              name: string;
          };
    isUser: boolean;
    timestamp: string;
}

export const Message: React.FC<MessageProps> = ({
    content,
    isUser,
    timestamp,
}) => {
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const renderContent = () => {
        if (typeof content === 'string') {
            return (
                <div className="group relative">
                    <p className="break-words whitespace-pre-wrap text-sm">
                        {content}
                    </p>
                </div>
            );
        }

        if (content.type === 'audio') {
            return (
                <div className="audio-message">
                    <audio
                        controls
                        className="max-w-full"
                    >
                        <source
                            src={content.url}
                            type="audio/webm"
                        />
                        Your browser does not support the audio element.
                    </audio>
                </div>
            );
        }

        return (
            <div className="file-message p-2 bg-blue-50 dark:bg-gray-800 rounded">
                <a
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {content.name}
                </a>
            </div>
        );
    };

    return (
        <div
            className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
        >
            <div
                className={`max-w-[70%] min-w-[15%] ${
                    isUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                } p-3 rounded-lg shadow-md`}
            >
                {renderContent()}
                <div
                    className={`text-xs text-center flex items-center justify-between w-full ${
                        isUser ? 'text-blue-100' : 'text-gray-500'
                    } mt-2`}
                >
                    <div>{timestamp}</div>
                    <div className="flex items-center justify-center">
                        {typeof content == 'string' && (
                            <button
                                onClick={() => copyToClipboard(content)}
                                className="rounded text-gray-300 hover:text-white"
                            >
                                <Copy
                                    size={14}
                                    className="my-auto"
                                />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
