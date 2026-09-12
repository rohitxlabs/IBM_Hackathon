"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const suggestedQuestions = [
  "Explain quadratic equations to me",
  "Help me prepare for my science test",
  "Create a study plan for finals",
  "What assignments are due this week?",
  "Why did my math score decrease?",
  "Give me practice questions for history",
];

const aiResponses: Record<string, string> = {
  default: "I'm Jinni AI, your personal learning assistant! I can help you understand concepts, prepare for tests, create study plans, and answer your academic questions. How can I help you today?",
  "explain quadratic equations": "A quadratic equation is a second-degree polynomial equation in a single variable x, with the general form:\n\n**ax² + bx + c = 0**\n\nWhere:\n- a, b, and c are constants\n- a ≠ 0\n- x is the unknown variable\n\nTo solve quadratic equations, you can use:\n1. **Factoring** - Breaking into two binomials\n2. **Quadratic Formula** - x = (-b ± √(b²-4ac)) / 2a\n3. **Completing the Square** - Rewriting in vertex form\n\nWould you like me to explain any of these methods in more detail?",
  "help me prepare": "I'd be happy to help you prepare for your test! Here's a suggested study plan:\n\n**Week Before the Test:**\n1. Review class notes and textbook chapters\n2. Create summary sheets for key concepts\n3. Practice with sample questions\n4. Identify weak areas and focus on them\n\n**Day Before:**\n1. Light review of summary sheets\n2. Get a good night's sleep\n3. Prepare materials for the test day\n\n**Test Day:**\n1. Arrive early\n2. Review key formulas briefly\n3. Stay calm and confident\n\nWould you like me to help you with any specific subject or topic?",
  "create a study plan": "Here's a personalized study plan template:\n\n**Daily Schedule:**\n- 3:30 - 4:00 PM: Review class notes\n- 4:00 - 5:00 PM: Work on assignments\n- 5:00 - 5:15 PM: Break\n- 5:15 - 6:00 PM: Study new concepts\n- 6:00 - 6:30 PM: Practice problems\n\n**Weekly Goals:**\n- Monday: Mathematics\n- Tuesday: Science\n- Wednesday: English\n- Thursday: History\n- Friday: Review weak areas\n- Weekend: Light review + rest\n\n**Tips:**\n- Take regular breaks\n- Stay hydrated\n- Get enough sleep\n- Ask for help when needed\n\nWould you like me to customize this plan for your specific needs?",
  "what assignments are due": "Let me check your upcoming assignments:\n\n**Pending Assignments:**\n1. Mathematics - Quadratic Equations Problem Set (Due: Sep 10)\n2. English - Essay: Shakespeare's Hamlet (Due: Sep 15)\n3. History - World War II Timeline (Due: Sep 20)\n4. Mathematics - Statistics Project (Due: Sep 25)\n\n**Overdue:**\n1. Physics - Problem Set (Due: Sep 1)\n\nWould you like help with any of these assignments?",
  "why did my score decrease": "There could be several reasons why your score might have decreased. Let's analyze:\n\n**Common Reasons:**\n1. **Difficulty Level** - The topic might be more challenging\n2. **Study Habits** - Changes in your study routine\n3. **Test Format** - Different question types\n4. **Time Management** - Rushing through questions\n5. **Conceptual Gaps** - Missing foundational knowledge\n\n**What You Can Do:**\n1. Review the specific topics where you lost marks\n2. Practice similar problems\n3. Ask your teacher for clarification\n4. Create a focused study plan for weak areas\n\nWould you like me to help you identify your weak areas and create a improvement plan?",
  "give me practice questions": "Here are some practice questions for different subjects:\n\n**Mathematics:**\n1. Solve: 2x² + 5x - 3 = 0\n2. Find the derivative of f(x) = 3x² + 2x - 5\n\n**Science:**\n1. Explain Newton's Third Law of Motion\n2. What is the difference between ionic and covalent bonds?\n\n**English:**\n1. Write a thesis statement for an essay on climate change\n2. Identify the metaphors in the given poem\n\n**History:**\n1. What were the main causes of World War I?\n2. Explain the significance of the Renaissance\n\nWould you like me to provide answers and explanations for any of these questions?",
};

function getAIResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  for (const [key, response] of Object.entries(aiResponses)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return response;
    }
  }
  
  return aiResponses.default;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: aiResponses.default,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI thinking
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiResponse: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: getAIResponse(content),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleSuggestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: aiResponses.default,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Link
            href="/student"
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-[var(--radius-sm)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-accent-500 to-accent-700 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Jinni AI</h1>
              <p className="text-sm text-gray-500">Always here to help</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleClearChat}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-[var(--radius-sm)] transition-colors"
          title="Clear chat"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : ""
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-700 rounded-full flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                message.role === "user"
                  ? "bg-primary-600 text-white rounded-tr-none"
                  : "bg-gray-100 text-gray-900 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-700 rounded-full flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
              </svg>
            </div>
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-tl-none">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions */}
      {messages.length <= 2 && (
        <div className="py-4">
          <p className="text-sm font-medium text-gray-600 mb-3">Suggested questions:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.slice(0, 4).map((question) => (
              <button
                key={question}
                onClick={() => handleSuggestionClick(question)}
                className="px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="pt-4 border-t border-gray-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Jinni AI anything..."
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-accent-500"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 bg-accent-600 text-white rounded-full flex items-center justify-center hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
}
