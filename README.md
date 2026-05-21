# Lingua

Lingua 是一個受 Duolingo 啟發的 AI 語言學習 App，使用 Expo、React Native、Expo Router、Clerk、Stream Video、NativeWind、Zustand 與 AsyncStorage 建置。

這個專案同時是一個教學型專案。程式碼應該維持實用、清楚、容易講解，讓開發者可以一個功能接著一個功能學會如何組成現代 AI Expo App。

## 目前功能

- 使用吉祥物插圖的 Onboarding 畫面，並導向 Clerk 登入與註冊流程。
- 支援 Email 驗證碼登入、Email/密碼註冊，以及 Google、LINE、GitHub、Apple OAuth。
- 依照登入狀態與語言選擇狀態自動導流：Onboarding、語言選擇、主頁分頁。
- 支援國語、英文、西班牙文、法文、日文、韓文的語言選擇。
- Home 儀表板包含問候語、每日 XP 預覽、目前語言、目前單元與今日計畫。
- Learn 分頁以 typed local lesson data 顯示單元課程卡與練習卡。
- AI 老師課程畫面使用 Stream 語音通話，並串接獨立的 Vision Agent 服務。
- Chat 分頁提供本機 mock AI 家教回覆流程，聊天紀錄會持久化保存。
- 使用 PostHog 追蹤 app 開啟、畫面瀏覽、登入註冊、語言選擇與課程生命週期事件。

## 技術棧

- Expo SDK 54
- React 19 與 React Native 0.81
- TypeScript
- Expo Router
- NativeWind v5 preview、Tailwind CSS v4、`react-native-css`
- Zustand 搭配 AsyncStorage 持久化
- Clerk 驗證
- Stream Video React Native SDK 與 Stream Node SDK
- PostHog React Native
- `vision-agent/` 底下的 Python Vision Agent 服務

## 專案架構

```txt
app/
  (auth)/                 Clerk 登入與註冊 routes
  (tabs)/                 登入後主要 tab routes
  api/                    Stream 與 Vision Agent 的 Expo Router API routes
  lesson/[lessonId].tsx   課程詳細 route
  _layout.tsx             Root providers、字體、Clerk、PostHog、Stack
  index.tsx               登入與語言狀態導流入口
  onboarding.tsx          公開 onboarding route
  LanguageSelection.tsx   語言選擇 route

components/
  auth-screen.tsx         共用 Clerk auth UI
  audio-teacher-session.tsx
  bottom-tab-bar.tsx
  chat-*                  Chat UI 元件
  lesson-card.tsx

constants/
  images.ts               集中管理圖片 imports

data/
  languages.ts            支援語言資料
  units.ts                單元資料
  lessons.ts              合併輸出的課程資料
  course-lessons/         各語言課程內容

features/
  chat/                   Mock tutor reply 行為

hooks/
  useStreamAudioCall.ts   Stream 通話生命週期、Vision Agent session、字幕

lib/
  analytics.ts            PostHog event helpers
  api.ts                  Web/native API URL helper
  posthog.ts              PostHog client 設定

store/
  UseLanguageStore.ts     已選語言持久化
  use-chat-store.ts       聊天紀錄持久化

types/
  learning.ts             共用學習領域 types

vision-agent/
  agent.py                Python AI 老師服務
  README.md               Vision Agent 設定說明
```

## 安裝與設定

安裝依賴：

```bash
npm install
```

在專案根目錄建立本機 `.env`：

```bash
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# 當 native build 無法透過 dev host 連到 Expo Router API routes 時使用。
EXPO_PUBLIC_API_BASE_URL=http://localhost:8081

# Stream 語音課程與 API route token 建立需要。
STREAM_API_KEY=...
STREAM_API_SECRET=...

# App 連接 Python Vision Agent 服務時需要。
VISION_AGENT_BASE_URL=http://localhost:8000
VISION_AGENT_TIMEOUT_MS=30000

# 選用 analytics。沒有有效 key 時 PostHog 會停用。
POSTHOG_API_KEY=phc_...
POSTHOG_HOST=https://us.i.posthog.com
```

