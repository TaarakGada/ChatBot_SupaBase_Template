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

        // Split by double newlines to separate paragraphs
        return content
            .split('\n\n')
            .filter((paragraph) => paragraph.trim())
            .map((paragraph, index) => {
                const elementKey = `${paragraph.slice(0, 10)}-${index}`;

                // Handle special formatted content (lists, etc.)
                if (paragraph.includes('*')) {
                    return (
                        <div
                            key={`formatted-${elementKey}`}
                            className="markdown-content"
                        >
                            {paragraph.split('\n').map((line, lineIndex) => {
                                // Handle bullet points
                                if (line.startsWith('*')) {
                                    return (
                                        <li
                                            key={`list-${lineIndex}`}
                                            className="ml-4"
                                        >
                                            {line.replace('*', '').trim()}
                                        </li>
                                    );
                                }
                                // Handle headings
                                if (line.startsWith('**')) {
                                    return (
                                        <strong
                                            key={`heading-${lineIndex}`}
                                            className="block"
                                        >
                                            {line.replace(/\*\*/g, '')}
                                        </strong>
                                    );
                                }
                                return (
                                    <p
                                        key={`text-${lineIndex}`}
                                        className="break-words"
                                    >
                                        {line}
                                    </p>
                                );
                            })}
                        </div>
                    );
                }

                // Regular paragraph
                return (
                    <p
                        key={`text-${elementKey}`}
                        className="break-words whitespace-pre-wrap text-sm"
                    >
                        {paragraph}
                    </p>
                );
            });
    }, [content]);

    if (!messageElements.length) {
        return null;
    }

    return <div className="space-y-2">{messageElements}</div>;
};
