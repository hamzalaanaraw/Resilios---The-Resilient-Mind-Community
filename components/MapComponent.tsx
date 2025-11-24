
import React, { useState, useEffect } from 'react';
import { GroundingChunk } from '../types';
import { LocationMarkerIcon, SearchIcon } from './Icons';

interface MapComponentProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
    results: GroundingChunk[];
    userLocation: { latitude: number; longitude: number } | null;
    initError: string | null;
}

export const MapComponent: React.FC<MapComponentProps> = ({ onSearch, isLoading, results, userLocation, initError }) => {
    const [query, setQuery] = useState('mental health clinic');
    const [hasAttemptedSearch, setHasAttemptedSearch] = useState(false);

    useEffect(() => {
        // Automatically trigger an initial search on component mount only if no results yet
        if (results.length === 0 && !hasAttemptedSearch) {
             onSearch(query);
             setHasAttemptedSearch(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
            setHasAttemptedSearch(true);
        }
    };
    
    return (
        <div className="p-4 h-full flex flex-col">
            <div className="max-w-2xl mx-auto w-full">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Find Local Support</h2>
                <p className="text-slate-600 mb-6">Enter a search term to find mental wellness resources near you. This feature uses your location to provide accurate results.</p>
                
                <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="e.g., therapists, crisis center..."
                        className="flex-1 p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 transition"
                        disabled={!!initError}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !!initError}
                        className="p-3 bg-sky-500 text-white rounded-lg disabled:bg-slate-300 hover:bg-sky-600 transition flex items-center justify-center"
                    >
                       {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                           <SearchIcon />
                        )}
                    </button>
                </form>

                <div className="w-full">
                     {initError && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-center mb-4 animate-fadeIn">
                             <p className="text-red-700 font-semibold mb-1">Service Unavailable</p>
                             <p className="text-red-600 text-sm">{initError}</p>
                        </div>
                     )}
                     
                     {isLoading && (
                         <div className="text-center py-10">
                             <div className="w-10 h-10 border-4 border-sky-100 border-t-sky-500 rounded-full animate-spin mx-auto mb-3"></div>
                             <p className="text-slate-500">Searching for resources near you...</p>
                         </div>
                     )}
                     
                     {!isLoading && !userLocation && !initError && hasAttemptedSearch && (
                        <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                            <p className="text-amber-800 font-medium mb-1">Location Access Needed</p>
                            <p className="text-amber-700 text-sm">Please allow location access in your browser to find support centers near you.</p>
                        </div>
                     )}

                     {!isLoading && userLocation && results.length === 0 && !initError && hasAttemptedSearch && (
                        <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                             <p className="text-slate-600 font-medium">No results found.</p>
                             <p className="text-slate-500 text-sm mt-1">Try a different search term like "therapist", "counseling", or "support group".</p>
                        </div>
                     )}
                     
                     <div className="space-y-3">
                        {results.map((chunk, index) => (
                           chunk.maps && (
                             <a
                                href={chunk.maps.uri}
                                key={index}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-sky-400 hover:shadow-md transition group animate-fadeIn"
                            >
                                <div className="flex justify-between items-start">
                                    <h4 className="font-semibold text-sky-800 group-hover:text-sky-600 transition-colors">{chunk.maps.title}</h4>
                                    <LocationMarkerIcon className="h-5 w-5 text-slate-300 group-hover:text-sky-500 transition-colors"/>
                                </div>
                                <div className="flex items-center text-xs font-bold text-sky-600 mt-3 uppercase tracking-wide">
                                    Open in Google Maps &rarr;
                                </div>
                            </a>
                           )
                        ))}
                     </div>
                </div>
            </div>
        </div>
    );
};
