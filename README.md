# にーいちよん / 214
![keyvisual](public/images/keyvisual.png)

# 日本語

## 概要
にーいちよんは、個性豊かな３人の女子高生たちとバレンタインデーを楽しむエンタメチャットアプリです。

## 特徴

### 1. キャラクターとの対話
- 3人の個性的なキャラクターとリアルタイムな会話が可能
  - まりぴ: ピンク、明るく元気なギャル。パソコン部の幽霊部員。原宿のレインボーわたあめ屋さんでバイト中。グミ（特にハリボーゴールドベア）が大好き。平成ギャル系のファッションとメイクに興味あり。
  - のんたん: 水色、ネガティブでめんどくさがりの17歳の女子高生、文芸部。精神的に不安定、甘いもの（特にパイの実）が大好き、人混みが苦手で社会不安あり、自己否定的だが友達にはやさしい。
  - ななほまる: 金髪、軽音部の女子高生でギター担。弟をわりと溺愛している。感情表現が豊かで自己主張が強いが、恋愛感情がよく分からない。

### 2. 感情認識
- ドキドキメーター
  - 現在の感情値をリアルタイムで表示
  - -100から100の範囲で感情を数値化
  - 視覚的なアニメーション効果で感情の変化を表現
- チョコメーター
  - 会話を通じて蓄積される感情スコアを表示
  - キャラクターごとの感情係数による補正

### 3. AI日記生成機能
- ユーザープロフィールを基にした自動日記生成
- キャラクターの個性を反映した文体と内容
- 3段階の生成プロセス
  1. ユーザーの性格分析
  2. キャラクターの思考生成
  3. 日記の文章生成

## 技術スタック
### フロントエンド
- TypeScript ^5.0.0
- React ^19.0.0
- Vite ^5.0.0
- Tailwind CSS ^3.4.17
  - daisyUI プラグイン
  - カスタムアニメーション設定

### バックエンド (Google Cloud)
- Node.js ^20.0.0
- Cloud Run
- Vertex AI (Gemini-1.0-pro)
  - テキスト生成
  - 感情分析
  - 日記生成

### 開発ツール
- npm ^10.0.0
- ESLint ^9.0.0
- Playwright ^1.41.0（E2Eテスト）
- vitest

## クイックスタート
**1. リポジトリのクローン**
```bash
git clone https://github.com/yasuna-sub/214.git
```

**2. 依存パッケージのインストール**
```bash
npm install
```

**3. 環境変数の設定**
```bash
cp .env.example .env
# .envファイルを編集し、必要な環境変数を設定
```

**4. Vertex AI Studioの設定**
0. Google Cloudアカウントの作成
1. Google Cloud CLIのインストール
2. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
3. プロジェクトを選択または新規作成
4. Vertex AI APIの有効化
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```
4. サービスアカウントの作成と認証情報のダウンロード
   ```bash
   # サービスアカウントの作成
   gcloud iam service-accounts create vertex-ai-user \
     --display-name="Vertex AI User"

   # 必要な権限の付与
   gcloud projects add-iam-policy-binding [YOUR_PROJECT_ID] \
     --member="serviceAccount:vertex-ai-user@[YOUR_PROJECT_ID].iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"

   # 認証情報のダウンロード
   gcloud iam service-accounts keys create vertex-ai-key.json \
     --iam-account=vertex-ai-user@[YOUR_PROJECT_ID].iam.gserviceaccount.com
   ```
5. ダウンロードした認証情報を`.env`ファイルに設定
   ```
   GOOGLE_APPLICATION_CREDENTIALS="./vertex-ai-key.json"
   ```

**5. 開発サーバーの起動**
```bash
npm run dev
npm run server
```

## デプロイ
### Cloud Runへのデプロイ
#### 前提条件
0. Google Cloudアカウントの作成
1. Google Cloud CLIのインストール
2. Dockerのインストール
3. プロジェクトのビルド設定の確認

#### デプロイ手順
0. Google Cloud CLIの初期設定
```bash
gcloud auth login
gcloud config set project [YOUR_PROJECT_ID]
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

1. Dockerイメージのビルドとプッシュ
```bash
docker build -t gcr.io/[YOUR_PROJECT_ID]/your-app-name .
gcloud auth configure-docker
docker push gcr.io/[YOUR_PROJECT_ID]/your-app-name
```

2. Cloud Runへのデプロイ
```bash
gcloud run deploy your-app-name \
  --image gcr.io/[YOUR_PROJECT_ID]/your-app-name \
  --platform managed \
  --region asia-northeast0 \
  --allow-unauthenticated
```

## ライセンス
本プロジェクトは、Apache2.0ライセンスの下で提供されています。
詳細は[License.md](Lisense.md)と[NOTICE.md](NOTICE.md)をご参照ください。

