import { VoiceRecordingPreview } from './VoiceRecordingPreview';
import { FileListPreview } from './FileListPreview';
import { JSX } from 'react';

interface TextMessageProps {
    content: string;
}

export const TextMessage: React.FC<TextMessageProps> = ({ content }) => {
    const lines = content.split('\n');
    const messageContent: JSX.Element[] = [];
    let currentFiles: string[] = [];

    lines.forEach((line, index) => {
        if (line.startsWith('[Voice Recording:')) {
            const size =
                line.match(/\[(Voice Recording: .+)\]/)?.[1].split(': ')[1] ||
                '';
            messageContent.push(
                <VoiceRecordingPreview
                    key={`voice-${index}`}
                    size={size}
                />
            );
        } else if (line.startsWith('[Attached files:')) {
            currentFiles =
                line.match(/\[Attached files: (.+)\]/)?.[1].split(', ') || [];
            messageContent.push(
                <FileListPreview
                    key={`files-${index}`}
                    files={currentFiles}
                />
            );
        } else if (line.trim()) {
            messageContent.push(
                <p
                    key={index}
                    className="break-words whitespace-pre-wrap text-sm"
                >
                    {line}
                </p>
            );
        }
    });

    return <div className="space-y-2">{messageContent}</div>;
};
