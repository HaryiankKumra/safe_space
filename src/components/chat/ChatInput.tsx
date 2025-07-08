
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  inputValue,
  setInputValue,
  onSendMessage,
  onKeyPress
}) => {
  return (
    <div className="flex gap-2">
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={onKeyPress}
        placeholder="Tell me how you're feeling or ask for stress relief tips..."
        className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
      />
      <Button onClick={onSendMessage} className="bg-purple-600 hover:bg-purple-700">
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ChatInput;
