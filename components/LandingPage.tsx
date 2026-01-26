import React from 'react';
import { IMAGES } from '../constants';
import { 
  AvatarSparkIcon, 
  CalendarIcon, 
  DocumentTextIcon, 
  SparklesIcon, 
  CheckIcon,
  WandSparklesIcon,
  MapIcon,
  FireIcon,
  BrainIcon
} from './Icons';
import { AnimatedResilios } from './AnimatedResilios';

interface LandingPageProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; tag?: string; color: string }> = ({ icon, title, description, tag, color }) => (
  <div className={`group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-2xl hover:border-sky-100 transition-all duration-500 hover:-translate-y-2`}>
    <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
      {icon}
    </div>
    {tag && <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-3 block">{tag}</span>}
    <h3 className="text-xl font-black text-slate-900 mb-3 tracking-tight">{title}</h3>
    <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
  </div>
);

const StepItem: React.FC<{ number: string; title: string; description: string }> = ({ number, title, description }) => (
    <div className="flex gap-6 items-start">
        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shrink-0 font-black text-xl shadow-xl shadow-slate-200">
            {number}
        </div>
        <div>
            <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">{title}</h4>
            <p className="text-slate-500 text-sm leading-relaxed font-medium">{description}</p>
        </div>
    </div>
);

const PlanColumn: React.FC<{ 
  title: string; 
  price: string; 
  description: string; 
  features: string[]; 
  isPremium?: boolean; 
  onAction: () => void 
}> = ({ title, price, description, features, isPremium, onAction }) => (
  <div className={`flex flex-col p-8 rounded-[2.5rem] border ${isPremium ? 'bg-slate-900 text-white border-slate-800 shadow-2xl shadow-sky-200/20' : 'bg-white text-slate-900 border-slate-100 shadow-sm'}`}>
    <div className="mb-8">
      <h3 className="text-2xl font-black tracking-tight mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-4xl font-black">{price}</span>
        <span className={isPremium ? 'text-slate-400' : 'text-slate-500'}>{price === 'Free' ? '' : '/mo'}</span>
      </div>
      <p className={`text-sm font-medium leading-relaxed ${isPremium ? 'text-slate-400' : 'text-slate-500'}`}>{description}</p>
    </div>
    
    <ul className="space-y-4 mb-10 flex-1">
      {features.map((f, i) => (
        <li key={i} className="flex items-start gap-3">
          <div className={`mt-1 shrink-0 ${isPremium ? 'text-sky-400' : 'text-emerald-500'}`}>
            <CheckIcon />
          </div>
          <span className="text-sm font-bold">{f}</span>
        </li>
      ))}
    </ul>
    
    <button 
      onClick={onAction}
      className={`w-full py-4 rounded-2xl font-black transition-all active:scale-95 ${isPremium ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-xl shadow-sky-500/20' : 'bg-slate-50 hover:bg-slate-100 text-slate-900'}`}
    >
      {isPremium ? 'Explore Premium Features' : 'Start Free Forever'}
    </button>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onLogin }) => {
  return (
    <div className="min-h-screen w-full bg-white font-sans text-slate-900 flex flex-col selection:bg-sky-100 selection:text-sky-900 overflow-y-auto">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-xl border-b border-slate-100 z-50 pt-safe">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-200">
                <img src={IMAGES.logo} alt="Resilios" className="h-7 w-7 rounded-full brightness-0 invert"/>
             </div>
             <span className="font-black text-2xl tracking-tighter text-slate-900">Resilios</span>
          </div>
          <div className="flex items-center gap-4 md:gap-8">
            <button onClick={onLogin} className="text-sm font-bold text-slate-500 hover:text-sky-600 transition-colors hidden sm:block">Sign In</button>
            <button onClick={onGetStarted} className="px-6 py-3 text-sm font-black text-white bg-slate-900 rounded-full hover:bg-sky-600 transition-all shadow-xl shadow-slate-200 active:scale-95">Get Started</button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-40 pb-32">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] bg-sky-100/50 rounded-full blur-[140px] -z-10"></div>
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="text-left animate-view">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-widest mb-8">
                        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Built by peers for proactive wellness
                    </div>
                    <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]">
                        Stability is a <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-indigo-600">Practice.</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-slate-500 max-w-xl mb-12 leading-relaxed font-medium">
                        Resilios is free for essential wellness tracking, while Premium offers a deeper, more personal experience for those who want it.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={onGetStarted} className="px-10 py-5 text-lg font-black text-white bg-sky-500 rounded-3xl shadow-2xl shadow-sky-200 hover:bg-sky-600 hover:-translate-y-1 active:scale-95 transition-all">
                            Try Premium Features
                        </button>
                        <button onClick={onLogin} className="px-10 py-5 text-lg font-black text-slate-900 bg-slate-50 rounded-3xl hover:bg-slate-100 transition-all">
                            Sign In
                        </button>
                    </div>
                    <p className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Includes a 7-day trial of all features</p>
                </div>
                <div className="relative hidden lg:flex justify-center items-center animate-pop">
                    <div className="absolute inset-0 bg-sky-50 rounded-full blur-3xl opacity-30"></div>
                    <AnimatedResilios emotion="supportive" size={450} />
                </div>
            </div>
        </section>

        {/* PRICING COMPARISON SECTION */}
        <section className="py-32 bg-slate-50/50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">Choose your path to stability.</h2>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Resilios is always here for you. Use our core tools for free, or unlock deep immersion with a premium membership.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              <PlanColumn 
                title="Free Forever"
                price="Free"
                description="The core essentials to build your foundation and stay grounded daily."
                features={[
                  "Personal Wellness Operating Manual",
                  "Daily Mood Check-ins & Notes",
                  "Local Crisis Resource Map",
                  "Secure Encryption for Privacy",
                  "Community Support Chat (Basic)"
                ]}
                onAction={onGetStarted}
              />
              <PlanColumn 
                isPremium
                title="Premium Support"
                price="$4.99"
                description="Advanced AI companionship and deep pattern analysis for long-term growth."
                features={[
                  "Everything in Free, plus:",
                  "Live Voice Interaction with Resilios",
                  "Unlimited Messaging & Support",
                  "Deep Pattern AI Wellness Insights",
                  "Personalized Guided Meditations",
                  "Stability Guide Synthesis"
                ]}
                onAction={onGetStarted}
              />
            </div>
          </div>
        </section>

        {/* THE MISSION SECTION */}
        <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 blur-[120px] rounded-full"></div>
            <div className="max-w-5xl mx-auto px-6 relative z-10">
                <div className="flex flex-col md:flex-row gap-16 items-center">
                    <div className="w-full md:w-1/3 shrink-0">
                        <div className="aspect-square bg-white/5 rounded-[3rem] border border-white/10 flex items-center justify-center p-8">
                            <img src={IMAGES.avatar} alt="Resilios" className="w-full h-full rounded-[2.5rem] object-cover grayscale opacity-80" />
                        </div>
                    </div>
                    <div>
                        <span className="text-sky-400 text-xs font-black uppercase tracking-[0.3em] mb-4 block">Our Story</span>
                        <h2 className="text-4xl font-black mb-8 tracking-tight">Built from Lived Experience.</h2>
                        <div className="space-y-6 text-slate-300 text-lg leading-relaxed font-medium">
                            <p>
                                Resilios was born from "Jack," a peer who spent seven years navigating Bipolar II. He didn't want a cold clinic; he wanted a wise companion who understood the messy, non-linear nature of recovery.
                            </p>
                            <p>
                                We've combined that lived empathy with evidence-based frameworks like <strong>CBT, DBT, and ACT</strong> to create an environment where progress is measured in "Micro-Steps"—the tiny, almost invisible increments that build a stable life.
                            </p>
                            <div className="pt-4">
                                <button onClick={() => window.open('https://instagram.com/theresilientmindco', '_blank')} className="text-sky-400 font-black flex items-center gap-2 group hover:gap-4 transition-all">
                                    Join our community on Instagram <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section className="py-32 bg-white">
            <div className="max-w-7xl mx-auto px-6">
                <div className="text-center mb-24">
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter mb-6">The Resilience Workflow.</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto font-medium text-lg">A simple, three-stage process to move from reactive crisis to proactive navigation.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
                    <StepItem 
                        number="01" 
                        title="Map Your Strategy" 
                        description="Use the Wellness Plan to document your Toolbox, Triggers, and Daily Maintenance. This is your personal Operating Manual." 
                    />
                    <StepItem 
                        number="02" 
                        title="Track the Subtle" 
                        description="Daily Mood Check-ins and Micro-Step challenges help you spot patterns and early warning signs before they escalate." 
                    />
                    <StepItem 
                        number="03" 
                        title="Real-time Support" 
                        description="When things get heavy, connect with the AI Chat or the Live Voice Avatar for immediate grounding and perspective." 
                    />
                </div>
            </div>
        </section>

        {/* FEATURES GRID */}
        <section className="py-32 bg-slate-50/50 relative">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
                    <div>
                        <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-8">Everything you need to stay grounded.</h2>
                        <p className="text-xl text-slate-500 mb-12 leading-relaxed">We provide essential wellness tools for free, with premium features designed for deep immersive support.</p>
                        
                        <div className="space-y-4">
                            <BenefitItem text="Unlimited Wellness Plan History" />
                            <BenefitItem text="Daily Micro-Step Challenge Generation" />
                            <BenefitItem text="Local Crisis Resource Mapping" />
                            <BenefitItem text="AI-Synthesized Stability Guides" />
                            <BenefitItem text="Encrypted, Peer-Led Data Privacy" />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FeatureCard 
                            color="bg-sky-50 text-sky-600"
                            icon={<DocumentTextIcon />} 
                            title="The Manual" 
                            description="Document your triggers and routines in a cohesive stability guide." 
                        />
                        <FeatureCard 
                            color="bg-emerald-50 text-emerald-600"
                            icon={<CalendarIcon />} 
                            title="Analytics" 
                            description="Visualize your mood trends and patterns over days, weeks, and months." 
                        />
                        <FeatureCard 
                            color="bg-indigo-50 text-indigo-600"
                            tag="Premium"
                            icon={<AvatarSparkIcon />} 
                            title="Live Voice" 
                            description="High-fidelity voice sessions for real-time emotional processing." 
                        />
                        <FeatureCard 
                            color="bg-amber-50 text-amber-600"
                            tag="Premium"
                            icon={<WandSparklesIcon />} 
                            title="Meditations" 
                            description="Personalized guided meditations generated for your current state." 
                        />
                    </div>
                </div>
            </div>
        </section>

        {/* TRIAL CTA SECTION */}
        <section className="py-32 bg-white">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <div className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-sky-500/10 blur-[100px]"></div>
                    <div className="relative z-10">
                        <h2 className="text-4xl md:text-6xl font-black mb-8 tracking-tighter">Experience Premium.</h2>
                        <p className="text-sky-100/60 text-xl mb-12 max-w-2xl mx-auto font-medium">
                            Access every premium feature instantly with a 7-day trial. If you choose not to subscribe after, your basic features stay free forever.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6">
                            <button onClick={onGetStarted} className="px-12 py-5 text-xl font-black text-slate-900 bg-white rounded-[2rem] hover:bg-sky-400 hover:text-white transition-all active:scale-95 shadow-xl">
                                Join Now
                            </button>
                        </div>
                        <p className="mt-8 text-white/30 text-xs font-black uppercase tracking-widest">No credit card required to start trial</p>
                    </div>
                </div>
            </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-50 py-24 px-6 border-t border-slate-100 mt-auto">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
              <div className="col-span-1 md:col-span-2 space-y-8">
                  <div className="flex items-center gap-3">
                    <img src={IMAGES.logo} alt="Resilios" className="h-10 w-10 rounded-xl shadow-lg shadow-sky-100"/>
                    <span className="font-black text-3xl tracking-tighter">Resilios</span>
                  </div>
                  <p className="text-slate-500 max-w-sm leading-relaxed font-medium text-base">
                      The Resilient Mind Co. is an AI wellness collective dedicated to low-barrier mental health support built by peers with lived experience.
                  </p>
                  <div className="flex gap-4">
                      <a href="https://instagram.com/theresilientmindco" target="_blank" className="p-3 bg-white rounded-xl border border-slate-200 text-slate-400 hover:text-sky-500 hover:border-sky-200 transition-all">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                      </a>
                  </div>
              </div>

              <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Application</h4>
                  <ul className="space-y-4 text-sm font-bold text-slate-500">
                      <li><button className="hover:text-sky-600 transition-colors">Chat Support</button></li>
                      <li><button className="hover:text-sky-600 transition-colors">Wellness Plan</button></li>
                      <li><button className="hover:text-sky-600 transition-colors">Live Avatar</button></li>
                      <li><button className="hover:text-sky-600 transition-colors">Local Resources</button></li>
                  </ul>
              </div>

              <div>
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6">Company</h4>
                  <ul className="space-y-4 text-sm font-bold text-slate-500">
                      <li><button className="hover:text-sky-600 transition-colors">Our Mission</button></li>
                      <li><button className="hover:text-sky-600 transition-colors">Contact Us</button></li>
                      <li><button className="hover:text-sky-600 transition-colors">Privacy Policy</button></li>
                      <li><button className="hover:text-sky-600 transition-colors">Terms of Service</button></li>
                  </ul>
              </div>
          </div>
          <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">© {new Date().getFullYear()} The Resilient Mind Co.</p>
          </div>
      </footer>
    </div>
  );
};

const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center gap-3 text-slate-700">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckIcon />
        </div>
        <span className="text-base font-bold text-slate-700">{text}</span>
    </div>
);
