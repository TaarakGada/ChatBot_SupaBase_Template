import React from 'react';
import {
    Copy,
    Volume2,
    FileIcon,
    PlayCircle,
    Download,
    Image as ImageIcon,
    Mic,
} from 'lucide-react';
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

const AudioMessage = ({ url, name }: { url: string; name: string }) => (
    <div className="flex items-center gap-3 p-2 bg-black/20 rounded-lg">
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

const FileMessage = ({ url, name }: { url: string; name: string }) => {
    const isImage = name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    return isImage ? (
        <div className="flex flex-col gap-2">
            <img
                src={url}
                alt={name}
                className="max-w-[300px] rounded-lg shadow-lg"
            />
            <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                <div className="flex items-center gap-2">
                    <ImageIcon
                        size={16}
                        className="text-blue-400"
                    />
                    <span className="text-sm truncate">{name}</span>
                </div>
                <DownloadButton
                    url={url}
                    name={name}
                />
            </div>
        </div>
    ) : (
        <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg group max-w-[300px]">
            <FileIcon
                size={24}
                className="text-blue-400 flex-shrink-0"
            />
            <div className="flex-grow min-w-0">
                <div className="text-sm truncate">{name}</div>
            </div>
            <DownloadButton
                url={url}
                name={name}
            />
        </div>
    );
};

const DownloadButton = ({ url, name }: { url: string; name: string }) => (
    <Tooltip.Root>
        <Tooltip.Trigger asChild>
            <a
                href={url}
                download={name}
                className="p-1.5 opacity-70 hover:opacity-100 hover:bg-white/10 rounded-lg transition-all duration-200"
            >
                <Download
                    size={16}
                    className="text-white"
                />
            </a>
        </Tooltip.Trigger>
        <Tooltip.Portal>
            <Tooltip.Content
                className="bg-black/75 text-white px-2 py-1 rounded text-xs z-[9999]"
                sideOffset={5}
            >
                Download file
                <Tooltip.Arrow className="fill-black/75" />
            </Tooltip.Content>
        </Tooltip.Portal>
    </Tooltip.Root>
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

const FilePreview = ({ name, type }: { name: string; type: string }) => {
    const isImage = name.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    if (isImage) {
        return (
            <div className="flex flex-col gap-2 mb-2">
                <div className="relative group">
                    <img
                        src={`/path/to/images/${name}`}
                        alt={name}
                        className="max-w-[300px] rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center">
                        <Download
                            size={24}
                            className="text-white"
                        />
                    </div>
                </div>
                <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <ImageIcon
                            size={16}
                            className="text-blue-400"
                        />
                        <span className="text-sm truncate">{name}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 p-3 bg-black/20 rounded-lg mb-2">
            <FileIcon
                size={18}
                className="text-blue-400"
            />
            <div className="flex-1 min-w-0">
                <div className="text-sm truncate">{name}</div>
                <div className="text-xs text-white/50">{type}</div>
            </div>
            <Tooltip.Root>
                <Tooltip.Trigger asChild>
                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                        <Download
                            size={16}
                            className="text-white/70"
                        />
                    </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                    <Tooltip.Content
                        className="bg-black/75 text-white px-2 py-1 rounded text-xs"
                        sideOffset={5}
                    >
                        Download file
                        <Tooltip.Arrow className="fill-black/75" />
                    </Tooltip.Content>
                </Tooltip.Portal>
            </Tooltip.Root>
        </div>
    );
};

const TextMessage = ({ content }: { content: string }) => {
    const lines = content.split('\n');
    return (
        <div className="space-y-2">
            {lines.map((line, index) => {
                if (line.startsWith('[Voice Recording:')) {
                    const size =
                        line
                            .match(/\[(Voice Recording: .+)\]/)?.[1]
                            .split(': ')[1] || '';
                    return (
                        <VoiceRecordingPreview
                            key={index}
                            size={size}
                        />
                    );
                }
                if (line.startsWith('[Attached files:')) {
                    const files =
                        line
                            .match(/\[Attached files: (.+)\]/)?.[1]
                            .split(', ') || [];
                    return (
                        <div key={index}>
                            {files.map((file, idx) => (
                                <FilePreview
                                    key={idx}
                                    name={file}
                                    type={
                                        file.split('.').pop()?.toUpperCase() ||
                                        ''
                                    }
                                />
                            ))}
                        </div>
                    );
                }
                return (
                    <p
                        key={index}
                        className="break-words whitespace-pre-wrap text-sm"
                    >
                        {line}
                    </p>
                );
            })}
        </div>
    );
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
        <Tooltip.Provider delayDuration={200}>
            <div
                className={`flex ${
                    isUser ? 'justify-end' : 'justify-start'
                } mb-4 animate-fadeIn`}
            >
                <div
                    className={`max-w-[70%] min-w-[240px] ${
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
                    {typeof content === 'string' ? (
                        <TextMessage content={content} />
                    ) : content.type === 'audio' ? (
                        <AudioMessage
                            url={content.url}
                            name={content.name}
                        />
                    ) : (
                        <FileMessage
                            url={content.url}
                            name={content.name}
                        />
                    )}

                    <div
                        className={`text-xs mt-2 flex items-center justify-between gap-2 ${
                            isUser ? 'text-blue-100' : 'text-gray-500'
                        }`}
                    >
                        <span className="opacity-75">{timestamp}</span>
                        {typeof content === 'string' && (
                            <div className="flex items-center gap-1">
                                {!isUser && ( // Only show speak button for AI messages
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <button
                                                onClick={() =>
                                                    speakText(content)
                                                }
                                                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                            >
                                                <Volume2
                                                    size={14}
                                                    className="text-white/70"
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
                                )}
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <button
                                            onClick={() =>
                                                copyToClipboard(content)
                                            }
                                            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                                        >
                                            <Copy
                                                size={14}
                                                className="text-white/70"
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Tooltip.Provider>
    );
};
