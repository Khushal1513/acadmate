import { useEffect, useState } from 'react';
import { Users, CheckSquare, BookOpen, MessageSquare, Calendar } from 'lucide-react';
import Lottie from 'lottie-react';
import ProtectedRoute from './ProtectedRoute';

export default function Home({ onSectionChange, isLoggedIn, onLoginRequired }) {
  const [animationData, setAnimationData] = useState(null);
  const [animationError, setAnimationError] = useState(null);
  const [chatbotAnimationData, setChatbotAnimationData] = useState(null);
  const [chatbotError, setChatbotError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const baseUrl = (import.meta).env?.BASE_URL || '/';
    const animationUrl = `${baseUrl.replace(/\/$/, '/') }animations/learn.json`;
    fetch(animationUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (isMounted) setAnimationData(json);
      })
      .catch((err) => {
        if (isMounted) setAnimationError(err?.message || 'Failed to load animation');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Load chatbot animation JSON (bottom-left floating)
  useEffect(() => {
    let isMounted = true;
    const baseUrl = (import.meta).env?.BASE_URL || '/';
    const chatbotUrl = `${baseUrl.replace(/\/$/, '/') }animations/chatbot.json`;
    fetch(chatbotUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (isMounted) setChatbotAnimationData(json);
      })
      .catch((err) => {
        if (isMounted) setChatbotError(err?.message || 'Failed to load chatbot animation');
      });
    return () => {
        isMounted = false;
    };
  }, []);
  const features = [
    {
      title: 'Seniors',
      action: 'Seniors',
      description: 'Connect with experienced seniors for guidance and mentorship',
      icon: Users,
      color: 'bg-blue-50 hover:bg-blue-100',
      iconColor: 'text-blue-600',
      protected: true
    },
    {
      title: 'Task Manager',
      action: 'TaskManager',
      description: 'Organize your academic tasks and deadlines efficiently',
      icon: CheckSquare,
      color: 'bg-green-50 hover:bg-green-100',
      iconColor: 'text-green-600',
      protected: true
    },
    {
      title: 'Event Buddy',
      action: 'EventBuddy',
      description: 'Discover and join exciting academic events and activities',
      icon: Calendar,
      color: 'bg-yellow-50 hover:bg-yellow-100',
      iconColor: 'text-yellow-600',
      protected: true
    },
    {
      title: 'Study Materials',
      action: 'Study Materials',
      description: 'Access comprehensive study resources and materials',
      icon: BookOpen,
      color: 'bg-purple-50 hover:bg-purple-100',
      iconColor: 'text-purple-600',
      protected: true
    },
    {
      title: 'Chatbot',
      action: 'Chatbot',
      description: 'Get instant help and answers to your academic questions',
      icon: MessageSquare,
      color: 'bg-orange-50 hover:bg-orange-100',
      iconColor: 'text-orange-600',
      protected: true
    }
  ];

  const handleCardClick = (feature) => {
    // Navigate to the section - authentication will be handled by ProtectedRoute
    onSectionChange(feature.action);
  };

  return (
    <div className="min-h-screen custom-beige relative">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Left: Animation space */}
          <div className="w-full h-80 md:h-96 lg:h-[32rem] rounded-xl bg-white/40 flex items-center justify-center overflow-hidden">
            {animationData ? (
              <Lottie animationData={animationData} loop autoplay className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl px-4 text-center">
                <span className="text-gray-600 mb-1">Animation placeholder</span>
                <span className="text-gray-500 text-sm">Expected at public/animations/learn.json</span>
                {animationError && (
                  <span className="text-red-500 text-xs mt-2">{animationError}</span>
                )}
              </div>
            )}
          </div>

          {/* Right: Heading and description */}
          <div className="text-left">
            <div className="text-6xl md:text-7xl lg:text-8xl font-bold custom-brown mb-8 uppercase tracking-tight heading-glow">
              <div style={{ lineHeight: '1.2' }}>EXPLORE NEW</div>
              <div style={{ lineHeight: '1.2' }}>WAYS TO</div>
              <div style={{ lineHeight: '1.2' }}>LEARN</div>
            </div>
            <p className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-12 max-w-2xl text-yellow-500 fade-soft drop-shadow">
              Doubts to Degrees
            </p>
          </div>
        </div>
      </section>

      {/* Features Cards */}
      <section className="py-16 px-4">
        <div className="max-w-[96rem] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 xl:gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={index}
                  onClick={() => handleCardClick(feature)}
                  className={`${feature.color} p-12 md:p-14 rounded-2xl shadow-lg card-hover cursor-pointer border border-gray-200 group h-96 md:h-[26rem] lg:h-[28rem] transition-transform will-change-transform ${index % 2 === 0 ? 'md:-translate-y-6' : 'md:translate-y-6'}`}
                >
                  <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-20 h-20 ${feature.iconColor} bg-white rounded-xl shadow-md mb-8 group-hover:scale-110 transition-transform`}>
                      <IconComponent className="h-10 w-10" />
                    </div>
                  <h3 className="text-3xl md:text-4xl font-bold custom-brown mb-4 break-keep whitespace-normal leading-snug text-center">
                      {feature.title}
                    </h3>
                  <p className="custom-brown opacity-80 leading-relaxed text-lg md:text-xl break-words whitespace-normal mx-auto max-w-[18rem] text-center">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Info Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold custom-brown mb-6">
            Your Academic Success Partner
          </h2>
          <p className="text-lg custom-brown opacity-80 max-w-2xl mx-auto leading-relaxed">
            AcadMate brings together all the tools you need for academic excellence. 
            Connect, learn, organize, and succeed with our comprehensive platform designed for students.
          </p>
        </div>
      </section>

      {/* Floating Chatbot Animation - bottom-right (clickable, no circle) */}
      <div className="fixed right-4 bottom-4 md:right-8 md:bottom-8 z-40">
        <button
          onClick={() => handleCardClick({ action: 'Chatbot', protected: true })}
          aria-label="Open Chatbot"
          className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 p-0 m-0 cursor-pointer bg-transparent border-none outline-none flex items-center justify-center"
          style={{ background: 'transparent' }}
        >
          {chatbotAnimationData ? (
            <Lottie animationData={chatbotAnimationData} loop autoplay className="w-full h-full" />
          ) : (
            <div className="text-xs text-gray-500 px-2 text-center">
              Chatbot
              {chatbotError && <div className="text-red-500 mt-1">{chatbotError}</div>}
            </div>
          )}
        </button>
      </div>
    </div>
  );
}
