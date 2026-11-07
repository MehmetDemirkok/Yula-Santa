'use client';

import { useEffect, useState } from 'react';
import { formatPlate } from '@/lib/plaka/cities';
import TurkeyMap from './TurkeyMap';
import {
    ArrowRight,
    Check,
    Clock3,
    Flame,
    Lightbulb,
    LogOut,
    Sparkles,
    X,
} from 'lucide-react';
import type { AnswerResult, PublicQuestion } from '@/lib/plaka/contracts';
import styles from './PlakaAvcisi.module.css';

type Props = {
    question: PublicQuestion;
    questionNumber: number;
    totalQuestions: number;
    durationSeconds: number | null;
    modeTitle: string;
    levelLabel: string;
    daily: boolean;
    score: number;
    streak: number;
    bestStreak: number;
    correctCount: number;
    secondsLeft: number | null;
    selectedIndex: number | null;
    feedback: AnswerResult | null;
    submitting: boolean;
    finishing: boolean;
    error: string | null;
    finishFailed: boolean;
    onRetryFinish: () => void;
    onSelect: (optionIndex: number) => void;
    onNext: () => void;
    onQuit: () => void;
};

const OPTION_KEYS = ['1', '2', '3', '4'];

function promptLabel(question: PublicQuestion): string {
    if (question.kind === 'plaka-sehir') return 'Bu plaka hangi ile ait?';
    if (question.kind === 'sehir-plaka') return 'Bu şehrin plaka kodu kaç?';
    if (question.kind === 'harita') return 'Bu il haritada nerede? Dokun, sonra onayla.';
    return 'Bu ipuçları hangi ili anlatıyor?';
}

