import React from 'react';
import { X } from 'lucide-react';

interface RecordingIndicatorProps {
    isRecording: boolean;
    recordingTime: number;
    stopRecording: () => void;
}

const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
    isRecording,
    recordingTime,
    stopRecording,
}) => {
    if (!isRecording) return null;

    return (
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
    );
};

export default RecordingIndicator;
