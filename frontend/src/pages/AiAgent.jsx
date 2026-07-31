import { useState, useRef, useEffect } from 'react';
import {
  FiCpu, FiSend, FiUser, FiTrash2, FiMessageSquare,
  FiCompass, FiInfo, FiLoader, FiCheck
} from 'react-icons/fi';
import PageHeader from '../components/PageHeader';
import { useChatWithAiAgent } from '../hooks';
import { notify } from '../lib/notify';

const QUICK_PROMPTS = [
  {
    category: "Administrative",
    text: "Draft a follow-up email to a patient about their next appointment."
  },
  {
    category: "Clinical Help",
    text: "Explain the typical side effects and interactions of Metformin."
  },
  {
    category: "Hospital Policy",
    text: "Draft a memo to department staff reinforcing sanitation protocols."
  },
  {
    category: "Templates",
    text: "Create a referral letter template for a patient needing cardiology review."
  }
];

export default function AiAgent() {
  const chatMutation = useChatWithAiAgent();
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I am your AI Copilot. How can I assist you with clinical documentation, research, draft generation, or administrative tasks today?',
      timestamp: new Date()
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, chatMutation.isPending]);

  const handleSend = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || chatMutation.isPending) return;

    if (!textToSend) {
      setInputMessage('');
    }

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date()
    };

    const history = messages
      .filter(m => m.id !== 'welcome' && !m.isError)
      .map(m => ({
        role: m.role,
        content: m.content
      }));

    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await chatMutation.mutateAsync({ message: text, history });
      
      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err?.message || 'Failed to get a response from the AI Copilot. Please try again.'}`,
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: 'Hello! I am your AI Copilot. How can I assist you with clinical documentation, research, draft generation, or administrative tasks today?',
        timestamp: new Date()
      }
    ]);
    notify.success('Chat history cleared');
  };

  return (
    <>
      <PageHeader title="AI Copilot" subtitle="Intelligent hospital assistant for drafts, translations, clinical help, and administrative support" />

      <div className="page-body fade-in">
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 24, alignItems: 'start' }}>
          
          {/* Main Chat Area */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 240px)', padding: 0 }}>
            {/* Chat Header */}
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', padding: '16px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ 
                  background: 'var(--color-accent-light)', 
                  color: 'var(--color-accent)', 
                  padding: 8, 
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FiCpu size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>MediCare Assistant</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></span>
                    Online
                  </span>
                </div>
              </div>
              <button 
                className="btn btn-outline" 
                onClick={clearChat}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', fontSize: '0.8rem' }}
                title="Clear Chat"
              >
                <FiTrash2 /> Clear
              </button>
            </div>

            {/* Messages Body */}
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              padding: '24px', 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 16,
              background: 'var(--color-bg-input)'
            }}>
              {messages.map((msg) => {
                const isAssistant = msg.role === 'assistant';
                return (
                  <div 
                    key={msg.id} 
                    style={{ 
                      display: 'flex', 
                      gap: 12, 
                      maxWidth: '80%', 
                      alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                      flexDirection: isAssistant ? 'row' : 'row-reverse'
                    }}
                  >
                    {/* Avatar */}
                    <div style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      flexShrink: 0,
                      background: isAssistant 
                        ? (msg.isError ? 'var(--color-danger-bg)' : 'var(--color-accent-light)') 
                        : 'var(--color-bg-tertiary)',
                      color: isAssistant 
                        ? (msg.isError ? 'var(--color-danger)' : 'var(--color-accent)') 
                        : 'var(--color-text-secondary)',
                      border: `1px solid ${isAssistant ? 'transparent' : 'var(--color-border)'}`
                    }}>
                      {isAssistant ? <FiCpu size={16} /> : <FiUser size={16} />}
                    </div>

                    {/* Message Bubble */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <div style={{ 
                        padding: '12px 16px', 
                        borderRadius: 'var(--radius-lg)', 
                        fontSize: '0.9rem', 
                        lineHeight: 1.5,
                        whiteSpace: 'pre-wrap',
                        boxShadow: 'var(--shadow-sm)',
                        background: isAssistant 
                          ? (msg.isError ? 'var(--color-danger-bg)' : 'var(--color-bg-card)') 
                          : 'var(--color-accent)',
                        color: isAssistant 
                          ? (msg.isError ? 'var(--color-danger)' : 'var(--color-text-primary)') 
                          : '#ffffff',
                        border: isAssistant ? '1px solid var(--color-border)' : 'none',
                        borderTopLeftRadius: isAssistant ? 0 : 'var(--radius-lg)',
                        borderTopRightRadius: isAssistant ? 'var(--radius-lg)' : 0
                      }}>
                        {msg.content}
                      </div>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        color: 'var(--color-text-muted)',
                        alignSelf: isAssistant ? 'flex-start' : 'flex-end',
                        padding: '0 4px'
                      }}>
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {chatMutation.isPending && (
                <div style={{ display: 'flex', gap: 12, maxWidth: '80%', alignSelf: 'flex-start' }}>
                  <div style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    background: 'var(--color-accent-light)',
                    color: 'var(--color-accent)',
                    flexShrink: 0
                  }}>
                    <FiCpu size={16} />
                  </div>
                  <div style={{ 
                    padding: '12px 16px', 
                    borderRadius: 'var(--radius-lg)', 
                    background: 'var(--color-bg-card)', 
                    border: '1px solid var(--color-border)',
                    borderTopLeftRadius: 0,
                    boxShadow: 'var(--shadow-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    color: 'var(--color-text-muted)',
                    fontSize: '0.85rem'
                  }}>
                    <FiLoader className="spin" size={14} />
                    <span>AI Copilot is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', background: 'var(--color-bg-card)' }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <textarea 
                  className="form-control"
                  placeholder="Ask Medicare AI Copilot anything... (Press Enter to send)"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  style={{ 
                    flex: 1, 
                    resize: 'none', 
                    padding: '12px 16px', 
                    borderRadius: 'var(--radius-md)', 
                    height: '46px',
                    lineHeight: '22px'
                  }}
                  disabled={chatMutation.isPending}
                />
                <button 
                  className="btn btn-primary"
                  onClick={() => handleSend()}
                  disabled={chatMutation.isPending || !inputMessage.trim()}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    width: '46px', 
                    height: '46px',
                    borderRadius: 'var(--radius-md)',
                    padding: 0
                  }}
                >
                  {chatMutation.isPending ? <FiLoader className="spin" /> : <FiSend size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Right Info Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Quick Suggestions */}
            <div className="card">
              <div className="card-header" style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 10, marginBottom: 12 }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0, fontSize: '0.9rem', fontWeight: 600 }}>
                  <FiCompass style={{ color: 'var(--color-accent)' }} /> Suggestions
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {QUICK_PROMPTS.map((prompt, i) => (
                  <button 
                    key={i}
                    onClick={() => handleSend(prompt.text)}
                    disabled={chatMutation.isPending}
                    style={{
                      textAlign: 'left',
                      background: 'var(--color-bg-input)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      padding: '10px 12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: '0.8rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}
                    className="suggestion-btn"
                  >
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase' }}>
                      {prompt.category}
                    </span>
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {prompt.text}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* System Info */}
            <div className="card" style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, color: 'var(--color-text-primary)' }}>
                <FiInfo style={{ color: 'var(--color-accent)' }} />
                <span>About AI Copilot</span>
              </div>
              <p style={{ margin: 0, lineHeight: 1.4 }}>
                MediCare AI Copilot is an LLM-powered assistant built to optimize clinical workflows, answer medical questions, generate templates, and automate administrative overhead.
              </p>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiCheck style={{ color: 'var(--color-success)' }} /> Safe & authenticated session
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiCheck style={{ color: 'var(--color-success)' }} /> HIPAA-compliant guidelines
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
