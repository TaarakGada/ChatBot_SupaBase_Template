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
            <div className="flex items-center gap-2">
                <ImageIcon
                    size={16}
                    className="text-current opacity-70"
                />
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:opacity-100 opacity-70 truncate flex-1"
                >
                    {name}
                </a>
                <span className="text-xs opacity-50">{extension}</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <FileIcon
                size={16}
                className="text-current opacity-70"
            />
            <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:opacity-100 opacity-70 truncate flex-1"
            >
                {name}
            </a>
            <span className="text-xs opacity-50">{extension}</span>
        </div>
    );
};
