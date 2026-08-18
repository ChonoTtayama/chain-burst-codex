import { Link } from 'react-router-dom'
import { readGameStats } from '../storage/gameStats'

export function TitlePage() {
  const stats = readGameStats()

  return (
    <main className="title-page shell">
      <section className="title-card" aria-labelledby="game-title">
        <p className="eyebrow">ONE CLICK. ONE CHANCE.</p>
        <h1 id="game-title">CHAIN <span>BURST</span></h1>
        <p className="title-lede">爆発をひとつ起こして、動くボールをどこまで連鎖させられるか。</p>

        <div className="how-to" aria-label="遊び方">
          <p className="section-label">HOW TO PLAY</p>
          <ol>
            <li>ボールが動くフィールドを見極める</li>
            <li>クリック／タップは一度だけ</li>
            <li>爆発の連鎖で最高CHAINを目指す</li>
          </ol>
        </div>

        <div className="title-actions">
          <Link className="button button-primary start-button" to="/game">START <span aria-hidden="true">→</span></Link>
          <Link className="button button-secondary history-button" to="/history">HISTORY</Link>
        </div>

        <dl className="stats-grid">
          <div>
            <dt>BEST CHAIN</dt>
            <dd>{stats.bestChain}</dd>
          </div>
          <div>
            <dt>PLAY COUNT</dt>
            <dd>{stats.playCount}</dd>
          </div>
        </dl>
      </section>
    </main>
  )
}
