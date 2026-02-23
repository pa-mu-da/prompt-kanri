'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Search, Layers, LayoutGrid } from 'lucide-react';
import { Header } from './Header';
import { PromptCard } from './PromptCard';
import { EditModal } from './EditModal';
import { PromptItem, Category, AppSettings, AppState } from '@/lib/types';
import { cn } from '@/lib/utils';

import { FirebaseService } from '@/lib/firebase-service';

export const Dashboard: React.FC = () => {
    const [state, setState] = useState<AppState>({
        variable: '',
        items: [],
        settings: {
            autoInsertPosition: 'start',
            theme: 'light',
        },
    });

    const [activeTab, setActiveTab] = useState<Category>('style');
    const [searchQuery, setSearchQuery] = useState('');
    const [editingItem, setEditingItem] = useState<PromptItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(10);
    const [isLoading, setIsLoading] = useState(true);

    // Firebase Auth & Data Sync
    useEffect(() => {
        let unsubscribe: () => void = () => { };

        const init = async () => {
            try {
                await FirebaseService.signIn();

                // Get initial settings and variable
                await FirebaseService.getInitialState((variable, settings) => {
                    setState(prev => ({ ...prev, variable, settings }));
                    if (settings.theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    }
                });

                // Subscribe to prompts
                unsubscribe = FirebaseService.subscribeToPrompts((items) => {
                    setState(prev => ({ ...prev, items }));
                    setIsLoading(false);
                });
            } catch (e) {
                console.error("Firebase init failed", e);
                setIsLoading(false);
            }
        };

        init();
        return () => unsubscribe();
    }, []);

    // Sync theme to DOM and Cloud Settings
    useEffect(() => {
        if (state.settings.theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        if (!isLoading) {
            FirebaseService.saveSettings(state.settings, state.variable);
        }
    }, [state.settings, state.variable, isLoading]);

    const filteredItems = state.items
        .filter(item => item.category === activeTab)
        .filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
            item.versions.some(v => v.prompt.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .sort((a, b) => b.createdAt - a.createdAt);

    const displayedItems = filteredItems.slice(0, visibleCount);

    const handleSaveItem = async (newItem: PromptItem) => {
        try {
            await FirebaseService.savePrompt(newItem);
        } catch (e) {
            console.error("Failed to save item", e);
            alert("保存に失敗しました。");
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (typeof window !== 'undefined' && window.confirm('このアイテムを削除してもよろしいですか？')) {
            try {
                await FirebaseService.deletePrompt(id);
            } catch (e) {
                console.error("Failed to delete item", e);
                alert("削除に失敗しました。");
            }
        }
    };

    const updateSettings = (newSettings: Partial<AppSettings>) => {
        setState(prev => ({
            ...prev,
            settings: { ...prev.settings, ...newSettings }
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
            <Header
                variable={state.variable}
                setVariable={(v) => setState(prev => ({ ...prev, variable: v }))}
                settings={state.settings}
                updateSettings={updateSettings}
            />

            <main className="max-w-4xl mx-auto px-4 py-8 pb-32">
                {/* Actions & Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    {/* Tab Switcher */}
                    <div className="flex bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit">
                        <button
                            onClick={() => setActiveTab('style')}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                activeTab === 'style'
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            )}
                        >
                            <Layers size={18} /> 画風 (Style)
                        </button>
                        <button
                            onClick={() => setActiveTab('subject')}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                                activeTab === 'subject'
                                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                                    : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                            )}
                        >
                            <LayoutGrid size={18} /> 内容 (Subject)
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="パレットを検索..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    {displayedItems.length > 0 ? (
                        displayedItems.map(item => (
                            <PromptCard
                                key={item.id}
                                item={item}
                                variable={state.variable}
                                settings={state.settings}
                                onEdit={(item) => {
                                    setEditingItem(item);
                                    setIsModalOpen(true);
                                }}
                                onDelete={handleDeleteItem}
                            />
                        ))
                    ) : (
                        <div className="text-center py-20 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                            <div className="text-slate-400 italic mb-4">まだアイテムがありません...</div>
                            <button
                                onClick={() => {
                                    setEditingItem(null);
                                    setIsModalOpen(true);
                                }}
                                className="text-blue-600 font-bold hover:underline"
                            >
                                最初のアイテムを作成する
                            </button>
                        </div>
                    )}
                </div>

                {/* Load More */}
                {filteredItems.length > visibleCount && (
                    <div className="mt-8 flex justify-center">
                        <button
                            onClick={() => setVisibleCount(prev => prev + 10)}
                            className="px-8 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            さらに読み込む
                        </button>
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            <button
                onClick={() => {
                    setEditingItem(null);
                    setIsModalOpen(true);
                }}
                className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group shadow-blue-500/40"
            >
                <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" />
            </button>

            <EditModal
                isOpen={isModalOpen}
                item={editingItem}
                initialCategory={activeTab}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveItem}
            />
        </div>
    );
};
