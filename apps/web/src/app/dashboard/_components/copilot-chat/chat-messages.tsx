'use client'

import { useEffect, useRef } from 'react'
import { Sparkles, User } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import type { ChatMessage } from '@/lib/copilot/types'

interface ChatMessagesProps {
  messages: ChatMessage[]
  isLoading?: boolean
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)
  
  // Auto-scroll para o final quando novas mensagens chegam
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])
  
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}
      
      {isLoading && <LoadingBubble />}
      
      <div ref={bottomRef} />
    </div>
  )
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${isUser 
          ? 'bg-navy' 
          : 'bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500'
        }
      `}>
        {isUser ? (
          <User className="w-4 h-4 text-sand" />
        ) : (
          <Sparkles className="w-4 h-4 text-white" />
        )}
      </div>
      
      {/* Message */}
      <div className={`
        max-w-[85%] rounded-xl px-4 py-3
        ${isUser 
          ? 'bg-navy text-sand' 
          : 'bg-stone/10 text-navy'
        }
      `}>
        {isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-sm prose-navy max-w-none 
            prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0
            prose-headings:text-navy prose-strong:text-navy">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}

function LoadingBubble() {
  return (
    <div className="flex gap-3">
      {/* Avatar com gradiente AI */}
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 flex items-center justify-center flex-shrink-0">
        <Sparkles className="w-4 h-4 text-white" />
      </div>
      
      {/* Shimmer skeleton */}
      <div className="bg-stone/10 rounded-xl px-4 py-3 space-y-2.5 min-w-[220px]">
        <ShimmerBar width="100%" />
        <ShimmerBar width="80%" />
        <ShimmerBar width="60%" />
      </div>
    </div>
  )
}

function ShimmerBar({ width }: { width: string }) {
  return (
    <div 
      className="h-3 rounded relative overflow-hidden bg-stone/40"
      style={{ width }}
    >
      <div 
        className="absolute inset-0 shimmer-effect"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.6) 50%, transparent 100%)',
        }}
      />
    </div>
  )
}

