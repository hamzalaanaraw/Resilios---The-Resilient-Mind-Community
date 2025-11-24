
import React, { useRef, useEffect, useState } from 'react';
import { Chart } from 'chart.js/auto';
import { CheckInData, WellnessPlanData } from '../types';
import { FireIcon, SparklesIcon, CalendarIcon } from './Icons';

interface WellnessCalendarProps {
  history: CheckInData[];
  onGenerateInsights: () => void;
  insights: string;
  isGenerating: boolean;
  initError: string | null;
  wellnessPlan: WellnessPlanData;
}

const moodColors = {
  1: 'rgba(239, 68, 68, 1)',  // red-500
  2: 'rgba(239, 68, 68, 1)',
  3: 'rgba(245, 158, 11, 1)', // amber-500
  4: 'rgba(245, 158, 11, 1)',
  5: 'rgba(234, 179, 8, 1)',  // yellow-500
  6: 'rgba(234, 179, 8, 1)',
  7: 'rgba(34, 197, 94, 1)',  // green-500
  8: 'rgba(34, 197, 94, 1)',
  9: 'rgba(14, 165, 233, 1)', // sky-500
  10: 'rgba(14, 165, 233, 1)',
};

// --- Stats Component ---
const StatsCard: React.FC<{ label: string; value: string | number; icon?: React.ReactNode; color?: string }> = ({ label, value, icon, color = 'bg-white' }) => (
    <div className={`p-4 rounded-xl border border-slate-100 shadow-sm flex items-center space-x-3 ${color}`}>
        {icon && <div className="p-2 bg-white/50 rounded-lg backdrop-blur-sm">{icon}</div>}
        <div>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-0.5">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    </div>
);

// --- Markdown Renderer (Reused) ---
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderLine = (line: string, index: number) => {
        const bolded = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-bold text-slate-700 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: bolded.substring(4) }} />;
        }
        if (line.startsWith('* ')) {
            return <li key={index} dangerouslySetInnerHTML={{ __html: bolded.substring(2) }} />;
        }
        return <p key={index} dangerouslySetInnerHTML={{ __html: bolded }} />;
    };

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    lines.forEach((line, index) => {
        if (line.startsWith('* ')) {
            listItems.push(line);
        } else {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`ul-${index}`} className="list-disc pl-5 space-y-1 my-4">
                        {listItems.map((item, i) => renderLine(item, i))}
                    </ul>
                );
                listItems = [];
            }
            if (line.trim() !== '') {
                elements.push(renderLine(line, index));
            }
        }
    });
    if (listItems.length > 0) {
        elements.push(<ul key={`ul-end`} className="list-disc pl-5 space-y-1 my-4">{listItems.map((item, i) => renderLine(item, i))}</ul>);
    }
    return <>{elements}</>;
};

