# 🚂 Развертывание на Railway

Обновление кода на Railway с новой поддержкой Supabase.

## Шаг 1️⃣: Обновить код на GitHub

Убедитесь, что все изменения залиты в `main` ветку:

```bash
git add .
git commit -m "Add Supabase integration"
git push origin main
```

Railway будет отслеживать изменения и автоматически разворачивать.

## Шаг 2️⃣: Добавить переменные окружения в Railway

1. Перейти на [railway.app](https://railway.app)
2. Открыть ваш проект **telegram-bitrix-messenger**
3. Открыть **Service** → **Settings** (или переменные слева)
4. Добавить переменные:

```
TELEGRAM_BOT_TOKEN=xxx
TELEGRAM_WEBHOOK_URL=https://xxxxx.railway.app/webhook/telegram
BITRIX_WEBHOOK_URL=https://xxx.bitrix24.com/rest/xxx/
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
PORT=3000
```

**Где взять эти значения:**

| Переменная | Где найти |
|---|---|
| `TELEGRAM_BOT_TOKEN` | От @BotFather в Telegram |
| `TELEGRAM_WEBHOOK_URL` | Railway Domain (см. ниже) + `/webhook/telegram` |
| `BITRIX_WEBHOOK_URL` | Bitrix CRM → Разработчикам → Входящие вебхуки |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_ANON_KEY` | Supabase → Settings → API → anon key |

### Найти Railway Domain

1. Railway → Telegram Bitrix Messenger сервис
2. Откройте **Network** или **Domains**
3. Скопируйте домен (обычно что-то типа `xxxxx.railway.app`)

Пример:
```
TELEGRAM_WEBHOOK_URL=https://telegram-bitrix-xxx.railway.app/webhook/telegram
```

## Шаг 3️⃣: Проверить развертывание

1. Откройте **Deployments** в Railway
2. Дождитесь, пока статус станет ✅ **Success**
3. Нажимите на deployment для просмотра логов

## Шаг 4️⃣: Установить Telegram Webhook

После успешного развертывания откройте в браузере:

```
https://ваш-домен.railway.app/setup-webhook
```

Ответ должен быть:
```json
{
  "success": true,
  "message": "Webhook установлен",
  "data": {...}
}
```

## Шаг 5️⃣: Протестировать

Отправить сообщение боту в Telegram.

Вы должны получить ответ:
```
✅ Сообщение получено и сохранено!
```

И сообщение появится в Supabase таблице `messages`.

## ✅ Проверка

### Проверить контакты

```bash
curl https://ваш-домен.railway.app/api/contacts
```

Должно вернуть JSON с контактами.

### Проверить логи

Railway → Logs:
- Должны видны логи типа `📨 Message from...`
- Должны видны логи типа `✅ Contact created...`

## 🔄 Поток обновлений

Теперь при каждом изменении в GitHub:

1. GitHub push → Railway слышит об изменении
2. Railway автоматически запускает сборку
3. `npm install` установит зависимости
4. `npm start` запустит новый код

Видны логи развертывания в Railway Dashboard.

## 📊 Мониторинг

Railway Dashboard показывает:
- ✅ **Status**: зелено = работает
- 📊 **Metrics**: CPU, Memory, Bandwidth
- 📝 **Logs**: реал-тайм логи приложения

## 🆘 Если что-то не работает

### "502 Bad Gateway"
- Проверьте логи в Railway
- Убедитесь, что все переменные окружения установлены
- Перезапустите сервис: Railway → Restart

### "Error: Cannot find module 'supabase'"
- Нажимите **Force Redeploy** в Railway
- Railway переустановит зависимости

### Сообщения не сохраняются
- Проверьте `SUPABASE_URL` и `SUPABASE_ANON_KEY`
- Откройте Supabase → Logs для поиска ошибок
- Проверьте RLS policies в Supabase

## 💾 Резервные копии

Railway автоматически создает резервные копии, но советуем:

1. Регулярно экспортировать данные из Supabase
2. Использовать GitHub для версионирования кода
3. Хранить важные переменные окружения в безопасном месте

## 🎉 Успех!

Когда все работает:
- ✅ Сообщения поступают в Telegram
- ✅ Сообщения сохраняются в Supabase
- ✅ API endpoints доступны для Bitrix

**Готово к Фазе 3: Создание Bitrix приложения-мессенджера! 🚀**
