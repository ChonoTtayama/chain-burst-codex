import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameCanvas } from '../components/GameCanvas'
import { CHAIN_FX_THRESHOLDS, getChainVisualTier } from '../game/chainFx'
import type { GamePhase } from '../game/types'
import { getGameConfig, readGameSettings, type GameSettings } from '../settings/gameSettings'
import {
  readGameStats,
  recordBestChain,
  recordCompletedPlay,
  recordPlay,
  type GameStats,
} from '../storage/gameStats'

export function GamePage() {
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [chain, setChain] = useState(0)
  const [stats, setStats] = useState<GameStats>(() => readGameStats())
  // Settings are captured for the current visit. A later visit to /game reads
  // the latest saved preferences, while retries keep their current round rules.
  const [roundSettings] = useState<GameSettings>(() => readGameSettings())
  const [newBest, setNewBest] = useState(false)
  const [overdriveBurst, setOverdriveBurst] = useState(0)
  const bestAtRoundStart = useRef(stats.bestChain)
  const previousChainRef = useRef(0)
  const chainRef = useRef(0)
  const resultRecordedRef = useRef(false)
  const gameConfig = useMemo(() => getGameConfig(roundSettings), [roundSettings])

  const handleChainChange = useCallback((nextChain: number) => {
    if (
      nextChain >= CHAIN_FX_THRESHOLDS.overdrive
      && previousChainRef.current < CHAIN_FX_THRESHOLDS.overdrive
    ) {
      setOverdriveBurst((value) => value + 1)
    }
    previousChainRef.current = nextChain
    chainRef.current = nextChain
    setChain(nextChain)
    if (nextChain > bestAtRoundStart.current) {
      setNewBest(true)
      setStats(recordBestChain(nextChain))
    }
  }, [])

  const handlePhaseChange = useCallback((nextPhase: GamePhase) => {
    setPhase(nextPhase)
    if (nextPhase === 'result' && !resultRecordedRef.current) {
      resultRecordedRef.current = true
      setStats(recordCompletedPlay(chainRef.current))
    }
  }, [])

  const handleLaunch = useCallback(() => {
    setStats(recordPlay())
  }, [])

  const retry = () => {
    const latestStats = readGameStats()
    bestAtRoundStart.current = latestStats.bestChain
    previousChainRef.current = 0
    chainRef.current = 0
    resultRecordedRef.current = false
    setStats(latestStats)
    setChain(0)
    setNewBest(false)
    setOverdriveBurst(0)
    setPhase('ready')
    setRound((value) => value + 1)
  }

  const chainTier = getChainVisualTier(chain)
  const isOverdrive = chainTier === 'overdrive'
  const chainStatus = isOverdrive
    ? 'OVERDRIVE MODE'
    : chainTier === 'surge'
      ? 'CHAIN SURGE'
      : chainTier === 'rising'
        ? 'CHAIN RISING'
        : 'CHAIN REACTING'

  return (
    <main className={`game-page shell effect-${roundSettings.effect}`}>
      <header className="game-header">
        <button className="brand-button" type="button" onClick={() => navigate('/')} aria-label="タイトル画面へ戻る">
          CHAIN <span>BURST</span>
        </button>
        <div className="scoreboard" aria-live="polite">
          <div className={`score-item score-current chain-tier-${chainTier}`}>
            <span>{isOverdrive ? 'OVERDRIVE' : 'CHAIN'}</span>
            <strong className="chain-value" key={chain}>{chain}<small> / {gameConfig.ballCount}</small></strong>
          </div>
          <div className="score-item">
            <span>BEST</span>
            <strong>{stats.bestChain}</strong>
          </div>
        </div>
      </header>

      <section className={`game-stage stage-tier-${chainTier}`} aria-label="ゲーム画面">
        <GameCanvas
          key={round}
          gameConfig={gameConfig}
          effect={roundSettings.effect}
          onChainChange={handleChainChange}
          onPhaseChange={handlePhaseChange}
          onLaunch={handleLaunch}
        />
        {phase === 'chain' && chain > 0 && (
          <div key={`chain-streak-${chain}`} className={`chain-streak chain-tier-${chainTier}`} aria-live="polite">
            <span>{chainStatus}</span>
            <strong><b>{chain}</b><small> CHAIN</small></strong>
          </div>
        )}
        {phase === 'chain' && isOverdrive && overdriveBurst > 0 && (
          <div key={`overdrive-${overdriveBurst}`} className="overdrive-alert" aria-hidden="true">
            <span>10+ CHAIN</span>
            <strong>OVERDRIVE</strong>
          </div>
        )}
        {phase === 'ready' && (
          <div className="stage-message ready-message" aria-live="polite">
            <span>CLICK / TAP ANYWHERE</span>
            <small>チャンスは一度だけ</small>
          </div>
        )}
        {phase === 'result' && (
          <div className="result-panel" role="status">
            <p className="eyebrow">RESULT</p>
            <p className="result-chain">CHAIN <strong>{chain}</strong><small> / {gameConfig.ballCount}</small></p>
            {newBest && <p className="new-best">NEW BEST!</p>}
            <div className="result-actions">
              <button className="button button-primary" type="button" onClick={retry}>RETRY <span aria-hidden="true">↻</span></button>
              <button className="button button-secondary" type="button" onClick={() => navigate('/')}>TITLE</button>
            </div>
          </div>
        )}
      </section>

      <p className="game-hint">爆発はボールに触れると次の爆発を生みます。連鎖中の追加操作はできません。</p>
    </main>
  )
}
