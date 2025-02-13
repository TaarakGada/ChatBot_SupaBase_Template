import React, { useState, useRef, useEffect } from 'react';
import {
    Mic,
    Send,
    Paperclip,
    X,
    FileIcon,
    Image as ImageIcon,
} from 'lucide-react';

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
                onSendVoice(audioBlob);
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

    const handleSend = () => {
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
            }
        }
        if (selectedFiles.length > 0) {
            onSendFiles(selectedFiles);
            setSelectedFiles([]);
        }
        setShowToolList(false);
    };

    return (
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

            {selectedFiles.length > 0 && (
                <div className="max-w-[50%] mx-auto mb-4]">
                    <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl p-3 space-y-2">
                        <div className="text-sm text-white/70 font-medium px-2">
                            Selected Files ({selectedFiles.length})
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={file.name + file.size}
                                    className="flex items-center gap-2 bg-white/5 rounded-lg p-2 group"
                                >
                                    {getFileIcon(file)}
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-white truncate">
                                            {file.name}
                                        </div>
                                        <div className="text-xs text-white/50">
                                            {formatFileSize(file.size)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() =>
                                            setSelectedFiles((prev) =>
                                                prev.filter(
                                                    (_, i) => i !== index
                                                )
                                            )
                                        }
                                        className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 rounded-lg transition-all duration-200"
                                    >
                                        <X
                                            size={14}
                                            className="text-white/70"
                                        />
                                    </button>
                                </div>
                            ))}
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
                                setSelectedFiles(
                                    Array.from(e.target.files || [])
                                )
                            }
                            className="hidden"
                            multiple
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
                        >
                            <Paperclip
                                size={20}
                                className="text-white/70"
                            />
                        </button>
                        <button
                            onClick={
                                !isRecording ? startRecording : stopRecording
                            }
                            className="p-2 hover:bg-white/10 rounded-xl transition-colors duration-200"
                        >
                            <Mic
                                size={20}
                                className="text-white/70"
                            />
                        </button>
                        <div className="flex-grow" />
                        <button
                            onClick={handleSend}
                            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors duration-200"
                        >
                            <Send
                                size={20}
                                className="text-white"
                            />
                        </button>
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
                                    <span className="text-lg">{tool.icon}</span>
                                    <span className="flex-1">{tool.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessageInput;
