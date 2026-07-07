const express = require('express');
const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.json());

// Environment variables
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BITRIX_WEBHOOK_URL = process.env.BITRIX_WEBHOOK_URL;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Bitrix Webhook API helper
const bitrixAPI = (method, params = {}) => {
  const url = `${BITRIX_WEBHOOK_URL}${method}.json`;
  return axios.post(url, params);
};

// ==================== SUPABASE FUNCTIONS ====================

// Initialize database tables (run once)
async function initializeDatabase() {
  try {
    console.log('✅ Database tables should be created in Supabase dashboard');
    console.log('📋 See SQL migrations below');
  } catch (error) {
    console.error('Database init error:', error.message);
  }
}

// Save contact to Supabase
async function saveContact(telegramUser, chatId) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .insert([{
        telegram_id: telegramUser.id.toString(),
        chat_id: chatId.toString(),
        first_name: telegramUser.first_name || 'Telegram User',
        last_name: telegramUser.last_name || '',
        username: telegramUser.username || null,
        phone_number: telegramUser.phone_number || null,
        is_bot: telegramUser.is_bot || false,
        metadata: {
          telegram_user: telegramUser
        }
      }])
      .select();

    if (error) {
      console.error('Error saving contact:', error.message);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in saveContact:', error.message);
    return null;
  }
}

// Find or create contact
async function findOrCreateContact(telegramUser, chatId) {
  try {
    // Try to find existing contact
    const { data: existing } = await supabase
      .from('contacts')
      .select('*')
      .eq('telegram_id', telegramUser.id.toString())
      .limit(1)
      .single();

    if (existing) {
      return existing;
    }

    // Create new contact
    return await saveContact(telegramUser, chatId);
  } catch (error) {
    console.error('Error in findOrCreateContact:', error.message);
    return null;
  }
}

// Save message to Supabase
async function saveMessage(contactId, messageData) {
  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([{
        contact_id: contactId,
        telegram_message_id: messageData.message_id,
        chat_id: messageData.chat_id.toString(),
        sender_id: messageData.from.id.toString(),
        sender_name: messageData.from.username || messageData.from.first_name || 'Unknown',
        text: messageData.text || '',
        message_type: messageData.text ? 'text' : 'other',
        direction: 'incoming', // incoming or outgoing
        telegram_timestamp: new Date(messageData.date * 1000),
        metadata: messageData
      }])
      .select();

    if (error) {
      console.error('Error saving message:', error.message);
      return null;
    }

    return data?.[0] || null;
  } catch (error) {
    console.error('Error in saveMessage:', error.message);
    return null;
  }
}

// ==================== TELEGRAM WEBHOOK ====================

// Main webhook handler for incoming Telegram messages
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
    const userName = from.username || from.first_name || 'Unknown';
    const messageText = text || '';

    console.log(`📨 Message from ${userName}: ${messageText}`);

    // Step 1: Find or create contact
    const contact = await findOrCreateContact(from, chatId);

    if (!contact) {
      console.error('Failed to create/find contact');
      return res.status(200).json({ ok: true });
    }

    // Step 2: Save message to Supabase
    await saveMessage(contact.id, {
      message_id,
      chat_id: chatId,
      from,
      text: messageText,
      date
    });

    // Step 3: Create activity in Bitrix
    await createMessageInBitrix(contact.bitrix_contact_id || null, messageText, userName, chatId);

    // Step 4: Send confirmation to Telegram
    await sendTelegramMessage(chatId, '✅ Сообщение получено и сохранено!');

    res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(200).json({ ok: true });
  }
});

// ==================== BITRIX INTEGRATION ====================

