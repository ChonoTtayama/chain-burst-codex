# CHAIN BURST

1回のクリック／タップで爆発を起こし、動くボールをどこまで連鎖できるかを競う小型Webゲームです。ReactとHTML Canvasで動作し、サーバーやアカウントは必要ありません。

## 主な機能

- 1プレイ1回のクリック／タップによる連鎖ゲーム
- CHAIN数に応じた連鎖演出と10 CHAIN以上のOVERDRIVE表示
- BEST CHAIN、PLAY COUNT、直近10プレイのHISTORY
- BALL COUNT、BALL SPEED、EFFECTのゲーム設定
- PC、タブレット、スマートフォン向けのレスポンシブCanvas

## 技術構成

- React 18 + TypeScript
- Vite 5
- React Router 6
- HTML Canvas
- LocalStorage
- Vitest + jsdom

## 必要環境

- Node.js 24 LTS 以上
- npm

## ローカル起動

```sh
npm install
npm run dev
```

ターミナルに表示された `http://localhost:5173/`（ポート使用中の場合は別の番号）をブラウザで開きます。停止はターミナルで `Ctrl + C` です。

## 確認コマンド

```sh
npm test       # ゲームロジック、Canvas寸法、保存データ、設定を確認
npm run build  # TypeScriptの型検査と本番用ビルド
```

## 操作方法

ゲーム画面でフィールドを1回クリックまたはタップすると爆発が始まります。爆発に触れたボールは次の爆発を起こし、連鎖数がCHAINになります。RESULT画面からRETRY、またはTITLEへ戻れます。

## 保存データ

ブラウザのLocalStorageに次のデータを保存します。データがない・壊れている・保存できない環境でも、初期値でゲームを続けられます。

- BEST CHAIN
- PLAY COUNT
- 直近10プレイのCHAIN履歴
- BALL COUNT / BALL SPEED / EFFECT設定

保存データをリセットする場合は、ブラウザの開発者ツールからこのサイトのLocalStorageを削除してください。
