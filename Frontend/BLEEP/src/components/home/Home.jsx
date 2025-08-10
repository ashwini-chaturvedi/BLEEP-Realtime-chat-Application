import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, Zap, Shield, Globe, Smartphone, ChevronRight, Star, Play } from 'lucide-react';
import { BleepLoader } from '../AllComponents';

const Loader = () => (
  <div className="flex items-center justify-center space-x-1">
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
  </div>
);

const TypingText = ({ texts, speed = 100 }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    if (textIndex < texts.length) {
      const currentText = texts[textIndex];
      if (currentIndex < currentText.length) {
        const timeout = setTimeout(() => {
          setDisplayText(prev => prev + currentText[currentIndex]);
          setCurrentIndex(prev => prev + 1);
        }, speed);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setDisplayText('');
          setCurrentIndex(0);
          setTextIndex(prev => (prev + 1) % texts.length);
        }, 2000);
        return () => clearTimeout(timeout);
      }
    }
  }, [currentIndex, textIndex, texts, speed]);

  return <span className="text-blue-400">{displayText}</span>;
};

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => (
  <div 
    className="bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/10"
    style={{animation: `fadeInUp 0.8s ease-out ${delay}s both`}}
  >
    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const ChatBubble = ({ message, isUser, delay = 0 }) => (
  <div 
    className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-3`}
    style={{animation: `slideIn 0.6s ease-out ${delay}s both`}}
  >
    <div className={`max-w-xs px-4 py-2 rounded-2xl ${
      isUser 
        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
        : 'bg-gray-800 text-gray-300'
    }`}>
      {message}
    </div>
  </div>
);

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const typingTexts = ["Connect instantly", "Chat securely", "Share moments", "Stay connected"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-300 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className='mb-20'>
                <BleepLoader/>
            </div>           
            
            <div className="h-20 mb-2">
              <h2 className="text-2xl md:text-4xl font-light text-gray-300">
                <TypingText texts={typingTexts} speed={90}  />
                <span className="animate-pulse">|</span>
              </h2>
            </div>
            
            <p className="text-xl text-gray-100 mb-12 max-w-2xl mx-auto leading-relaxed">
              Experience lightning-fast messaging with end-to-end encryption, 
              real-time notifications, and seamless group conversations.
            </p>
          </div>
        </div>
      </section>

      {/* Live Chat Preview */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
              <div className="flex items-center text-sm text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-bounce"></div>
                Live Chat Preview
              </div>
            </div>
            
            <div className="space-y-4">
              <ChatBubble message="Hey! How's the new chat app?" isUser={false} delay={0.2} />
              <ChatBubble message="It's amazing! The real-time features are so smooth 🚀" isUser={true} delay={0.4} />
              <ChatBubble message="I love the end-to-end encryption too!" isUser={false} delay={0.6} />
              <div className="flex justify-start">
                <div className="bg-gray-800 px-4 py-2 rounded-2xl flex items-center space-x-2" style={{animation: 'slideIn 0.6s ease-out 0.8s both'}}>
                  <span className="text-gray-400 text-sm">Ashwini is typing</span>
                  <Loader />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative z-10 px-6 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl p-5 md:text-5xl font-bold mb-6 bg-gradient-to-r from-black to-black bg-clip-text text-transparent">
              Why Choose <span className='font-serif text-yellow-400'>BLEEP </span>?
            </h3>
            <p className="text-xl text-gray-100 max-w-2xl mx-auto">
              Built for modern communication with cutting-edge technology and user-first design.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Zap} 
              title="Lightning Fast" 
              description="Messages delivered instantly with real-time synchronization across all your devices."
              delay={0.1}
            />
            <FeatureCard 
              icon={Shield} 
              title="End-to-End Security" 
              description="Your conversations are protected with military-grade encryption that only you can access."
              delay={0.2}
            />
            <FeatureCard 
              icon={Users} 
              title="Group Conversations" 
              description="Create unlimited group chats with file sharing, voice messages, and admin controls."
              delay={0.3}
            />
            <FeatureCard 
              icon={Globe} 
              title="Global Reach" 
              description="Connect with anyone, anywhere in the world with automatic message translation."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};

export default Home;