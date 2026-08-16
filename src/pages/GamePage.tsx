import { useCallback, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { GameCanvas } from '../components/GameCanvas'
import { GAME_CONFIG } from '../game/config'
import type { GamePhase } from '../game/types'
import { readGameStats, recordBestChain, recordPlay, type GameStats } from '../storage/gameStats'

export function GamePage() {
  const navigate = useNavigate()
  const [round, setRound] = useState(0)
  const [phase, setPhase] = useState<GamePhase>('ready')
  const [chain, setChain] = useState(0)
  const [stats, setStats] = useState<GameStats>(() => readGameStats())
  const [newBest, setNewBest] = useState(false)
  const bestAtRoundStart = useRef(stats.bestChain)

  const handleChainChange = useCallback((nextChain: number) => {
    setChain(nextChain)
    if (nextChain > bestAtRoundStart.current) {
      setNewBest(true)
      setStats(recordBestChain(nextChain))
    }
  }, [])

  const handleLaunch = useCallback(() => {
    setStats(recordPlay())
  }, [])

  const retry = () => {
    const latestStats = readGameStats()
    bestAtRoundStart.current = latestStats.bestChain
    setStats(latestStats)
    setChain(0)
    setNewBest(false)
    setPhase('ready')
    setRound((value) => value + 1)
  }

  return (
    <main className="game-page shell">
      <header className="game-header">
        <button className="brand-button" type="button" onClick={() => navigate('/')} aria-label="タイトル画面へ戻る">
          CHAIN <span>BURST</span>
        </button>
        <div className="scoreboard" aria-live="polite">
          <div className="score-item score-current">
            <span>CHAIN</span>
            <strong>{chain}<small> / {GAME_CONFIG.ballCount}</small></strong>
          </div>
          <div className="score-item">
            <span>BEST</span>
            <strong>{stats.bestChain}</strong>
          </div>
        </div>
      </header>

      <section className="game-stage" aria-label="ゲーム画面">
        <GameCanvas key={round} onChainChange={handleChainChange} onPhaseChange={setPhase} onLaunch={handleLaunch} />
        {phase === 'ready' && (
          <div className="stage-message ready-message" aria-live="polite">
            <span>CLICK / TAP ANYWHERE</span>
            <small>チャンスは一度だけ</small>
          </div>
        )}
        {phase === 'result' && (
          <div className="result-panel" role="status">
            <p className="eyebrow">RESULT</p>
            <p className="result-chain">CHAIN <strong>{chain}</strong><small> / {GAME_CONFIG.ballCount}</small></p>
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
