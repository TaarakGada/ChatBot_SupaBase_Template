import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { Tooltip } from './common/Tooltip';

interface ChatListItemProps {
    id: string;
    name: string;
    isActive: boolean;
    editingId: string | null;
    onSelect: () => void;
    onDelete: () => void;
    onEdit: () => void;
    onRename: (newName: string) => void;
}

export const ChatListItem: React.FC<ChatListItemProps> = ({
    id,
    name,
    isActive,
    editingId,
    onSelect,
    onDelete,
    onEdit,
    onRename,
}) => {
    return (
        <div
            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer
                ${
                    isActive
                        ? 'bg-white/15 border border-white/20'
                        : 'hover:bg-white/10'
                }`}
            onClick={onSelect}
        >
            {editingId === id ? (
                <input
                    type="text"
                    defaultValue={name}
                    onBlur={(e) => onRename(e.target.value)}
                    onKeyPress={(e) =>
                        e.key === 'Enter' && onRename(e.currentTarget.value)
                    }
                    className="flex-grow px-2 py-1 bg-white/10 text-white placeholder-white/50
                             rounded border border-white/20 focus:outline-none focus:border-white/30"
                    autoFocus
                />
            ) : (
                <>
                    <span className="flex-grow truncate text-white font-medium">
                        {name}
                    </span>
                    <div className="flex items-center gap-1 ml-2">
                        <Tooltip content="Edit Chat Name">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit();
                                }}
                                className="p-1.5 rounded-lg hover:bg-white/10 transition-all"
                            >
                                <Edit2
                                    size={14}
                                    className="text-white/70"
                                />
                            </button>
                        </Tooltip>
                        <Tooltip content="Delete Chat">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="p-1.5 rounded-lg hover:bg-red-500/20 transition-all"
                            >
                                <Trash2
                                    size={14}
                                    className="text-red-400"
                                />
                            </button>
                        </Tooltip>
                    </div>
                </>
            )}
        </div>
    );
};
