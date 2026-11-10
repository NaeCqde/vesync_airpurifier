# vesync-airpurifier 仕様

VeSync(Levoit)の空気清浄機を、HTTP の簡単な API で操作・参照する Bun 製サーバー。
仕様を変えたときは、このファイルも必ず更新する。

## 構成

| ファイル | 役割 |
|---|---|
| `index.ts` | サーバー本体(Hono)。VeSync へのログイン、対象機器の特定、HTTP のエンドポイント |
| `devices.ts` | `bun run devices`。アカウントの機器一覧を出し、`UUID` を調べるための補助 |

実行は `bun run start`(= `bun run index.ts`)。`bun run build` で単一の実行ファイルにもできる。
VeSync との通信は `tsvesync` ライブラリに任せる。

## 設定(環境変数)

| 変数 | 必須 | 内容 |
|---|---|---|
| `HOSTNAME` | はい | 待ち受けるアドレス(例 `0.0.0.0`) |
| `PORT` | はい | 待ち受けるポート(例 `10400`) |
| `EMAIL`, `PASSWORD` | はい | VeSync アカウント |
| `UUID` | はい | 対象の空気清浄機の UUID |

どれかが欠けていると、メッセージを出して終了コード 1 で終了する。
タイムゾーンは `Asia/Tokyo`、国コードは `JP` に固定。

## 起動時の動作

1. VeSync にログインし、機器一覧を更新する。機器が取れなければ例外で終了する。
2. `fans` の中から `UUID` が一致する `VeSyncFan` を探し、保持する。なければ「Device not found」で終了する。
3. 機器の表示、CID、UUID をログに出す。

機器の状態は起動時に取得したものを保持する。読み取りのたびに VeSync へ問い合わせ直すことはしない(値は `tsvesync` のオブジェクトが持つ最新の内容)。

## HTTP のエンドポイント

読み取りは GET、変更は**メソッドを問わず**(`app.all`)受け付ける。応答は本文のみのテキスト。

| パス | 動作 |
|---|---|
| `GET /` | 機器の状態の JSON(`displayJSON()`) |
| `GET /air-quality` | 空気質の値 |
| `GET /filter-life` | フィルターの残り寿命 |
| `GET /power` | 電源の状態(`deviceStatus`) |
| `/power/:power` | `on` なら電源オン。**それ以外の値はすべてオフ** |
| `GET /speed` | 現在の風量 |
| `GET /speed-min` | `1` |
| `GET /speed-max` | その機種の最大風量 |
| `/speed/:speed` | `max` は最大、`min` は 1、それ以外は `Number(speed)` を風量にする |
| `GET /mode` | 現在のモード |
| `/mode/:mode` | 指定したモードにする(許される値は `tsvesync` が決める) |

変更は成功すると本文 `OK`(200)。入力の検査は `/power` と `/speed` ではほぼ行わない。失敗は `tsvesync` が出す例外のままで、HTTP の 500 になる。

## セキュリティ上の注意(現状)

- **エンドポイントに認証がない。** 届く相手は誰でも機器を操作できる。`HOSTNAME` は信頼できる LAN だけに向けること。
- 変更が GET でもできるため、Web ページの `<img src>` などから操作される恐れ(CSRF)がある。
- `/speed/:speed` は数値の検査をしない(`NaN` などがライブラリに渡る)。
- 認証情報は環境変数だけで持ち、ログには出さない。
