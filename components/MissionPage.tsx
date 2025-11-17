import React from 'react';

export const MissionPage: React.FC = () => {
  return (
    <div className="p-4 h-full">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Our Mission: The Heart Behind Resilios</h2>
        <div className="space-y-4 text-slate-700 text-lg leading-relaxed">
            <p>
              Resilios was born from lived experience. Our founder, Jack (a pseudonym), has navigated the complexities of Bipolar II for seven years. His journey was marked by long nights of searching for resources that could offer real, practical support — workbooks, research papers, guarded forum threads, and tiny life hacks that collectively became an informal education in what actually helps.
            </p>
            <p>
              Over time, Jack learned to shape the energy of hypomania into something useful: creating practical exercises, gentle scripts, and simple grounding practices that can be used not just in moments of crisis, but as part of a daily maintenance plan for mental wellness.
            </p>
            <h3 className="text-2xl font-bold text-slate-800 pt-4 mb-2">Our Guiding Principles</h3>
            <p>
              The materials and conversations within Resilios are not a substitute for therapy, but they are created with clinical principles in mind. We draw inspiration from evidence-based frameworks like <strong>Cognitive Behavioral Therapy (CBT)</strong> and <strong>Dialectical Behavior Therapy (DBT)</strong>. Our approach is rooted in trauma-informed pacing, always emphasizing safety, consent, and self-compassion.
            </p>
            <p>
              We believe in providing low-barrier, evidence-informed tools and in upholding the dignity of every person who uses them. Our goal is to help you move from a place of reactive crisis management to one of proactive mental wellness.
            </p>
            <blockquote className="border-l-4 border-sky-500 pl-4 italic text-slate-800 my-6">
              "We believe in low-barrier, evidence-informed tools — and in dignity for everyone using them."
            </blockquote>
            <p>
              Join our community and follow our journey on Instagram. We're building a space for resilience, together.
            </p>
            <a 
              href="https://www.instagram.com/theresilientmindco/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block mt-4 px-6 py-3 bg-sky-500 text-white font-semibold rounded-lg shadow-md hover:bg-sky-600 transition-colors no-underline"
            >
              Follow us on Instagram
            </a>
        </div>
      </div>
    </div>
  );
};
