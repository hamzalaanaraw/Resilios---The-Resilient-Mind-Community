import React from 'react';

export const PoliciesPage: React.FC = () => {
  return (
    <div className="p-4 h-full">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-4">Trust & Safety</h2>
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 my-6">
            <p className="font-bold text-amber-800">Disclaimer</p>
            <p className="text-amber-700 text-sm">The following policies are provided as a general template. They are not legal advice. You should consult with a legal professional to ensure your policies are compliant with all applicable laws and regulations.</p>
        </div>

        <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Privacy Policy</h3>
            <div className="space-y-3 text-slate-600">
                <p><strong>Last Updated: [Date]</strong></p>
                <p>Your privacy is important to us. It is Resilios' policy to respect your privacy regarding any information we may collect from you across our application.</p>
                <h4 className="text-lg font-semibold text-slate-700 pt-2">1. Information We Collect</h4>
                <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used. The data you provide, including your wellness plan and chat history, is stored securely to personalize your experience. Authentication information is managed securely via Firebase Authentication.</p>
                <h4 className="text-lg font-semibold text-slate-700 pt-2">2. How We Use Your Information</h4>
                <p>We use the information we collect to operate, maintain, and provide you with the features and functionality of the app. Anonymized data may be used to improve our AI models and services.</p>
                <h4 className="text-lg font-semibold text-slate-700 pt-2">3. Security</h4>
                <p>We take security seriously and take reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access, disclosure, alteration, and destruction.</p>
                <h4 className="text-lg font-semibold text-slate-700 pt-2">4. Your Consent</h4>
                <p>By using our app, you hereby consent to our Privacy Policy and agree to its terms.</p>
            </div>
        </section>

        <section>
            <h3 className="text-2xl font-bold text-slate-700 mb-2">Terms of Service</h3>
            <div className="space-y-3 text-slate-600">
                <p><strong>Last Updated: [Date]</strong></p>
                <h4 className="text-lg font-semibold text-slate-700 pt-2">1. Acceptance of Terms</h4>
                <p>By accessing or using the Resilios application, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.</p>
                <h4 className="text-lg font-semibold text-slate-700 pt-2">2. Not Medical Advice</h4>
                <p>Resilios is an AI-powered mental wellness companion. It is not a medical device, nor does it provide medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay in seeking it because of something you have read or heard on Resilios.</p>
                <h4 className="text-lg font-semibold text-slate-700 pt-2">3. User Conduct</h4>
                <p>You agree not to use the service for any purpose that is illegal or prohibited by these terms. You are responsible for all your activity in connection with the service.</p>
                <h4 className="text-lg font-semibold text-slate-700 pt-2">4. Termination</h4>
                <p>We may terminate or suspend your access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            </div>
        </section>
      </div>
    </div>
  );
};
