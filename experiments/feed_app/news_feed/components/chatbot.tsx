'use client'

import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Chatbot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  interface Message {
    id: number;
    role: 'user' | 'assistant';
    content: string;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  interface ChatResponse {
    id: number;
    content: string;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!input.trim()) return;

    // Add user message to state
    setMessages(prevMessages => [...prevMessages, { id: Date.now(), role: 'user', content: input }]);
    setInput(''); // Clear the input field

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: input }] }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatResponse = await response.json();

      // Add bot response to state
      setMessages(prevMessages => [...prevMessages, { id: data.id, role: 'assistant', content: data.content }]);
    } catch (error) {
      console.error('Error during chat:', error);
    }
  };

  useEffect(() => {
      if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
      }
  }, [messages]);

  return (
      <div className="flex flex-col h-[400px]">
          <ScrollArea className="flex-grow mb-4 pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                  {messages.map(m => (
                      <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-2 rounded-lg ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                              {m.content}
                          </div>
                      </div>
                  ))}
              </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="flex space-x-2">
              <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Chat with VideoLLaMA2 (out-of-the-box) - Insert a Youtube Link"
                  className="flex-grow"
              />
              <Button type="submit">Send</Button>
          </form>
      </div>
  );
}

