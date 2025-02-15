import React from 'react';
import { ToolListProps } from '../types/messageInput';

export const ToolList: React.FC<ToolListProps> = ({
    showToolList,
    selectedToolIndex,
    filteredTools,
    onToolSelect,
}) => {
    if (!showToolList) return null;

    return (
        <div className="absolute bottom-full left-2 mb-2 w-64 bg-black/30 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg overflow-hidden transition-all duration-200">
            <div className="py-1">
                {filteredTools.map((tool, index) => (
                    <button
                        key={tool.id}
                        className={`w-full px-4 py-2 flex items-center gap-3 text-left text-white transition-colors duration-200 ${
                            index === selectedToolIndex
                                ? 'bg-white/10'
                                : 'hover:bg-white/5'
                        }`}
                        onClick={() => onToolSelect(tool.id)}
                    >
                        <span className="text-lg">{tool.icon}</span>
                        <span className="flex-1">{tool.name}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
