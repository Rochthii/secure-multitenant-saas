'use client';

import React, { useState } from 'react';
import { Eye, Lock, FlaskConical, ShieldAlert } from 'lucide-react';

interface SecurityTabsContainerProps {
    realtimeSocNode: React.ReactNode;
    wormVaultNode: React.ReactNode;
    sandboxNode: React.ReactNode;
}

export function SecurityTabsContainer({
    realtimeSocNode,
    wormVaultNode,
    sandboxNode
}: SecurityTabsContainerProps) {
    const [activeTab, setActiveTab] = useState<'soc' | 'worm' | 'sandbox'>('soc');

    return (
        <div className="space-y-8">
            {/* Tabs Navigation Header - Premium Sleek design */}
            <div className="flex flex-col sm:flex-row gap-2 border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-2 rounded-2xl backdrop-blur-xl shadow-lg relative z-20">
                <button
                    onClick={() => setActiveTab('soc')}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-98 ${
                        activeTab === 'soc'
                            ? 'bg-amber-500 text-slate-950 shadow-[0_6px_25px_-5px_rgba(245,158,11,0.55)] scale-102 font-black border-none'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                >
                    <Eye className="w-4.5 h-4.5" />
                    <span>Giám sát SOC thực tế</span>
                </button>
                
                <button
                    onClick={() => setActiveTab('worm')}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-98 ${
                        activeTab === 'worm'
                            ? 'bg-amber-500 text-slate-950 shadow-[0_6px_25px_-5px_rgba(245,158,11,0.55)] scale-102 font-black border-none'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                >
                    <Lock className="w-4.5 h-4.5" />
                    <span>Sổ cái WORM (ISO 27017)</span>
                </button>
                
                <button
                    onClick={() => setActiveTab('sandbox')}
                    className={`flex-1 flex items-center justify-center gap-2.5 py-3.5 px-5 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 transform active:scale-98 ${
                        activeTab === 'sandbox'
                            ? 'bg-amber-500 text-slate-950 shadow-[0_6px_25px_-5px_rgba(245,158,11,0.55)] scale-102 font-black border-none'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 border border-transparent'
                    }`}
                >
                    <FlaskConical className="w-4.5 h-4.5" />
                    <span>Giả lập tấn công (Sandbox)</span>
                </button>
            </div>

            {/* Tab Contents with smooth fade-in micro-animation */}
            <div className="transition-all duration-500 ease-in-out">
                {activeTab === 'soc' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {realtimeSocNode}
                    </div>
                )}
                {activeTab === 'worm' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        <div className="max-w-5xl mx-auto">
                            {wormVaultNode}
                        </div>
                    </div>
                )}
                {activeTab === 'sandbox' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {sandboxNode}
                    </div>
                )}
            </div>
        </div>
    );
}
