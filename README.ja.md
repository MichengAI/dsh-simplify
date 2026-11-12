<p align="center">
  <img src="assets/branding/dsh-simplify-banner.png" alt="DSH Simplify" width="100%">
</p>

<div align="center">

# DSH Simplify

**DeepSeek Harness で最近変更したコードを、機能を保持したまま簡素化・リファクタリング。**

[简体中文](README.zh-CN.md) · [English](README.en.md) · [日本語](README.ja.md) · [Español](README.es.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Русский](README.ru.md) · [Português](README.pt.md)

[更新履歴](CHANGELOG.md) · [Apache-2.0](LICENSE)

[![ライセンス: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)
[![npm package](https://img.shields.io/npm/v/%40michengai%2Fdsh-simplify.svg?label=npm%20package)](https://www.npmjs.com/package/@michengai/dsh-simplify)
[![DSH Web Plugin](https://img.shields.io/badge/DSH%20Web-Plugin-0f766e.svg)](https://github.com/deepseek-ai/deepseek-harness)
[![DSH 対応バージョン 0.2.2-rc.2](https://img.shields.io/badge/DSH-up%20to%200.2.2--rc.2-2563eb.svg)](#インストール)
[![Node.js 22.19+](https://img.shields.io/badge/Node.js-22.19%2B-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org/)

</div>

> DSH Simplify はコミュニティによって保守されている DeepSeek Harness プラグインであり、DeepSeek AI 公式の製品ではありません。現在のセッションで `/simplify` と入力すると、Agent に Git 変更範囲内のコード整理を依頼し、可読性を高めつつ元の機能を維持します。DSH Web および DSH Web を統合したデスクトップアプリケーションをサポートしています。

Agent に送信されるタスクプロンプトは簡体字中国語のままですが、コマンド候補のラベルと説明はインターフェース言語に合わせて自動的に切り替わります。

## 機能概要

一連のコーディングが完了した後、`/simplify` を使って現在の Agent に対し、直前に変更した箇所の整理を依頼します。元の動作を保ちながら可読性を改善します。

- **今回の変更にフォーカス**：Git の変更スコープに沿ってコードを整理し、無関係なファイルへの修正拡大を防ぎます。
- **新規追加ファイルもカバー**：新規ファイルはファイル全体のレビューに対応し、初回コミットが存在しないリポジトリもサポートします。
- **適切なスコープの選択**：デフォルトでは作業ツリーの変更を検査しますが、ステージング領域のみ、指定コミット、または特定パスのみに絞り込むことも可能です。
- **コミット後も振り返り可能**：デフォルトモードでは、作業ツリーに変更がない場合、直近のコミットを振り返って検査できます。
- **スコープが信頼できない場合は停止**：競合、ファイルの予期せぬ変更、読み込み失敗が発生した場合は理由を返し、修正後の再試行を促します。

本コマンドが投入するのは簡素化タスクです。修正および検証が完了したかどうかは、Agent のその後の返答と実際の diff を確認してください。

## DSH プロダクトエコシステム

デスクトップワークベンチをご利用の場合は、[DSH Codex Desktop](https://github.com/MichengAI/dsh-codex-desktop/releases) をダウンロードしてください。すでに [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 環境をお持ちの場合は、各プロジェクトの README に従って必要なプラグインを個別導入できます。以下は 11 個の独自開発プラグインです：

| プラグイン | 用途 |
| --- | --- |
| [Codex UI](https://github.com/MichengAI/dsh-codex-ui) | プロジェクトとセッションの整理、タスク検索、会話ターンの移動 |
| [Agency Agents](https://github.com/MichengAI/dsh-agency-agents) | タスクに応じた専門ロールの選択と召喚 |
| [Skills Manager](https://github.com/MichengAI/dsh-skills-manager) | ローカルスキルの検索、有効化/無効化、新規作成、インポート |
| [Archive Manager](https://github.com/MichengAI/dsh-archive-manager) | アーカイブ済みセッションの検索、復元、クリーンアップ |
| [IM Connect](https://github.com/MichengAI/dsh-im-connect) | メッセージングプラットフォームからのタスク投入と返答受信 |
| [Automation](https://github.com/MichengAI/dsh-automation) | スケジュールに沿ったタスク自動実行と実行履歴の確認 |
| [BTW](https://github.com/MichengAI/dsh-btw) | 現在のコンテキスト内でメインタスクを中断せずに一時的な質問を行う |
| [Simplify](https://github.com/MichengAI/dsh-simplify) | `/simplify` による Git 変更範囲内のコード整理 |
| [PUA](https://github.com/MichengAI/dsh-pua) | 失敗時に別のアプローチを試し、原因を調査し、完了前に検証するよう Agent を誘導 |
| [Code Review](https://github.com/MichengAI/dsh-code-review) | `/review` で独立 Agent によるコードレビューを開始し、現在のセッションでレポートを受信 |
| [Codex Pet](https://github.com/MichengAI/dsh-codex-pet) | デスクトップペットを通じてセッション通知を確認し、ツール承認や質問に回答 |

## 前提条件

- ホスト対応範囲：DeepSeek Harness `0.2.x` 全シリーズ（`>=0.2.0-rc.1 <0.3.0-0`）。`0.2.0-rc.1`、`0.2.0-rc.2`、`0.2.1-rc.1`～`0.2.1-rc.5`、`0.2.2-rc.1`、`0.2.2-rc.2` で互換性検証済み。
- `0.2.0-rc.1` より前の旧ホストはバージョンゲートにより拒否されます。`0.1.x` をお使いの場合はプラグインバージョン `0.1.16` をインストールしてください。
- Node.js >= 22.19、PATH 内で Git が実行可能であること。
- 現在のセッションがローカル Git リポジトリに関連付けられていること。

## インストール

以下のコマンドでは `web` プロファイルを使用しています。環境に応じて置き換えてください。

### Agent にインストールを依頼（推奨）

ローカルのターミナルコマンドを実行できる任意の Agent に以下を送信してください：

```text
DSH プラグイン @michengai/dsh-simplify をローカルの web プロファイルにインストールしてください。実行コマンド: dsh plugin --profile web add @michengai/dsh-simplify@1.0.9 --registry=https://registry.npmjs.org/。インストール後、dsh --profile web --dump-config を実行して設定に michengai-simplify が含まれていることを確認し、DSH をリロードして使い始める方法を教えてください。
```

### npm から手動インストール

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add @michengai/dsh-simplify@1.0.9 --registry=https://registry.npmjs.org/
```

<details>
<summary>ローカルパッケージからインストール</summary>

[GitHub Release](https://github.com/MichengAI/dsh-simplify/releases/tag/v1.0.9) から公開されている tgz をダウンロードし、パッケージのディレクトリで以下を実行します：

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web add .\michengai-dsh-simplify-1.0.9.tgz --ignore-scripts
```

</details>

### リロードと確認

現在のタスクが終了した後にインストールまたは更新してください。反映されない場合は、デスクトップアプリの再読み込み機能を使用するか、`dsh web` を再起動してください。

## 使い方

現在の Git プロジェクトセッションで以下を入力します：

```text
/simplify
```

### 範囲指定オプション

| 入力 | 対象範囲 |
| --- | --- |
| `/simplify` | HEAD から現在の作業ツリーまでの差分（未追跡ファイルを含む）。変更がない場合は直近のコミットを振り返り |
| `/simplify --staged` | ステージング領域のみ。対象のステージ済みファイルに未ステージの変更がある場合は拒否 |
| `/simplify --ref=main` | 指定コミットから現在の作業ツリーまでの差分（未追跡ファイルを含む） |
| `/simplify --ref HEAD` | 明示的な HEAD 範囲。直近コミットへのフォールバックなし |
| `/simplify src/a.ts "src/path with space.ts"` | 指定したファイルのみの変更。未追跡ファイルはファイル全体を対象 |
| `/simplify src` | ディレクトリ内の変更ファイルを展開 |
| `/simplify -- --special.ts` | オプション終端記号 `--` 以降にハイフンで始まるパスを指定可能 |

## トラブルシューティング

**Enter を押した後にテキストが消えるが応答がない**：空のレビューでは Agent は起動しません。コード変更がない場合や、変更行が存在しないファイルのみの場合はリクエストを発行しません。

**現在のディレクトリが Git リポジトリではない**：適切な Git プロジェクトセッションで実行するか、リポジトリを初期化してください。

**ステージングファイルに未ステージの変更が残っている**：それらの変更を保存またはコミットした上で `--staged` を再実行するか、引数なしの `/simplify` を使用してください。

**タイムアウトまたはスナップショットの期限切れ**：対象のファイルやディレクトリを絞り込み、並行編集が完了した後に再試行してください。

## 実行境界

本プラグインは Git の読み取り専用クエリおよびローカルファイルの読み取りのみを実行し、`git add`、コミット、リセット等の書き込み操作は一切自動実行しません。

編集範囲は Agent に対するプロンプトレベルの制約であり、ファイルシステムの書き込み権限を物理的に隔離するものではありません。Agent はユーザーの承認とホストのツール権限に従って編集とテストを実施します。

## アンインストール

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

dsh plugin --profile web remove @michengai/dsh-simplify
```

> 開発および検証ガイドについては、[简体中文](README.zh-CN.md#二次开发) または [English](README.en.md#development) をご参照ください。

## ライセンス

[Apache-2.0](LICENSE)，Copyright 2026 MichengAI。
