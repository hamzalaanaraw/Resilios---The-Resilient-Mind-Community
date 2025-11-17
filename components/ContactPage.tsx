import React from 'react';

export const ContactPage: React.FC = () => {
    const email = 'TheCommunity@Resilientmindco.com';
    return (
        <div className="p-4 h-full flex items-center justify-center">
            <div className="max-w-lg mx-auto text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">Get In Touch</h2>
                <p className="text-slate-600 mb-8 text-lg">
                    We'd love to hear from you. Whether you have a question, feedback, or a story to share, our inbox is always open.
                </p>
                <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
                    <p className="text-slate-700 mb-4">
                        Please reach out to us at:
                    </p>
                    <a 
                        href={`mailto:${email}`}
                        className="text-2xl font-semibold text-sky-600 break-all hover:underline"
                    >
                        {email}
                    </a>
                </div>
                 <p className="text-xs text-slate-400 mt-8">
                    We do our best to respond to all inquiries, but please remember this is not a crisis support line. If you are in crisis, please contact a local emergency number.
                </p>
            </div>
        </div>
    );
};
