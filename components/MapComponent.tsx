
import React, { useState, useEffect } from 'react';
import { GroundingChunk } from '../types';
import { LocationMarkerIcon, SearchIcon } from './Icons';

interface MapComponentProps {
    onSearch: (query: string) => void;
    isLoading: boolean;
    results: GroundingChunk[];
    userLocation: { latitude: number; longitude: number } | null;
}

export const MapComponent: React.FC<MapComponentProps> = ({ onSearch, isLoading, results, userLocation }) => {
    const [query, setQuery] = useState('mental health clinic');

    useEffect(() => {
        // Automatically trigger an initial search on component mount.
        // This will also trigger the browser's location permission prompt.
        onSearch(query);
    }, []);


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
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
                    />
                    <button
                        type="submit"
                        disabled={isLoading}
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
                     {isLoading && <p className="text-slate-500 text-center">Searching for resources near you...</p>}
                     
                     {!isLoading && !userLocation && (
                        <p className="text-slate-500 text-center p-4 bg-amber-50 border border-amber-200 rounded-lg">Please allow location access in your browser to find local support centers.</p>
                     )}

                     {!isLoading && userLocation && results.length === 0 && (
                        <p className="text-slate-500 text-center">No results found for your search. Try a different term like "therapist" or "counseling".</p>
                     )}
                     
                     <div className="space-y-3">
                        {results.map((chunk, index) => (
                           chunk.maps && (
                             <a
                                href={chunk.maps.uri}
                                key={index}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block p-4 bg-white border border-slate-200 rounded-lg hover:border-sky-400 hover:shadow-md transition"
                            >
                                <h4 className="font-semibold text-sky-800">{chunk.maps.title}</h4>
                                <div className="flex items-center text-sm text-sky-600 mt-2">
                                    <LocationMarkerIcon className="h-4 w-4 mr-1"/>
                                    Open in Google Maps
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
