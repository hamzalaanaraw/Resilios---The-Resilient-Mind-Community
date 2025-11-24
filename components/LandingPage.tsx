import React from 'react';
import { IMAGES } from '../constants';
import { AvatarSparkIcon, BrainIcon, CalendarIcon, DocumentTextIcon, SparklesIcon, WaveformHistoryIcon } from './Icons';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow hover:border-sky-100">
    <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
               <img src={IMAGES.logo} alt="Resilios Logo" className="h-8 w-8 rounded-full border border-slate-200"/>
               <span className="font-bold text-xl tracking-tight text-slate-800">Resilios</span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onLogin}
                className="text-sm font-semibold text-slate-600 hover:text-sky-600 transition-colors hidden sm:block"
              >
                Sign In
              </button>
              <button 
                onClick={onGetStarted}
                className="px-5 py-2.5 text-sm font-bold text-white bg-sky-600 rounded-full hover:bg-sky-700 transition-all shadow-md hover:shadow-lg"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-bold uppercase tracking-wider mb-6 animate-fadeIn">
                <span className="mr-2">✨</span> AI for Mental Resilience
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight mb-6 leading-tight animate-fadeIn">
                Your Operating Manual for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Mental Wellness</span>.
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-fadeIn">
                Resilios helps you move from reactive crisis management to proactive stability. Build your personalized plan, track your insights, and talk to an AI companion who truly understands.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeIn">
                <button 
                    onClick={onGetStarted}
                    className="px-8 py-4 text-lg font-bold text-white bg-sky-600 rounded-full shadow-xl hover:bg-sky-700 hover:scale-105 transition-all"
                >
                    Start Your Free Trial
                </button>
                <button 
                    onClick={() => {
                        const el = document.getElementById('mission');
                        el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-8 py-4 text-lg font-bold text-slate-700 bg-white border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-all"
                >
                    Our Mission
                </button>
            </div>
        </div>
      </section>

      {/* Visual Demo Section (Abstract representation) */}
      <section className="px-4 pb-24">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-sky-900 to-indigo-900 rounded-3xl p-2 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 rounded-2xl overflow-hidden relative min-h-[400px] md:min-h-[500px] flex items-center justify-center">
                 <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                 <div className="relative z-10 text-center p-8">
                     <img src={IMAGES.avatar} alt="Resilios Avatar" className="w-40 h-40 mx-auto mb-6 drop-shadow-2xl rounded-full border-4 border-white/10 animate-pulse" />
                     <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-lg mx-auto">
                        <p className="text-sky-100 text-lg italic">
                            "I'm here to help you build your toolkit. Not just for when things are hard, but to keep you steady when things are good."
                        </p>
                        <p className="text-white font-bold mt-4 text-sm uppercase tracking-wide">— Resilios AI</p>
                     </div>
                 </div>
            </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Complete Mental Wellness Support</h2>
                <p className="text-lg text-slate-600">Everything you need to understand your patterns and build resilience.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <FeatureCard 
                    icon={<DocumentTextIcon />}
                    title="Wellness Plan"
                    description="Create a personalized 'Operating Manual' for your mind. Map your triggers, warning signs, and crisis protocols."
                />
                <FeatureCard 
                    icon={<BrainIcon />}
                    title="Empathetic AI Chat"
                    description="A judgment-free space to process thoughts 24/7. Trained on CBT/DBT principles and lived experience."
                />
                <FeatureCard 
                    icon={<AvatarSparkIcon />}
                    title="Live Avatar"
                    description="Experience real-time voice conversations with our animated AI avatar for a deeper connection."
                />
                 <FeatureCard 
                    icon={<CalendarIcon />}
                    title="Mood & Insights"
                    description="Track your daily check-ins and receive AI-generated insights about your emotional patterns."
                />
                <FeatureCard 
                    icon={<WaveformHistoryIcon />}
                    title="Voice History"
                    description="Save meaningful voice conversations to reflect on your progress over time."
                />
                <FeatureCard 
                    icon={<SparklesIcon />}
                    title="Journal Prompts"
                    description="Get personalized writing prompts generated specifically from your wellness plan context."
                />
            </div>
        </div>
      </section>

      {/* Founder / Mission Section */}
      <section id="mission" className="py-24 bg-slate-50 border-t border-slate-200">
          <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100">
                  <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider mb-6">
                      Our Story
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Built from Lived Experience.</h2>
                  <div className="space-y-6 text-lg text-slate-600 leading-relaxed">
                      <p>
                        Resilios wasn't built in a boardroom. It was born from the journey of our founder, Jack (a pseudonym), who has navigated Bipolar II for seven years.
                      </p>
                      <p>
                        After long nights searching for resources that offered real, practical support, Jack realized that clinical tools were often cold, and wellness apps were often too superficial. He needed an "Operating Manual" for his own mind.
                      </p>
                      <p>
                        Resilios combines that lived wisdom with evidence-based frameworks. We believe in tools that respect your dignity and help you become the expert on yourself.
                      </p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-100 flex items-center gap-4">
                      <div className="h-12 w-12 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                           <img src={IMAGES.avatar} alt="Founder" className="h-full w-full object-cover grayscale opacity-80" />
                      </div>
                      <div>
                          <p className="font-bold text-slate-900">The Resilient Mind Co.</p>
                          <p className="text-sm text-slate-500">Founded 2024</p>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* Community / CTA */}
      <section className="py-20 bg-sky-900 text-white text-center px-4">
          <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Join the Community</h2>
              <p className="text-sky-100 text-lg mb-10">
                  We are building a movement for proactive mental health. Follow us for daily tips, community stories, and updates.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={onGetStarted}
                    className="px-8 py-4 bg-white text-sky-900 font-bold rounded-full hover:bg-sky-50 transition-colors shadow-lg"
                  >
                      Start Your Journey
                  </button>
                  <a 
                    href="https://www.instagram.com/theresilientmindco/"
                    target="_blank"
                    rel="noreferrer"
                    className="px-8 py-4 bg-transparent border-2 border-sky-400 text-sky-100 font-bold rounded-full hover:bg-sky-800 hover:text-white transition-colors"
                  >
                      Follow on Instagram
                  </a>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 px-4 border-t border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">Resilios</span>
                  <span className="text-xs">by The Resilient Mind Co.</span>
              </div>
              <div className="flex gap-6 text-sm">
                  <button className="hover:text-white transition-colors">Privacy Policy</button>
                  <button className="hover:text-white transition-colors">Terms of Service</button>
                  <button className="hover:text-white transition-colors">Contact</button>
              </div>
              <div className="text-xs">
                  © {new Date().getFullYear()} All Rights Reserved.
              </div>
          </div>
      </footer>
    </div>
  );
};