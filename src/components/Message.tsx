import React, { JSX } from 'react';
import {
    Copy,
    Volume2,
    FileIcon,
    Image as ImageIcon,
    Mic,
    PlayCircle,
} from 'lucide-react';
import * as TooltipProvider from '@radix-ui/react-tooltip';
import { Tooltip } from './common/Tooltip';
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

const AudioMessage = ({ url, name }: { url: string; name: string }) => (
    <div
        className="flex items-center gap-3 p-3 
                  bg-neutral-900/50 
                  border border-neutral-200/10
                  rounded-xl"
    >
        <PlayCircle
            size={24}
            className="text-blue-400 flex-shrink-0"
        />
        <div className="flex-grow min-w-0">
            <div className="text-sm truncate mb-1">{name}</div>
            <audio
                controls
                className="w-full max-w-[300px] h-8"
            >
                <source
                    src={url}
                    type="audio/webm"
                />
            </audio>
        </div>
    </div>
);

const VoiceRecordingPreview = ({ size }: { size: string }) => (
    <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg mb-2">
        <div className="flex items-center gap-2">
            <Mic
                size={18}
                className="text-blue-400"
            />
            <span className="text-sm text-white/70">Voice Recording</span>
        </div>
        <span className="text-xs text-white/50">{size}</span>
    </div>
);

const FilePreview = ({ name }: { name: string }) => {
    const isImage = name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const extension = name.split('.').pop()?.toUpperCase() || '';

    if (isImage) {
        return (
            <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                <ImageIcon
                    size={16}
                    className="text-blue-400"
                />
                <span className="text-sm text-white/70 truncate flex-1">
                    {name}
                </span>
                <span className="text-xs text-white/50">{extension}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
            <FileIcon
                size={16}
                className="text-blue-400"
            />
            <span className="text-sm text-white/70 truncate flex-1">
                {name}
            </span>
            <span className="text-xs text-white/50">{extension}</span>
        </div>
    );
};

const FileListPreview = ({ files }: { files: string[] }) => (
    <div className="space-y-2 mb-2">
        <div className="text-sm font-medium text-white/90 mb-2">Files</div>
        <div className="space-y-1">
            {files.map((file, idx) => (
                <FilePreview
                    key={idx}
                    name={file}
                />
            ))}
        </div>
    </div>
);

const TextMessage = ({ content }: { content: string }) => {
    const lines = content.split('\n');
    const messageContent: JSX.Element[] = [];
    let currentFiles: string[] = [];

    lines.forEach((line, index) => {
        if (line.startsWith('[Voice Recording:')) {
            const size =
                line.match(/\[(Voice Recording: .+)\]/)?.[1].split(': ')[1] ||
                '';
            messageContent.push(
                <VoiceRecordingPreview
                    key={`voice-${index}`}
                    size={size}
                />
            );
        } else if (line.startsWith('[Attached files:')) {
            currentFiles =
                line.match(/\[Attached files: (.+)\]/)?.[1].split(', ') || [];
            messageContent.push(
                <FileListPreview
                    key={`files-${index}`}
                    files={currentFiles}
                />
            );
        } else if (line.trim()) {
            messageContent.push(
                <p
                    key={index}
                    className="break-words whitespace-pre-wrap text-sm"
                >
                    {line}
                </p>
            );
        }
    });

    return <div className="space-y-2">{messageContent}</div>;
};

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
                    } p-4 rounded-2xl shadow-lg hover:shadow-xl 
                        border transition-all duration-300`}
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
