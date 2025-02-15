import { useState, useRef } from 'react';
import { validateFiles, isFileAlreadySelected } from '../utils/fileUtils';

export const useFileHandling = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isFileListCollapsed, setIsFileListCollapsed] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelection = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files);
        const uniqueNewFiles = newFiles.filter(
            (file) => !isFileAlreadySelected(file, selectedFiles)
        );

        if (uniqueNewFiles.length === 0) {
            setFileError('Selected files are already added');
            setTimeout(() => setFileError(null), 3000);
            return;
        }

        const allFiles = [...selectedFiles, ...uniqueNewFiles];
        const validation = validateFiles(allFiles);

        if (!validation.valid) {
            setFileError(validation.error || null);
            setTimeout(() => setFileError(null), 3000);
            return;
        }

        setSelectedFiles(allFiles);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return {
        selectedFiles,
        setSelectedFiles,
        fileError,
        isFileListCollapsed,
        setIsFileListCollapsed,
        fileInputRef,
        handleFileSelection,
    };
};
