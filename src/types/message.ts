export interface MessageContent {
    text?: string;
    type: 'text' | 'audio' | 'file';
    url?: string;
    name?: string;
}

export interface MessageProps {
    content: string | MessageContent;
    isUser: boolean;
    timestamp: string;
}
