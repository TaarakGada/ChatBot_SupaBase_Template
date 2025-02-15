import React from 'react';
import { ChevronLeft, Plus } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface SidebarHeaderProps {
    onCollapse: () => void;
    onNewChat: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
    onCollapse,
    onNewChat,
}) => {
    return (
        <div className="flex justify-between items-center mb-6">
            <Tooltip content="Collapse Sidebar">
                <button
                    onClick={onCollapse}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                    <ChevronLeft
                        size={20}
                        className="text-white"
                    />
                </button>
            </Tooltip>

            <Tooltip content="Create New Chat">
                <button
                    onClick={onNewChat}
                    className="flex items-center gap-2 px-3 py-1.5 
                             bg-white/10 hover:bg-white/20 
                             rounded-lg transition-all duration-200
                             border border-white/10"
                >
                    <Plus
                        size={16}
                        className="text-white"
                    />
                    <span className="text-sm font-medium text-white">
                        New Chat
                    </span>
                </button>
            </Tooltip>
        </div>
    );
};
