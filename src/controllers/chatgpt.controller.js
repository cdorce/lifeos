import { sequelize } from '../config/database.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

class ChatGPTController {
  // Send message to ChatGPT
  async sendMessage(req, res) {
    try {
      const { message, conversationId } = req.body;
      const userId = req.user.id;

      console.log('📝 Sending message:', { message, conversationId, userId });

      if (!message || !message.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Message is required'
        });
      }

      if (!OPENAI_API_KEY) {
        return res.status(500).json({
          status: 'error',
          message: 'OpenAI API key not configured'
        });
      }

      // Get conversation history if conversationId provided
      let messages = [];
      let newConversationId = conversationId;

      if (conversationId) {
        const [history] = await sequelize.query(
          `SELECT * FROM chatgpt_messages 
           WHERE conversation_id = ? AND user_id = ? 
           ORDER BY created_at ASC`,
          { replacements: [conversationId, userId] }
        );

        messages = history.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
      } else {
        // Create new conversation
        const [result] = await sequelize.query(
          `INSERT INTO chatgpt_conversations (user_id, created_at, updated_at)
           VALUES (?, NOW(), NOW())`,
          { replacements: [userId] }
        );
        newConversationId = result;
      }

      // Add new user message
      messages.push({
        role: 'user',
        content: message
      });

      console.log('📤 Calling OpenAI API with', messages.length, 'messages');

      // Call OpenAI API
      const openaiResponse = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: messages,
          max_tokens: 1000,
          temperature: 0.7
        })
      });

      if (!openaiResponse.ok) {
        const errorData = await openaiResponse.json();
        console.error('❌ OpenAI API error:', errorData);
        throw new Error(errorData.error?.message || 'OpenAI API error');
      }

      const openaiData = await openaiResponse.json();
      const assistantMessage = openaiData.choices[0].message.content;

      console.log('✅ Got response from OpenAI');

      // Save user message to database
      await sequelize.query(
        `INSERT INTO chatgpt_messages (conversation_id, user_id, role, content, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        { replacements: [newConversationId, userId, 'user', message] }
      );

      // Save assistant message to database
      await sequelize.query(
        `INSERT INTO chatgpt_messages (conversation_id, user_id, role, content, created_at)
         VALUES (?, ?, ?, ?, NOW())`,
        { replacements: [newConversationId, userId, 'assistant', assistantMessage] }
      );

      // Update conversation updated_at
      await sequelize.query(
        `UPDATE chatgpt_conversations SET updated_at = NOW() WHERE id = ?`,
        { replacements: [newConversationId] }
      );

      console.log('💾 Messages saved to database');

      res.json({
        status: 'success',
        conversationId: newConversationId,
        response: assistantMessage
      });

    } catch (error) {
      console.error('❌ ChatGPT error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to get response from ChatGPT'
      });
    }
  }

  // Get all conversations for user
  async getConversations(req, res) {
    try {
      const userId = req.user.id;

      const [conversations] = await sequelize.query(
        `SELECT id, user_id, created_at, updated_at 
         FROM chatgpt_conversations 
         WHERE user_id = ? 
         ORDER BY updated_at DESC`,
        { replacements: [userId] }
      );

      res.json({
        status: 'success',
        conversations: conversations
      });

    } catch (error) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch conversations'
      });
    }
  }

  // Get messages for a conversation
  async getConversationMessages(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify conversation belongs to user
      const [conversation] = await sequelize.query(
        `SELECT * FROM chatgpt_conversations WHERE id = ? AND user_id = ?`,
        { replacements: [id, userId] }
      );

      if (conversation.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Conversation not found'
        });
      }

      // Get messages
      const [messages] = await sequelize.query(
        `SELECT id, role, content, created_at 
         FROM chatgpt_messages 
         WHERE conversation_id = ? AND user_id = ?
         ORDER BY created_at ASC`,
        { replacements: [id, userId] }
      );

      res.json({
        status: 'success',
        messages: messages
      });

    } catch (error) {
      console.error('Get messages error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to fetch messages'
      });
    }
  }

  // Delete conversation
  async deleteConversation(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Verify conversation belongs to user
      const [conversation] = await sequelize.query(
        `SELECT * FROM chatgpt_conversations WHERE id = ? AND user_id = ?`,
        { replacements: [id, userId] }
      );

      if (conversation.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Conversation not found'
        });
      }

      // Delete messages first (foreign key constraint)
      await sequelize.query(
        `DELETE FROM chatgpt_messages WHERE conversation_id = ?`,
        { replacements: [id] }
      );

      // Delete conversation
      await sequelize.query(
        `DELETE FROM chatgpt_conversations WHERE id = ?`,
        { replacements: [id] }
      );

      res.json({
        status: 'success',
        message: 'Conversation deleted'
      });

    } catch (error) {
      console.error('Delete conversation error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to delete conversation'
      });
    }
  }
}

export default new ChatGPTController();