export const WellnessCalendar: React.FC<WellnessCalendarProps> = ({ history, onGenerateInsights, insights, isGenerating, initError, wellnessPlan }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarViewDate, setCalendarViewDate] = useState<Date>(new Date());

  // --- Chart Logic ---
  useEffect(() => {
    if (chartRef.current && history.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Sort history by date for the chart
        const sortedHistory = [...history].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: sortedHistory.map(h => new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })),
            datasets: [{
              label: 'Mood Score',
              data: sortedHistory.map(h => h.mood),
              borderColor: 'rgba(56, 189, 248, 0.6)',
              backgroundColor: sortedHistory.map(h => moodColors[h.mood as keyof typeof moodColors] || 'rgba(100, 116, 139, 1)'),
              tension: 0.3,
              pointRadius: 4,
              fill: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: { beginAtZero: true, max: 10, ticks: { stepSize: 1 } },
              x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
          }
        });
      }
    }
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [history]);

  // --- Stats Calculation ---
  const calculateStats = () => {
      if (history.length === 0) return { streak: 0, avgMood: 0, count: 0 };
      
      const sortedDates = [...history].map(h => new Date(h.date).toDateString());
      const uniqueDates = [...new Set(sortedDates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      
      let streak = 0;
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      
      if (uniqueDates.includes(today)) streak = 1;
      else if (uniqueDates.includes(yesterday)) streak = 1; // Allow streak to persist if missed only today so far
      
      if (streak > 0) {
          let checkDate = new Date(uniqueDates[0]);
          for (let i = 1; i < uniqueDates.length; i++) {
              const prevDate = new Date(uniqueDates[i]);
              const diffTime = Math.abs(checkDate.getTime() - prevDate.getTime());
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
              if (diffDays <= 1) { // Consecutive
                  streak++;
                  checkDate = prevDate;
              } else {
                  break;
              }
          }
      }

      const totalMood = history.reduce((acc, curr) => acc + curr.mood, 0);
      const avgMood = (totalMood / history.length).toFixed(1);

      return { streak, avgMood, count: history.length };
  };
  
  const stats = calculateStats();

  // --- Calendar Helpers ---
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getCheckInForDate = (day: number) => {
      const targetDate = new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), day);
      return history.find(h => new Date(h.date).toDateString() === targetDate.toDateString());
  };

  const renderCalendar = () => {
      const daysInMonth = getDaysInMonth(calendarViewDate);
      const firstDay = getFirstDayOfMonth(calendarViewDate);
      const days = [];

      // Empty slots
      for (let i = 0; i < firstDay; i++) {
          days.push(<div key={`empty-${i}`} className="h-10"></div>);
      }

      // Days
      for (let i = 1; i <= daysInMonth; i++) {
          const checkIn = getCheckInForDate(i);
          const isSelected = selectedDate.getDate() === i && selectedDate.getMonth() === calendarViewDate.getMonth() && selectedDate.getFullYear() === calendarViewDate.getFullYear();
          
          days.push(
              <button
                  key={i}
                  onClick={() => setSelectedDate(new Date(calendarViewDate.getFullYear(), calendarViewDate.getMonth(), i))}
                  className={`h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all
                    ${isSelected ? 'ring-2 ring-sky-500 ring-offset-2' : ''}
                    ${checkIn 
                        ? 'text-white font-bold' 
                        : 'text-slate-600 hover:bg-slate-100'}
                  `}
                  style={{ backgroundColor: checkIn ? moodColors[checkIn.mood as keyof typeof moodColors] : undefined }}
              >
                  {i}
              </button>
          );
      }
      return days;
  };

  // Check-in for the *Selected* date
  const selectedCheckIn = history.find(h => new Date(h.date).toDateString() === selectedDate.toDateString());

  return (
    <div className="h-full bg-slate-50/50 p-4 overflow-y-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header & Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatsCard 
                label="Current Streak" 
                value={`${stats.streak} Days`} 
                icon={<FireIcon />} 
                color="bg-orange-50 text-orange-800 border-orange-100"
            />
            <StatsCard 
                label="Average Mood" 
                value={`${stats.avgMood}/10`} 
                color="bg-sky-50 text-sky-800 border-sky-100"
            />
            <StatsCard 
                label="Total Check-ins" 
                value={stats.count} 
                color="bg-emerald-50 text-emerald-800 border-emerald-100"
            />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Calendar & Daily Detail */}
            <div className="lg:col-span-1 space-y-6">
                
                {/* Calendar Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800 text-lg">
                            {calendarViewDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </h3>
                        <div className="flex space-x-2">
                             <button onClick={() => setCalendarViewDate(new Date(calendarViewDate.setMonth(calendarViewDate.getMonth() - 1)))} className="p-1 hover:bg-slate-100 rounded">←</button>
                             <button onClick={() => setCalendarViewDate(new Date(calendarViewDate.setMonth(calendarViewDate.getMonth() + 1)))} className="p-1 hover:bg-slate-100 rounded">→</button>
                        </div>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                        {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-xs font-bold text-slate-400">{d}</span>)}
                    </div>
                    <div className="grid grid-cols-7 gap-y-2">
                        {renderCalendar()}
                    </div>
                    <div className="mt-4 flex items-center justify-center text-xs text-slate-400 gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500"></div> Low
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Okay
                        <div className="w-3 h-3 rounded-full bg-sky-500"></div> Good
                    </div>
                </div>

                {/* Daily Detail Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 min-h-[200px]">
                    <h3 className="font-bold text-slate-800 mb-1 flex items-center">
                        <CalendarIcon />
                        <span className="ml-2">{selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </h3>
                    
                    {selectedCheckIn ? (
                        <div className="mt-4 animate-fadeIn">
                            <div className="flex items-center mb-3">
                                <span className="text-3xl mr-3">{selectedCheckIn.mood >= 8 ? '😄' : selectedCheckIn.mood >= 5 ? '😐' : '😔'}</span>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Mood Score: {selectedCheckIn.mood}/10</p>
                                    <p className="text-xs text-slate-400">{new Date(selectedCheckIn.date).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit'})}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Notes</p>
                                <p className="text-sm text-slate-700 whitespace-pre-wrap">{selectedCheckIn.notes || "No notes for this entry."}</p>
                            </div>
                        </div>
                    ) : (
                        <div className="h-32 flex flex-col items-center justify-center text-slate-400">
                            <p className="text-sm">No check-in for this day.</p>
                            {selectedDate.toDateString() === new Date().toDateString() && (
                                <p className="text-xs mt-1 text-sky-500">Click "Daily Check-in" in the menu!</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Column: Chart & AI Insights */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h3 className="font-bold text-slate-800 mb-4">Mood Trends</h3>
                    <div className="h-64">
                         {history.length > 0 ? (
                            <canvas ref={chartRef}></canvas>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 bg-slate-50 rounded-lg">
                                Not enough data yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* AI Insights */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-indigo-500"></div>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-slate-800 flex items-center">
                            <SparklesIcon /> 
                            <span className="ml-2">AI Wellness Insights</span>
                        </h3>
                        <button
                            onClick={onGenerateInsights}
                            disabled={isGenerating || history.length < 3 || !!initError}
                            className="text-xs font-bold px-3 py-1.5 bg-sky-100 text-sky-700 rounded-lg hover:bg-sky-200 transition disabled:opacity-50"
                        >
                            {isGenerating ? "Analyzing..." : "Refresh Insights"}
                        </button>
                    </div>

                    {history.length < 3 ? (
                        <p className="text-sm text-slate-500 italic">Complete at least 3 daily check-ins to unlock personalized AI insights about your patterns.</p>
                    ) : (
                        <div className="prose prose-sm max-w-none text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-100">
                             {isGenerating ? (
                                <div className="space-y-2 animate-pulse">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                                </div>
                             ) : insights ? (
                                <MarkdownRenderer content={insights} />
                             ) : (
                                <p className="text-center text-slate-500 py-4">Click "Refresh Insights" to analyze your mood patterns and wellness plan.</p>
                             )}
                        </div>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
