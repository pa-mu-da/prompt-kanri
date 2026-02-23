'use client';

import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { X, Plus, Trash2, Upload, Check, ChevronRight } from 'lucide-react';
import { PromptItem, Category, PromptVersion } from '@/lib/types';
import { createThumbnail } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { FirebaseService } from '@/lib/firebase-service';

interface EditModalProps {
    item: PromptItem | null; // null for new
    initialCategory: Category;
    isOpen: boolean;
    onClose: () => void;
    onSave: (item: PromptItem) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ item, initialCategory, isOpen, onClose, onSave }) => {
    const [category, setCategory] = useState<Category>(item?.category || initialCategory);
    const [title, setTitle] = useState(item?.title || '');
    const [tags, setTags] = useState(item?.tags.join(', ') || '');
    const [versions, setVersions] = useState<PromptVersion[]>(
        item?.versions || [{ id: crypto.randomUUID(), name: 'v1', prompt: '' }]
    );

    // Image handling
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
    const [isCropping, setIsCropping] = useState(false);
    const [thumbnail, setThumbnail] = useState(item?.thumbnail || '');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens or item changes
    React.useEffect(() => {
        if (isOpen) {
            setCategory(item?.category || initialCategory);
            setTitle(item?.title || '');
            setTags(item?.tags.join(', ') || '');
            setVersions(item?.versions || [{ id: crypto.randomUUID(), name: 'v1', prompt: '' }]);
            setThumbnail(item?.thumbnail || '');
            setImageSrc(null);
            setIsCropping(false);
        }
    }, [isOpen, item, initialCategory]);

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result as string);
                setIsCropping(true);
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleFinishCrop = async () => {
        if (imageSrc && croppedAreaPixels) {
            try {
                const croppedImage = await createThumbnail(imageSrc, croppedAreaPixels);
                setThumbnail(croppedImage);
                setIsCropping(false);
                setImageSrc(null);
            } catch (e) {
                console.error(e);
            }
        }
    };

    const addVersion = () => {
        setVersions([...versions, { id: crypto.randomUUID(), name: `v${versions.length + 1}`, prompt: '' }]);
    };

    const removeVersion = (id: string) => {
        if (versions.length > 1) {
            setVersions(versions.filter(v => v.id !== id));
        }
    };

    const updateVersion = (id: string, field: keyof PromptVersion, value: string) => {
        setVersions(versions.map(v => v.id === id ? { ...v, [field]: value } : v));
    };

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const newItem: PromptItem = {
                id: item?.id || crypto.randomUUID(),
                category,
                title,
                tags: tags.split(',').map(t => t.trim()).filter(t => t),
                thumbnail: thumbnail, // Store as Base64 directly
                versions,
                createdAt: item?.createdAt || Date.now(),
            };
            await onSave(newItem);
            onClose();
        } catch (e) {
            console.error("Save failed", e);
            alert("保存に失敗しました。");
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col relative">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                        {item ? 'アイテムを編集' : '新規作成'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">

                    {/* Category Toggle */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
                        <button
                            onClick={() => setCategory('style')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                category === 'style' ? "bg-white dark:bg-slate-700 shadow-sm text-blue-600" : "text-slate-500"
                            )}
                        >
                            画風
                        </button>
                        <button
                            onClick={() => setCategory('subject')}
                            className={cn(
                                "px-6 py-2 rounded-lg text-sm font-bold transition-all",
                                category === 'subject' ? "bg-white dark:bg-slate-700 shadow-sm text-emerald-600" : "text-slate-500"
                            )}
                        >
                            内容
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
                        {/* Image Section */}
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">画像</label>
                            <div
                                className="group relative w-[200px] h-[200px] bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-colors hover:border-blue-400"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {thumbnail ? (
                                    <img src={thumbnail} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center">
                                        <Upload className="mx-auto mb-2 text-slate-400" size={32} />
                                        <span className="text-xs text-slate-500">画像を選択</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                    画像を変更
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                className="hidden"
                                accept="image/*"
                            />
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">タイトル</label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="例: シネマティック・ライティング"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">タグ (カンマ区切り)</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={e => setTags(e.target.value)}
                                    placeholder="realistic, outdoors, 8k..."
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Versions Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">バージョン管理</label>
                            <button
                                onClick={addVersion}
                                className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full hover:bg-blue-100 transition-colors"
                            >
                                <Plus size={14} /> バージョンを追加
                            </button>
                        </div>

                        <div className="space-y-3">
                            {versions.map((v, index) => (
                                <div key={v.id} className="relative p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex gap-4 mb-3">
                                        <input
                                            type="text"
                                            value={v.name}
                                            onChange={e => updateVersion(v.id, 'name', e.target.value)}
                                            className="w-24 bg-transparent border-b border-slate-300 dark:border-slate-600 px-1 py-0.5 text-sm font-bold focus:border-blue-500 outline-none"
                                            placeholder="名称"
                                        />
                                        <div className="flex-1" />
                                        {versions.length > 1 && (
                                            <button
                                                onClick={() => removeVersion(v.id)}
                                                className="text-slate-400 hover:text-red-500 p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                    <textarea
                                        value={v.prompt}
                                        onChange={e => updateVersion(v.id, 'prompt', e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm min-h-[80px] focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        placeholder="プロンプトを入力... {{var}} が変数に置換されます。"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        キャンセル
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={cn(
                            "px-8 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2",
                            isSaving && "brightness-90"
                        )}
                    >
                        {isSaving ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                保存中...
                            </>
                        ) : '保存する'}
                    </button>
                </div>

                {/* Overlapping Cropper Layer */}
                {isCropping && imageSrc && (
                    <div className="absolute inset-0 z-[110] bg-slate-900 flex flex-col">
                        <div className="p-4 flex items-center justify-between border-b border-white/10 shrink-0">
                            <h3 className="text-white font-bold">正方形にクロップ</h3>
                            <button onClick={() => setIsCropping(false)} className="text-white/60 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 relative bg-black">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                            />
                        </div>
                        <div className="p-6 bg-slate-900 shrink-0 space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-white/40">ズーム</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e: any) => setZoom(e.target.value)}
                                    className="flex-1 accent-blue-500"
                                />
                            </div>
                            <button
                                onClick={handleFinishCrop}
                                className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 transition-all"
                            >
                                <Check size={20} /> 決定
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
