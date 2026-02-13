import React, { useState, useEffect, useRef } from 'react';
import './AIBot.css';
import { FaMicrophone, FaPaperPlane, FaRobot, FaTimes, FaVolumeUp, FaVolumeMute } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const AIBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { sender: 'bot', text: 'Hi! I am the Green Thread Assistant. How can I help you today?' }
    ]);
    const [inputText, setInputText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(true);
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Speech Recognition Setup
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = useRef(null);

    useEffect(() => {
        if (SpeechRecognition) {
            recognition.current = new SpeechRecognition();
            recognition.current.continuous = false;
            recognition.current.lang = 'en-US';

            recognition.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInputText(transcript);
                handleSend(transcript);
            };

            recognition.current.onend = () => {
                setIsListening(false);
            };
        }
    }, []);

    const toggleListening = () => {
        if (!recognition.current) {
            alert("Browser does not support Speech Recognition.");
            return;
        }

        if (isListening) {
            recognition.current.stop();
        } else {
            recognition.current.start();
            setIsListening(true);
        }
    };

    const speak = (text) => {
        if (!isSpeaking) return;
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    };

    const handleSend = async (text = inputText) => {
        if (!text.trim()) return;

        const userMsg = { sender: 'user', text };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');

        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    message: text,
                    history: messages.slice(-5) // Send last 5 messages for context
                })
            });

            const data = await response.json();
            
            // Bot Message
            const botMsg = { sender: 'bot', text: data.message || "I didn't catch that." };
            setMessages(prev => [...prev, botMsg]);
            speak(botMsg.text);

            // Handle Actions
            if (data.action) {
                console.log("AI Action:", data.action, data.data);
                handleAction(data.action, data.data);
            }

        } catch (error) {
            console.error("Error talking to bot:", error);
            setMessages(prev => [...prev, { sender: 'bot', text: "Sorry, I am having trouble connecting." }]);
        }
    };

    const handleAction = (action, data) => {
        switch (action) {
            case "REGISTER_USER_INTENT":
                navigate('/signup');
                break;
            case "LOGIN_USER_INTENT":
                navigate('/login');
                break;
            case "NAVIGATE":
                if (data && data.path) navigate(data.path);
                break;
            case "SEARCH_PRODUCTS":
                if (data && data.query) {
                    // Navigate to marketplace with search query
                    // Assuming /marketplace accepts a query param or we can filter local state
                    // For now, let's just go to marketplace and show an alert or set context
                    // Ideally we pass state:
                    navigate('/marketplace', { state: { searchQuery: data.query } });
                }
                break;
            default:
                break;
        }
    };

    return (
        <div className={`ai-bot-container ${isOpen ? 'open' : ''}`}>
            {!isOpen && (
                <button className="ai-bot-toggle" onClick={() => setIsOpen(true)}>
                    <FaRobot size={24} />
                    <span className="ai-bot-label">AI Assistant</span>
                </button>
            )}

            {isOpen && (
                <div className="ai-bot-window">
                    <div className="ai-bot-header">
                        <div className="ai-bot-title">
                            <FaRobot /> Green Thread Assistant
                        </div>
                        <div className="ai-bot-controls">
                            <button onClick={() => setIsSpeaking(!isSpeaking)} title={isSpeaking ? "Mute" : "Unmute"}>
                                {isSpeaking ? <FaVolumeUp /> : <FaVolumeMute />}
                            </button>
                            <button onClick={() => setIsOpen(false)}>
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    <div className="ai-bot-messages">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message ${msg.sender}`}>
                                <div className="message-text">{msg.text}</div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="ai-bot-input">
                        <button 
                            className={`mic-btn ${isListening ? 'listening' : ''}`} 
                            onClick={toggleListening}
                        >
                            <FaMicrophone />
                        </button>
                        <input 
                            type="text" 
                            value={inputText} 
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Type or speak..."
                        />
                        <button className="send-btn" onClick={() => handleSend()}>
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIBot;