`app/_layout.tsx` 會檢查 `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`。如果沒有設定，App 會直接拋出錯誤，因為 Clerk Provider 會包住整個 App。

## 啟動 App

啟動 Expo dev server：

```bash
npm run start
```

常用平台指令：

```bash
npm run ios
npm run android
npm run web
```

AI 老師語音課程使用 Stream 的 native WebRTC 相關依賴，因此完整測試建議使用 development build 或 native runtime，不建議只依賴 Expo Go。

## 啟動 Vision Agent

`vision-agent/` 裡的 Python 服務會加入 App 建立的 Stream call，負責即時 AI 老師行為。

可以建立 `vision-agent/.env`，或使用 parent `.env` 中的 server-side secrets：

```bash
STREAM_API_KEY=...
STREAM_API_SECRET=...
OPENAI_API_KEY=...
```

本機啟動：

```bash
cd vision-agent
uv venv --python 3.12
uv sync
uv run agent.py serve --host 0.0.0.0 --port 8000
```

接著讓 Expo App 指向這個服務：

```bash
VISION_AGENT_BASE_URL=http://localhost:8000
```

## App 流程

1. `app/index.tsx` 等待 Clerk 與語言 store hydration 完成。
2. 未登入使用者會導向 `/onboarding`。
3. 已登入但尚未選語言的使用者會導向 `/LanguageSelection`。
4. 已登入且已選語言的使用者會進入 `/home`。
5. Tab layout 會用相同的登入與語言狀態檢查保護所有主要分頁。
6. 課程 route 從 `data/` 載入 typed lesson content，並渲染 `AudioTeacherSession`。

## 資料模型

課程內容目前刻意使用本機 TypeScript 資料，方便教學與版本控管。

- 新增或修改語言：`data/languages.ts`
- 新增單元：`data/units.ts`
- 新增課程內容：`data/course-lessons/`
- 將新課程陣列匯出：`data/lessons.ts`
- 共用資料結構需對齊：`types/learning.ts`

這個版本沒有資料庫。除非功能明確需要後端，否則優先使用本機 TypeScript data、Zustand 與 AsyncStorage。

## 樣式規則

- 一般 UI 樣式使用 NativeWind classes。
- React Native 特例使用 `StyleSheet` 或 inline styles，例如 `ScrollView.contentContainerStyle`、`KeyboardAvoidingView`、動態尺寸、pressed state、shadow、platform-specific values。
- Design tokens 與可重用 utilities 放在 `global.css`。
- App 圖片必須透過 `constants/images.ts` 集中 import。
- Poppins 字體在 `app/_layout.tsx` 載入。

## API Routes

Expo Router API routes 放在 `app/api/`。

- `POST /api/stream/audio-call`：建立 Stream audio room、upsert 學習者與 AI 老師 user、啟動 call，並回傳短效 call token。
- `POST /api/vision-agent/session`：要求 Python Vision Agent 服務加入 Stream call。
- `DELETE /api/vision-agent/session`：停止 Vision Agent session。
- `GET /api/vision-agent/captions`：從 Vision Agent 服務輪詢 buffered live captions。

Secrets 必須留在 API routes 或 Python service。不要把 Stream secrets、OpenAI keys 或 agent credentials 暴露在 mobile code。

## 品質檢查

完成 feature work 前請執行：

```bash
npm run lint
npm run typecheck
```

## 開發注意事項

- `app/` 裡的 screens 應專注在 routing 與組合 components。
- 只有當 UI 概念清楚或能讓 screen 更好讀時，才抽成 component。
- 優先做小而可教學的功能，避免大範圍重寫。
- 驗證使用 Clerk，學習內容使用 typed local files，全域 client state 使用 Zustand。
- 新增安全相關的 AI 或 Stream 功能時，應透過 server-side API routes 或 `vision-agent/` 處理。
