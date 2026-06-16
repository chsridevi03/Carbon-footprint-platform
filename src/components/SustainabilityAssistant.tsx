/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Send, Leaf, Cpu, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';

interface SustainabilityAssistantProps {
  token: string | null;
}

export default function SustainabilityAssistant({ token }: SustainabilityAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `👋 Greetings Eco Tracker! I'm **GreenTrack's AI Sustainability Specialist**. 
      
I've analyzed calculations of your footprint category metrics. Ask me anything on how to reduce emissions, choose carbon offsets, upgrade appliances, or transition your lifestyle! 

Here are some ecological prompts to get us rolling:`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const startermessages = [
    'How do I reduce my transportation emissions footprint?',
    'What is the standard climate target annual carbon cap?',
    'Explain the carbon difference between Vegan and Non-Veg diet habits.',
    'LED vs Halogen bulb cost-energy impacts.',
  ];

  // Auto-scroll anchor
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    setErrorText(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            sender: m.sender,
            text: m.text
          }))
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync with Green AI server.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'assistant',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err: any) {
      setErrorText(err.message || 'Connecting with AI specialist timed out.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage(inputText);
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset-msg',
        sender: 'assistant',
        text: `♻️ Chat history cleared. Ask me any environmental, solar, commute, energy conservation, or lifestyle questions to reduce your carbon index!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[78vh]" id="ai-assistant-terminal">
      {/* Sidebar with presets */}
      <div className="lg:col-span-1 hidden lg:flex flex-col space-y-4 text-left">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-slate-800 shadow-sm space-y-3.5 flex-1 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="flex items-center space-x-2 text-natural-primary">
              <Cpu size={16} />
              <h3 className="font-display font-bold text-xs uppercase tracking-wider text-natural-text-dark dark:text-white">Assistant Presets</h3>
            </span>

            <div className="space-y-2">
              {startermessages.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p)}
                  className="w-full text-[10.5px] leading-relaxed p-2.5 rounded-xl border border-natural-bg-muted text-left text-natural-text-charcoal font-semibold bg-natural-bg-muted/15 dark:bg-slate-850/50 hover:bg-natural-bg-muted/45 dark:hover:bg-slate-800/80 transition cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="flex items-center justify-center space-x-2 w-full py-2 hover:bg-[#BC4749]/10 text-[#BC4749] rounded-xl text-xs font-bold transition border border-[#BC4749]/30 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Reset Dialogue</span>
          </button>
        </div>
      </div>

      {/* Primary chat workspace */}
      <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-slate-900 border border-natural-bg-muted dark:border-[#1E3020] rounded-2xl shadow-sm overflow-hidden relative">
        {/* Chat header */}
        <div className="px-5 py-4 border-b border-natural-bg-muted dark:border-[#1E3020] flex items-center justify-between">
          <div className="flex items-center space-x-3 text-left">
            <span className="p-2 rounded-xl bg-natural-bg-muted text-natural-primary">
              <Sparkles size={16} className="animate-spin" style={{ animationDuration: '6s' }} />
            </span>
            <div className="space-y-0.5">
              <h3 className="font-display font-bold text-xs text-natural-text-dark dark:text-white leading-none">Sustainability Specialist</h3>
              <p className="text-[10px] text-natural-primary dark:text-natural-lime font-bold uppercase leading-none tracking-widest flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-natural-primary inline-block animate-ping" />
                Gemini-3.5-powered
              </p>
            </div>
          </div>

          <button
            onClick={handleClearHistory}
            className="lg:hidden p-1.5 text-[#BC4749] rounded hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            title="Clear Chat"
          >
            <Trash2 size={15} />
          </button>
        </div>

        {/* Scrollable chat log viewport */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" id="chat-messages-container">
          {messages.map((m) => {
            const isAI = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex ${isAI ? 'justify-start' : 'justify-end'} text-left items-start space-x-3`}
              >
                {isAI && (
                  <span className="p-1 text-xs rounded bg-natural-bg-muted text-natural-primary font-bold shrink-0">
                    🌿
                  </span>
                )}
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 space-y-1 ${
                  isAI
                    ? 'bg-natural-bg-muted/15 border border-natural-bg-muted text-natural-text-charcoal'
                    : 'bg-[#1B3022] text-white text-right shadow-sm'
                }`}>
                  {/* Clean text handling */}
                  <div className="text-xs leading-relaxed break-words whitespace-pre-wrap">
                    {m.text}
                  </div>
                  <span className={`text-[8.5px] block uppercase font-mono tracking-widest ${isAI ? 'text-natural-text-sage' : 'text-natural-bg-muted/75'}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start items-center space-x-3" id="chat-ai-typing-status">
              <span className="p-1 text-xs rounded bg-natural-bg-muted text-natural-primary shrink-0">🌿</span>
              <div className="bg-natural-bg-muted/15 p-3 rounded-2xl flex items-center space-x-1">
                <span className="h-1.5 w-1.5 rounded-full bg-natural-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-natural-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-1.5 w-1.5 rounded-full bg-natural-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          {errorText && (
            <div className="p-2 border border-[#BC4749]/20 bg-[#BC4749]/10 text-[#BC4749] text-[11px] rounded-xl flex items-center space-x-2 leading-none w-max mx-auto border border-[#BC4749]/20">
              <AlertCircle size={13} className="text-[#BC4749]" />
              <span>{errorText}</span>
            </div>
          )}

          <div ref={endOfMessagesRef} />
        </div>

        {/* Input box bottom */}
        <div className="px-5 py-4 border-t border-natural-bg-muted bg-natural-bg-muted/5 font-sans">
          <div className="flex items-center space-x-2 pr-1" id="chat-form-container">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              className="flex-1 text-xs font-semibold px-4 py-2.5 border border-natural-bg-muted rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-sans"
              placeholder="Ask about appliances, solar offsets, EV options..."
              id="ai-coach-input"
            />
            <button
              onClick={() => sendMessage(inputText)}
              disabled={isLoading || !inputText.trim()}
              id="ai-coach-submit-btn"
              className="p-2.5 bg-[#1B3022] hover:bg-[#386641] text-white rounded-xl transition cursor-pointer disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
