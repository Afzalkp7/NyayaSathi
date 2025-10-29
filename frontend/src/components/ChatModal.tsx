import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import type { Message } from '../types'; // This will now import all our new types
import { SendIcon, CloseIcon, ScalesIcon } from './icons';
import AIResponseCard from './AIResponseCard'; // Import the new component

interface ChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!userInput.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: userInput.trim() };
        setMessages(prev => [...prev, userMessage]);

        const problemToSolve = userInput;
        setUserInput('');
        setIsLoading(true);

        try {
            const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/search/laws`;
            const response = await axios.post(apiUrl, {
                userProblem: problemToSolve
            });

            // IMPORTANT: We now create an AI message with all the structured data
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: response.data.legalInformation, // Keep simple text for notifications, etc.
                legalInformation: response.data.legalInformation,
                relevantSections: response.data.relevantSections,
                nextSteps: response.data.nextSteps,
            };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error("Error fetching API response:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                sender: 'ai',
                text: "Sorry, I couldn't connect to the server. Please check your connection or try again later."
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b">
                    {/* Header remains the same */}
                    <div className="flex items-center">
                        <ScalesIcon className="h-6 w-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-800 ml-2">NyayaSathi Legal Assistant</h2>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                        <CloseIcon className="h-6 w-6" />
                    </button>
                </header>

                <div ref={chatContainerRef} className="flex-1 p-6 overflow-y-auto space-y-4">
                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
                            {msg.sender === 'ai' && (
                                <div className="bg-blue-600 p-2 rounded-full self-start">
                                    <ScalesIcon className="h-5 w-5 text-white" />
                                </div>
                            )}

                            {/* UPDATED RENDER LOGIC */}
                            {msg.sender === 'ai' && msg.relevantSections ? (
                                // If it's an AI message with structured data, use the new card
                                <AIResponseCard 
                                    legalInformation={msg.legalInformation!}
                                    relevantSections={msg.relevantSections}
                                    nextSteps={msg.nextSteps!}
                                />
                            ) : (
                                // Otherwise, use the simple message bubble
                                <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                                    <p className="whitespace-pre-wrap">{msg.text}</p>
                                </div>
                            )}
                        </div>
                    ))}
                     {isLoading && (
                         <div className="flex items-start gap-3">
                            <div className="bg-blue-600 p-2 rounded-full">
                                <ScalesIcon className="h-5 w-5 text-white" />
                            </div>
                            <div className="max-w-md p-3 rounded-lg bg-gray-100 text-gray-800 rounded-bl-none">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                         </div>
                    )}
                </div>

                <footer className="p-4 border-t">
                    {/* Footer remains the same */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-2">
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Describe your legal issue here..."
                            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-800 placeholder-gray-500"
                            disabled={isLoading}
                        />
                        <button
                            onClick={handleSend}
                            disabled={!userInput.trim() || isLoading}
                            className="p-2 rounded-full text-white bg-blue-600 disabled:bg-blue-300 hover:bg-blue-700 transition-colors"
                        >
                            <SendIcon className="h-5 w-5" />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default ChatModal;