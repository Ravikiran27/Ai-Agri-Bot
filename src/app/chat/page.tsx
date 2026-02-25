'use client';

import { agriculturalQuery } from '@/ai/flows/agricultural-query';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Bot, Send, User } from 'lucide-react';
import { useRef, useState, useTransition, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { addChatMessage, getChatMessages } from '@/lib/chat-supabase';


type Message = {
  role: 'user' | 'assistant';
  content: string;
};


async function logChatHistorySupabase(messages: Message[], userId: string) {
  // Store the entire chat as a single message for now
  await addChatMessage({ user_id: userId, message: JSON.stringify(messages) });
}

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Not logged in");
        return;
      }
      setUserId(user.id);
      const { data, error } = await getChatMessages(user.id);
      if (error) {
        setError(error.message);
        return;
      }
      // If you want to show the latest chat session, parse the last message
      if (data && data.length > 0) {
        try {
          const last = data[data.length - 1];
          const parsed = JSON.parse(last.message);
          setMessages(Array.isArray(parsed) ? parsed : []);
        } catch {
          setMessages([]);
        }
      }
    };
    fetchUserAndMessages();
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userInput = input.trim();
    if (!userInput || !userId) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: userInput }];
    setMessages(newMessages);
    setInput('');

    startTransition(async () => {
      const result = await agriculturalQuery({ query: userInput });
      const updatedMessages: Message[] = [
        ...newMessages,
        { role: 'assistant', content: String(result.answer) }
      ];
      setMessages(updatedMessages);
      setTimeout(() => logChatHistorySupabase(updatedMessages, userId), 0);
    });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col">
      <div className="flex-1 space-y-6 overflow-y-auto rounded-lg border p-4 shadow-sm">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Bot className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h2 className="text-2xl font-semibold">Agri-Chat</h2>
              <p className="text-muted-foreground">
                Ask me anything about farming, crops, or soil health.
              </p>
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex items-start gap-4',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-md rounded-lg p-3 text-sm',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p>{message.content}</p>
              </div>
              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback><User size={20} /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))
        )}
        {isPending && (
            <div className='flex items-start gap-4 justify-start'>
                <Avatar className="h-8 w-8">
                  <AvatarFallback><Bot size={20} /></AvatarFallback>
                </Avatar>
                <div className="max-w-md rounded-lg p-3 text-sm bg-muted flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-foreground" style={{ animationDelay: '0s' }}></span>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-foreground" style={{ animationDelay: '0.2s' }}></span>
                    <span className="h-2 w-2 animate-pulse rounded-full bg-foreground" style={{ animationDelay: '0.4s' }}></span>
                </div>
            </div>
        )}
      </div>
      <div className="mt-4">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className="relative flex items-center"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="w-full resize-none pr-20"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                formRef.current?.requestSubmit();
              }
            }}
            rows={1}
            disabled={isPending}
          />
          <Button
            type="submit"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            disabled={isPending || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
