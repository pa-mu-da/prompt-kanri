# Web公開（デプロイ）ガイド

この手順を完了すると、発行されたURLを使ってスマホやタブレットから「プロンプト・パレット」が使えるようになります！

## ステップ 1: GitHub へのアップロード
Vercelと連携するために、まずはコードをGitHubに上げる必要があります。

1.  GitHub にログインし、**New repository** を作成します（名前は `prompt-palette` など）。
2.  PCのターミナル（PowerShell等）で以下のコマンドを順番に実行します：
    ```powershell
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/あなたのユーザー名/リポジトリ名.git
    git push -u origin main
    ```

---

## ステップ 2: Vercel へのデプロイ
1.  [Vercel](https://vercel.com/) にアクセスし、GitHubアカウントでログインします。
2.  **Add New > Project** をクリックし、先ほど作成した GitHub リポジトリを選択（Import）します。

---

## ステップ 3: 環境変数（Environment Variables）の設定
**ここが一番重要です！** Firebaseと接続するために必要です。

1.  Vercelのプロジェクト設定画面にある **Environment Variables** セクションを開きます。
2.  `.env.local` にある内容を一つずつ入力して **Add** してください：
    *   `NEXT_PUBLIC_FIREBASE_API_KEY`
    *   `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
    *   `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
    *   `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
    *   `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
    *   `NEXT_PUBLIC_FIREBASE_APP_ID`

---

## ステップ 4: 完了！
1.  **Deploy** ボタンをクリックします。
2.  数分待つと「Congratulations!」と表示され、アプリのURLが発行されます。

そのURLをスマホのブラウザでお気に入りに登録すれば、いつでもどこでもプロンプト管理ができるようになります！
