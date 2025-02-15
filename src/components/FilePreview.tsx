import { FileIcon, Image as ImageIcon } from 'lucide-react';

interface FilePreviewProps {
    name: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ name }) => {
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
