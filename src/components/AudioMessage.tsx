import { PlayCircle } from 'lucide-react';

interface AudioMessageProps {
    url: string;
    name: string;
}

export const AudioMessage: React.FC<AudioMessageProps> = ({ url, name }) => (
    <div className="flex items-center gap-3">
        <PlayCircle
            size={24}
            className="text-current opacity-70 flex-shrink-0"
        />
        <div className="flex-grow min-w-0">
            <div className="text-sm truncate mb-1 opacity-70">{name}</div>
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
