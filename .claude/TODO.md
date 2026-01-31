# Taiwan Heritage Hunter - 剩餘工作項目

> 最後更新: 2026-01-31

## 已完成項目 ✅

### Phase 1: 安全性強化
- [x] `src/lib/validation.ts` - Zod 驗證 schema (搜尋參數、土地資料、API 回應)
- [x] `sanitizeInput()` - XSS 防護函數
- [x] API 路由套用驗證 (`/api/lands`, `/api/cities`, `/api/stats`)

### Phase 2: 效能優化
- [x] `useDebounce` hook - 300ms 防抖機制
- [x] 修復 `loadMore` 閉包問題 - 使用 `useRef` 保持最新 filters

### Phase 3: 程式碼品質
- [x] `src/lib/case-converter.ts` - camelCase/snake_case 轉換工具
- [x] JSDoc 註解 - `hooks.ts`, `data-loader.ts`, `api-client.ts`

### Git
- [x] Commit: `487564f` - 已推送到 `origin/main`

---

## 待處理項目 ⏳

### 1. Supabase 設定 (高優先)
API 端點目前回傳 503 錯誤，需要設定環境變數：

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**步驟：**
1. 建立 Supabase 專案 (https://supabase.com)
2. 執行 `supabase/migrations/001_initial_schema.sql` 建立資料表
3. 複製 API URL 和 anon key 到 `.env.local`

### 2. 區域座標擴充 (中優先)
`src/lib/district-coords.ts` 目前僅涵蓋約 40% 台灣區域。

**需要添加：**
- 高雄市各區
- 台中市各區
- 桃園市各區
- 其他縣市

### 3. Phase 4: 測試 (低優先)
審查報告建議但尚未實作：

- [ ] Jest 單元測試設定
- [ ] Playwright E2E 測試
- [ ] API 整合測試

### 4. 次要改進
- [ ] Rate limiting 實作
- [ ] 請求重試機制
- [ ] 請求逾時設定
- [ ] 統計資料快取

---

## 已知問題

1. **Next.js lockfile 警告** - 根目錄有多個 `package-lock.json`，可在 `next.config.js` 設定 `turbopack.root` 解決

2. **Port 3000 佔用** - 如果開發伺服器無法啟動，檢查是否有其他程序佔用：
   ```bash
   lsof -i :3000
   ```

---

## 快速啟動

```bash
cd "/Users/redlin/Desktop/Taiwan Heritage Hunter /heritage-hunter"
npm run dev
```

## 相關檔案

| 檔案 | 用途 |
|------|------|
| `src/lib/validation.ts` | Zod 驗證 schema |
| `src/lib/hooks.ts` | React hooks (含防抖) |
| `src/lib/case-converter.ts` | 命名轉換工具 |
| `supabase/migrations/` | 資料庫 schema |