async function createMessageInBitrix(contactId, messageText, userName, chatId) {
  try {
    if (!contactId) {
      console.log('⚠️  No Bitrix contact ID, skipping Bitrix activity creation');
      return null;
    }

    const activityResponse = await bitrixAPI('crm.activity.add', {
      fields: {
        'OWNER_TYPE_ID': 1, // Contact
        'OWNER_ID': contactId,
        'TYPE_ID': 4, // Note
        'SUBJECT': `Telegram: ${userName}`,
        'DESCRIPTION': messageText,
        'COMPLETED': 'N',
        'DIRECTION': 1, // Incoming
        'RESPONSIBLE_ID': 1,
        'NOTIFY_TYPE': 0,
        'COMMENT': `From Telegram Chat ID: ${chatId}`
      }
    });

    if (activityResponse.data.result) {
      console.log(`✅ Activity created in Bitrix: ID ${activityResponse.data.result}`);
      return activityResponse.data.result;
    }
  } catch (error) {
    console.error('Error creating Bitrix activity:', error.message);
  }
  return null;
}

// ==================== MESSAGE HISTORY API ====================

// Get conversation history with a specific contact
app.get('/api/conversations/:contact_id', async (req, res) => {
  try {
    const { contact_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data: messages, error } = await supabase
      .from('messages')
      .select('*')
      .eq('contact_id', contact_id)
      .order('telegram_timestamp', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      count: messages.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Get last message for each contact
    const contactsWithLastMessage = await Promise.all(
      contacts.map(async (contact) => {
        const { data: lastMessage } = await supabase
          .from('messages')
          .select('*')
          .eq('contact_id', contact.id)
          .order('telegram_timestamp', { ascending: false })
          .limit(1)
          .single();

        return {
          ...contact,
          last_message: lastMessage || null
        };
      })
    );

    res.json({
      success: true,
      data: contactsWithLastMessage,
      count: contactsWithLastMessage.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single contact with conversation
app.get('/api/contacts/:contact_id', async (req, res) => {
  try {
    const { contact_id } = req.params;

    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contact_id)
      .single();

    if (contactError || !contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .eq('contact_id', contact_id)
      .order('telegram_timestamp', { ascending: true });

    if (messagesError) {
      return res.status(400).json({ error: messagesError.message });
    }

    res.json({
      success: true,
      data: {
        ...contact,
        messages: messages || []
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message to Telegram (from Bitrix)
app.post('/api/send-message', async (req, res) => {
  try {
    const { contact_id, text } = req.body;

    if (!contact_id || !text) {
      return res.status(400).json({ error: 'contact_id and text are required' });
    }

    // Get contact info
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', contact_id)
      .single();

    if (contactError || !contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Send message to Telegram
    const chatId = contact.chat_id;
    await sendTelegramMessage(chatId, text);

    // Save outgoing message to database
    const { data: savedMessage, error: saveError } = await supabase
      .from('messages')
      .insert([{
        contact_id: contact_id,
        chat_id: chatId,
        sender_id: 'bitrix_system',
        sender_name: 'Bitrix System',
        text: text,
        message_type: 'text',
        direction: 'outgoing',
        metadata: { source: 'bitrix' }
      }])
      .select();

    if (saveError) {
      console.error('Error saving outgoing message:', saveError.message);
    }

    res.json({
      success: true,
      message: 'Message sent successfully',
      data: savedMessage?.[0] || null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TELEGRAM FUNCTIONS ====================

async function sendTelegramMessage(chatId, text) {
  try {
    await axios.post(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      chat_id: chatId,
      text: text
    });
    console.log(`✅ Telegram message sent to ${chatId}`);
  } catch (error) {
    console.error('Error sending Telegram message:', error.message);
  }
}

// ==================== SETUP ENDPOINTS ====================

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

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ==================== SERVER START ====================

async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📝 Telegram Webhook: ${process.env.TELEGRAM_WEBHOOK_URL}`);
    console.log(`⚙️  Setup: ${process.env.TELEGRAM_WEBHOOK_URL || 'https://your-app.railway.app'}/setup-webhook`);
    console.log(`\n📊 API Endpoints:`);
    console.log(`   GET /api/contacts - Get all contacts`);
    console.log(`   GET /api/contacts/:contact_id - Get contact with messages`);
    console.log(`   GET /api/conversations/:contact_id - Get conversation history`);
    console.log(`   POST /api/send-message - Send message to Telegram`);
  });
}

startServer();
