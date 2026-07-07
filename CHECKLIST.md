# ✅ Чек-лист: Фаза 1 - Backend

## 📋 Фаза 1: Backend с БД (ВЫ ЗДЕСЬ)

### Шаг 1: Настроить Supabase ⏳

- [ ] Создать проект на supabase.com
- [ ] Скопировать Project URL
- [ ] Скопировать Anon Key
- [ ] Запустить SQL миграцию (`supabase/migrations/001_init_schema.sql`)
- [ ] Проверить, что таблицы созданы (contacts, messages, conversation_summaries)

Документация: [SETUP_SUPABASE.md](./SETUP_SUPABASE.md)

### Шаг 2: Обновить код на локальной машине ⏳

- [ ] Скачать обновления с GitHub (`git pull`)
- [ ] Запустить `npm install` (добавится @supabase/supabase-js)
- [ ] Создать файл `.env` с переменными:
  ```
  TELEGRAM_BOT_TOKEN=xxx
  TELEGRAM_WEBHOOK_URL=https://ваш-домен.railway.app/webhook/telegram
  BITRIX_WEBHOOK_URL=https://xxx.bitrix24.com/rest/xxx/
  SUPABASE_URL=https://xxx.supabase.co
  SUPABASE_ANON_KEY=xxx
  PORT=3000
  ```
- [ ] Запустить локально: `npm run dev`
- [ ] Проверить в браузере: `http://localhost:3000/health` → должен вернуть `{status: OK}`

### Шаг 3: Обновить код на Railway ⏳

- [ ] Залить изменения в GitHub: `git push origin main`
- [ ] Открыть Railway Dashboard
- [ ] Подождать автоматического развертывания
- [ ] Добавить переменные окружения в Railway
- [ ] Проверить логи - должны быть без ошибок

Документация: [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md)

### Шаг 4: Установить Telegram Webhook ⏳

- [ ] Откройте: `https://ваш-домен.railway.app/setup-webhook`
- [ ] Должно вернуть: `{success: true}`

### Шаг 5: Протестировать ⏳

- [ ] Отправить сообщение боту в Telegram
- [ ] Получить ответ: ✅ Сообщение получено и сохранено!
- [ ] Открыть Supabase Dashboard
- [ ] Проверить таблицу `contacts` - должен быть новый контакт
- [ ] Проверить таблицу `messages` - должно быть сообщение
- [ ] Проверить API: `https://ваш-домен.railway.app/api/contacts` - должен вернуть JSON

### Шаг 6: Проверить API endpoints ⏳

Все endpoint'ы работают?

- [ ] `GET /api/contacts` - возвращает список контактов
- [ ] `GET /api/contacts/:contact_id` - возвращает контакт с историей
- [ ] `GET /api/conversations/:contact_id` - возвращает сообщения
- [ ] `POST /api/send-message` - отправляет сообщение в Telegram

Примеры в [README.md](./README.md#-rest-api)

---

## 🎯 Фаза 2: Интеграция с Bitrix (СЛЕДУЮЩАЯ)

После завершения Фазы 1:

- [ ] Обновить код чтобы сохранять `bitrix_contact_id` при создании контакта
- [ ] Добавить endpoint для создания Activities в Bitrix
- [ ] Добавить endpoint для получения ответа из Bitrix
- [ ] Двусторонняя синхронизация: Telegram ↔ Bitrix

---

## 🎨 Фаза 3: Bitrix Приложение (ФИНАЛЬНАЯ)

После завершения Фаз 1 и 2:

- [ ] Создать виджет/приложение в Bitrix
- [ ] Интерфейс мессенджера:
  - [ ] Список контактов
  - [ ] История переписки
  - [ ] Форма для отправки сообщений
  - [ ] Реал-тайм уведомления
- [ ] Запустить в Bitrix
- [ ] Протестировать полный цикл:
  - Сообщение в Telegram → появляется в Bitrix мессенджере
  - Ответ в Bitrix → отправляется в Telegram

---

## 📚 Документация

- [README.md](./README.md) - Полный обзор и API
- [SETUP_SUPABASE.md](./SETUP_SUPABASE.md) - Настройка БД
- [DEPLOY_RAILWAY.md](./DEPLOY_RAILWAY.md) - Развертывание
- [server.js](./server.js) - Исходный код backend'а
- [supabase/migrations/](./supabase/migrations/) - SQL миграции

---

## 🔗 Полезные ссылки

- 🤖 [Telegram Bot API](https://core.telegram.org/bots/api)
- 🗄️ [Supabase Docs](https://supabase.com/docs)
- 🚂 [Railway Docs](https://docs.railway.app)
- 🔵 [Bitrix REST API](https://dev.1c-bitrix.ru/rest_help/)

---

## ❓ Часто задаваемые вопросы

**Q: Где проверить логи?**
A: Railway Dashboard → Logs (нижняя часть экрана)

**Q: Как понять, что Supabase подключена?**
A: Откройте Supabase Dashboard → посмотрите на таблицы. Когда приходит сообщение - оно появляется в таблице `messages`

**Q: Могу ли я использовать другую БД вместо Supabase?**
A: Да, но нужно переписать код подключения. Рекомендуем Supabase для простоты.

**Q: Когда будет Bitrix приложение?**
A: После завершения Фазы 1! Приступим после проверки что все работает.

---

## 🎉 Статус проекта

```
Фаза 1: Backend с БД         ████████████████░░ 80% (вы здесь)
Фаза 2: Интеграция Bitrix    ░░░░░░░░░░░░░░░░░░  0%
Фаза 3: Bitrix Приложение    ░░░░░░░░░░░░░░░░░░  0%
```

---

**Готовы начать? Следуйте шагам выше!** 🚀
