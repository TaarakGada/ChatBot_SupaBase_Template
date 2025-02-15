import { Mic } from 'lucide-react';

interface VoiceRecordingPreviewProps {
    size: string;
}

export const VoiceRecordingPreview: React.FC<VoiceRecordingPreviewProps> = ({
    size,
}) => (
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
