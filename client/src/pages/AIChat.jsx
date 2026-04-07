import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot,
  User,
  Trash2,
  Copy,
  Plus,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AIChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-4');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const messagesEndRef = useRef(null);
  const API_URL = 'http://localhost:5000/api/ai';

  const aiModels = [
    { 
      id: 'gpt-4', 
      name: 'GPT-4', 
      provider: 'OpenAI',
      description: 'Most capable model for complex tasks',
      color: 'green',
      icon: '🤖'
    },
    { 
      id: 'gpt-3.5-turbo', 
      name: 'GPT-3.5', 
      provider: 'OpenAI',
      description: 'Fast and cost-effective',
      color: 'blue',
      icon: '⚡'
    },
    { 
      id: 'claude-3-opus', 
      name: 'Claude Opus', 
      provider: 'Anthropic',
      description: 'Best for analysis',
      color: 'purple',
      icon: '🧠'
    },
    { 
      id: 'claude-3-sonnet', 
      name: 'Claude Sonnet', 
      provider: 'Anthropic',
      description: 'Balanced performance',
      color: 'indigo',
      icon: '💫'
    },
    { 
      id: 'gemini-pro', 
      name: 'Gemini Pro', 
      provider: 'Google',
      description: 'Multimodal tasks',
      color: 'red',
      icon: '✨'
    },
    { 
      id: 'grok-1', 
      name: 'Grok', 
      provider: 'xAI',
      description: 'Real-time access',
      color: 'orange',
      icon: '🚀'
    },
    { 
      id: 'deepseek', 
      name: 'DeepSeek', 
      provider: 'DeepSeek',
      description: 'Strong coding',
      color: 'cyan',
      icon: '🔍'
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/conversations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch conversations');

      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    try {
      setIsLoading(true);

      // Add user message to UI immediately
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: inputMessage,
        model: selectedModel,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      const inputValue = inputMessage;
      setInputMessage('');

      // Send to backend
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: inputValue,
          conversationId: currentConversationId || null,
          model: selectedModel
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to get response');
      }

      const data = await res.json();

      // Set conversation ID if new
      if (!currentConversationId) {
        setCurrentConversationId(data.conversationId);
      }

      // Add assistant message
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.response,
        model: selectedModel,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Refresh conversations
      fetchConversations();
      toast.success('✅ Message sent!');

    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to send message');
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([]);
    setCurrentConversationId(null);
    setInputMessage('');
  };

  const handleLoadConversation = async (convId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/conversation/${convId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to load conversation');

      const data = await res.json();
      setMessages(data.messages || []);
      setCurrentConversationId(convId);
      setSelectedModel(data.conversation.model);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load conversation');
    }
  };

  const handleDeleteConversation = async (convId, e) => {
    e.stopPropagation();

    if (!window.confirm('Delete this conversation?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/conversation/${convId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete');

      toast.success('Conversation deleted');
      fetchConversations();

      if (currentConversationId === convId) {
        handleNewConversation();
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied!');
  };

  const clearChat = () => {
    handleNewConversation();
  };

  const getModelColor = (modelId) => {
    const model = aiModels.find(m => m.id === modelId);
    return model?.color || 'gray';
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Sidebar - Conversations */}
      {showSidebar && (
        <div className="w-80 bg-gray-900 rounded-xl flex flex-col border border-gray-700">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-700">
            <button
              onClick={handleNewConversation}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Conversation
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2">
            {conversations.length === 0 ? (
              <p className="text-gray-400 text-sm p-4">No conversations yet</p>
            ) : (
              conversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => handleLoadConversation(conv.id)}
                  className={`w-full p-3 rounded-lg mb-2 text-left transition-colors ${
                    currentConversationId === conv.id
                      ? 'bg-gray-700' 
                      : 'hover:bg-gray-800 bg-gray-900/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white truncate">{conv.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{conv.model}</p>
                    </div>
                    <button
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      className="text-red-400 hover:text-red-300 flex-shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 bg-gray-900 rounded-xl flex flex-col border border-gray-700">
        {/* Chat Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">AI Assistant</h2>
              <p className="text-sm text-gray-400">
                Using {aiModels.find(m => m.id === selectedModel)?.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={clearChat}
              className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-400 text-lg">Start a conversation</p>
                <p className="text-gray-500 text-sm mt-2">Select a model and type your message</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map(message => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  onCopy={copyMessage}
                  modelColor={getModelColor(message.model)}
                />
              ))}
              
              {isLoading && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-blue-600/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-6 h-6 text-blue-400" />
                  </div>
                  <div className="flex-1 bg-gray-800 rounded-2xl p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Model Selector */}
        <div className="px-6 py-3 border-t border-gray-700">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-sm text-gray-400 whitespace-nowrap">Model:</span>
            {aiModels.map(model => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedModel === model.id
                    ? `bg-blue-600 text-white`
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span className="mr-1">{model.icon}</span>
                {model.name}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white placeholder-gray-500"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message, onCopy, modelColor }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-start gap-4 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser 
          ? 'bg-blue-600' 
          : 'bg-gray-700'
      }`}>
        {isUser ? (
          <User className="w-6 h-6 text-white" />
        ) : (
          <Bot className="w-6 h-6 text-gray-300" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 ${isUser ? 'flex flex-col items-end' : ''}`}>
        <div className={`rounded-2xl p-4 max-w-3xl ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-800 text-gray-100'
        }`}>
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Message Actions */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">
            {message.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || ''}
          </span>
          {!isUser && (
            <button
              onClick={() => onCopy(message.content)}
              className="p-1 text-gray-500 hover:text-gray-300 rounded transition-colors"
              title="Copy message"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIChat;