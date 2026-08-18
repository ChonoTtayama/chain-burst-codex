import { Link } from 'react-router-dom'
import { HISTORY_LIMIT, readGameStats } from '../storage/gameStats'

function formatAverage(scores: number[]): string {
  if (scores.length === 0) return '0.0'
  return (scores.reduce((total, score) => total + score, 0) / scores.length).toFixed(1)
}

export function HistoryPage() {
  const stats = readGameStats()
  const average = formatAverage(stats.recentChains)

  return (
    <main className="history-page shell">
      <section className="history-card" aria-labelledby="history-title">
        <Link className="history-back" to="/">← TITLE</Link>
        <p className="eyebrow">PLAY ARCHIVE</p>
        <h1 id="history-title">CHAIN <span>HISTORY</span></h1>
        <p className="history-lede">直近のプレイ結果を振り返ろう。</p>

        <dl className="history-summary">
          <div>
            <dt>BEST CHAIN</dt>
            <dd>{stats.bestChain}</dd>
          </div>
          <div>
            <dt>AVERAGE CHAIN</dt>
            <dd>{average}</dd>
          </div>
          <div>
            <dt>PLAY COUNT</dt>
            <dd>{stats.playCount}</dd>
          </div>
        </dl>

        <section className="history-list-panel" aria-labelledby="recent-plays-title">
          <header className="history-list-header">
            <p className="section-label" id="recent-plays-title">RECENT PLAYS</p>
            <span>LAST {stats.recentChains.length} / {HISTORY_LIMIT}</span>
          </header>
          {stats.recentChains.length > 0 ? (
            <ol className="history-list">
              {stats.recentChains.map((chain, index) => (
                <li key={`${index}-${chain}`}>
                  <span className="history-rank">#{String(index + 1).padStart(2, '0')}</span>
                  <strong>{chain}</strong>
                  <span className="history-chain-label">CHAIN</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="history-empty">まだプレイ履歴はありません。<br />最初のCHAINを記録しよう。</p>
          )}
        </section>

        <Link className="button button-secondary history-title-button" to="/">TITLE</Link>
      </section>
    </main>
  )
}
