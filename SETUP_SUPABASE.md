# 🗄️ Настройка Supabase

Подробная инструкция по настройке Supabase для хранения сообщений и контактов.

## Шаг 1️⃣: Создать проект Supabase

1. Перейти на [supabase.com](https://supabase.com)
2. Нажать **"New project"** или **"+ New Project"**
3. Выбрать организацию (или создать новую)
4. Заполнить данные:
   - **Name**: `telegram-bitrix-messenger` (или любое другое имя)
   - **Database Password**: Сильный пароль (скопировать, пригодится!)
   - **Region**: Выбрать ближайший к вам (например, `eu-west-1` для Европы)
5. Нажать **"Create new project"**

⏳ Ждем 1-2 минуты, пока Supabase создает проект...

## Шаг 2️⃣: Получить ключи доступа

После создания проекта:

1. Открыть **Project Settings** → **API** (слева в меню)
2. Скопировать и сохранить:
   - **Project URL** (например: `https://xyzabc.supabase.co`)
   - **anon public** (anon key) - это ваш `SUPABASE_ANON_KEY`

Пример:
```
SUPABASE_URL=https://xyzabc.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...very_long_key...XYZ
```

## Шаг 3️⃣: Создать таблицы БД

### Способ A: Через SQL Editor (рекомендуется)

1. В левом меню Supabase: **SQL Editor**
2. Нажать **"New Query"** или **"New SQL snippet"**
3. Скопировать весь код из файла `supabase/migrations/001_init_schema.sql`
4. Вставить в SQL Editor
5. Нажать **"Run"** или Ctrl+Enter

Если все прошло успешно, вы увидите сообщение ✅ "Success"

### Способ B: Через Supabase CLI

Если у вас установлен Supabase CLI:

```bash
# Инициализировать Supabase в проекте
supabase init

# Запустить миграцию
supabase db push
```

## Шаг 4️⃣: Проверить таблицы

1. Откройте **Table Editor** (левый меню)
2. Вы должны увидеть таблицы:
   - `contacts`
   - `messages`
   - `conversation_summaries`

Если таблицы появились - успех! ✅

## Шаг 5️⃣: Добавить ключи в .env

Обновить файл `.env`:

```bash
SUPABASE_URL=https://xyzabc.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...your_key_here...
```

## Шаг 6️⃣: Протестировать подключение

```bash
npm install
npm run dev
```

Если сервер запустился без ошибок - БД подключена! ✅

## 🔐 Безопасность (важно!)

Текущая конфигурация RLS (Row Level Security) позволяет публичный доступ.

Для production нужно:

1. **Ограничить доступ** к таблицам через RLS policies
2. **Использовать Service Role Key** вместо Anon Key для критических операций
3. **Включить аутентификацию** Supabase

### Быстрая секьюризация

В Supabase Dashboard → **Authentication** → **Policies**:

```sql
-- Разрешить доступ только через API ключ
CREATE POLICY "Allow API access only" ON messages
  FOR ALL TO authenticated USING (true);
```

## 📊 Структура данных

### contacts
```
id (UUID) - Первичный ключ
telegram_id (TEXT) - ID из Telegram
chat_id (TEXT) - ID чата
first_name (TEXT) - Имя
last_name (TEXT) - Фамилия  
username (TEXT) - Юзернейм
phone_number (TEXT) - Номер телефона
is_bot (BOOLEAN) - Бот ли это
bitrix_contact_id (INTEGER) - ID контакта в Bitrix
metadata (JSONB) - Доп. данные в JSON
created_at, updated_at (TIMESTAMP)
```

### messages
```
id (UUID) - Первичный ключ
contact_id (UUID) - Ссылка на контакт
telegram_message_id (BIGINT) - ID из Telegram
chat_id (TEXT) - ID чата
sender_id (TEXT) - ID отправителя
sender_name (TEXT) - Имя отправителя
text (TEXT) - Текст сообщения
message_type (TEXT) - Тип (text, photo, video)
direction (TEXT) - incoming / outgoing
telegram_timestamp (TIMESTAMP) - Время в Telegram
metadata (JSONB) - Доп. данные
created_at, updated_at (TIMESTAMP)
```

## 🧪 Протестировать через Postman/cURL

После запуска сервера:

```bash
# Получить все контакты
curl http://localhost:3000/api/contacts

# Отправить тестовое сообщение
curl -X POST http://localhost:3000/api/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "contact_id": "ваш_uuid",
    "text": "Привет!"
  }'
```

## 🆘 Проблемы

### "Error: Project not found"
- Проверьте SUPABASE_URL и SUPABASE_ANON_KEY
- Убедитесь, что скопировали правильно

### "RLS policy error"
- Откройте таблицу в Supabase
- Нажмите на иконку 🛡️ (Security)
- Убедитесь, что RLS политики включены

### "Table does not exist"
- Проверьте, что SQL миграция выполнилась успешно
- Откройте SQL Editor и запустите миграцию еще раз

## ✅ Что дальше?

Когда таблицы созданы и подключены:

1. **Обновить Railway** новым кодом с Supabase
2. **Проверить, что сообщения сохраняются** в Supabase
3. **Протестировать API** endpoints
4. **Создавать Bitrix приложение** используя API endpoints

## 📚 Дополнительные ресурсы

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Database Guide](https://supabase.com/docs/guides/database)
- [Supabase REST API](https://supabase.com/docs/reference/javascript/introduction)