## 謝辞
本プロジェクトは[AI Agent Hackathon with Google Cloud](https://zenn.dev/hackathons/2024-google-cloud-japan-ai-hackathon)の参加作品として開発されました。

Google Cloudのクレジットを活用させていただき、Cloud Run, Cloud Build, Vertex AI Studioの実装が可能となりました。

--------

# English

## Overview
"214" is an entertainment chat application where users can enjoy Valentine's Day interactions with three unique high school girl characters.

## Features

### 1. Character Dialogue System
- Real-time conversations with three distinctive characters:
  - Maripi: Pink-themed, bright and energetic gyaru. A ghost member of the computer club. Works part-time at a rainbow cotton candy shop in Harajuku. Loves gummy candies (especially Haribo Gold Bears). Interested in Heisei-era gyaru fashion and makeup.
  - Nontan: Light blue-themed, negative and lazy 17-year-old high school girl in the literature club. Mentally unstable, loves sweets (especially Pai no Mi), struggles with crowds and social anxiety, self-deprecating but kind to friends.
  - Nanahomaru: Blonde, a guitar player in the light music club. Quite doting on her younger brother. Expressive and assertive, but confused about romantic feelings.

### 2. Emotion Recognition System
- Doki Doki Meter
  - Real-time display of current emotion values
  - Emotion quantification ranging from -100 to 100
  - Visual animation effects expressing emotional changes
- Chocolate Meter
  - Displays accumulated emotion scores through conversations
  - Emotion coefficient adjustments per character

### 3. AI Diary Generation
- Automatic diary generation based on user profiles
- Character-specific writing style and content
- 3-stage generation process:
  1. User personality analysis
  2. Character thought generation
  3. Diary text creation

## Technology Stack
### Frontend
- TypeScript ^5.0.0
- React ^19.0.0
- Vite ^5.0.0
- Tailwind CSS ^3.4.17
  - daisyUI plugin
  - Custom animation settings

### Backend (Google Cloud)
- Node.js ^20.0.0
- Cloud Run
- Vertex AI (Gemini-1.0-pro)
  - Text generation
  - Emotion analysis
  - Diary generation

### Development Tools
- npm ^10.0.0
- ESLint ^9.0.0
- Playwright ^1.41.0 (E2E testing)
- vitest

## Setup
**1. Clone repository**
```bash
git clone https://github.com/yasuna-sub/214.git
```

**2. Install dependencies**
```bash
npm install
```

**3. Configure environment variables**
```bash
cp .env.example .env
# Edit .env file with required variables
```

**4. Configure Vertex AI Studio**
1. Access [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a new project
3. Enable Vertex AI API
   ```bash
   gcloud services enable aiplatform.googleapis.com
   ```
4. Create service account and download credentials
   ```bash
   # Create service account
   gcloud iam service-accounts create vertex-ai-user \
     --display-name="Vertex AI User"

   # Grant necessary permissions
   gcloud projects add-iam-policy-binding [YOUR_PROJECT_ID] \
     --member="serviceAccount:vertex-ai-user@[YOUR_PROJECT_ID].iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"

   # Download credentials
   gcloud iam service-accounts keys create vertex-ai-key.json \
     --iam-account=vertex-ai-user@[YOUR_PROJECT_ID].iam.gserviceaccount.com
   ```
5. Configure downloaded credentials in `.env` file
   ```
   GOOGLE_APPLICATION_CREDENTIALS="./vertex-ai-key.json"
   ```

**5. Start development server**
```bash
npm run dev
npm run server
```

## Deployment
### Cloud Run Deployment
#### Prerequisites
0. Create Google Cloud account
1. Install Google Cloud CLI
2. Install Docker
3. Check project build settings

#### Deployment Steps
0. Initialize Google Cloud CLI
```bash
gcloud auth login
gcloud config set project [YOUR_PROJECT_ID]
gcloud services enable cloudbuild.googleapis.com run.googleapis.com
```

1. Build and push Docker image
```bash
docker build -t gcr.io/[YOUR_PROJECT_ID]/practice-app .
gcloud auth configure-docker
docker push gcr.io/[YOUR_PROJECT_ID]/your-app-name
```

2. Deploy to Cloud Run
```bash
gcloud run deploy your-app-name \
  --image gcr.io/[YOUR_PROJECT_ID]/your-app-name \
  --platform managed \
  --region asia-northeast0 \
  --allow-unauthenticated
```

## License
This project is provided under the Apache 2.0 License.
For details, please refer to [License.md](License.md)and [NOTICE.md](NOTICE.md).

## Acknowledgments
This project was developed as a participating entry in the [AI Agent Hackathon with Google Cloud](https://zenn.dev/hackathons/2024-google-cloud-japan-ai-hackathon).

We were able to implement Cloud Run, Cloud Build, and Vertex AI Studio for the first time thanks to the Google Cloud credits provided.


