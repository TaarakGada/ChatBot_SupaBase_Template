import { FileIcon, Image as ImageIcon } from 'lucide-react';

interface FilePreviewProps {
    name: string;
    url: string;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ name, url }) => {
    const isImage = name.match(/\.(jpg|jpeg|png|gif|webp)$/i);
    const extension = name.split('.').pop()?.toUpperCase() || '';

    if (isImage) {
        return (
            <div className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                <ImageIcon
                    size={16}
                    className="text-blue-400"
                />
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 hover:text-white truncate flex-1"
                >
                    {name}
                </a>
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
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-white/70 hover:text-white truncate flex-1"
            >
                {name}
            </a>
            <span className="text-xs text-white/50">{extension}</span>
        </div>
    );
};
