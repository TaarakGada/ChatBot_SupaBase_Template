import React, { useMemo } from 'react';
import { VoiceRecordingPreview } from './VoiceRecordingPreview';
import { FileListPreview } from './FileListPreview';

interface TextMessageProps {
    content: string;
}

export const TextMessage: React.FC<TextMessageProps> = ({ content }) => {
    const messageElements = useMemo(() => {
        if (!content || typeof content !== 'string') {
            return [];
        }

        return content
            .split('\n')
            .filter((line) => line.trim())
            .map((line, index) => {
                const elementKey = `${line.slice(0, 10)}-${index}`;

                if (line.startsWith('[Voice Recording:')) {
                    const size =
                        line
                            .match(/\[(Voice Recording: .+)\]/)?.[1]
                            .split(': ')[1] || '';
                    return (
                        <VoiceRecordingPreview
                            key={`voice-${elementKey}`}
                            size={size}
                        />
                    );
                }

                if (line.startsWith('[Attached files:')) {
                    const files =
                        line
                            .match(/\[Attached files: (.+)\]/)?.[1]
                            .split(', ') || [];
                    return (
                        <FileListPreview
                            key={`files-${elementKey}`}
                            files={files}
                        />
                    );
                }

                return (
                    <p
                        key={`text-${elementKey}`}
                        className="break-words whitespace-pre-wrap text-sm"
                    >
                        {line}
                    </p>
                );
            });
    }, [content]);

    if (!messageElements.length) {
        return null;
    }

    return <div className="space-y-2">{messageElements}</div>;
};
