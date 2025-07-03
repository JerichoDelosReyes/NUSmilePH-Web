import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import TitleHead from '../Custom Hooks/TitleHead';
import '../Views/Styles/AIChatBot.css';
import API_ENDPOINTS from '../../config/api';

// Set to false in production environment
const USE_SIMULATED_RESPONSE = false;

// Create a wrapper component to use navigation context
const AIChatBot = () => {
  
  // Set page title
  TitleHead('Molar Bear');

  const [userMessage, setUserMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { sender: 'bot', text: 'Hi there! I\'m MolarBear AI. How can I help you with your dental questions today?', timestamp: new Date() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const chatContentRef = useRef(null);

  // Improved scrollToBottom function
  const scrollToBottom = () => {
    if (chatContentRef.current) {
      const { scrollHeight, scrollTop, clientHeight } = chatContentRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      
      if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ 
          behavior: isNearBottom ? 'smooth' : 'auto',
          block: 'end' // Ensures it scrolls to the end without shifting layout
        });
      }
    }
  };

  useEffect(() => {
    // Use a small timeout to ensure DOM is updated before scrolling
    setTimeout(() => scrollToBottom(), 10);
  }, [chatMessages]);

  // Function to remove asterisks from text
  const removeAsterisks = (text) => {
    if (!text) return '';
    return text.replace(/\*/g, '');
  };

  // Process messages to format any special content
  const processMessage = (text) => {
    // Enhanced to handle different types of content formatting
    if (!text) return '';
    
    // Remove asterisks before processing
    const cleanText = removeAsterisks(text);
    
    // Split text by newlines and render paragraphs properly
    return cleanText.split('\n').map((line, i) => (
      line ? <p key={i}>{line}</p> : <br key={i} />
    ));
  };

  // Updated handleSubmit function to prevent layout shifts
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedMessage = userMessage.trim();
    if (!trimmedMessage) return;
    
    // Add user message to chat
    const newUserMessage = { 
      sender: 'user', 
      text: trimmedMessage, 
      timestamp: new Date() 
    };
    
    setChatMessages(prevMessages => [...prevMessages, newUserMessage]);
    setUserMessage('');
    setIsLoading(true);
    
    // Scroll to bottom immediately after adding user message
    setTimeout(() => scrollToBottom(), 10);
    
    try {
      console.log('Sending message to API:', trimmedMessage);
      
      // Check if we should use simulated response (for development)
      if (USE_SIMULATED_RESPONSE) {
        // Simulate API response after a delay
        setTimeout(() => {
          const aiMessage = {
            sender: 'bot',
            text: `Thanks for your question about "${trimmedMessage}". As a dental AI assistant, I can provide information on oral health, treatments, and preventive care. How else can I assist you?`,
            timestamp: new Date(),
          };
          
          setChatMessages(prevMessages => [...prevMessages, aiMessage]);
          setIsLoading(false);
          // Scroll after response
          setTimeout(() => scrollToBottom(), 10);
        }, 1000);
        
        return;
      }
      
      // Call the actual API
      const response = await axios.post(
        `${API_ENDPOINTS.MOLARBEAR_CHAT}`,
        { userInput: trimmedMessage },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 15000, // 15 second timeout
        }
      );
      
      // Get response text and remove any asterisks
      let responseText = response.data.message || response.data || "I'm sorry, I couldn't process that request.";
      
      // Add AI response to chat
      const aiMessage = {
        sender: 'bot',
        text: responseText,
        timestamp: new Date(),
      };
      
      setChatMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error("Error calling API:", error);
      
      let errorMessage = "Sorry, I'm having trouble connecting right now. Please try again later.";
      
      // Detailed error handling based on error type
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
        
        if (error.response.status === 401) {
          errorMessage = "Authentication required. Please sign in again.";
        } else if (error.response.status === 403) {
          errorMessage = "You don't have permission to perform this action.";
        } else if (error.response.status === 429) {
          errorMessage = "You've sent too many messages. Please wait a moment and try again.";
        } else if (error.response.status >= 500) {
          errorMessage = "The server encountered an error. Our team has been notified.";
        }
        
        // Use server-provided message if available
        if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.request) {
        console.error("Error request:", error.request);
        
        // Check if it's a timeout
        if (error.code === 'ECONNABORTED') {
          errorMessage = "The request timed out. Please check your internet connection and try again.";
        } else {
          errorMessage = "No response received from server. Please check your internet connection.";
        }
      } else {
        console.error("Error message:", error.message);
        errorMessage = "An error occurred while sending your message. Please try again.";
      }
      
      // Add error message to chat
      const errorResponse = {
        sender: 'bot',
        text: errorMessage,
        timestamp: new Date(),
        isError: true,
      };
      
      setChatMessages(prevMessages => [...prevMessages, errorResponse]);
    } finally {
      setIsLoading(false);
      // Also scroll after receiving response
      setTimeout(() => scrollToBottom(), 10);
    }
  };

  const formatTimestamp = (timestamp) => {
    const options = { hour: '2-digit', minute: '2-digit', hour12: true };
    return new Date(timestamp).toLocaleString('en-US', options);
  };

  return (
    <div className="ChatBot-content flex flex-col h-full" style={{ minHeight: 'calc(100vh - 120px)' }}>
      <div className="ChatBot-content-body flex-grow flex flex-col">
        <div className="cards flex flex-col h-full">
          {/* Header Section for Chatbot */}
          <div className="ChatBot-header">
            <img 
              src="/Molar_Bear_Transparent-removebg-preview.png" 
              alt="Molar Bear" 
              className="w-16 h-16 rounded-full" 
            />
            <h1 className="text-2xl font-bold text-blue-900">MolarBear AI</h1>
          </div>

          {/* Chat Content Area - Make it flexible height */}
          <div className="ChatBot-body flex-grow flex flex-col">
            <div 
              className="ChatContent flex-grow overflow-y-auto mb-4 p-4" 
              ref={chatContentRef}
              style={{ minHeight: '300px' }}
            >
              <div className="space-y-4">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                        msg.sender === 'user' 
                          ? 'bg-blue-600 text-blue-50 rounded-br-none' 
                          : msg.isError 
                            ? 'bg-red-200 text-red-800 rounded-bl-none'
                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                      }`}
                    >
                      <div className={msg.sender === 'user' ? 'text-blue-50' : (msg.isError ? 'text-red-800' : 'text-gray-800')}>
                        {processMessage(msg.text)}
                      </div>
                      <div className={`text-xs mt-1 ${
                        msg.sender === 'user' 
                          ? 'text-blue-200'
                          : (msg.isError ? 'text-red-500' : 'text-gray-500')
                      }`}>
                        {formatTimestamp(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>
            
            {/* Input Area - Fixed at bottom */}
            <div className="chat-input-container px-4 pb-4 mt-auto">
              <form onSubmit={handleSubmit} className="flex space-x-2">
                <input 
                  type="text" 
                  name="Reply" 
                  id="textbox" 
                  className="input flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  placeholder="Ask anything about dental health..." 
                  value={userMessage} 
                  onChange={e => setUserMessage(e.target.value)}
                  disabled={isLoading}
                />
                <button 
                  type="submit"
                  className={`${
                    isLoading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  } text-white px-4 py-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 send-button`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIChatBot;