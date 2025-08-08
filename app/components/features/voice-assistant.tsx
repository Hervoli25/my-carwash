
'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  MessageSquare,
  Calendar,
  Car,
  CreditCard,
  User,
  Sparkles,
  Bot,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VoiceCommand {
  command: string;
  response: string;
  timestamp: Date;
  type: 'booking' | 'inquiry' | 'account' | 'general';
}

// Extend Window interface for Speech Recognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversation, setConversation] = useState<VoiceCommand[]>([
    {
      command: 'Hello, what services do you offer?',
      response: 'Hi! We offer Express Exterior wash for R80, Premium Wash & Wax for R150, Deluxe Interior & Exterior for R220, and Executive Detail Package for R350. Which service interests you?',
      timestamp: new Date(Date.now() - 120000),
      type: 'inquiry'
    },
    {
      command: 'Book a premium wash for tomorrow at 2 PM',
      response: 'I\'d be happy to book a Premium Wash & Wax for tomorrow at 2 PM. The service takes about 60 minutes and costs R150. Would you like me to proceed with this booking?',
      timestamp: new Date(Date.now() - 60000),
      type: 'booking'
    }
  ]);

  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onstart = () => {
          setIsListening(true);
        };

        recognitionRef.current.onresult = (event: any) => {
          const last = event.results.length - 1;
          const transcript = event.results[last][0].transcript;
          setTranscript(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (transcript.trim()) {
            processVoiceCommand(transcript);
          }
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }
  }, [transcript]);

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const processVoiceCommand = async (command: string) => {
    setIsProcessing(true);
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let response = '';
    let type: VoiceCommand['type'] = 'general';
    
    const lowerCommand = command.toLowerCase();
    
    if (lowerCommand.includes('book') || lowerCommand.includes('schedule') || lowerCommand.includes('appointment')) {
      response = 'I can help you book a car wash! What service would you like and when? We have Express Wash (R80), Premium Wash (R150), Deluxe Service (R220), or Executive Detail (R350).';
      type = 'booking';
    } else if (lowerCommand.includes('price') || lowerCommand.includes('cost') || lowerCommand.includes('how much')) {
      response = 'Our prices are: Express Exterior Wash R80, Premium Wash & Wax R150, Deluxe Interior & Exterior R220, and Executive Detail Package R350. All prices include eco-friendly products!';
      type = 'inquiry';
    } else if (lowerCommand.includes('account') || lowerCommand.includes('profile') || lowerCommand.includes('membership')) {
      response = 'I can help with your account! You currently have 15,420 loyalty points and are on a 12-day streak. Would you like to check your booking history or update your profile?';
      type = 'account';
    } else if (lowerCommand.includes('location') || lowerCommand.includes('where') || lowerCommand.includes('address')) {
      response = 'PRESTIGE Car Wash is located in Cape Town. We offer convenient booking and have multiple time slots available. Would you like to check available times for today?';
      type = 'inquiry';
    } else if (lowerCommand.includes('hello') || lowerCommand.includes('hi') || lowerCommand.includes('help')) {
      response = 'Hello! I\'m your PRESTIGE Car Wash assistant. I can help you book services, check prices, manage your account, or answer questions about our services. What can I help you with today?';
      type = 'general';
    } else {
      response = 'I understand you\'re asking about "' + command + '". I can help with booking services, checking prices, managing your account, or general questions about PRESTIGE Car Wash. Could you be more specific about what you need?';
      type = 'general';
    }
    
    const newCommand: VoiceCommand = {
      command,
      response,
      timestamp: new Date(),
      type
    };
    
    setConversation(prev => [...prev, newCommand]);
    setTranscript('');
    setIsProcessing(false);
    
    // Speak the response
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const getTypeIcon = (type: VoiceCommand['type']) => {
    switch (type) {
      case 'booking': return <Calendar className="w-4 h-4" />;
      case 'inquiry': return <MessageSquare className="w-4 h-4" />;
      case 'account': return <User className="w-4 h-4" />;
      default: return <Bot className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: VoiceCommand['type']) => {
    switch (type) {
      case 'booking': return 'bg-green-100 text-green-800';
      case 'inquiry': return 'bg-blue-100 text-blue-800';
      case 'account': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const quickCommands = [
    'Book a wash for today',
    'What are your prices?',
    'Check my account balance',
    'What time slots are available?',
    'Cancel my booking',
    'Where are you located?'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-0">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Voice Assistant</h3>
              <p className="text-sm text-gray-600">Speak naturally to book services and get help</p>
            </div>
            <Badge className="bg-indigo-500 text-white">
              <Sparkles className="w-3 h-3 mr-1" />
              AI VOICE
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Voice Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mic className="w-5 h-5 mr-2 text-indigo-500" />
            Voice Control
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center space-y-6">
            {/* Microphone Button */}
            <motion.div
              animate={{ 
                scale: isListening ? [1, 1.1, 1] : 1,
                rotate: isListening ? 360 : 0
              }}
              transition={{ 
                scale: { repeat: isListening ? Infinity : 0, duration: 1 },
                rotate: { duration: 2, repeat: isListening ? Infinity : 0, ease: "linear" }
              }}
            >
              <Button
                onClick={isListening ? stopListening : startListening}
                disabled={isProcessing}
                className={`
                  w-20 h-20 rounded-full text-white transition-all duration-300
                  ${isListening 
                    ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-200' 
                    : isProcessing
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-indigo-500 hover:bg-indigo-600'
                  }
                `}
              >
                {isProcessing ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-8 h-8" />
                  </motion.div>
                ) : isListening ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
            </motion.div>

            {/* Status */}
            <div className="text-center">
              {isListening && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-600 font-medium"
                >
                  🎤 Listening... Speak now
                </motion.div>
              )}
              
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-yellow-600 font-medium"
                >
                  🤖 Processing your request...
                </motion.div>
              )}
              
              {!isListening && !isProcessing && (
                <div className="text-gray-600">
                  Tap the microphone to start voice commands
                </div>
              )}
            </div>

            {/* Live Transcript */}
            {transcript && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
              >
                <div className="text-sm text-blue-700 mb-1">You're saying:</div>
                <div className="font-medium text-blue-900">{transcript}</div>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Commands */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Voice Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {quickCommands.map((command, index) => (
              <motion.button
                key={command}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => processVoiceCommand(command)}
                className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border text-left transition-colors"
                disabled={isProcessing}
              >
                <Send className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{command}</span>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversation History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Conversation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {conversation.slice(-10).reverse().map((item, index) => (
                <motion.div
                  key={`${item.timestamp.getTime()}-${index}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-3"
                >
                  {/* User Message */}
                  <div className="flex justify-end">
                    <div className="max-w-[80%] bg-blue-500 text-white p-3 rounded-lg">
                      <div className="font-medium text-sm">{item.command}</div>
                      <div className="text-xs opacity-75 mt-1">
                        {item.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Assistant Response */}
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-gray-100 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Bot className="w-4 h-4 text-indigo-500" />
                        <Badge className={getTypeColor(item.type)}>
                          {getTypeIcon(item.type)}
                          <span className="ml-1 capitalize">{item.type}</span>
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-800">{item.response}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-500">
                          {item.timestamp.toLocaleTimeString()}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if ('speechSynthesis' in window) {
                              const utterance = new SpeechSynthesisUtterance(item.response);
                              window.speechSynthesis.speak(utterance);
                            }
                          }}
                        >
                          <Volume2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            
            {conversation.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation using voice commands</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Browser Compatibility Note */}
      {typeof window !== 'undefined' && !('webkitSpeechRecognition' in window) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-4">
            <div className="flex items-center space-x-2 text-yellow-800">
              <MessageSquare className="w-5 h-5" />
              <p className="text-sm">
                Voice recognition is not supported in your browser. Please use Chrome, Safari, or Edge for the best experience.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
