
import React, { useState, useEffect } from 'react';
import { GroundingChunk, MapSearch } from '../types';
import { LocationMarkerIcon, SearchIcon, ClockIcon, SparklesIcon } from './Icons';

interface MapComponentProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
    results: GroundingChunk[];
    history: MapSearch[];
    userLocation: { latitude: number; longitude: number } | null;
    initError: string | null;
}

const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
        {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="h-4 bg-slate-100 rounded w-2/3 mb-4"></div>
                <div className="h-3 bg-slate-50 rounded w-1/2"></div>
            </div>
        ))}
    </div>
);

export const MapComponent: React.FC<MapComponentProps> = ({ onSearch, isLoading, results, history, userLocation, initError }) => {
    const [query, setQuery] = useState('Mental Health Support');
    const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);

    useEffect(() => {
        if (results.length === 0 && !hasAttemptedSearch) {
             onSearch(query);
             setHasAttemptedSearch(true);
        }
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
            setHasAttemptedSearch(true);
        }
    };

    const handleHistoryClick = (q: string) => {
        setQuery(q);
        onSearch(q);
        setHasAttemptedSearch(true);
    };
    
    return (
        <div className="flex-1 overflow-y-auto no-scrollbar bg-slate-50/50">
            <div className="max-w-3xl mx-auto w-full p-4 md:p-8 pb-32">
                
                {/* Header Section */}
                <div className="mb-10 text-center md:text-left">
                    <span className="inline-block px-3 py-1 bg-sky-100 text-sky-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">Resource Finder</span>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3 leading-tight">Find Local Support</h2>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-xl">
                        Discover clinics, support groups, and therapists near you. We use secure location grounding to find vetted resources.
                    </p>
                </div>
                
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="relative mb-12 group">
                    <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-sky-500 transition-colors">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for therapists, clinics, yoga..."
                        className="w-full pl-14 pr-32 py-5 bg-white border border-slate-200 rounded-[2rem] shadow-xl shadow-slate-200/50 focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500 transition-all text-base font-bold placeholder-slate-400"
                        disabled={!!initError}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !!initError || !query.trim()}
                        className="absolute right-3 inset-y-3 px-6 bg-sky-500 text-white rounded-2xl font-black shadow-lg shadow-sky-200 hover:bg-sky-600 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                       {isLoading ? (
                            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : "Search"}
                    </button>
                </form>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    
                    {/* Sidebar: History */}
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-100 shadow-sm">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <ClockIcon /> Recent
                            </h3>
                            <div className="flex flex-col gap-2">
                                {history.length > 0 ? (
                                    history.map((h) => (
                                        <button 
                                            key={h.id}
                                            onClick={() => handleHistoryClick(h.query)}
                                            className="text-left px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-white hover:text-sky-600 hover:shadow-sm transition-all truncate border border-transparent hover:border-slate-100"
                                        >
                                            {h.query}
                                        </button>
                                    ))
                                ) : (
                                    <p className="text-[10px] text-slate-400 italic">No history yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Main Content: Results */}
                    <div className="lg:col-span-3">
                         {initError && (
                            <div className="p-8 bg-red-50 border border-red-100 rounded-3xl text-center mb-8 animate-pop">
                                 <p className="text-red-700 font-black mb-2">Service Offline</p>
                                 <p className="text-red-600/80 text-sm font-medium">{initError}</p>
                            </div>
                         )}
                         
                         {isLoading ? (
                             <LoadingSkeleton />
                         ) : (
                             <div className="space-y-4">
                                {!userLocation && !initError && hasAttemptedSearch && (
                                    <div className="text-center p-12 bg-amber-50 rounded-[2rem] border border-amber-100 animate-pop">
                                        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">📍</div>
                                        <h3 className="text-lg font-black text-amber-900 mb-2">Location Required</h3>
                                        <p className="text-amber-700/70 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                                            Enable location access to discover wellness centers in your immediate vicinity.
                                        </p>
                                    </div>
                                )}

                                {userLocation && results.length === 0 && !initError && hasAttemptedSearch && (
                                    <div className="text-center py-20 px-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm animate-pop">
                                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-3xl opacity-50 grayscale">🔍</div>
                                        <h3 className="text-xl font-black text-slate-900 mb-3">No resources found nearby.</h3>
                                        <p className="text-slate-500 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                                            Try a broader search term like "Hospital" or "Doctor" if specific centers aren't appearing.
                                        </p>
                                    </div>
                                )}
                                
                                <div className="grid gap-4">
                                    {results.map((chunk, index) => (
                                    chunk.maps && (
                                        <a
                                            href={chunk.maps.uri}
                                            key={index}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group block p-6 bg-white border border-slate-100 rounded-[1.75rem] hover:border-sky-400 hover:shadow-2xl hover:shadow-sky-100/50 transition-all duration-300 animate-view"
                                        >
                                            <div className="flex justify-between items-start gap-4">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="p-1.5 bg-sky-50 text-sky-500 rounded-lg group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                                            <LocationMarkerIcon />
                                                        </span>
                                                        <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-sky-600 transition-colors">
                                                            {chunk.maps.title}
                                                        </h4>
                                                    </div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                        <SparklesIcon className="w-3 h-3"/> Verified Grounding
                                                    </p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 transition-all rotate-[-45deg] group-hover:rotate-0">
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M5 12h14m-7-7l7 7-7 7" /></svg>
                                                </div>
                                            </div>
                                            
                                            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-50">
                                                <span className="text-xs font-black text-sky-600 group-hover:underline">View on Maps</span>
                                                <span className="text-[10px] text-slate-300 font-bold">Directions available</span>
                                            </div>
                                        </a>
                                    )
                                    ))}
                                </div>
                             </div>
                         )}
                    </div>
                </div>
            </div>
        </div>
    );
};
