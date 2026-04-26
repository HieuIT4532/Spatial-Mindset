# Phase 1 — Auth Integration Notes

## Files đã được tạo tự động:
- `src/firebase.js` — Firebase config (cần điền env vars)
- `src/hooks/useAuth.js` — AuthContext + Provider + hooks
- `src/hooks/useUserData.js` — Offline-first XP/Streak sync với Firestore
- `src/components/AuthModal.jsx` — Modal đăng nhập/đăng ký
- `src/components/UserAvatar.jsx` — Avatar button trên header
- `src/AppWithAuth.jsx` — Wrapper tích hợp Auth vào App

## Setup cần làm (5 phút):

### 1. Cài Firebase SDK
```bash
npm install firebase
```

### 2. Tạo .env.local
Copy `.env.example` → `.env.local`, điền config từ Firebase Console:
- Vào https://console.firebase.google.com
- Project của bạn (hoặc tạo mới) → Project Settings → Web App
- Copy config vào .env.local

### 3. Bật Authentication trong Firebase Console
- Authentication → Sign-in method
- Bật: Email/Password ✅
- Bật: Google ✅

### 4. Tạo Firestore Database
- Firestore Database → Create database → Start in test mode
- (Sau này thêm Security Rules khi deploy production)

### 5. Thêm UserAvatar vào header
Trong `GameHUD.jsx`, import và render `<UserAvatar>` (xem comment trong file).

## Firestore Data Structure:
```
users/
  {uid}/
    uid: string
    displayName: string
    email: string
    xp: number
    streak: number
    lastActive: timestamp
    rankName: string
    level: number
    achievements: array
    createdAt: timestamp
```

## Offline-first Strategy:
- XP/Streak luôn lưu localStorage trước (instant, no latency)
- Sync lên Firestore async (background)
- Khi login: lấy max(local, cloud) để không mất data offline
- Firestore SDK tự handle offline queue khi mất mạng
