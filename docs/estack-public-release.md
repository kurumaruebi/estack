# estack の公開の手順

estack は公開のリポジトリ 1 つで開発する。最初の公開だけ、今までの非公開のリポジトリの履歴を持ち込まない 1 コミットの書き出しにする。考え方は [estack の計画](../estack/計画.md) の 8 章。

## 書き出しから外す物

- `estack/非公開/`（計画の控え・作業の記録・外の資料の写し）。`scripts/estack/check-personal.ts` の `PRIVATE_PATHS` と同じ一覧を使う。
- Git で追っていない物（`.gitignore` の物、作業場のファイル）。書き出しは `git archive` で、指定した参照の追っているファイルだけを取る。
- ほかのブランチ（`evidence` のスクリーンショットなど）とすべての履歴。

## 最初の公開

1. `main` が最新で、CI が緑なのを確かめる。Actions の支払いが止まっているあいだは CI が走らないので、代わりに「最後に緑だった PR の確認」と、変わった範囲の手元の狭い検査で済ませてよい。公開の最初の push が、その枝での最初の CI になる: 履歴が 1 コミットのとき base が取れないので、コメントと個人の値の差分検査はその回だけ飛び、lint・型・試験は全部回る（ワークフローが `base=none` を出す）。
2. Mac で書き出す。個人の値の一覧（`~/.config/estack/personal-patterns.txt`）が要る。作者は GitHub の noreply のアドレスにする。

   ```sh
   bun scripts/estack/export-public.ts /tmp/estack-public --ref origin/main \
     --author "<ユーザー名> <<ID>+<ユーザー名>@users.noreply.github.com>"
   ```

   作者は `ESTACK_PUBLIC_AUTHOR` でも渡せる。書き出しは次を確かめ、1 つでも落ちたらコミットを作らずに止まる。
   - `LICENSE` と `NOTICE` があり、`Required Notice:` の行が残っている。
   - 個人の値の一覧の値が、どのファイルにも入っていない。
   - `gitleaks` が入っていれば、鍵に見える物が無い。試験用のダミーとして確かめた物だけを `estack/checks/public-export-allowlist.txt`（`<パス> <規則>` の形）に書く。
3. 書き出した物を目で見る（ファイルの数、`git show --stat`）。
4. GitHub で新しい公開のリポジトリを作り、書き出した物を push する。push とリポジトリの作成は持ち主がする（書き出しの道具は push しない）。
5. 公開のリポジトリで、`main` を守る設定（PR と CI の緑を必須に）を入れ、Actions の Secrets（`ESTACK_PERSONAL_HASHES` など）を入れ直す。
6. Mac の作業係・VPS の取り込み・GitHub App の入れ先を、新しいリポジトリに向ける（`~/.config/estack/worker.json` の `repo`、VPS の読み取りの中継の設定、両方の App の入れ先）。
7. 今の非公開のリポジトリは、履歴の控えとして書き込みを止める。

## 公開のあとの決まり

- 開発は公開のリポジトリで、今までと同じ PR の流れ（Mac の作業係 → PR → 持ち主の承認 → squash → VPS への反映）で続ける。
- コミットの作者は GitHub の noreply のアドレスにする。Mac の作業係とそれぞれのチェックアウトで、一度だけ手で設定する: `git config user.email <ID>+<ユーザー名>@users.noreply.github.com`。GitHub の設定の「Keep my email addresses private」と「Block command line pushes that expose my email」も入れる。
- 個人の値（名前・アドレス・IP・チームや App の ID・鍵の名前）は、リポジトリの外（`~/.config/estack/`・GitHub の Secrets・非公開の控え）に置き、コードには設定の名前だけを書く。コミット前のフックと CI の個人の値の検査はそのまま回す。
- コミットの文と PR の本文にも個人の値を入れない。
- 外の資料の写しや作業の記録は `estack/非公開/` にも置かず、リポジトリの外の非公開の控えに置く（公開のリポジトリでは `estack/非公開/` も公開される）。
