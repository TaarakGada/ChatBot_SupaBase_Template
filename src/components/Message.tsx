import React from 'react';
import { Copy, Volume2 } from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import toast from 'react-hot-toast';

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
        <Tooltip.Provider delayDuration={200}>
            <div
                className={`flex ${
                    isUser ? 'justify-end' : 'justify-start'
                } mb-4 animate-fadeIn`}
            >
                <div
                    className={`max-w-[70%] min-w-[15%] ${
                        isUser
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white'
                            : 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 text-gray-900 dark:text-white'
                    } p-4 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 backdrop-blur-sm
                border ${
                    isUser
                        ? 'border-blue-400/20'
                        : 'border-gray-200/20 dark:border-gray-700/20'
                }`}
                >
                    {renderContent()}
                    <div
                        className={`text-xs text-center flex items-center justify-between w-full ${
                            isUser ? 'text-blue-100' : 'text-gray-500'
                        } mt-2 opacity-75`}
                    >
                        <div>{timestamp}</div>
                        <div className="flex items-center justify-center gap-2">
                            {typeof content === 'string' && (
                                <>
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <button
                                                onClick={() =>
                                                    speakText(content)
                                                }
                                                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                                            >
                                                <Volume2
                                                    size={14}
                                                    className="text-gray-300 hover:text-white"
                                                />
                                            </button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content
                                                className="bg-black/75 text-white px-2 py-1 rounded text-xs"
                                                sideOffset={5}
                                            >
                                                Speak text
                                                <Tooltip.Arrow className="fill-black/75" />
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>

                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <button
                                                onClick={() =>
                                                    copyToClipboard(content)
                                                }
                                                className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                                            >
                                                <Copy
                                                    size={14}
                                                    className="text-gray-300 hover:text-white"
                                                />
                                            </button>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content
                                                className="bg-black/75 text-white px-2 py-1 rounded text-xs"
                                                sideOffset={5}
                                            >
                                                Copy to clipboard
                                                <Tooltip.Arrow className="fill-black/75" />
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Tooltip.Provider>
    );
};
