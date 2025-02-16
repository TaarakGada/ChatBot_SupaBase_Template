export interface MessageInputProps {
    onSendMessage: (content: string) => Promise<void>;
    onSendVoice: (blob: Blob) => Promise<void>;
    onSendFiles: (files: File[]) => Promise<void>;
    isLoading?: boolean; // Add this line
}

export interface ToolListProps {
    message: string;
    showToolList: boolean;
    selectedToolIndex: number;
    filteredTools: Array<{
        id: string;
        name: string;
        icon: React.ReactNode;
    }>;
    onToolSelect: (toolId: string) => void;
}

export interface ActionButtonsProps {
    isLoading: boolean;
    isRecording: boolean;
    handleSend: () => void;
    startRecording: () => void;
    stopRecording: () => void;
    onFileClick: () => void;
}
