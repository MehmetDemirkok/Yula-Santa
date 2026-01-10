"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Users, RefreshCw, Copy, Check, Plus, Edit3, X, List, Shuffle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export function TeamGeneratorClient() {
    const t = useTranslations('tools.teamGeneratorContent');
    const router = useRouter();

    // Core Data
    const [namesList, setNamesList] = useState<string[]>([]);

    // UI State
    const [newName, setNewName] = useState("");
    const [isBulkMode, setIsBulkMode] = useState(false);
    const [bulkText, setBulkText] = useState("");

    // Generator State
    const [teamCount, setTeamCount] = useState(2);
    const [teams, setTeams] = useState<string[][]>([]);
    const [generated, setGenerated] = useState(false);
    const [copied, setCopied] = useState<number | null>(null);

    // Sync bulk text when entering bulk mode
    useEffect(() => {
        if (isBulkMode) {
            setBulkText(namesList.join('\n'));
        }
    }, [isBulkMode]);

    const handleAddName = () => {
        if (newName.trim()) {
            setNamesList([...namesList, newName.trim()]);
            setNewName("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddName();
        }
    };

    const removeName = (index: number) => {
        setNamesList(namesList.filter((_, i) => i !== index));
    };

    const saveBulk = () => {
        const newNames = bulkText.split('\n').filter(line => line.trim() !== '');
        setNamesList(newNames);
        setIsBulkMode(false);
    };

    const generateTeams = () => {
        if (namesList.length < 2) return;

        // Shuffle
        const shuffled = [...namesList].sort(() => Math.random() - 0.5);

        // Distribute
        const newTeams: string[][] = Array.from({ length: teamCount }, () => []);

        shuffled.forEach((name, index) => {
            newTeams[index % teamCount].push(name);
        });

        setTeams(newTeams);
        setGenerated(true);
        triggerConfetti();
    };

    const triggerConfetti = () => {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    const copyTeam = (index: number, teamMembers: string[]) => {
        const text = `${t('team')} ${index + 1}:\n${teamMembers.join('\n')}`;
        navigator.clipboard.writeText(text);
        setCopied(index);
        setTimeout(() => setCopied(null), 2000);
    };

    const clearAll = () => {
        setNamesList([]);
        setGenerated(false);
        setTeams([]);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Input Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col min-h-[600px]">
                            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center justify-between">
                                <span className="flex items-center gap-2">👥 {t('title')}</span>
                                <span className="text-xs font-normal text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                                    {namesList.length}
                                </span>
                            </h2>

                            {/* Mode Toggle */}
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4 shrink-0">
                                <button
                                    onClick={() => setIsBulkMode(false)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${!isBulkMode ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <List className="w-4 h-4 inline-block mr-1.5" />
                                    {t('listMode')}
                                </button>
                                <button
                                    onClick={() => setIsBulkMode(true)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${isBulkMode ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                                >
                                    <Edit3 className="w-4 h-4 inline-block mr-1.5" />
                                    {t('bulkMode')}
                                </button>
                            </div>

                            <div className="flex-1 flex flex-col min-h-0">
                                {isBulkMode ? (
                                    <div className="flex-1 flex flex-col mb-4">
                                        <textarea
                                            value={bulkText}
                                            onChange={(e) => setBulkText(e.target.value)}
                                            placeholder={t('namesPlaceholder')}
                                            className="flex-1 w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none font-medium mb-4 text-sm leading-relaxed"
                                        />
                                        <Button onClick={saveBulk} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                                            Apply Changes
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Add Name Input */}
                                        <div className="flex gap-2 mb-4 shrink-0">
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder={t('addName')}
                                                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                            />
                                            <Button onClick={handleAddName} className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl w-10 h-10 p-0 flex items-center justify-center">
                                                <Plus className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        {/* Name List */}
                                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
                                            {namesList.length === 0 ? (
                                                <div className="text-center text-gray-400 py-8 text-sm italic">
                                                    {t('namesPlaceholder')}
                                                </div>
                                            ) : (
                                                namesList.map((name, idx) => (
                                                    <div key={idx} className="group flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-colors">
                                                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate mr-2 text-sm">
                                                            {name}
                                                        </span>
                                                        <button
                                                            onClick={() => removeName(idx)}
                                                            className="text-gray-400 hover:text-red-500 p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>

                                        <Button
                                            onClick={clearAll}
                                            variant="outline"
                                            size="sm"
                                            className="w-full mb-6 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 border-red-100 dark:border-red-900/20 shrink-0"
                                        >
                                            <Trash2 className="w-3 h-3 mr-2" />
                                            {t('clear')}
                                        </Button>
                                    </>
                                )}

                                <div className="mt-auto shrink-0 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    <label className="text-sm font-medium text-gray-500 mb-2 block flex justify-between">
                                        <span>{t('countLabel')}</span>
                                        <span className="font-bold text-indigo-600">{teamCount}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="2"
                                        max="10"
                                        value={teamCount}
                                        onChange={(e) => setTeamCount(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-indigo-600 mb-6"
                                    />

                                    <Button
                                        onClick={generateTeams}
                                        disabled={namesList.length < 2}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Users className="w-5 h-5 mr-2" />
                                        {t('generate')}
                                    </Button>

                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Section */}
                    <div className="lg:col-span-8">
                        {generated ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
                                {teams.map((team, index) => (
                                    <div
                                        key={index}
                                        className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 relative group hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all hover:shadow-md"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100 dark:border-gray-800">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mr-3 text-sm">
                                                    {index + 1}
                                                </div>
                                                {t('team')} {index + 1}
                                            </h3>
                                            <button
                                                onClick={() => copyTeam(index, team)}
                                                className="p-2 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                                                title="Copy List"
                                            >
                                                {copied === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <ul className="space-y-2">
                                            {team.map((member, i) => (
                                                <li key={i} className="flex items-center text-gray-600 dark:text-gray-300 font-medium p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mr-3"></span>
                                                    {member}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800 text-gray-400">
                                <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                    <Users className="w-10 h-10 text-gray-300" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('title')}</h3>
                                <p className="max-w-md mx-auto mb-8">{t('aboutText')}</p>
                            </div>
                        )}

                    </div>
                </div>

                {/* Instructions & About Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('howToTitle')}</h3>
                        <ul className="space-y-3">
                            {(t.raw('howToText') as string[]).map((step, i) => (
                                <li key={i} className="flex items-start text-gray-500 dark:text-gray-400">
                                    <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-indigo-500 rounded-full shrink-0"></span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 border border-gray-100 dark:border-gray-800">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('aboutTitle')}</h3>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-lg">{t('aboutText')}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
