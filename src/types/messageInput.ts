export interface MessageInputProps {
    onSendMessage: (message: string) => void;
    onSendVoice: (blob: Blob) => void;
    onSendFiles: (files: File[]) => void;
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
