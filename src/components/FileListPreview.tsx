import { FilePreview } from './FilePreview';

interface FileListPreviewProps {
    files: string[];
}

export const FileListPreview: React.FC<FileListPreviewProps> = ({ files }) => (
    <div className="space-y-2 mb-2">
        <div className="text-sm font-medium text-white/90 mb-2">Files</div>
        <div className="space-y-1">
            {files.map((file, idx) => (
                <FilePreview
                    key={idx}
                    name={file}
                />
            ))}
        </div>
    </div>
);
