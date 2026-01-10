import { useEffect, useState } from 'react';
import { Users, CheckSquare, BookOpen, MessageSquare, Calendar } from 'lucide-react';
import Lottie from 'lottie-react';
import ProtectedRoute from './ProtectedRoute';
import AttendanceIcon from './AttendanceIcon';

export default function Home({ onSectionChange, isLoggedIn, onLoginRequired }) {
  const [animationData, setAnimationData] = useState(null);
  const [animationError, setAnimationError] = useState(null);
  const [chatbotAnimationData, setChatbotAnimationData] = useState(null);
  const [chatbotError, setChatbotError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const baseUrl = import.meta.env?.BASE_URL || '/';
    const animationUrl = `${baseUrl.replace(/\/$/, '/') }animations/learn.json`;

    fetch(animationUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => isMounted && setAnimationData(json))
      .catch((err) => isMounted && setAnimationError(err?.message));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const baseUrl = import.meta.env?.BASE_URL || '/';
    const chatbotUrl = `${baseUrl.replace(/\/$/, '/') }animations/chatbot.json`;

    fetch(chatbotUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => isMounted && setChatbotAnimationData(json))
      .catch((err) => isMounted && setChatbotError(err?.message));

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
    onSectionChange(feature.action);
  };

  return (
    <div className="min-h-screen custom-beige relative">

     {/* ===== FLOATING ATTENDIFY BUTTON ===== */}
<div className="fixed top-[140px] right-2 sm:top-32 sm:right-6 md:top-28 md:right-16 z-40">
  <button
    onClick={() => handleCardClick({ action: 'Attendify', protected: true })}
    aria-label="Open Attendify"
    className="group bg-transparent p-0 border-none outline-none cursor-pointer transition-transform hover:scale-105"
  >
    {/* Mobile */}
    <div className="block sm:hidden">
      <AttendanceIcon size={50} />
    </div>

    {/* Tablet */}
    <div className="hidden sm:block md:hidden">
      <AttendanceIcon size={68} />
    </div>

    {/* Desktop */}
    <div className="hidden md:block">
      <AttendanceIcon size={88} />
    </div>
  </button>
</div>


      {/* ===== HERO SECTION ===== */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="w-full h-80 md:h-96 lg:h-[32rem] rounded-xl bg-white/40 flex items-center justify-center overflow-hidden">
            {animationData ? (
              <Lottie animationData={animationData} loop autoplay className="w-full h-full" />
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                Animation placeholder
                {animationError && <div className="text-red-500 text-sm mt-2">{animationError}</div>}
              </div>
            )}
          </div>

          <div>
            <div className="text-6xl md:text-7xl lg:text-8xl font-bold custom-brown uppercase mb-8">
              <div>EXPLORE NEW</div>
              <div>WAYS TO</div>
              <div>LEARN</div>
            </div>
            <p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-yellow-500">
              Doubts to Degrees
            </p>
          </div>
        </div>
      </section>

      {/* ===== FEATURE CARDS ===== */}
      <section className="py-16 px-4">
        <div className="max-w-[96rem] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                onClick={() => handleCardClick(feature)}
                className={`${feature.color} p-12 rounded-2xl shadow-lg cursor-pointer border border-gray-200 transition-transform hover:-translate-y-2`}
              >
                <div className="text-center">
                  <div className={`w-20 h-20 mx-auto mb-8 flex items-center justify-center ${feature.iconColor} bg-white rounded-xl shadow-md`}>
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-bold custom-brown mb-4">{feature.title}</h3>
                  <p className="text-lg custom-brown opacity-80">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ===== FLOATING CHATBOT ===== */}
      <div className="fixed right-4 bottom-4 md:right-8 md:bottom-8 z-40">
        <button
          onClick={() => handleCardClick({ action: 'Chatbot', protected: true })}
          className="w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 bg-transparent border-none"
        >
          {chatbotAnimationData ? (
            <Lottie animationData={chatbotAnimationData} loop autoplay />
          ) : (
            <span className="text-sm text-gray-500">Chatbot</span>
          )}
        </button>
      </div>
    </div>
  );
}
