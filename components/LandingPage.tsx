
import React from 'react';
import { IMAGES } from '../constants';
import { AvatarSparkIcon, BrainIcon, CalendarIcon, DocumentTextIcon, SparklesIcon, WaveformHistoryIcon } from './Icons';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow hover:border-sky-100 active:scale-[0.98]">
    <div className="w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center text-sky-600 mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col pt-safe">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 pt-safe">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
               <img src={IMAGES.logo} alt="Resilios Logo" className="h-8 w-8 rounded-full border border-slate-200"/>
               <span className="font-bold text-xl tracking-tight text-slate-800">Resilios</span>
            </div>
            <div className="flex items-center gap-3 md:gap-4">
              <button onClick={onLogin} className="text-sm font-bold text-slate-600 hover:text-sky-600 transition-colors hidden sm:block">Sign In</button>
              <button onClick={onGetStarted} className="px-5 py-2.5 text-sm font-bold text-white bg-sky-600 rounded-full hover:bg-sky-700 transition-all shadow-md active:scale-95">Get Started</button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-16 md:pt-32 md:pb-20 px-6 sm:px-8">
            <div className="max-w-5xl mx-auto text-center">
                <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-sky-100 text-sky-700 text-[10px] md:text-xs font-black uppercase tracking-widest mb-6 animate-fadeIn">
                    <span className="mr-2">✨</span> Proactive Mental Stability
                </div>
                <h1 className="text-4xl md:text-7xl font-black text-slate-900 tracking-tight mb-6 leading-[1.1] md:leading-tight animate-fadeIn text-balance">
                    Your Operating Manual for <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Mental Wellness</span>.
                </h1>
                <p className="text-lg md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed animate-fadeIn px-4">
                    Resilios helps you move from reactive crisis management to proactive stability. Talk to an AI companion who understands.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fadeIn px-8 md:px-0">
                    <button onClick={onGetStarted} className="px-8 py-4 text-lg font-bold text-white bg-sky-600 rounded-2xl shadow-xl hover:bg-sky-700 active:scale-95 transition-all">Start Free Trial</button>
                    <button onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 text-lg font-bold text-slate-700 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 active:scale-95 transition-all">Our Mission</button>
                </div>
            </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 bg-white">
            <div className="max-w-6xl mx-auto px-6 sm:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Support at Every Step.</h2>
                    <p className="text-slate-600">Everything you need to understand your patterns and build resilience.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <FeatureCard icon={<DocumentTextIcon />} title="Wellness Plan" description="Create a personalized 'Operating Manual' for your mind. Map triggers, warning signs, and protocols." />
                    <FeatureCard icon={<BrainIcon />} title="Empathetic AI Chat" description="A judgment-free space to process thoughts 24/7. Trained on CBT/DBT principles and lived wisdom." />
                    <FeatureCard icon={<AvatarSparkIcon />} title="Live Avatar" description="Experience real-time voice conversations with our animated AI avatar for a deeper connection." />
                    <FeatureCard icon={<CalendarIcon />} title="Mood & Insights" description="Track daily check-ins and receive AI-generated insights about your emotional patterns." />
                    <FeatureCard icon={<WaveformHistoryIcon />} title="Voice History" description="Save meaningful voice conversations to reflect on your progress over time." />
                    <FeatureCard icon={<SparklesIcon />} title="Journal Prompts" description="Get personalized writing prompts generated specifically from your context." />
                </div>
            </div>
        </section>

        {/* Mission Section */}
        <section id="mission" className="py-20 bg-slate-50 border-y border-slate-200">
            <div className="max-w-4xl mx-auto px-6 md:px-8">
                <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-100 text-center md:text-left">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-6 tracking-tight">Built from Lived Wisdom.</h2>
                    <p className="text-lg text-slate-600 leading-relaxed mb-8">
                        Resilios was born from the journey of our founder who has navigated Bipolar II for seven years. We combine lived experience with evidence-based frameworks to help you become the expert on yourself.
                    </p>
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <img src={IMAGES.avatar} alt="Founder" className="h-16 w-16 rounded-full grayscale border-2 border-slate-100" />
                        <div>
                            <p className="font-black text-slate-900">The Resilient Mind Co.</p>
                            <p className="text-xs font-bold text-sky-600 uppercase tracking-widest">Founded 2024</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12 px-6 pb-safe">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                  <span className="font-black text-slate-100 text-xl tracking-tight">Resilios</span>
                  <p className="text-[10px] mt-1 font-bold uppercase tracking-widest text-slate-500">The Resilient Mind Co.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-widest">
                  <button className="hover:text-white transition-colors">Privacy</button>
                  <button className="hover:text-white transition-colors">Terms</button>
                  <button className="hover:text-white transition-colors">Contact</button>
              </div>
              <div className="text-[10px] opacity-50 font-medium">© {new Date().getFullYear()} All Rights Reserved.</div>
          </div>
      </footer>
    </div>
  );
};
