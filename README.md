# vesync-airpurifier

日本語 | [English](README.en.md)

VeSync(Levoit)の空気清浄機を、HTTP の簡単な API で操作・参照する Bun 製サーバーです。VeSync との通信は `tsvesync` ライブラリに任せています。

## 使い方

依存関係を入れます。

```bash
bun install
```

設定は環境変数で行います。雛形は `.env.example` です(`example.env` としてリリースにも付いています)。`bun run devices` で、アカウントの機器一覧を出して `UUID` を調べられます。

起動します。

```bash
bun run start
```

`bun run build` で単一の実行ファイルにもできます。リリースにはビルド済みの実行ファイル(Windows / macOS / Linux)が置かれます。

## 仕様

動作の決まりは [docs/SPEC.md](docs/SPEC.md) にあります。

このプロジェクトは `bun init`(bun v1.3.6)で作りました。[Bun](https://bun.com) は高速なオールインワンの JavaScript ランタイムです。
