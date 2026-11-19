import type { PartialTranslation } from "../../../message";
import type { messages as source } from "../../en/error/update";

export const messages = {
  "error.update.unsupported": "アップデートはインストール済みのデスクトップ版でご利用いただけます。",
  "error.update.notReady": "インストールできるアップデートがありません。",
  "error.update.restartFailed": "アップデートをインストールするための再起動ができませんでした。",
  "error.update.downloadStalled": "アップデートのダウンロードが応答しなくなりました。もう一度お試しください。",
  "error.update.installFailed":
    "アップデートをインストールできませんでした。estack を終了してから開き直し、もう一度お試しください。",
  "error.update.downloadFailed": "アップデートをダウンロードできませんでした。もう一度お試しください。",
  "error.update.checkFailed": "アップデートを確認できませんでした。もう一度お試しください。",
  "error.update.checkStalled": "アップデートの確認が応答しなくなりました。もう一度お試しください。",
  "error.update.checkOffline":
    "アップデートサービスに接続できませんでした。インターネット接続を確認してから、もう一度お試しください。",
  "error.update.checkUnavailable":
    "アップデートサービスから応答がありませんでした。数分後に estack が自動でもう一度試します。",
  "error.update.checkNoRelease":
    "このプラットフォーム向けに公開されたアップデートは見つかりませんでした。数分後に estack が自動でもう一度試します。",
  "error.update.managedByNix": "この estack のアップデートは Nix がインストールします。Nix で更新してください。",
  "error.update.managedByHost":
    "この Mac のアップデートはホストがインストールします。ホストのメンテナンスが実行されるまで、アップデートは準備済みのままです。",
  "error.update.siblingSession":
    "このアプリケーションから別の estack セッションがまだ実行中です。先に他のすべての macOS ユーザーアカウントで estack を終了してから、アップデートをもう一度インストールしてください。",
  "error.update.siblingSessionSameAccount":
    "このユーザーアカウントで別の estack プロセスがまだ実行中です。それを終了してから、もう一度アップデートをインストールしてください。",
  "error.update.siblingCheckFailed":
    "他の estack セッションを確認できませんでした。インストールする前にもう一度お試しください。",
  "error.update.readOnlyLocation":
    "この場所からは estack のアップデートをインストールできません。estack を終了してください。Finder で estack を「アプリケーション」フォルダにドラッグします（すでにそこにある場合は、一度外に出してから戻します）。その後 estack を開き、もう一度アップデートをインストールしてください。",
  "error.update.appImageMissing":
    "AppImage ファイルが移動、名前変更、または置き換えられたため、estack はアップデートをインストールできません。estack を終了してから、AppImage ファイルをもう一度開いてください。",
  "error.update.appImageReadOnly":
    "estack は AppImage ファイルのフォルダにアップデートをインストールできません。estack を終了し、AppImage ファイルをホームフォルダ内のフォルダに移動してから開き、もう一度アップデートをインストールしてください。",
  "error.update.remoteDisabled": "このコンピューターでは、サーバー管理者からのアップデートはオフになっています。",
  "error.update.restartStarted": "estack はアップデートをインストールするため、すでに再起動しています。",
  "error.update.alreadyRestarting": "estack はすでに再起動しています。",
} as const satisfies PartialTranslation<typeof source>;
