import React, { useRef, useEffect } from 'react';
import { Chart } from 'chart.js/auto';
import { CheckInData } from '../types';

interface TimeChartProps {
  history: CheckInData[];
  onGenerateInsights: () => void;
  insights: string;
  isGenerating: boolean;
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

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderLine = (line: string, index: number) => {
        // Bold text: **text**
        const bolded = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Headings: ### Heading
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-xl font-bold text-slate-700 mt-4 mb-2" dangerouslySetInnerHTML={{ __html: bolded.substring(4) }} />;
        }
        // Unordered list: * item
        if (line.startsWith('* ')) {
            return <li key={index} dangerouslySetInnerHTML={{ __html: bolded.substring(2) }} />;
        }
        // Default to paragraph
        return <p key={index} dangerouslySetInnerHTML={{ __html: bolded }} />;
    };

    const lines = content.split('\n');
    // FIX: Changed JSX.Element to React.ReactNode to resolve namespace error.
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
        elements.push(
            <ul key={`ul-end`} className="list-disc pl-5 space-y-1 my-4">
                {listItems.map((item, i) => renderLine(item, i))}
            </ul>
        );
    }

    return <>{elements}</>;
};

export const TimeChart: React.FC<TimeChartProps> = ({ history, onGenerateInsights, insights, isGenerating }) => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current && history.length > 0) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        chartInstance.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: history.map(h => h.date.toLocaleDateString()),
            datasets: [{
              label: 'Mood Score',
              data: history.map(h => h.mood),
              borderColor: 'rgba(56, 189, 248, 0.6)',
              backgroundColor: history.map(h => moodColors[h.mood as keyof typeof moodColors] || 'rgba(100, 116, 139, 1)'),
              tension: 0.2,
              pointRadius: 5,
              pointHoverRadius: 8,
              fill: false,
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                max: 10,
                title: { display: true, text: 'Mood (1-10)' }
              },
              x: {
                title: { display: true, text: 'Date' }
              }
            },
            plugins: {
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const index = context.dataIndex;
                    const notes = history[index]?.notes;
                    let label = `Mood: ${context.parsed.y}`;
                    if (notes) {
                        label += ` - Notes: ${notes}`;
                    }
                    return label;
                  }
                }
              }
            }
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

  return (
    <div className="p-4 h-full">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Your Wellness Timeline</h2>
        <p className="text-slate-600 mb-8">Visualize your mood over time to see patterns and celebrate your progress.</p>
        
        <div className="h-80 w-full mb-8 p-4 border border-slate-200 rounded-lg bg-white shadow-sm">
          {history.length > 0 ? (
            <canvas ref={chartRef}></canvas>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">
              <p>Your mood chart will appear here once you start doing daily check-ins.</p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-2xl font-bold text-slate-800 mb-4">AI-Powered Insights</h3>
           <button
                onClick={onGenerateInsights}
                disabled={isGenerating || history.length < 3}
                className="inline-flex items-center justify-center px-4 py-2 mb-4 text-sm font-medium transition-colors duration-150 bg-sky-500 text-white rounded-lg hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-slate-400 disabled:cursor-not-allowed"
            >
                {isGenerating ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                    </>
                ) : (
                    "✨ Generate AI Insights"
                )}
            </button>
            {history.length < 3 && <p className="text-xs text-slate-500 italic">You need at least 3 check-ins to generate insights.</p>}
            
            <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 min-h-[10rem]">
                {isGenerating ? (
                     <div className="flex items-center justify-center h-full text-slate-500">
                        <p>Looking for patterns in your data...</p>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none text-slate-700">
                        {insights ? <MarkdownRenderer content={insights} /> : <p className="text-slate-500">Your personal insights will appear here when you generate them.</p>}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
