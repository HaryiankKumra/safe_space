import React, { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/types/chat";
import { getLocalStressRecommendations } from "@/utils/stressRecommendations";
import ChatMessage from "./chat/ChatMessage";
import TypingIndicator from "./chat/TypingIndicator";
import ChatInput from "./chat/ChatInput";
import QuickActions from "./chat/QuickActions";

const StressChatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "bot",
      content:
        "Hi! I'm your AI stress management assistant. I'm here to help you with relaxation techniques, breathing exercises, and personalized stress relief strategies. How are you feeling right now?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      console.log("🔄 Sending message to chatbot...");

      // Try API with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timeout")), 8000),
      );

      const apiPromise = supabase.functions.invoke("stress-chatbot", {
        body: { message: inputValue },
      });

      try {
        const { data, error } = (await Promise.race([
          apiPromise,
          timeoutPromise,
        ])) as any;

        if (!error && data?.response) {
          console.log("✅ Received AI response");
          const botMessage: Message = {
            id: (Date.now() + 1).toString(),
            type: "bot",
            content: data.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, botMessage]);
        } else {
          throw new Error(error?.message || "API response failed");
        }
      } catch (apiError) {
        console.warn(
          "⚠️ AI chatbot unavailable, using local responses:",
          apiError,
        );

        // Enhanced local responses
        const recommendation = getLocalStressRecommendations(inputValue);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: "bot",
          content:
            recommendation.response +
            "\n\n💡 *Note: AI chatbot is currently offline. For full AI responses, configure OpenAI API key in your Supabase functions.*",
          timestamp: new Date(),
          stressLevel: recommendation.stressLevel,
        };
        setMessages((prev) => [...prev, botMessage]);

        // Only show toast for first offline message
        if (!localStorage.getItem("chatbot_offline_shown")) {
          localStorage.setItem("chatbot_offline_shown", "true");
          toast({
            title: "Offline Mode Active",
            description:
              "Using local stress management responses. Configure API keys for full AI chat.",
            variant: "default",
          });
        }
      }
    } catch (error) {
      console.error("❌ Chatbot error:", error);

      // Ultimate fallback
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content:
          "I understand you're reaching out for stress management support. While I'm experiencing technical difficulties, here are some immediate techniques that can help:\n\n🌬️ **Quick Relief:**\n• Take 5 deep breaths (4 counts in, 6 counts out)\n• Progressive muscle relaxation\n• Ground yourself by naming 5 things you can see\n\n💪 **Remember:** You have the strength to manage this moment. What specific area would you like help with?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleQuickAction = (message: string) => {
    setInputValue(message);
  };

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          AI Stress Management Chatbot
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            ✅ Active
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-96">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-4 bg-slate-900/50 rounded-lg border border-slate-600">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}

            {isTyping && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <ChatInput
            inputValue={inputValue}
            setInputValue={setInputValue}
            onSendMessage={handleSendMessage}
            onKeyPress={handleKeyPress}
          />

          {/* Quick Actions */}
          <QuickActions onQuickAction={handleQuickAction} />
        </div>
      </CardContent>
    </Card>
  );
};

export default StressChatbot;
