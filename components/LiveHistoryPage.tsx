
import React from 'react';
import { LiveConversation } from '../types';

interface LiveHistoryPageProps {
  history: LiveConversation[];
}

const LiveHistoryItem: React.FC<{ conversation: LiveConversation }> = ({ conversation }) => {
  return (
    <div className="mb-6 p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
      <p className="text-sm font-semibold text-slate-500 mb-3">
        {new Date(conversation.timestamp).toLocaleString()}
      </p>
      <div className="space-y-2">
        {conversation.transcript.map((part, index) => (
          <div key={index} className={`flex ${part.role === 'user' ? 'items-end flex-col' : 'items-start flex-col'}`}>
            <p className="text-xs font-bold capitalize mb-0.5 text-slate-500">{part.role}</p>
            <div className={`max-w-prose px-3 py-1.5 rounded-lg text-sm ${part.role === 'user' ? 'bg-sky-100 text-sky-900' : 'bg-slate-100 text-slate-800'}`}>
              {part.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const LiveHistoryPage: React.FC<LiveHistoryPageProps> = ({ history }) => {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto pb-20">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Voice Conversation History</h2>
        <p className="text-slate-600 mb-8">Review your past voice sessions to reflect on your journey.</p>
        
        {history.length > 0 ? (
          <div>
            {/* Display in reverse chronological order */}
            {[...history].reverse().map(convo => (
              <LiveHistoryItem key={convo.id} conversation={convo} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="mx-auto h-16 w-16 text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l2-3 2 4 2-5 2 4" />
                </svg>
            </div>
            <p className="text-slate-500 mt-4">You don't have any saved voice conversations yet.</p>
            <p className="text-sm text-slate-400 mt-2">Start a conversation in the "Live Avatar" view to see your history here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
