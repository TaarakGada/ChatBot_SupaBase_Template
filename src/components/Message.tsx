import React from 'react';
import { Copy, Volume2 } from 'lucide-react';
import * as TooltipProvider from '@radix-ui/react-tooltip';
import { Tooltip } from './common/Tooltip';
import toast from 'react-hot-toast';
import { AudioMessage } from './AudioMessage';
import { FilePreview } from './FilePreview';
import { TextMessage } from './TextMessage';

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
        toast.success('Copied to clipboard!');
    };

    const speakText = (text: string) => {
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
        toast.success('Speaking text...');
    };

    return (
        <TooltipProvider.Provider>
            <div
                className={`flex ${
                    isUser ? 'justify-end' : 'justify-start'
                } mb-4 animate-fadeIn`}
            >
                <div
                    className={`max-w-[70%] min-w-[240px] ${
                        isUser
                            ? 'bg-blue-500/20 backdrop-blur-sm border-blue-500/30 text-white'
                            : 'bg-neutral-100/10 backdrop-blur-sm border-neutral-200/10 text-neutral-100'
                    } p-4 rounded-2xl shadow-lg hover:shadow-xl border transition-all duration-300`}
                >
                    {typeof content === 'string' ? (
                        <TextMessage content={content} />
                    ) : content.type === 'audio' ? (
                        <AudioMessage
                            url={content.url}
                            name={content.name}
                        />
                    ) : (
                        <FilePreview name={content.name} />
                    )}

                    <div
                        className={`text-xs mt-2 flex items-center justify-between gap-2 ${
                            isUser ? 'text-blue-100' : 'text-gray-500'
                        }`}
                    >
                        <span className="opacity-75">{timestamp}</span>
                        {typeof content === 'string' && (
                            <div className="flex items-center gap-1">
                                {!isUser && (
                                    <Tooltip content="Speak text">
                                        <button
                                            onClick={() => speakText(content)}
                                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <Volume2
                                                size={14}
                                                className="text-white/70"
                                            />
                                        </button>
                                    </Tooltip>
                                )}
                                <Tooltip content="Copy to clipboard">
                                    <button
                                        onClick={() => copyToClipboard(content)}
                                        className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                    >
                                        <Copy
                                            size={14}
                                            className="text-white/70"
                                        />
                                    </button>
                                </Tooltip>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </TooltipProvider.Provider>
    );
};
