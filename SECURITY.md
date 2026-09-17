# 🛡️ Security Policy

## Supported Versions

Routiva is committed to safeguarding user data through a local-first, zero-cloud architecture.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

---

## 🔒 Local-First Privacy Guarantee

1. **No External Telemetry**: Routiva contains zero analytics trackers, third-party user monitoring, or ad SDKs.
2. **On-Device Storage**: All habit information, logs, streaks, and timestamps reside solely in local SQLite storage (`routiva.db`) and Expo SecureStore.
3. **Network Isolation**: Habit tracking functions 100% offline without requiring internet access or transmission of user habits to external servers.
