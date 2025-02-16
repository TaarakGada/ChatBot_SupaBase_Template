import React from 'react';
import {
    FileIcon,
    Image as ImageIcon,
    X,
    ChevronUp,
    ChevronDown,
    Trash2,
} from 'lucide-react';
import { Tooltip } from './Tooltip';
import { formatFileSize } from '../utils/fileUtils';

interface FileListProps {
    selectedFiles: File[];
    fileError: string | null;
    isFileListCollapsed: boolean;
    setIsFileListCollapsed: (value: boolean) => void;
    setSelectedFiles: (files: File[]) => void;
}

const FileList: React.FC<FileListProps> = ({
    selectedFiles,
    fileError,
    isFileListCollapsed,
    setIsFileListCollapsed,
    setSelectedFiles,
}) => {
    const getFileIcon = (file: File) => {
        if (file.type.startsWith('image/')) {
            return (
                <ImageIcon
                    size={16}
                    className="text-blue-400"
                />
            );
        }
        return (
            <FileIcon
                size={16}
                className="text-gray-400"
            />
        );
    };

    if (selectedFiles.length === 0) return null;

    return (
        <div className="max-w-[50%] mx-auto mb-4">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg">
                <div className="flex items-center justify-between p-3">
                    <div className="flex-1 flex items-center justify-between px-2">
                        <Tooltip
                            content={
                                isFileListCollapsed
                                    ? 'Expand file list'
                                    : 'Collapse file list'
                            }
                        >
                            <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() =>
                                    setIsFileListCollapsed(!isFileListCollapsed)
                                }
                            >
                                <span className="text-sm text-white/70 font-medium">
                                    Selected Files ({selectedFiles.length})
                                </span>
                                {isFileListCollapsed ? (
                                    <ChevronUp
                                        size={16}
                                        className="text-white/50"
                                    />
                                ) : (
                                    <ChevronDown
                                        size={16}
                                        className="text-white/50"
                                    />
                                )}
                            </div>
                        </Tooltip>
                        {fileError && (
                            <span className="text-xs text-red-400">
                                {fileError}
                            </span>
                        )}
                    </div>
                    <Tooltip content="Clear all files">
                        <button
                            onClick={() => setSelectedFiles([])}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-all duration-200"
                        >
                            <Trash2
                                size={14}
                                className="text-white/70"
                            />
                        </button>
                    </Tooltip>
                </div>

                <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden
                    ${isFileListCollapsed ? 'max-h-0' : 'max-h-[40vh]'}`}
                >
                    <div
                        className="p-3 overflow-y-auto custom-scrollbar"
                        style={{ maxHeight: '35vh' }}
                    >
                        <div className="grid grid-cols-2 gap-2">
                            {selectedFiles.map((file, index) => (
                                <div
                                    key={`${file.name}-${file.size}-${index}`}
                                    className="flex items-center gap-2 bg-white/5 rounded-lg p-2 group"
                                >
                                    {getFileIcon(file)}
                                    <div className="flex-1 min-w-0">
                                        <Tooltip content={file.name}>
                                            <div className="text-sm text-white truncate">
                                                {file.name}
                                            </div>
                                        </Tooltip>
                                        <div className="text-xs text-white/50">
                                            {formatFileSize(file.size)}
                                        </div>
                                    </div>
                                    <Tooltip content="Remove file">
                                        <button
                                            onClick={() =>
                                                setSelectedFiles(
                                                    selectedFiles.filter(
                                                        (_, i) => i !== index
                                                    )
                                                )
                                            }
                                            className="p-1 opacity-0 group-hover:opacity-100 hover:bg-white/10 
                                            rounded-lg transition-all duration-200"
                                        >
                                            <X
                                                size={14}
                                                className="text-white/70"
                                            />
                                        </button>
                                    </Tooltip>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FileList;
