import React, { useState, useRef, useEffect } from 'react';
import { Mic, Send, Paperclip, Loader2, X } from 'lucide-react';
import * as TooltipProvider from '@radix-ui/react-tooltip';
import { Tooltip } from './common/Tooltip';
import toast from 'react-hot-toast';
import { tools } from '../constants/messageInput';
import { formatFileSize } from '../utils/fileUtils';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useFileHandling } from '../hooks/useFileHandling';
import RecordingIndicator from './RecordingIndicator';
import FileList from './FileList';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    onSendVoice: (blob: Blob) => void;
    onSendFiles: (files: File[]) => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    onSendVoice,
    onSendFiles,
}) => {
    const [message, setMessage] = useState('');
    const [showToolList, setShowToolList] = useState(false);
    const [filteredTools, setFilteredTools] = useState(tools);
    const [selectedToolIndex, setSelectedToolIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const {
        isRecording,
        recordingTime,
        voiceBlob,
        startRecording,
        stopRecording,
        setVoiceBlob,
    } = useAudioRecording();

    const {
        selectedFiles,
        setSelectedFiles,
        fileError,
        isFileListCollapsed,
        setIsFileListCollapsed,
        fileInputRef,
        handleFileSelection,
    } = useFileHandling();

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

    const handleCombinedSubmission = async () => {
        if (!message.trim() && !voiceBlob && selectedFiles.length === 0) {
            toast.error('Please provide a message, voice recording, or files');
            return;
        }

        setIsLoading(true);

        try {
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

    return (
        <TooltipProvider.Provider>
            <div className="fixed bottom-0 left-0 right-0 p-6 z-10">
                <RecordingIndicator
                    isRecording={isRecording}
                    recordingTime={recordingTime}
                    stopRecording={stopRecording}
                />

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

                <FileList
                    selectedFiles={selectedFiles}
                    fileError={fileError}
                    isFileListCollapsed={isFileListCollapsed}
                    setIsFileListCollapsed={setIsFileListCollapsed}
                    setSelectedFiles={setSelectedFiles}
                />

                <div className="relative max-w-[50%] mx-auto">
                    <div
                        className="relative bg-neutral-900/50 
                      backdrop-blur-xl backdrop-saturate-150 
                      border border-neutral-200/10
                      rounded-2xl shadow-xl overflow-hidden"
                    >
                        <div className="w-full px-4 pt-4 pb-2">
                            <textarea
                                ref={textareaRef}
                                value={message}
                                onChange={handleChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Type a message..."
                                className="w-full bg-transparent px-4 pt-4
                         text-white placeholder-neutral-400
                         focus:outline-none"
                                style={{ overflow: 'hidden' }}
                            />
                        </div>

                        <div
                            className="flex items-center gap-2 px-3 py-3 
                          border-t border-neutral-200/10
                          bg-neutral-900/50"
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) =>
                                    handleFileSelection(e.target.files)
                                }
                                className="hidden"
                                multiple
                            />
                            <Tooltip content="Attach files">
                                <button
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className="p-2.5 text-neutral-400 
                               hover:bg-neutral-800 hover:text-neutral-200 
                               rounded-xl transition-colors"
                                >
                                    <Paperclip
                                        size={20}
                                        className="text-white/70"
                                    />
                                </button>
                            </Tooltip>

                            <Tooltip
                                content={
                                    isRecording
                                        ? 'Stop recording'
                                        : 'Start recording'
                                }
                            >
                                <button
                                    onClick={
                                        !isRecording
                                            ? startRecording
                                            : stopRecording
                                    }
                                    className="p-2.5 text-neutral-400 
                               hover:bg-neutral-800 hover:text-neutral-200 
                               rounded-xl transition-colors"
                                >
                                    <Mic
                                        size={20}
                                        className="text-white/70"
                                    />
                                </button>
                            </Tooltip>

                            <div className="flex-grow" />
                            <Tooltip
                                content={
                                    isLoading ? 'Processing...' : 'Send message'
                                }
                            >
                                <button
                                    onClick={handleSend}
                                    disabled={isLoading}
                                    className={`p-2.5 ${
                                        isLoading
                                            ? 'bg-blue-400/50 cursor-not-allowed'
                                            : 'bg-blue-500/80 hover:bg-blue-600/80'
                                    } rounded-xl text-white shadow-sm transition-all duration-200`}
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
                            </Tooltip>
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
        </TooltipProvider.Provider>
    );
};

export default MessageInput;
