import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Sparkles, DollarSign, TrendingUp, PieChart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const quickActions = [
  {
    icon: DollarSign,
    label: 'Budget Analysis',
    prompt: 'Analyze my spending patterns and suggest improvements'
  },
  {
    icon: TrendingUp,
    label: 'Savings Tips',
    prompt: 'Give me personalized savings tips based on my expenses'
  },
  {
    icon: PieChart,
    label: 'Expense Breakdown',
    prompt: 'Explain my expense categories and which ones I should focus on'
  }
];

export const AIAssistant: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your personal finance assistant. I can help you analyze your spending, create budgets, suggest savings strategies, and answer any financial questions you have. What would you like to know?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Get user's financial data for context
    const { data: expenses } = await supabase
      .from('expenses')
      .select('*')
      .eq('user_id', user?.id);

    const { data: income } = await supabase
      .from('income')
      .select('*')
      .eq('user_id', user?.id);

    const totalIncome = income?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const totalExpenses = expenses?.reduce((sum, item) => sum + item.amount, 0) || 0;
    const balance = totalIncome - totalExpenses;

    // Category breakdown
    const categoryBreakdown = expenses?.reduce((acc: any, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {}) || {};

    // Simple AI response logic based on the question and financial data
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('spending')) {
      const topCategory = Object.entries(categoryBreakdown).sort(([,a]: any, [,b]: any) => b - a)[0];
      return `Based on your spending data, you've spent ₹${totalExpenses.toLocaleString()} out of your ₹${totalIncome.toLocaleString()} income. Your highest spending category is ${topCategory?.[0]} with ₹${(topCategory?.[1] as number)?.toLocaleString() || 0}. ${balance > 0 ? `You have ₹${balance.toLocaleString()} remaining.` : `You're over budget by ₹${Math.abs(balance).toLocaleString()}.`} Consider reducing spending in your top categories to improve your financial position.`;
    }
    
    if (lowerMessage.includes('save') || lowerMessage.includes('savings')) {
      const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0';
      return `Your current savings rate is ${savingsRate}%. Here are some personalized tips: 1) Try the 50/30/20 rule - 50% needs, 30% wants, 20% savings. 2) Reduce spending in your highest category (${Object.keys(categoryBreakdown)[0] || 'N/A'}). 3) Set up automatic transfers to savings. 4) Track your daily expenses to identify small leaks. Your goal should be to save at least 20% of your income.`;
    }
    
    if (lowerMessage.includes('category') || lowerMessage.includes('breakdown')) {
      const categories = Object.entries(categoryBreakdown)
        .sort(([,a]: any, [,b]: any) => b - a)
        .slice(0, 5)
        .map(([cat, amount]: any) => `${cat}: ₹${amount.toLocaleString()}`)
        .join(', ');
      return `Your expense breakdown: ${categories}. Focus on your top spending categories to maximize savings impact. Consider if your spending aligns with your financial goals and values.`;
    }
    
    if (lowerMessage.includes('income') || lowerMessage.includes('earn')) {
      return `Your total income is ₹${totalIncome.toLocaleString()}. To increase your income, consider: 1) Asking for a raise or promotion, 2) Starting a side hustle, 3) Freelancing in your expertise area, 4) Investing in skill development, 5) Creating passive income streams. Remember, increasing income is just as important as reducing expenses!`;
    }

    if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
      return `If you have debt, prioritize paying it off using either the debt avalanche method (highest interest first) or debt snowball method (smallest balance first). Focus on eliminating high-interest debt before investing. Consider consolidating debts if it reduces your interest rates.`;
    }

    if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
      return `Before investing, ensure you have: 1) Emergency fund (3-6 months expenses), 2) High-interest debt paid off, 3) Clear financial goals. Start with low-cost index funds, diversify your portfolio, and invest regularly. Consider SIPs for disciplined investing. Remember: time in market beats timing the market!`;
    }

    // Default response for general questions
    return `I understand you're asking about "${userMessage}". Based on your financial data - income: ₹${totalIncome.toLocaleString()}, expenses: ₹${totalExpenses.toLocaleString()}, balance: ₹${balance.toLocaleString()} - I'd recommend focusing on tracking your expenses, creating a budget, and building an emergency fund. Feel free to ask more specific questions about budgeting, saving, investing, or any other financial topic!`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await generateAIResponse(input);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setTimeout(() => {
        setMessages(prev => [...prev, assistantMessage]);
        setLoading(false);
      }, 1000); // Simulate AI thinking time
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again or ask a different question about your finances.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setLoading(false);
    }
  };

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Financial Assistant</h1>
        <p className="text-gray-600">Get personalized financial advice and insights</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleQuickAction(action.prompt)}
              className="flex items-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all border border-blue-100"
            >
              <Icon className="w-6 h-6 text-blue-600 mr-3" />
              <span className="font-medium text-gray-800">{action.label}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-2xl shadow-lg flex flex-col">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-600 ml-2' 
                    : 'bg-gradient-to-r from-purple-500 to-pink-500 mr-2'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 opacity-70 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
          
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-2">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask me anything about your finances..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={loading}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};