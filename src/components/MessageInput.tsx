import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Tooltip } from './Tooltip';
import { tools } from '../constants/messageInput';
import { formatFileSize } from '../utils/fileUtils';
import { useAudioRecording } from '../hooks/useAudioRecording';
import { useFileHandling } from '../hooks/useFileHandling';
import { MessageInputProps } from '../types/messageInput';
import { ActionButtons } from './ActionButtons';
import { ToolList } from './ToolList';
import RecordingIndicator from './RecordingIndicator';
import FileList from './FileList';

export const MessageInput: React.FC<MessageInputProps> = ({
    onSendMessage,
    onSendVoice,
    onSendFiles,
    isLoading = false, // Add default value
}) => {
    const [message, setMessage] = useState('');
    const [showToolList, setShowToolList] = useState(false);
    const [filteredTools, setFilteredTools] = useState(tools);
    const [selectedToolIndex, setSelectedToolIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
        fileInputRef: _,
        handleFileSelection: __,
    } = useFileHandling();

    const handleFileSelection = (files: FileList | null) => {
        if (files) {
            const fileArray = Array.from(files);
            setSelectedFiles((prev) => [...prev, ...fileArray]);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset the input
            }
        }
    };

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

        if (isLoading) return; // Add this check

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

            // Pass both content and files to onSendMessage
            onSendMessage(userContent, selectedFiles);

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
        }
    };

    const handleSend = () => {
        if (isLoading) return;
        handleCombinedSubmission();
    };

    return (
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
                            <Tooltip content="Clear recording">
                                <button
                                    onClick={() => setVoiceBlob(null)}
                                    className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200"
                                >
                                    <X
                                        size={14}
                                        className="text-white/70"
                                    />
                                </button>
                            </Tooltip>
                        </div>
                    </div>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileSelection(e.target.files)}
                className="hidden"
                multiple
            />

            <FileList
                selectedFiles={selectedFiles}
                fileError={fileError}
                isFileListCollapsed={isFileListCollapsed}
                setIsFileListCollapsed={setIsFileListCollapsed}
                setSelectedFiles={setSelectedFiles}
            />

            <div className="relative max-w-[50%] mx-auto">
                <div className="relative bg-neutral-900/50 backdrop-blur-xl backdrop-saturate-150 border border-neutral-200/10 rounded-2xl shadow-xl overflow-hidden">
                    <div className="w-full px-4 pt-4 pb-2">
                        <textarea
                            ref={textareaRef}
                            value={message}
                            onChange={handleChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type a message..."
                            className="w-full bg-transparent px-4 pt-4 text-white placeholder-neutral-400 focus:outline-none"
                            style={{ overflow: 'hidden' }}
                        />
                    </div>

                    <ActionButtons
                        isLoading={isLoading}
                        isRecording={isRecording}
                        handleSend={handleSend}
                        startRecording={startRecording}
                        stopRecording={stopRecording}
                        onFileClick={() => fileInputRef.current?.click()}
                    />
                </div>

                <ToolList
                    message={message}
                    showToolList={showToolList}
                    selectedToolIndex={selectedToolIndex}
                    filteredTools={filteredTools}
                    onToolSelect={insertTool}
                />
            </div>
        </div>
    );
};

export default MessageInput;
