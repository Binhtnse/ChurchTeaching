import React, { useState } from 'react';
import { Input, Button, Card, Spin, FloatButton } from 'antd';
import { SendOutlined, MessageOutlined, CloseOutlined } from '@ant-design/icons';

interface Message {
  text: string;
  isUser: boolean;
}

const ChatboxAI: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      text: inputMessage,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(
        `https://sep490-backend-production.up.railway.app/bot/chat?prompt=${encodeURIComponent(
          inputMessage
        )}`
      );
      const data = await response.text();

      const aiMessage: Message = {
        text: data,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching response:', error);
    }

    setInputMessage('');
    setIsLoading(false);
  };

  return (
    <>
      <FloatButton
        icon={<MessageOutlined />}
        onClick={() => setIsOpen(true)}
        type="primary"
        style={{ right: 24, bottom: 24 }}
      />

      {isOpen && (
        <div className="fixed bottom-24 right-8 z-50 w-[350px] sm:w-[400px]">
          <Card 
            className="shadow-lg"
            extra={
              <Button 
                type="text" 
                icon={<CloseOutlined />} 
                onClick={() => setIsOpen(false)}
              />
            }
            title="Church Teaching AI Chat"
          >
            <div className="h-[400px] flex flex-col">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.isUser
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-center">
                    <Spin />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onPressEnter={handleSendMessage}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button
                  type="primary"
                  icon={<SendOutlined />}
                  onClick={handleSendMessage}
                  className="bg-blue-500"
                >
                  Send
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default ChatboxAI;