import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_QUESTIONS = [
  "Why am I overspending?",
  "How can I save money this month?",
  "Is my financial health good?",
  "Predict my next month expenses",
  "What is my biggest spending category?",
  "How can I reach my savings goal?"
];

function TypingIndicator() {
  return (
    <div className="flex gap-2 items-center px-4 py-3">
      {[0, 1, 2].map(i => (
        <motion.div key={i} className="w-2 h-2 rounded-full"
          style={{ background: 'var(--accent-blue)' }}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! 👋 I'm your AI Financial Advisor. I have access to your real financial data and can give you personalized insights. Ask me anything about your finances!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiPowered, setAiPowered] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    const msg = text || input.trim();
    if (!msg || loading) return;

    const userMsg = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }));
      const data = await api.post('/ai/chat', { message: msg, conversationHistory: history });
      setAiPowered(data.aiPowered);
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, timestamp: new Date() }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! 🔄 How can I help you with your finances today?",
      timestamp: new Date()
    }]);
  };

  return (
    <div className="h-full flex flex-col" style={{ maxHeight: 'calc(100vh - 73px)' }}>
      {/* Header */}
      <div className="px-4 md:px-6 py-4 border-b flex items-center justify-between flex-shrink-0"
        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl btn-gradient flex items-center justify-center pulse-glow">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              AI Financial Advisor
              {aiPowered && (
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--accent-blue)' }}>
                  GPT-4
                </span>
              )}
            </h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Online · Access to your data</p>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-xl transition-all hover:bg-white/10"
          style={{ color: 'var(--text-muted)' }}>
          <RefreshCw size={12} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        {/* Suggested questions (show only when few messages) */}
        {messages.length <= 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <p className="col-span-full text-xs font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
              <Sparkles size={12} className="inline mr-1" />
              Suggested questions:
            </p>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                className="text-left text-xs p-3 rounded-xl transition-all hover:border-indigo-500/50 text-white/80"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                {q}
              </button>
            ))}
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'btn-gradient' : ''
              }`}
                style={msg.role === 'assistant' ? { background: 'var(--bg-card)', border: '1px solid var(--border-color)' } : {}}>
                {msg.role === 'user'
                  ? <span className="text-white text-xs font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                  : <Bot size={16} style={{ color: 'var(--accent-blue)' }} />}
              </div>

              {/* Bubble */}
              <div className={`max-w-[80%] md:max-w-[70%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' ? 'chat-user' : 'chat-ai'
                }`}
                  style={msg.role === 'assistant' ? { color: 'var(--text-primary)' } : {}}>
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none" style={{ color: 'inherit' }}>
                      {msg.content.split('\n').map((line, j) => (
                        <p key={j} className={j > 0 ? 'mt-1' : ''}>{line}</p>
                      ))}
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {msg.timestamp?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <Bot size={16} style={{ color: 'var(--accent-blue)' }} />
            </div>
            <div className="chat-ai rounded-2xl">
              <TypingIndicator />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 border-t flex-shrink-0"
        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-secondary)' }}>
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about your finances... (Enter to send)"
              rows={1}
              className="input-field resize-none pr-4"
              style={{ maxHeight: '120px', lineHeight: '1.5' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
              }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="btn-gradient w-11 h-11 rounded-xl flex items-center justify-center text-white disabled:opacity-50 flex-shrink-0">
            <Send size={16} />
          </motion.button>
        </div>
        <p className="text-xs mt-2 text-center" style={{ color: 'var(--text-muted)' }}>
          AI analyzes your actual transaction data to give personalized advice
        </p>
      </div>
    </div>
  );
}
