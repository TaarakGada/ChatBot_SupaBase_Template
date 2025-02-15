import React from 'react';
import { LogOut } from 'lucide-react';
import { Tooltip } from './common/Tooltip';

export const SidebarFooter: React.FC = () => {
    return (
        <div className="mt-auto pt-4 border-t border-white/10">
            <Tooltip content="Sign Out">
                <button className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                    <LogOut
                        size={20}
                        className="text-white/80 hover:text-white"
                    />
                </button>
            </Tooltip>
        </div>
    );
};
