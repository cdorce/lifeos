import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Loader, Copy } from 'lucide-react';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your AI Assistant powered by local Ollama. I can help with research, writing, coding, explanations, and much more. What would you like help with?",
      sender: 'ai',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText]   = useState('');
  const [loading, setLoading]       = useState(false);
  const [model, setModel]           = useState('mistral');
  const [error, setError]           = useState('');
  const [copied, setCopied]         = useState(null);
  const messagesEndRef              = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt: inputText, stream: false }),
      });

      if (!response.ok) {
        throw new Error('Ollama returned an error. Make sure a model is pulled: ollama pull mistral');
      }

      const data = await response.json();

      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: data.response.trim(),
        sender: 'ai',
        timestamp: new Date(),
      }]);
    } catch (err) {
      const isNetwork = err instanceof TypeError;
      const msg = isNetwork
        ? 'Cannot reach Ollama. Make sure:\n1. Ollama is running on your computer\n2. OLLAMA_ORIGINS is set to allow this site (see Settings → AI Setup)'
        : err.message;
      setError(msg);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        text: `❌ ${msg}`,
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const copyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const clearChat = () => {
    if (!window.confirm('Clear all messages?')) return;
    setMessages([{
      id: 1,
      text: "Hi! I'm your AI Assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
    }]);
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)] bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg overflow-hidden">

      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 p-4 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
          </div>
          <button
            onClick={clearChat}
            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            title="Clear chat"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Model selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">AI Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className="w-full px-3 py-2 bg-slate-700 text-white text-sm rounded border border-slate-600 focus:border-blue-400 focus:outline-none"
          >
            <option value="mistral">Mistral (Fast &amp; Balanced)</option>
            <option value="neural-chat">Neural Chat (Better Conversation)</option>
            <option value="llama2">Llama 2 (Most Capable)</option>
            <option value="codellama">Code Llama (Best for Code)</option>
          </select>
          <p className="text-xs text-slate-400 mt-1">
            Local AI — requires Ollama running on your computer.{' '}
            <span className="text-yellow-400">First time? Set <code className="bg-slate-600 px-1 rounded">OLLAMA_ORIGINS=https://lifeos.clefftonwidmaer.com</code> as a Windows system env var, then restart Ollama.</span>
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-md xl:max-w-2xl px-4 py-3 rounded-lg ${
              msg.sender === 'user'
                ? 'bg-blue-500 text-white'
                : msg.isError
                ? 'bg-red-500/20 text-red-300 border border-red-500'
                : 'bg-slate-700 text-slate-100'
            }`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              <p className="text-xs mt-1 opacity-60">{msg.timestamp.toLocaleTimeString()}</p>
              {msg.sender === 'ai' && !msg.isError && (
                <button
                  onClick={() => copyMessage(msg.id, msg.text)}
                  className="mt-2 text-xs px-2 py-1 bg-slate-600 hover:bg-slate-500 text-white rounded flex items-center gap-1 transition"
                >
                  <Copy className="w-3 h-3" />
                  {copied === msg.id ? 'Copied!' : 'Copy'}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-700 text-slate-100 px-4 py-3 rounded-lg flex items-center gap-2">
              <Loader className="w-4 h-4 animate-spin" />
              <p className="text-sm">AI is thinking...</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 p-3 bg-red-500/20 border border-red-500 text-red-300 rounded-lg text-sm flex-shrink-0">
          ⚠️ {error}
        </div>
      )}

      {/* Input */}
      <div className="bg-slate-800 border-t border-slate-700 p-4 flex-shrink-0">
        <div className="flex gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything… (Shift+Enter for new line)"
            className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-blue-400 focus:outline-none resize-none"
            rows={2}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !inputText.trim()}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>

    </div>
  );
}
