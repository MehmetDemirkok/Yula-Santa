"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ArrowLeft, Users, RefreshCw, Copy, Check, Plus, Edit3, X, List, Shuffle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";
import { secureShuffle } from "@/lib/random";

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

        // Shuffle (fair Fisher–Yates)
        const shuffled = secureShuffle(namesList);

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
        <div className="ys-page-shell py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-8"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                </Button>

                <h1 className="font-heading text-headline-lg-mobile sm:text-headline-lg text-[var(--text-primary)] mb-6 tracking-tight">
                    {t('title')}
                </h1>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Input Section */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="ys-card p-6 h-full flex flex-col min-h-[600px]">
                            <h2 className="font-heading text-headline-md text-[var(--text-primary)] mb-4 flex items-center justify-between">
                                <span className="flex items-center gap-2">{t('listMode')}</span>
                                <span className="ys-chip ys-chip-indigo">
                                    {namesList.length}
                                </span>
                            </h2>

                            {/* Mode Toggle */}
                            <div className="flex bg-[var(--surface-2)] p-1 rounded-lg mb-4 shrink-0">
                                <button
                                    onClick={() => setIsBulkMode(false)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${!isBulkMode ? 'bg-[var(--card-bg)] shadow-sm text-indigo-accent' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
                                >
                                    <List className="w-4 h-4 inline-block mr-1.5" />
                                    {t('listMode')}
                                </button>
                                <button
                                    onClick={() => setIsBulkMode(true)}
                                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${isBulkMode ? 'bg-[var(--card-bg)] shadow-sm text-indigo-accent' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
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
                                            className="flex-1 w-full p-4 rounded-lg border-2 border-[var(--input-border)] bg-[var(--input-bg)] text-[var(--text-primary)] focus:ring-0 focus:border-indigo-accent focus:outline-none resize-none font-medium mb-4 text-sm leading-relaxed"
                                        />
                                        <Button onClick={saveBulk} variant="secondary" className="w-full">
                                            Apply Changes
                                        </Button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Add Name Input */}
                                        <div className="flex gap-2 mb-4 shrink-0">
                                            <Input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                onKeyDown={handleKeyDown}
                                                placeholder={t('addName')}
                                                className="flex-1 h-auto py-2 focus:border-indigo-accent"
                                            />
                                            <Button onClick={handleAddName} className="shrink-0 aspect-square p-0 w-10 h-10">
                                                <Plus className="w-5 h-5" />
                                            </Button>
                                        </div>

                                        {/* Name List */}
                                        <div className="flex-1 overflow-y-auto pr-2 space-y-2 mb-4 custom-scrollbar">
                                            {namesList.length === 0 ? (
                                                <div className="text-center text-[var(--text-muted)] py-8 text-sm italic">
                                                    {t('namesPlaceholder')}
                                                </div>
                                            ) : (
                                                namesList.map((name, idx) => (
                                                    <div key={idx} className="group flex items-center justify-between bg-[var(--surface-2)] p-3 rounded-lg border border-[var(--border-light)] hover:border-indigo-accent/30 transition-colors">
                                                        <span className="font-medium text-[var(--text-secondary)] truncate mr-2 text-sm">
                                                            {name}
                                                        </span>
                                                        <button
                                                            onClick={() => removeName(idx)}
                                                            className="text-[var(--text-muted)] hover:text-santa-red p-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
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
                                            className="w-full mb-6 text-santa-red hover:text-santa-red hover:bg-santa-red/10 border-santa-red/20 shrink-0"
                                        >
                                            <Trash2 className="w-3 h-3 mr-2" />
                                            {t('clear')}
                                        </Button>
                                    </>
                                )}

                                <div className="mt-auto shrink-0 pt-4 border-t border-[var(--border-light)]">
                                    <label className="text-label-md text-[var(--text-secondary)] mb-2 block flex justify-between">
                                        <span>{t('countLabel')}</span>
                                        <span className="font-bold text-indigo-accent">{teamCount}</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="2"
                                        max="10"
                                        value={teamCount}
                                        onChange={(e) => setTeamCount(parseInt(e.target.value))}
                                        className="w-full h-2 bg-[var(--surface-2)] rounded-lg appearance-none cursor-pointer accent-indigo-accent mb-6"
                                    />

                                    <Button
                                        onClick={generateTeams}
                                        disabled={namesList.length < 2}
                                        size="lg"
                                        className="w-full"
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
                                        className="ys-card p-6 relative group hover:border-indigo-accent/30 transition-all"
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className="ys-card-header flex justify-between items-center">
                                            <h3 className="font-heading text-headline-md text-[var(--text-primary)] flex items-center">
                                                <div className="w-8 h-8 rounded-full bg-indigo-accent/10 text-indigo-accent flex items-center justify-center mr-3 text-sm">
                                                    {index + 1}
                                                </div>
                                                {t('team')} {index + 1}
                                            </h3>
                                            <button
                                                onClick={() => copyTeam(index, team)}
                                                className="p-2 text-[var(--text-muted)] hover:text-indigo-accent hover:bg-indigo-accent/10 rounded-lg transition-colors"
                                                title="Copy List"
                                            >
                                                {copied === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <ul className="space-y-2">
                                            {team.map((member, i) => (
                                                <li key={i} className="flex items-center text-[var(--text-secondary)] font-medium p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-accent mr-3"></span>
                                                    {member}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-[var(--surface-2)] rounded-xl border border-dashed border-[var(--border-medium)] text-[var(--text-muted)]">
                                <div className="w-20 h-20 bg-[var(--card-bg)] rounded-full flex items-center justify-center mb-6">
                                    <Users className="w-10 h-10 text-[var(--text-muted)]" />
                                </div>
                                <h3 className="font-heading text-headline-md text-[var(--text-primary)] mb-2">{t('title')}</h3>
                                <p className="max-w-md mx-auto mb-8 text-body-md">{t('aboutText')}</p>
                            </div>
                        )}

                    </div>
                </div>

                {/* Instructions & About Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    <div className="ys-card p-8">
                        <h3 className="font-heading text-headline-md text-[var(--text-primary)] mb-4">{t('howToTitle')}</h3>
                        <ul className="space-y-3">
                            {(t.raw('howToText') as string[]).map((step, i) => (
                                <li key={i} className="flex items-start text-[var(--text-secondary)]">
                                    <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-indigo-accent rounded-full shrink-0"></span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="ys-card p-8">
                        <h3 className="font-heading text-headline-md text-[var(--text-primary)] mb-4">{t('aboutTitle')}</h3>
                        <p className="text-body-lg text-[var(--text-secondary)] leading-relaxed">{t('aboutText')}</p>
                    </div>
                </div>

            </div>
        </div>
    );
}
