# 📱 Telegram Bitrix Messenger

Интеграция Telegram с Bitrix24 CRM. Сохранение всех сообщений в БД и доступ через REST API для создания мессенджера в Bitrix.

## 🎯 Возможности

- ✅ Получение сообщений из Telegram
- ✅ Сохранение в Supabase
- ✅ Создание контактов в Bitrix
- ✅ REST API для истории переписки
- ✅ API для отправки ответов в Telegram
- ✅ Готово для встраивания в Bitrix приложение

## 📋 Требования

- Node.js 14+
- Telegram Bot Token (от @BotFather)
- Bitrix24 Webhook URL
- Supabase Project

## 🚀 Быстрый старт

### 1. Клонировать репозиторий

```bash
git clone https://github.com/alanmyradiants/telegram-bitrix-messenger.git
cd telegram-bitrix-messenger
```

### 2. Установить зависимости

```bash
npm install
```

### 3. Настроить Supabase

#### 3.1 Создать проект на Supabase
1. Перейти на [supabase.com](https://supabase.com)
2. Нажать "New Project"
3. Выбрать организацию и название проекта
4. Скопировать **Project URL** и **Anon Key**

#### 3.2 Создать таблицы
1. Открыть **SQL Editor** в Supabase Dashboard
2. Скопировать содержимое файла `supabase/migrations/001_init_schema.sql`
3. Запустить SQL

Или используйте Supabase CLI:
```bash
supabase db push
```

### 4. Настроить переменные окружения

Создать файл `.env`:

```bash
# Telegram Bot
TELEGRAM_BOT_TOKEN=ваш_токен_от_botfather
TELEGRAM_WEBHOOK_URL=https://ваш-домен.railway.app/webhook/telegram

# Bitrix24
BITRIX_WEBHOOK_URL=https://ваш-домен.bitrix24.com/rest/webhook_id/

# Supabase
SUPABASE_URL=https://ваш-project.supabase.co
SUPABASE_ANON_KEY=ваш_анон_ключ

# Server
PORT=3000
```

### 5. Установить Telegram Webhook

Перейти по ссылке (после деплоя на Railway):

```
https://ваш-app.railway.app/setup-webhook
```

### 6. Запустить локально

```bash
npm run dev
```

Или в production:

```bash
npm start
```

## 🚂 Развертывание на Railway

### 1. Подключить репозиторий
1. Перейти на [railway.app](https://railway.app)
2. Нажать "New Project"
3. Выбрать "Deploy from GitHub repo"
4. Авторизовать и выбрать репозиторий

### 2. Установить переменные окружения
В Railway Dashboard → Project Settings → Variables добавить:

```
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_WEBHOOK_URL=https://xxxxx.railway.app/webhook/telegram
BITRIX_WEBHOOK_URL=https://xxx.bitrix24.com/rest/xxx/
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
PORT=3000
```

### 3. Развернуть
Railway автоматически развернет при push в репозиторий

## 📡 REST API

### Получить все контакты

```http
GET /api/contacts
```

**Ответ:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "telegram_id": "123456",
      "first_name": "John",
      "last_message": {
        "text": "Привет!",
        "telegram_timestamp": "2026-07-07T10:30:00Z"
      }
    }
  ],
  "count": 1
}
```

### Получить контакт с историей переписки

```http
GET /api/contacts/:contact_id
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "telegram_id": "123456",
    "first_name": "John",
    "chat_id": "123456",
    "messages": [
      {
        "id": "uuid",
        "text": "Привет!",
        "sender_name": "john_doe",
        "direction": "incoming",
        "telegram_timestamp": "2026-07-07T10:30:00Z"
      }
    ]
  }
}
```

### Получить историю переписки

```http
GET /api/conversations/:contact_id?limit=50&offset=0
```

### Отправить сообщение в Telegram

```http
POST /api/send-message
Content-Type: application/json

{
  "contact_id": "uuid",
  "text": "Ваше сообщение"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "id": "uuid",
    "text": "Ваше сообщение",
    "direction": "outgoing"
  }
}
```

## 🗄️ Структура БД

### Таблица `contacts`
- `id` - UUID первичный ключ
- `telegram_id` - ID пользователя Telegram
- `chat_id` - ID чата
- `first_name`, `last_name` - Имя и фамилия
- `username` - Юзернейм Telegram
- `bitrix_contact_id` - ID контакта в Bitrix
- `metadata` - JSON с дополнительными данными

### Таблица `messages`
- `id` - UUID первичный ключ
- `contact_id` - Ссылка на контакт
- `sender_id` - ID отправителя
- `sender_name` - Имя отправителя
- `text` - Текст сообщения
- `direction` - incoming или outgoing
- `telegram_timestamp` - Время сообщения

## 🔄 Поток работы

```
Telegram Message
    ↓
POST /webhook/telegram (Node.js)
    ↓
1. Find/Create Contact (Supabase)
2. Save Message (Supabase)
3. Create Activity in Bitrix
4. Send confirmation to Telegram
    ↓
Ready for Bitrix App UI
```

## 🎨 Следующий этап: Bitrix приложение

Код готов для встраивания в Bitrix приложение:

```javascript
// В Bitrix приложении можно использовать:
const contacts = await fetch('/api/contacts').then(r => r.json());
const conversation = await fetch(`/api/contacts/${id}`).then(r => r.json());

// Отправить сообщение:
await fetch('/api/send-message', {
  method: 'POST',
  body: JSON.stringify({ contact_id: id, text: 'Привет!' })
});
```

## 📞 Поддержка

Вопросы? Откройте Issue на GitHub или напишите в Telegram @alanmyradiants

## 📄 Лицензия

MIT