export default function PlayScreen({
    question,
    questionNumber,
    totalQuestions,
    durationSeconds,
    modeTitle,
    levelLabel,
    daily,
    score,
    streak,
    bestStreak,
    correctCount,
    secondsLeft,
    selectedIndex,
    feedback,
    submitting,
    finishing,
    error,
    finishFailed,
    onRetryFinish,
    onSelect,
    onNext,
    onQuit,
}: Props) {
    const isTimed = secondsLeft !== null;
    const locked = feedback !== null || submitting || finishing;
    const [confirmingQuit, setConfirmingQuit] = useState(false);
    const isMap = question.kind === 'harita';
    // A map tap only marks a province; the player confirms before it is sent.
    const [mapPick, setMapPick] = useState<{ position: number; code: number } | null>(null);
    const pendingCode = mapPick && mapPick.position === question.position ? mapPick.code : null;
    const nothingAnswered = questionNumber === 1 && feedback === null && !submitting;

    const requestQuit = () => {
        if (nothingAnswered) onQuit();
        else setConfirmingQuit(true);
    };

    useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.metaKey || event.ctrlKey || event.altKey) return;
            const digit = Number(event.key);
            if (!isMap && digit >= 1 && digit <= 4 && !locked) {
                event.preventDefault();
                onSelect(digit - 1);
                return;
            }
            if (event.key === 'Enter' && feedback && !finishing) {
                event.preventDefault();
                onNext();
            }
        }

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [feedback, finishing, isMap, locked, onNext, onSelect]);

    const timedTotal = durationSeconds ?? 60;
    const timedProgress = isTimed ? Math.min(100, ((secondsLeft ?? 0) / timedTotal) * 100) : 0;

    return (
        <div className={styles.shell} lang="tr" dir="ltr">
            <div className={styles.container}>
                <div className={styles.playWrap}>
                    <div className={styles.playTop}>
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={requestQuit}
                            disabled={finishing}
                            aria-label="Oyundan çık"
                        >
                            <LogOut size={18} />
                        </button>

                        <div className={styles.hud}>
                            <div className={styles.hudCell}>
                                <div className={styles.hudLabel}>Puan</div>
                                <div className={`${styles.hudValue} ${styles.hudValueNeon}`}>{score}</div>
                            </div>
                            <div className={`${styles.hudCell} ${streak >= 3 ? styles.comboFlash : ''}`}>
                                <div className={styles.hudLabel}>
                                    <Flame size={10} style={{ display: 'inline', verticalAlign: '-1px' }} />{' '}
                                    Seri
                                </div>
                                <div
                                    className={`${styles.hudValue} ${streak >= 3 ? styles.hudValueNeon : ''}`}
                                >
                                    {streak}
                                </div>
                            </div>
                            {isTimed ? (
                                <div className={styles.hudCell}>
                                    <div className={styles.hudLabel}>
                                        <Clock3 size={10} style={{ display: 'inline', verticalAlign: '-1px' }} />{' '}
                                        Süre
                                    </div>
                                    <div
                                        className={`${styles.hudValue} ${
                                            (secondsLeft ?? 0) <= 10 ? styles.hudValueDanger : ''
                                        }`}
                                    >
                                        {secondsLeft}s
                                    </div>
                                </div>
                            ) : (
                                <div className={styles.hudCell}>
                                    <div className={styles.hudLabel}>
                                        <Check size={10} style={{ display: 'inline', verticalAlign: '-1px' }} />{' '}
                                        Doğru
                                    </div>
                                    <div className={styles.hudValue}>{correctCount}</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {confirmingQuit ? (
                        <div className={styles.quitBar} role="alertdialog" aria-label="Oyundan çık">
                            <span>
                                Tur burada bitsin mi? Puanın kaydedilir, kalan sorular sayılmaz.
                                {daily ? ' Günlük hakkın da kullanılmış olur.' : ''}
                            </span>
                            <span className={styles.quitActions}>
                                <button
                                    type="button"
                                    className={styles.ctaGhost}
                                    onClick={() => setConfirmingQuit(false)}
                                    autoFocus
                                >
                                    Oyuna dön
                                </button>
                                <button
                                    type="button"
                                    className={styles.ctaGhost}
                                    onClick={onQuit}
                                    disabled={finishing}
                                >
                                    {finishing ? 'Kaydediliyor…' : 'Turu bitir'}
                                </button>
                            </span>
                        </div>
                    ) : null}

                    {isTimed ? (
                        <div
                            className={styles.timerTrack}
                            role="progressbar"
                            aria-label="Kalan süre"
                            aria-valuemin={0}
                            aria-valuemax={timedTotal}
                            aria-valuenow={secondsLeft ?? 0}
                        >
                            <div
                                className={`${styles.timerFill} ${
                                    (secondsLeft ?? 0) <= 10 ? styles.timerFillLow : ''
                                }`}
                                style={{ width: `${timedProgress}%` }}
                            />
                        </div>
                    ) : (
                        <div className={styles.progressRow}>
                            <div
                                className={styles.progressTrack}
                                role="progressbar"
                                aria-label="Soru ilerlemesi"
                                aria-valuemin={1}
                                aria-valuemax={totalQuestions}
                                aria-valuenow={questionNumber}
                            >
                                <div
                                    className={styles.progressFill}
                                    style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                                />
                            </div>
                            <span className={styles.progressText}>
                                {questionNumber} / {totalQuestions}
                            </span>
                        </div>
                    )}

                    <div className={styles.questionMeta} style={{ justifyContent: 'space-between' }}>
                        <span className={styles.diffTag}>{modeTitle}</span>
                        <span className={styles.panelHint}>
                            {isTimed ? `Soru ${questionNumber}` : `${levelLabel} seviye`}
                        </span>
                    </div>

                    <div className={styles.questionCard} key={`${question.position}-${questionNumber}`}>
                        {question.kind === 'plaka-sehir' ? (
                            <div>
                                <div className={styles.questionLabel}>PLAKA</div>
                                <div className={styles.promptPlate}>
                                    <span className={styles.plateStrip} aria-hidden="true">
                                        <span>TR</span>
                                        <span>🇹🇷</span>
                                    </span>
                                    <span className={styles.plateNumber} aria-label={`Plaka ${question.prompt}`}>
                                        {question.prompt}
                                    </span>
                                </div>
                            </div>
                        ) : null}

                        {question.kind === 'sehir-plaka' ? (
                            <div>
                                <div className={styles.questionLabel}>ŞEHİR</div>
                                <h2 className={styles.promptCity}>{question.prompt}</h2>
                            </div>
                        ) : null}

                        {question.kind === 'ipucu' ? (
                            <div>
                                <div className={styles.questionLabel}>
                                    <Lightbulb size={12} style={{ display: 'inline', verticalAlign: '-1px' }} />{' '}
                                    İPUÇLARI
                                </div>
                                <ul className={styles.hintList}>
                                    {question.prompt.split('\n').map((hint, index) => (
                                        <li key={hint} className={styles.hintItem}>
                                            <span className={styles.hintNum} aria-hidden="true">
                                                {index + 1}
                                            </span>
                                            <span>{hint}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}

                        {question.kind === 'harita' ? (
                            <div>
                                <div className={styles.questionLabel}>İL</div>
                                <h2 className={styles.promptCity}>{question.prompt}</h2>
                            </div>
                        ) : null}

                        <p className={styles.promptQuestion}>{promptLabel(question)}</p>

                        {isMap ? (
                            <div>
                                <TurkeyMap
                                    selected={pendingCode}
                                    correct={feedback ? feedback.correctIndex : null}
                                    wrong={feedback && !feedback.correct ? feedback.chosenIndex : null}
                                    disabled={locked}
                                    onPick={(code) => setMapPick({ position: question.position, code })}
                                />
                                {!feedback ? (
                                    <div className={styles.mapActions}>
                                        <button
                                            type="button"
                                            className={styles.cta}
                                            onClick={() => {
                                                if (pendingCode !== null) onSelect(pendingCode);
                                            }}
                                            disabled={locked || pendingCode === null}
                                        >
                                            <Check size={16} aria-hidden="true" />
                                            {pendingCode === null ? 'Haritadan bir il seç' : 'Bu il'}
                                        </button>
                                    </div>
                                ) : null}
                            </div>
                        ) : null}

                        <div className={styles.options} hidden={isMap}>
                            {question.options.map((option, index) => {
                                const isCorrect = feedback ? index === feedback.correctIndex : false;
                                const isWrong =
                                    feedback !== null && index === selectedIndex && !feedback.correct;
                                const isDim = feedback !== null && !isCorrect && !isWrong;

                                return (
                                    <button
                                        key={`${option}-${index}`}
                                        type="button"
                                        className={`${styles.option} ${isCorrect ? styles.optionCorrect : ''} ${
                                            isWrong ? styles.optionWrong : ''
                                        } ${isDim ? styles.optionDim : ''}`}
                                        onClick={() => onSelect(index)}
                                        disabled={locked}
                                        aria-label={`${index + 1}. seçenek: ${option}`}
                                    >
                                        <span className={styles.optionKey} aria-hidden="true">
                                            {OPTION_KEYS[index]}
                                        </span>
                                        <span>{option}</span>
                                        {isCorrect ? (
                                            <Check size={16} style={{ marginLeft: 'auto' }} aria-hidden="true" />
                                        ) : null}
                                        {isWrong ? (
                                            <X size={16} style={{ marginLeft: 'auto' }} aria-hidden="true" />
                                        ) : null}
                                    </button>
                                );
                            })}
                        </div>

                        <div aria-live="polite" aria-atomic="true">
                            {feedback ? (
                                <div
                                    className={`${styles.feedback} ${
                                        feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong
                                    }`}
                                >
                                    <span>
                                        {feedback.correct ? (
                                            <>
                                                Doğru! <span className={styles.answerReveal}>{feedback.cityName}</span>
                                                {isMap ? ` · ${formatPlate(feedback.cityCode)}` : null}
                                            </>
                                        ) : (
                                            <>
                                                Yanlış. Doğru cevap:{' '}
                                                <span className={styles.answerReveal}>
                                                    {feedback.correctLabel}
                                                </span>{' '}
                                                ({feedback.cityName})
                                            </>
                                        )}
                                    </span>
                                    {feedback.points > 0 ? (
                                        <span className={styles.feedbackPoints}>
                                            +{feedback.points}
                                            {feedback.comboBonus > 0
                                                ? ` (kombo +${feedback.comboBonus})`
                                                : ''}
                                        </span>
                                    ) : null}
                                    <button
                                        type="button"
                                        className={styles.ctaGhost}
                                        onClick={onNext}
                                        disabled={finishing}
                                    >
                                        {finishing ? 'Hesaplanıyor…' : 'Devam'}
                                        <ArrowRight size={14} aria-hidden="true" />
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        {submitting ? (
                            <p className={styles.panelHint} style={{ marginTop: '0.7rem' }}>
                                Cevap doğrulanıyor…
                            </p>
                        ) : null}

                        {error ? (
                            <div className={styles.errorBox} role="alert" style={{ marginTop: '0.8rem' }}>
                                <span>{error}</span>
                                {finishFailed ? (
                                    <button
                                        type="button"
                                        className={styles.ctaGhost}
                                        onClick={onRetryFinish}
                                        disabled={finishing}
                                    >
                                        {finishing ? 'Kaydediliyor…' : 'Tekrar dene'}
                                    </button>
                                ) : null}
                            </div>
                        ) : null}
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            gap: '0.5rem',
                            marginTop: '0.9rem',
                        }}
                    >
                        <span className={styles.panelHint}>
                            <Sparkles size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> En uzun
                            seri: {Math.max(bestStreak, streak)}
                        </span>
                        <span className={styles.panelHint}>
                            {isMap ? 'Tab ile iller arasında gez, Enter ile seç' : 'Klavye: 1–4 ile seç, Enter ile devam et'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
