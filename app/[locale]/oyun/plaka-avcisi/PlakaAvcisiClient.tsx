'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
    AnswerResult,
    GameSummary,
    PlayerOverview,
    StartedSession,
} from '@/lib/plaka/contracts';
import { MODE_CONFIG, type PlakaLevel, type PlakaMode } from '@/lib/plaka/game';
import { plakaApi, PlakaClientError } from '@/components/plaka/api';
import HomeScreen from '@/components/plaka/HomeScreen';
import PlayScreen from '@/components/plaka/PlayScreen';
import ResultScreen from '@/components/plaka/ResultScreen';

type Screen = 'home' | 'play' | 'result';

const NICKNAME_STORAGE_KEY = 'plaka_avcisi_nickname';

export default function PlakaAvcisiClient({ locale }: { locale: string }) {
    const [screen, setScreen] = useState<Screen>('home');
    const [profile, setProfile] = useState<PlayerOverview | null>(null);
    const [profileState, setProfileState] = useState<'loading' | 'ready' | 'error'>('loading');
    const [profileError, setProfileError] = useState<string | null>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const [nickname, setNickname] = useState('');
    const [starting, setStarting] = useState(false);
    const [leaderboardKey, setLeaderboardKey] = useState(0);

    const [session, setSession] = useState<StartedSession | null>(null);
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [bestStreak, setBestStreak] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<AnswerResult | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [gameError, setGameError] = useState<string | null>(null);
    const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
    const [summary, setSummary] = useState<GameSummary | null>(null);
    const [replaying, setReplaying] = useState(false);

    const questionShownAtRef = useRef<number>(Date.now());
    const deadlineRef = useRef<number | null>(null);
    const advanceTimerRef = useRef<number | null>(null);
    const finishedRef = useRef(false);
    const startingRef = useRef(false);
    const submittingRef = useRef(false);

    const loadProfile = useCallback(async () => {
        setProfileState('loading');
        setProfileError(null);
        try {
            const data = await plakaApi.stats();
            setProfile(data);
            setProfileState('ready');
        } catch (error) {
            setProfileState('error');
            setProfileError(
                error instanceof PlakaClientError && error.code === 'store_unavailable'
                    ? 'İstatistik servisi şu anda bakımda. Oyun geçici olarak oynanamıyor.'
                    : 'İstatistikler yüklenemedi. Bağlantını kontrol edip tekrar dene.'
            );
        }
    }, []);

    useEffect(() => {
        void loadProfile();
    }, [loadProfile]);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(NICKNAME_STORAGE_KEY);
            if (stored) setNickname(stored);
        } catch {
            // localStorage can be blocked (private mode) — guests still play anonymously.
        }
    }, []);

    const handleNicknameChange = useCallback((value: string) => {
        setNickname(value);
        try {
            window.localStorage.setItem(NICKNAME_STORAGE_KEY, value);
        } catch {
            // ignore quota/privacy errors
        }
    }, []);

    const clearAdvanceTimer = useCallback(() => {
        if (advanceTimerRef.current !== null) {
            window.clearTimeout(advanceTimerRef.current);
            advanceTimerRef.current = null;
        }
    }, []);

    const startGame = useCallback(
        async (mode: PlakaMode, level: PlakaLevel, daily = false) => {
            if (startingRef.current) return;
            startingRef.current = true;
            setStarting(true);
            setNotice(null);
            setGameError(null);
            clearAdvanceTimer();
            try {
                const data = await plakaApi.startSession({
                    mode,
                    level,
                    daily,
                    nickname: nickname.trim() || undefined,
                });

                if (data.status === 'daily_done') {
                    setNotice(
                        `Bugünkü meydan okumayı ${data.score} puanla tamamladın. Yarın yeni sorular geliyor.`
                    );
                    setScreen('home');
                    void loadProfile();
                    return;
                }

                setSession(data);
                setScore(data.score);
                setStreak(data.currentStreak);
                setBestStreak(data.bestStreak);
                setCorrectCount(0);
                setIndex(data.answeredCount);
                setSelectedIndex(null);
                setFeedback(null);
                setSummary(null);
                setSecondsLeft(data.durationSeconds);
                setFinishing(false);
                finishedRef.current = false;
                questionShownAtRef.current = Date.now();
                deadlineRef.current = data.durationSeconds
                    ? Date.now() + data.durationSeconds * 1000
                    : null;
                setScreen('play');
                window.scrollTo({ top: 0, behavior: 'auto' });
            } catch (error) {
                setNotice(
                    error instanceof PlakaClientError
                        ? error.message
                        : 'Oyun başlatılamadı. Lütfen tekrar dene.'
                );
                setScreen('home');
            } finally {
                startingRef.current = false;
                setStarting(false);
            }
        },
        [clearAdvanceTimer, loadProfile, nickname]
    );

    const finishGame = useCallback(async () => {
        if (!session || finishedRef.current) return;
        finishedRef.current = true;
        clearAdvanceTimer();
        setFinishing(true);
        setGameError(null);
        try {
            const result = await plakaApi.finish(session.sessionId);
            setSummary(result);
            setScreen('result');
            setLeaderboardKey((key) => key + 1);
            void loadProfile();
            window.scrollTo({ top: 0, behavior: 'auto' });
        } catch (error) {
            finishedRef.current = false;
            setGameError(
                error instanceof PlakaClientError
                    ? error.message
                    : 'Sonuç kaydedilemedi. Tekrar denemek için “Devam”a bas.'
            );
        } finally {
            setFinishing(false);
        }
    }, [clearAdvanceTimer, loadProfile, session]);

    const finishRef = useRef(finishGame);
    finishRef.current = finishGame;

    const advance = useCallback(
        (result: AnswerResult) => {
            clearAdvanceTimer();
            if (finishedRef.current) return;
            if (result.nextPosition === null) {
                void finishGame();
                return;
            }
            setIndex(result.nextPosition);
            setFeedback(null);
            setSelectedIndex(null);
            setGameError(null);
            questionShownAtRef.current = Date.now();
        },
        [clearAdvanceTimer, finishGame]
    );

    const advanceRef = useRef(advance);
    advanceRef.current = advance;

    const handleSelect = useCallback(
        async (optionIndex: number) => {
            if (!session || feedback || submittingRef.current || finishing || finishedRef.current) return;
            const question = session.questions[index];
            if (!question) return;

            submittingRef.current = true;
            const responseMs = Date.now() - questionShownAtRef.current;
            setSelectedIndex(optionIndex);
            setSubmitting(true);
            setGameError(null);

            try {
                const result = await plakaApi.answer({
                    sessionId: session.sessionId,
                    position: question.position,
                    optionIndex,
                    responseMs,
                });
                setFeedback(result);
                setScore(result.score);
                setStreak(result.streak);
                setBestStreak(result.bestStreak);
                if (result.correct) setCorrectCount((value) => value + 1);

                advanceTimerRef.current = window.setTimeout(
                    () => advanceRef.current(result),
                    result.correct ? 1100 : 1800
                );
            } catch (error) {
                if (error instanceof PlakaClientError) {
                    if (error.code === 'already_answered' || error.code === 'invalid_position') {
                        setSelectedIndex(null);
                        setGameError('Bu soru zaten yanıtlanmış. Sonraki soruya geçiliyor…');
                        setIndex((value) => Math.min(value + 1, session.questions.length - 1));
                        questionShownAtRef.current = Date.now();
                    } else if (error.code === 'session_inactive' || error.code === 'session_expired') {
                        setGameError('Oturum sona erdi, sonuçların kaydediliyor…');
                        void finishGame();
                    } else if (error.code === 'rate_limited') {
                        setSelectedIndex(null);
                        setGameError('Çok hızlı gidiyorsun, bir saniye bekle.');
                    } else {
                        setSelectedIndex(null);
                        setGameError(error.message);
                    }
                } else {
                    setSelectedIndex(null);
                    setGameError('Cevap gönderilemedi. Bağlantını kontrol et.');
                }
            } finally {
                submittingRef.current = false;
                setSubmitting(false);
            }
        },
        [feedback, finishGame, finishing, index, session]
    );

    const handleNext = useCallback(() => {
        if (finishing) return;
        if (feedback) {
            advanceRef.current(feedback);
            return;
        }
        if (gameError && session) {
            void finishGame();
        }
    }, [feedback, finishGame, finishing, gameError, session]);

    // Countdown for the timed mode.
    useEffect(() => {
        if (screen !== 'play' || deadlineRef.current === null) return;

        const tick = () => {
            const deadline = deadlineRef.current;
            if (deadline === null) return;
            const left = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
            setSecondsLeft(left);
            if (left <= 0) {
                void finishRef.current();
            }
        };

        tick();
        const interval = window.setInterval(tick, 250);
        return () => window.clearInterval(interval);
    }, [screen, session?.sessionId]);

    // Safety net: if the local index runs past the prepared questions, close the run.
    useEffect(() => {
        if (screen !== 'play' || !session) return;
        if (index >= session.questions.length) {
            void finishRef.current();
        }
    }, [index, screen, session]);

    useEffect(() => {
        return () => {
            if (advanceTimerRef.current !== null) window.clearTimeout(advanceTimerRef.current);
        };
    }, []);

    const handleReplay = useCallback(async () => {
        if (!summary || replaying) return;
        setReplaying(true);
        try {
            await startGame(summary.mode, summary.level, summary.daily);
        } finally {
            setReplaying(false);
        }
    }, [replaying, startGame, summary]);

    const handleHome = useCallback(() => {
        clearAdvanceTimer();
        setScreen('home');
        setSession(null);
        setSummary(null);
        setFeedback(null);
        setSelectedIndex(null);
        setGameError(null);
        setSecondsLeft(null);
        setCorrectCount(0);
        finishedRef.current = true;
        window.scrollTo({ top: 0, behavior: 'auto' });
        void loadProfile();
    }, [clearAdvanceTimer, loadProfile]);

    if (screen === 'play' && session) {
        const question = session.questions[index];
        if (!question) {
            return (
                <div className="ys-page-shell" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                    <p>Sonuçlar hazırlanıyor…</p>
                </div>
            );
        }

        return (
            <PlayScreen
                question={question}
                questionNumber={index + 1}
                totalQuestions={session.totalQuestions}
                durationSeconds={session.durationSeconds}
                modeTitle={session.daily ? 'Günün Meydan Okuması' : MODE_CONFIG[session.mode].title}
                levelLabel={session.level === 'karisik' ? 'Karışık' : session.level}
                score={score}
                streak={streak}
                bestStreak={bestStreak}
                correctCount={correctCount}
                secondsLeft={secondsLeft}
                selectedIndex={selectedIndex}
                feedback={feedback}
                submitting={submitting}
                finishing={finishing}
                error={gameError}
                onSelect={(optionIndex) => void handleSelect(optionIndex)}
                onNext={handleNext}
                onQuit={() => void finishGame()}
            />
        );
    }

    if (screen === 'result' && summary) {
        return (
            <ResultScreen
                locale={locale}
                summary={summary}
                onReplay={() => void handleReplay()}
                onHome={handleHome}
                replaying={replaying || starting}
            />
        );
    }

    return (
        <HomeScreen
            locale={locale}
            profile={profile}
            profileState={profileState}
            profileError={profileError}
            onRetryProfile={() => void loadProfile()}
            onStart={(mode, level, daily) => void startGame(mode, level, daily)}
            starting={starting}
            notice={notice}
            nickname={nickname}
            onNicknameChange={handleNicknameChange}
            leaderboardKey={leaderboardKey}
            onDismissNotice={() => setNotice(null)}
        />
    );
}
