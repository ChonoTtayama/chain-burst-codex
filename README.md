# CHAIN BURST

1回のクリック／タップで爆発を起こし、動くボールをどこまで連鎖できるかを競う小型Webゲームです。

## 技術構成

- React + TypeScript + Vite
- React Router
- HTML Canvas
- LocalStorage（BEST CHAIN / PLAY COUNT）

## 必要環境

- Node.js 24 LTS 以上
- npm

## ローカル起動

```sh
npm install
npm run dev
```

ターミナルに表示された `http://localhost:5173/`（ポート使用中の場合は別の番号）をブラウザで開きます。

## テストとビルド

```sh
npm test
npm run build
```

## 操作方法

ゲーム画面でフィールドを1回クリックまたはタップすると爆発が始まります。爆発に触れたボールは次の爆発を起こし、連鎖数がCHAINになります。

## 保存データ

BEST CHAINとPLAY COUNTは、ブラウザのLocalStorageに保存されます。
