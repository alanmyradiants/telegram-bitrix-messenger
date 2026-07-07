const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL;
const PORT = process.env.PORT || 3000;

// Bitrix Webhook API helper
const bitrixAPI = (method, params = {}) => {
  const url = `${BITRIX_WEBHOOK_URL}${method}.json`;
  return axios.post(url, params);
};

// Telegram webhook handler
app.post('/webhook/telegram', async (req, res) => {
  try {
    const message = req.body.message;
    
    if (!message) {
      return res.status(200).json({ ok: true });
    }

    const {
      message_id,
      chat,
      from,
      text,
      date
    } = message;

    const chatId = chat.id;
    const userId = from.id;
    const userName = from.username || from.first_name || 'Unknown';
    const messageText = text || '';

    console.log(`📨 Message from ${userName}: ${messageText}`);

    // Step 1: Find or create contact in Bitrix
    let contact = await findOrCreateContact(from, chatId);
    
    // Step 2: Create task/activity in Bitrix with message
    if (contact && contact.ID) {
      await createMessageInBitrix(contact.ID, messageText, userName, chatId);
      
      // Send confirmation to Telegram
      await sendTelegramMessage(chatId, `✅ Сообщение получено и добавлено в Bitrix!`);
    }

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(200).json({ ok: true }); // Always return 200 to Telegram
  }
});

// Find contact by phone/email, or create new
async function findOrCreateContact(telegramUser, chatId) {
  try {
    // Try to find by phone or email
    const listResponse = await bitrixAPI('crm.contact.list', {
      filter: {
        'PHONE': telegramUser.phone_number || '',
        'EMAIL': telegramUser.username || ''
      },
      limit: 1
    });

    if (listResponse.data.result && listResponse.data.result.length > 0) {
      return listResponse.data.result[0];
    }

    // Create new contact
    const createResponse = await bitrixAPI('crm.contact.add', {
      fields: {
        'NAME': telegramUser.first_name || 'Telegram User',
        'LAST_NAME': telegramUser.last_name || '',
        'PHONE': [{ VALUE: chatId.toString(), VALUE_TYPE: 'MOBILE' }],
        'COMMENTS': `Telegram ID: ${telegramUser.id}\\nUsername: @${telegramUser.username || 'N/A'}`
      }
    });

    if (createResponse.data.result) {
      console.log(`✅ New contact created: ID ${createResponse.data.result}`);
      return { ID: createResponse.data.result };
    }
  } catch (error) {
    console.error('Error finding/creating contact:', error.message);
  }
  return null;
}

// Create message/activity in Bitrix
async function createMessageInBitrix(contactId, messageText, userName, chatId) {
  try {
    // Create activity (note) in Bitrix
    const activityResponse = await bitrixAPI('crm.activity.add', {
      fields: {
        'OWNER_TYPE_ID': 1, // Contact
        'OWNER_ID': contactId,
        'TYPE_ID': 4, // Note
        'SUBJECT': `Telegram: ${userName}`,
        'DESCRIPTION': messageText,
        'COMPLETED': 'N',
        'DIRECTION': 1, // Incoming
        'RESPONSIBLE_ID': 1, // Admin user
        'NOTIFY_TYPE': 0,
        'COMMENT': `From Telegram Chat ID: ${chatId}`
      }
    });

    if (activityResponse.data.result) {
      console.log(`✅ Activity created: ID ${activityResponse.data.result}`);
      return activityResponse.data.result;
    }
  } catch (error) {
    console.error('Error creating activity:', error.message);
  }
  return null;
}

// Send message to Telegram
async function sendTelegramMessage(chatId, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text
    });
  } catch (error) {
    console.error('Error sending Telegram message:', error.message);
  }
}

// Set Telegram webhook (call this once to initialize)
app.get('/setup-webhook', async (req, res) => {
  try {
    const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL;
    const response = await axios.post(
      `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
      { url: webhookUrl }
    );
    res.json({ 
      success: true, 
      message: 'Webhook установлен',
      data: response.data 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Webhook: ${process.env.TELEGRAM_WEBHOOK_URL}`);
  console.log(`⚙️  Setup: ${process.env.TELEGRAM_WEBHOOK_URL || 'https://your-app.railway.app'}/setup-webhook`);
});
