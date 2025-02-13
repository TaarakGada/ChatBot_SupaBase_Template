import React, { useState, useRef, useEffect } from 'react';
import {
    Mic,
    Send,
    Paperclip,
    X,
    FileIcon,
    Image as ImageIcon,
    ChevronUp,
    ChevronDown,
    Loader2,
} from 'lucide-react';
import * as Tooltip from '@radix-ui/react-tooltip';
import toast from 'react-hot-toast';
import { sendToAI } from '../services/api';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    onSendVoice: (blob: Blob) => void;
    onSendFiles: (files: File[]) => void;
}

const tools = [
    { id: 'websearch', icon: '🔍', name: 'Web Search' },
    { id: 'calculator', icon: '🧮', name: 'Calculator' },
    { id: 'translator', icon: '🌐', name: 'Translator' },
    { id: 'weather', icon: '🌤', name: 'Weather' },
    { id: 'news', icon: '📰', name: 'News' },
    { id: 'todo', icon: '✓', name: 'Todo' },
    { id: 'reminder', icon: '⏰', name: 'Reminder' },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB per file
const MAX_TOTAL_SIZE = 8 * 1024 * 1024; // 8MB total

export const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    onSendVoice,
    onSendFiles,
}) => {
    const [message, setMessage] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [showToolList, setShowToolList] = useState(false);
    const [filteredTools, setFilteredTools] = useState(tools);
    const [selectedToolIndex, setSelectedToolIndex] = useState(0);
    const [isFileListCollapsed, setIsFileListCollapsed] = useState(false);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [voiceBlob, setVoiceBlob] = useState<Blob | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(
                200,
                textareaRef.current.scrollHeight
            )}px`;
        }
    }, [message]);

    useEffect(() => {
        const atIndex = message.lastIndexOf('@');
        if (atIndex !== -1) {
            const query = message.substring(atIndex + 1).toLowerCase();
            const matches = tools.filter(
                (tool) =>
                    tool.name.toLowerCase().startsWith(query) ||
                    tool.id.toLowerCase().startsWith(query)
            );
            setFilteredTools(matches);
            if (matches.length > 0) {
                setShowToolList(true);
            } else {
                setShowToolList(false);
            }
        } else {
            setShowToolList(false);
        }
    }, [message]);

    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return (
                <ImageIcon
                    size={16}
                    className="text-blue-400"
                />
            );
        }
        return (
            <FileIcon
                size={16}
                className="text-gray-400"
            />
        );
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
            });
            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (e) => {
                chunksRef.current.push(e.data);
            };
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, {
                    type: 'audio/webm',
                });
                setVoiceBlob(audioBlob); // Store the blob instead of sending immediately
                chunksRef.current = [];
                stream.getTracks().forEach((track) => track.stop());
            };
            mediaRecorderRef.current.start();
            setIsRecording(true);
            timerRef.current = window.setInterval(
                () => setRecordingTime((prev) => prev + 1),
                1000
            );
        } catch (err) {
            console.error('Error accessing microphone:', err);
            toast.error('Failed to access microphone');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            setRecordingTime(0);
            if (timerRef.current !== null) {
                clearInterval(timerRef.current);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey && !showToolList) {
            e.preventDefault();
            handleSend();
        } else if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            setMessage((prev) => prev + '\n');
        } else if (showToolList) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedToolIndex(
                    (prev) => (prev + 1) % filteredTools.length
                );
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedToolIndex(
                    (prev) =>
                        (prev - 1 + filteredTools.length) % filteredTools.length
                );
            } else if (e.key === 'Tab' || e.key === 'Enter') {
                e.preventDefault();
                insertTool(filteredTools[selectedToolIndex].id);
            } else if (e.key === 'Escape') {
                setShowToolList(false);
            }
        }
    };

    const insertTool = (toolId: string) => {
        const atIndex = message.lastIndexOf('@');
        if (atIndex !== -1) {
            // Get everything before the @ symbol
            const beforeAt = message.substring(0, atIndex);

            // Get everything after the current tool query
            // Find the first space or end of string after the @ symbol
            const afterQueryIndex = message.indexOf(' ', atIndex);
            const afterQuery =
                afterQueryIndex !== -1
                    ? message.substring(afterQueryIndex)
                    : '';

            // Set the new message with the tool inserted
            setMessage(beforeAt + `@${toolId}` + afterQuery);
        }
        setShowToolList(false);
    };

    const validateFiles = (
        files: File[]
    ): { valid: boolean; error?: string } => {
        let totalSize = 0;

        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                return {
                    valid: false,
                    error: `File ${file.name} exceeds 5MB limit`,
                };
            }
            totalSize += file.size;
        }

        if (totalSize > MAX_TOTAL_SIZE) {
            return {
                valid: false,
                error: 'Total file size exceeds 8MB limit',
            };
        }

        return { valid: true };
    };

    const handleCombinedSubmission = async () => {
        if (!message.trim() && !voiceBlob && selectedFiles.length === 0) {
            toast.error('Please provide a message, voice recording, or files');
            return;
        }

        setIsLoading(true);

        try {
            // Create user message summary
            const userContent = [
                message.trim() && `${message.trim()}`,
                voiceBlob &&
                    `[Voice Recording: ${formatFileSize(voiceBlob.size)}]`,
                selectedFiles.length > 0 &&
                    `[Attached files: ${selectedFiles
                        .map((f) => f.name)
                        .join(', ')}]`,
            ]
                .filter(Boolean)
                .join('\n');

            // Send to parent component
            onSendMessage(userContent);

            // Clear all inputs
            setMessage('');
            setVoiceBlob(null);
            setSelectedFiles([]);
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        } catch (error) {
            toast.error('Failed to send message');
            console.error('Error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSend = () => {
        if (isLoading) return;
        handleCombinedSubmission();
    };

    // Function to check if file already exists in selected files
    const isFileAlreadySelected = (newFile: File) => {
        return selectedFiles.some(
            (file) => file.name === newFile.name && file.size === newFile.size
        );
    };

    // Function to handle file selection
    const handleFileSelection = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        const uniqueNewFiles = newFiles.filter(
            (file) => !isFileAlreadySelected(file)
        );

        if (uniqueNewFiles.length === 0) {
            setFileError('Selected files are already added');
            setTimeout(() => setFileError(null), 3000);
            return;
        }

        // Validate all files including existing ones
        const allFiles = [...selectedFiles, ...uniqueNewFiles];
        const validation = validateFiles(allFiles);

        if (!validation.valid) {
            setFileError(validation.error || null);
            setTimeout(() => setFileError(null), 3000);
            return;
        }

        setSelectedFiles(allFiles);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Tooltip.Provider delayDuration={200}>
            <div className="fixed bottom-0 left-0 right-0 p-6 z-10">
                {isRecording && (
                    <div className="absolute z-20 bottom-24 left-1/2 transform -translate-x-1/2 bg-black/20 backdrop-blur-xl p-4 rounded-2xl shadow-lg border border-white/10">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-3 bg-red-500 rounded-full animate-ping" />
                            <span className="text-white font-medium">
                                Recording: {recordingTime}s
                            </span>
                            <button
                                onClick={stopRecording}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors duration-200"
                            >
                                <X
                                    size={20}
                                    className="text-white"
                                />
                            </button>
                        </div>
                    </div>
                )}

                {voiceBlob && !isRecording && (
                    <div className="max-w-[50%] mx-auto mb-4">
                        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/70">
                                    Voice Recording Ready
                                </span>
                                <button
                                    onClick={() => setVoiceBlob(null)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200"
                                >
                                    <X
                                        size={14}
                                        className="text-white/70"
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {selectedFiles.length > 0 && (
                    <div className="max-w-[50%] mx-auto mb-4">
                        <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg">
                            <div className="flex items-center justify-between p-3">
                                <div className="flex-1 flex items-center justify-between px-2">
                                    <Tooltip.Root>
                                        <Tooltip.Trigger asChild>
                                            <div
                                                className="flex items-center gap-2 cursor-pointer"
                                                onClick={() =>
                                                    setIsFileListCollapsed(
                                                        !isFileListCollapsed
                                                    )
                                                }
                                            >
                                                <span className="text-sm text-white/70 font-medium">
                                                    Selected Files (
                                                    {selectedFiles.length})
                                                </span>
                                                {isFileListCollapsed ? (
                                                    <ChevronUp
                                                        size={16}
                                                        className="text-white/50"
                                                    />
                                                ) : (
                                                    <ChevronDown
                                                        size={16}
                                                        className="text-white/50"
                                                    />
                                                )}
                                            </div>
                                        </Tooltip.Trigger>
                                        <Tooltip.Portal>
                                            <Tooltip.Content
                                                className="bg-black/75 text-white px-2 py-1 rounded text-xs z-[9999]"
                                                sideOffset={5}
                                            >
                                                {isFileListCollapsed
                                                    ? 'Expand file list'
                                                    : 'Collapse file list'}
                                                <Tooltip.Arrow className="fill-black/75" />
                                            </Tooltip.Content>
                                        </Tooltip.Portal>
                                    </Tooltip.Root>
                                    {fileError && (
                                        <span className="text-xs text-red-400">
                                            {fileError}
                                        </span>
                                    )}
                                </div>
                                <Tooltip.Root>
                                    <Tooltip.Trigger asChild>
                                        <button
                                            onClick={() => setSelectedFiles([])}
                                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200"
                                        >
                                            <X
                                                size={14}
                                                className="text-white/70"
                                            />
                                        </button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Portal>
                                        <Tooltip.Content
                                            className="bg-black/75 text-white px-2 py-1 rounded text-xs z-[9999]"
                                            sideOffset={5}
                                        >
                                            Clear all files
                                            <Tooltip.Arrow className="fill-black/75" />
                                        </Tooltip.Content>
                                    </Tooltip.Portal>
                                </Tooltip.Root>
                            </div>

                            <div
                                className={`transition-all duration-300 ease-in-out overflow-hidden
                                ${
                                    isFileListCollapsed
                                        ? 'max-h-0'
                                        : 'max-h-[40vh]'
                                }`}
                            >
                                <div
                                    className="p-3 overflow-y-auto custom-scrollbar"
                                    style={{ maxHeight: '35vh' }}
                                >
                                    <div className="grid grid-cols-2 gap-2">
                                        {selectedFiles.map((file, index) => (
                                            <div
                                                key={`${file.name}-${file.size}-${index}`}
                                                className="flex items-center gap-2 bg-white/5 rounded-lg p-2 group"
                                            >
                                                {getFileIcon(file)}
                                                <div className="flex-1 min-w-0">
                                                    <Tooltip.Root>
                                                        <Tooltip.Trigger
                                                            asChild
                                                        >
                                                            <div className="text-sm text-white truncate">
                                                                {file.name}
                                                            </div>
                                                        </Tooltip.Trigger>
                                                        <Tooltip.Portal>
                                                            <Tooltip.Content
                                                                className="bg-black/75 text-white px-2 py-1 rounded text-xs z-[9999] max-w-md"
                                                                sideOffset={5}
                                                            >
                                                                {file.name}
                                                                <Tooltip.Arrow className="fill-black/75" />
                                                            </Tooltip.Content>
                                                        </Tooltip.Portal>
                                                    </Tooltip.Root>
                                                    <div className="text-xs text-white/50">
                                                        {formatFileSize(
                                                            file.size
                                                        )}
                                                    </div>
                                                </div>
                                                <Tooltip.Root>
                                                    <Tooltip.Trigger asChild>
                                                        <button
                                                            onClick={() =>
                                                                setSelectedFiles(
                                                                    (prev) =>
                                                                        prev.filter(
                                                                            (
                                                                                _,
                                                                                i
                                                                            ) =>
                                                                                i !==
                                                                                index
                                                                        )
                                                                )
                                                            }
                                                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 
                                                            rounded-lg transition-all duration-200"
                                                        >
                                                            <X
                                                                size={14}
                                                                className="text-white/70"
                                                            />
                                                        </button>
                                                    </Tooltip.Trigger>
                                                    <Tooltip.Portal>
                                                        <Tooltip.Content
                                                            className="bg-black/75 text-white px-2 py-1 rounded text-xs z-[9999]"
                                                            sideOffset={5}
                                                        >
                                                            Remove file
                                                            <Tooltip.Arrow className="fill-black/75" />
                                                        </Tooltip.Content>
                                                    </Tooltip.Portal>
                                                </Tooltip.Root>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="relative max-w-[50%] mx-auto">
                    <div className="relative bg-black/20 backdrop-blur-xl backdrop-saturate-150 border border-white/10 rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
                        <div className="w-full px-4 pt-4 pb-2">
                            <textarea
                                ref={textareaRef}
                                value={message}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="w-full bg-transparent text-white placeholder-white/50 focus:outline-none resize-none min-h-[24px] max-h-[200px] transition-all duration-200"
                                style={{ overflow: 'hidden' }}
                            />
                        </div>

                        <div className="flex items-center gap-2 px-2 py-2 border-t border-white/10">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) =>
                                    handleFileSelection(e.target.files)
                                }
                                className="hidden"
                                multiple
                            />
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={() =>
                                            fileInputRef.current?.click()
                                        }
                                        className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
                                    >
                                        <Paperclip
                                            size={20}
                                            className="text-white/70"
                                        />
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        className="bg-black/75 text-white px-2 py-1 rounded text-xs z-[9999]"
                                        sideOffset={5}
                                    >
                                        Attach files
                                        <Tooltip.Arrow className="fill-black/75" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>

                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={
                                            !isRecording
                                                ? startRecording
                                                : stopRecording
                                        }
                                        className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
                                    >
                                        <Mic
                                            size={20}
                                            className="text-white/70"
                                        />
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        className="bg-black/75 text-white px-2 py-1 rounded text-xs z-[9999]"
                                        sideOffset={5}
                                    >
                                        {isRecording
                                            ? 'Stop recording'
                                            : 'Start recording'}
                                        <Tooltip.Arrow className="fill-black/75" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>

                            <div className="flex-grow" />
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <button
                                        onClick={handleSend}
                                        disabled={isLoading}
                                        className={`p-2 ${
                                            isLoading
                                                ? 'bg-blue-400 cursor-not-allowed'
                                                : 'bg-blue-600 hover:bg-blue-700'
                                        } rounded-xl transition-colors duration-200`}
                                    >
                                        {isLoading ? (
                                            <Loader2
                                                size={20}
                                                className="text-white animate-spin"
                                            />
                                        ) : (
                                            <Send
                                                size={20}
                                                className="text-white"
                                            />
                                        )}
                                    </button>
                                </Tooltip.Trigger>
                                <Tooltip.Portal>
                                    <Tooltip.Content
                                        className="bg-black/75 text-white px-2 py-1 rounded text-xs z-[9999]"
                                        sideOffset={5}
                                    >
                                        {isLoading
                                            ? 'Processing...'
                                            : 'Send message'}
                                        <Tooltip.Arrow className="fill-black/75" />
                                    </Tooltip.Content>
                                </Tooltip.Portal>
                            </Tooltip.Root>
                        </div>
                    </div>

                    {showToolList && (
                        <div className="absolute bottom-full left-2 mb-2 w-64 bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden transition-all duration-200">
                            <div className="py-1">
                                {filteredTools.map((tool, index) => (
                                    <button
                                        key={tool.id}
                                        className={`w-full px-4 py-2 flex items-center gap-3 text-left text-white transition-colors duration-200 ${
                                            index === selectedToolIndex
                                                ? 'bg-white/10'
                                                : 'hover:bg-white/5'
                                        }`}
                                        onClick={() => insertTool(tool.id)}
                                    >
                                        <span className="text-lg">
                                            {tool.icon}
                                        </span>
                                        <span className="flex-1">
                                            {tool.name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Tooltip.Provider>
    );
};

export default MessageInput;
