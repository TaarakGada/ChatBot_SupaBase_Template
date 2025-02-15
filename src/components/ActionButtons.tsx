import React from 'react';
import { Mic, Send, Paperclip, Loader2 } from 'lucide-react';
import { Tooltip } from './common/Tooltip';
import { ActionButtonsProps } from '../types/messageInput';

export const ActionButtons: React.FC<ActionButtonsProps> = ({
    isLoading,
    isRecording,
    handleSend,
    startRecording,
    stopRecording,
    onFileClick,
}) => {
    return (
        <div className="flex items-center gap-2 px-3 py-3 border-t border-neutral-200/10 bg-neutral-900/50">
            <Tooltip content="Attach files">
                <button
                    onClick={onFileClick}
                    className="p-2.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 rounded-xl transition-colors"
                >
                    <Paperclip
                        size={20}
                        className="text-white/70"
                    />
                </button>
            </Tooltip>

            <Tooltip
                content={isRecording ? 'Stop recording' : 'Start recording'}
            >
                <button
                    onClick={!isRecording ? startRecording : stopRecording}
                    className="p-2.5 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 rounded-xl transition-colors"
                >
                    <Mic
                        size={20}
                        className="text-white/70"
                    />
                </button>
            </Tooltip>

            <div className="flex-grow" />

            <Tooltip content={isLoading ? 'Processing...' : 'Send message'}>
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
    );
};
