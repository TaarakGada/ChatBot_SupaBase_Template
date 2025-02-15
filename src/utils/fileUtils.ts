import { MAX_FILE_SIZE, MAX_TOTAL_SIZE } from '../constants/messageInput';

export const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export const validateFiles = (files: File[]): { valid: boolean; error?: string } => {
    let totalSize = 0;

    for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
            return {
                valid: false,
                error: `File ${file.name} exceeds 5MB limit`,
            };
        }
        totalSize += file.size;
    }

    if (totalSize > MAX_TOTAL_SIZE) {
        return {
            valid: false,
            error: 'Total file size exceeds 8MB limit',
        };
    }

    return { valid: true };
};

export const isFileAlreadySelected = (newFile: File, selectedFiles: File[]) => {
    return selectedFiles.some(
        (file) => file.name === newFile.name && file.size === newFile.size
    );
};
