'use client';

import React, { useState } from 'react';
import { Variable, Settings, ChevronDown, ChevronUp, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppSettings } from '@/lib/types';

interface HeaderProps {
    variable: string;
    setVariable: (v: string) => void;
    settings: AppSettings;
    updateSettings: (s: Partial<AppSettings>) => void;
}

export const Header: React.FC<HeaderProps> = ({ variable, setVariable, settings, updateSettings }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
            <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
                    Prompt Palette
                </h1>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className={cn(
                            "p-2 rounded-full transition-colors",
                            isExpanded ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                        title="Variable Input"
                    >
                        <Variable size={20} />
                    </button>

                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={cn(
                            "p-2 rounded-full transition-colors",
                            showSettings ? "bg-slate-200 dark:bg-slate-700" : "hover:bg-slate-100 dark:hover:bg-slate-800"
                        )}
                        title="Settings"
                    >
                        <Settings size={20} />
                    </button>

                    <button
                        onClick={() => updateSettings({ theme: settings.theme === 'light' ? 'dark' : 'light' })}
                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {settings.theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                    </button>
                </div>
            </div>

            {/* Variable Area */}
            <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800",
                isExpanded ? "max-h-32 opacity-100 py-4" : "max-h-0 opacity-0 py-0"
            )}>
                <div className="max-w-4xl mx-auto px-4">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">
                        現在の変数 ({"{{var}}"})
                    </label>
                    <input
                        type="text"
                        value={variable}
                        onChange={(e) => setVariable(e.target.value)}
                        placeholder="例: Masterpiece, highly detailed..."
                        className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Settings Area */}
            <div className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800",
                showSettings ? "max-h-[200px] opacity-100 py-4" : "max-h-0 opacity-0 py-0"
            )}>
                <div className="max-w-4xl mx-auto px-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">変数の自動挿入位置</span>
                        <div className="flex bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                            <button
                                onClick={() => updateSettings({ autoInsertPosition: 'start' })}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all",
                                    settings.autoInsertPosition === 'start'
                                        ? "bg-blue-500 text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                <ChevronDown size={14} /> 先頭
                            </button>
                            <button
                                onClick={() => updateSettings({ autoInsertPosition: 'end' })}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1 rounded-md text-sm transition-all",
                                    settings.autoInsertPosition === 'end'
                                        ? "bg-blue-500 text-white shadow-sm"
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                )}
                            >
                                <ChevronUp size={14} /> 末尾
                            </button>
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-1">同期ID (共有用パスワード)</label>
                                <input
                                    type="text"
                                    value={settings.syncId || ''}
                                    onChange={(e) => updateSettings({ syncId: e.target.value })}
                                    placeholder="例: my-secret-palette"
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                                <p className="text-[10px] text-slate-400 mt-1 italic">PCとスマホで同じIDを入力すると、プロンプトを共有・同期できます。</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};
