import { sequelize } from '../config/database.js';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

class AIController {
  // Send message to any AI model
  async sendMessage(req, res) {
    try {
      const { message, conversationId, model } = req.body;
      const userId = req.user.id;

      console.log('📝 Sending message:', { message, conversationId, model, userId });

      if (!message || !message.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Message is required'
        });
      }

      if (!model) {
        return res.status(400).json({
          status: 'error',
          message: 'Model is required'
        });
      }

      // Get conversation history
      let messages = [];
      let newConversationId = conversationId;

      if (conversationId) {
        const [history] = await sequelize.query(
          `SELECT * FROM ai_messages 
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
          `INSERT INTO ai_conversations (user_id, model, title, created_at, updated_at)
           VALUES (?, ?, ?, NOW(), NOW())`,
          { replacements: [userId, model, `Chat with ${model}`] }
        );
        newConversationId = result;
      }

      // Add new user message
      messages.push({
        role: 'user',
        content: message
      });

      console.log(`📤 Calling ${model} API with ${messages.length} messages`);

      // Call appropriate AI provider
      let aiResponse;

      if (model.includes('gpt') || model.includes('claude-3-sonnet') || model === 'deepseek') {
        // OpenAI models (GPT) or using OpenAI-compatible endpoint
        aiResponse = await this.callOpenAIModel(model, messages);
      } else if (model.includes('claude')) {
        // Anthropic Claude models
        aiResponse = await this.callClaudeModel(model, messages);
      } else if (model === 'gemini-pro') {
        // Google Gemini
        aiResponse = await this.callGeminiModel(messages);
      } else if (model === 'grok-1') {
        // Grok via xAI (uses OpenAI-compatible format)
        aiResponse = await this.callGrokModel(messages);
      } else {
        throw new Error(`Unknown model: ${model}`);
      }

      console.log('✅ Got response from', model);

      // Save user message
      await sequelize.query(
        `INSERT INTO ai_messages (conversation_id, user_id, role, content, model, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        { replacements: [newConversationId, userId, 'user', message, model] }
      );

      // Save assistant message
      await sequelize.query(
        `INSERT INTO ai_messages (conversation_id, user_id, role, content, model, created_at)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        { replacements: [newConversationId, userId, 'assistant', aiResponse, model] }
      );

      // Update conversation
      await sequelize.query(
        `UPDATE ai_conversations SET updated_at = NOW(), title = ? WHERE id = ?`,
        { replacements: [`${message.substring(0, 50)}...`, newConversationId] }
      );

      console.log('💾 Messages saved to database');

      res.json({
        status: 'success',
        conversationId: newConversationId,
        response: aiResponse,
        model: model
      });

    } catch (error) {
      console.error('❌ AI error:', error);
      res.status(500).json({
        status: 'error',
        message: error.message || 'Failed to get response from AI'
      });
    }
  }

  // Call OpenAI models (GPT-3.5, GPT-4, etc.)
  async callOpenAIModel(model, messages) {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model === 'gpt-4-turbo' ? 'gpt-4-turbo-preview' : model,
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Call Claude models (Anthropic)
  async callClaudeModel(model, messages) {
    if (!ANTHROPIC_API_KEY) {
      throw new Error('Anthropic API key not configured');
    }

    // Convert messages to Claude format
    const claudeMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model === 'claude-3-opus' ? 'claude-3-opus-20240229' : 
               model === 'claude-3-sonnet' ? 'claude-3-sonnet-20240229' :
               model,
        max_tokens: 1500,
        messages: claudeMessages
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Anthropic API error');
    }

    const data = await response.json();
    return data.content[0].text;
  }

  // Call Google Gemini
  async callGeminiModel(messages) {
    if (!GOOGLE_API_KEY) {
      throw new Error('Google API key not configured');
    }

    // Convert messages to Gemini format
    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: contents,
          generationConfig: {
            maxOutputTokens: 1500,
            temperature: 0.7
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API error');
    }

    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  }

  // Call Grok (xAI) - uses OpenAI-compatible format
  async callGrokModel(messages) {
    const grokKey = process.env.GROK_API_KEY;
    if (!grokKey) {
      throw new Error('Grok API key not configured');
    }

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${grokKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'grok-1',
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Grok API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Get all conversations for user
  async getConversations(req, res) {
    try {
      const userId = req.user.id;

      const [conversations] = await sequelize.query(
        `SELECT id, user_id, model, title, created_at, updated_at 
         FROM ai_conversations 
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
        `SELECT * FROM ai_conversations WHERE id = ? AND user_id = ?`,
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
        `SELECT id, role, content, model, created_at 
         FROM ai_messages 
         WHERE conversation_id = ? AND user_id = ?
         ORDER BY created_at ASC`,
        { replacements: [id, userId] }
      );

      res.json({
        status: 'success',
        conversation: conversation[0],
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

      const [conversation] = await sequelize.query(
        `SELECT * FROM ai_conversations WHERE id = ? AND user_id = ?`,
        { replacements: [id, userId] }
      );

      if (conversation.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'Conversation not found'
        });
      }

      // Delete messages first
      await sequelize.query(
        `DELETE FROM ai_messages WHERE conversation_id = ?`,
        { replacements: [id] }
      );

      // Delete conversation
      await sequelize.query(
        `DELETE FROM ai_conversations WHERE id = ?`,
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

export default new AIController();