import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BALL_COUNT_OPTIONS,
  BALL_SPEED_OPTIONS,
  EFFECT_OPTIONS,
  readGameSettings,
  writeGameSettings,
  type BallCount,
  type BallSpeed,
  type EffectLevel,
  type GameSettings,
} from '../settings/gameSettings'

const speedLabels: Record<BallSpeed, string> = {
  slow: 'SLOW',
  normal: 'NORMAL',
  fast: 'FAST',
}

const effectLabels: Record<EffectLevel, string> = {
  normal: 'NORMAL',
  reduced: 'REDUCED',
}

export function SettingsPage() {
  const [settings, setSettings] = useState<GameSettings>(() => readGameSettings())

  const updateSettings = (next: Partial<GameSettings>) => {
    setSettings(writeGameSettings({ ...settings, ...next }))
  }

  return (
    <main className="settings-page shell">
      <section className="settings-card" aria-labelledby="settings-title">
        <Link className="history-back" to="/">← TITLE</Link>
        <p className="eyebrow">PLAYER PREFERENCES</p>
        <h1 id="settings-title">GAME <span>SETTINGS</span></h1>
        <p className="settings-lede">次のプレイから反映されます。</p>

        <section className="setting-group" aria-labelledby="ball-count-title">
          <div className="setting-group-heading">
            <p className="section-label" id="ball-count-title">BALL COUNT</p>
            <span>{settings.ballCount} BALLS</span>
          </div>
          <div className="setting-options setting-options-three">
            {BALL_COUNT_OPTIONS.map((count) => (
              <button
                key={count}
                className={settings.ballCount === count ? 'setting-option is-selected' : 'setting-option'}
                type="button"
                aria-pressed={settings.ballCount === count}
                onClick={() => updateSettings({ ballCount: count as BallCount })}
              >
                {count}
              </button>
            ))}
          </div>
        </section>

        <section className="setting-group" aria-labelledby="ball-speed-title">
          <div className="setting-group-heading">
            <p className="section-label" id="ball-speed-title">BALL SPEED</p>
            <span>{speedLabels[settings.ballSpeed]}</span>
          </div>
          <div className="setting-options setting-options-three">
            {BALL_SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                className={settings.ballSpeed === speed ? 'setting-option is-selected' : 'setting-option'}
                type="button"
                aria-pressed={settings.ballSpeed === speed}
                onClick={() => updateSettings({ ballSpeed: speed })}
              >
                {speedLabels[speed]}
              </button>
            ))}
          </div>
        </section>

        <section className="setting-group" aria-labelledby="effect-title">
          <div className="setting-group-heading">
            <p className="section-label" id="effect-title">EFFECT</p>
            <span>{effectLabels[settings.effect]}</span>
          </div>
          <div className="setting-options setting-options-two">
            {EFFECT_OPTIONS.map((effect) => (
              <button
                key={effect}
                className={settings.effect === effect ? 'setting-option is-selected' : 'setting-option'}
                type="button"
                aria-pressed={settings.effect === effect}
                onClick={() => updateSettings({ effect })}
              >
                {effectLabels[effect]}
              </button>
            ))}
          </div>
          <p className="setting-description">REDUCEDは連鎖時の強い発光やOVERDRIVE演出を抑えます。</p>
        </section>

        <p className="settings-saved" role="status">SAVED AUTOMATICALLY</p>
        <Link className="button button-primary settings-title-button" to="/">TITLE</Link>
      </section>
    </main>
  )
}
