'use client';

import React from 'react';
import { MoreVertical, Copy, Tag, Settings, Trash2 } from 'lucide-react';
import { PromptItem, AppSettings } from '@/lib/types';
import { CATEGORY_COLORS, cn } from '@/lib/utils';
import { copyPrompt } from '@/lib/copy-utils';

interface PromptCardProps {
    item: PromptItem;
    variable: string;
    settings: AppSettings;
    onEdit: (item: PromptItem) => void;
    onDelete: (id: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
    item,
    variable,
    settings,
    onEdit,
    onDelete,
}) => {
    const colors = CATEGORY_COLORS[item.category];
    const [copiedId, setCopiedId] = React.useState<string | null>(null);

    const handleCopy = async (prompt: string, id: string) => {
        const success = await copyPrompt(prompt, variable, settings);
        if (success) {
            setCopiedId(id);
            setTimeout(() => setCopiedId(null), 2000);
        }
    };

    return (
        <div
            onClick={() => onEdit(item)}
            className={cn(
                "group flex items-center gap-4 p-3 rounded-xl border transition-all hover:shadow-md cursor-pointer",
                colors.bg,
                colors.border
            )}
        >
            {/* Thumbnail */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 italic text-xs">画像なし</div>
                )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 truncate">
                        {item.title || (item.versions[0]?.prompt.slice(0, 20) + '...')}
                    </h3>
                    <div className="md:hidden">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(item.id);
                            }}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1 px-1 mb-3">
                    {item.tags.map(tag => (
                        <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 text-[10px] font-medium text-slate-500">
                            <Tag size={8} /> {tag}
                        </span>
                    ))}
                </div>

                {/* Copy Buttons */}
                <div className="flex flex-wrap gap-2">
                    {item.versions.map(v => (
                        <button
                            key={v.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCopy(v.prompt, v.id);
                            }}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95",
                                copiedId === v.id
                                    ? "bg-green-500 text-white"
                                    : cn(colors.accent, "text-white hover:brightness-110")
                            )}
                        >
                            <Copy size={12} />
                            {v.name || 'コピー'}
                            {copiedId === v.id && "!"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex flex-col gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                    }}
                    className="p-2 text-slate-400 hover:text-blue-500 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-all"
                    title="編集"
                >
                    <Settings size={18} />
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-white/50 dark:hover:bg-black/20 rounded-full transition-all"
                    title="削除"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};
