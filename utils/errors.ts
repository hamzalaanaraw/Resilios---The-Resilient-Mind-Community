
/**
 * Translates technical error messages into user-friendly, empathetic language
 * consistent with the Resilios persona.
 */
export const getFriendlyErrorMessage = (error: any): string => {
  const msg = (error?.message || error?.toString() || '').toLowerCase();

  // Network / Connection
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('offline')) {
    return "It looks like you're offline. Please check your internet connection.";
  }

  // Google GenAI Specific
  if (msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) {
    return "I'm receiving a lot of messages right now. Please give me a moment to catch up.";
  }
  if (msg.includes('503') || msg.includes('overloaded')) {
    return "My servers are a bit overloaded. Please try again in a few seconds.";
  }
  if (msg.includes('500') || msg.includes('internal')) {
    return "I encountered a temporary glitch. Please try sending that again.";
  }
  if (msg.includes('safety') || msg.includes('blocked')) {
    return "I couldn't process that specific request due to safety guidelines. Let's try rephrasing it.";
  }
  if (msg.includes('api_key') || msg.includes('apikey')) {
    return "There seems to be a configuration issue with my connection key.";
  }

  // Geolocation
  if (msg.includes('permission denied') || msg.includes('user denied')) {
    return "Location access was denied. Please enable it in your browser settings to use this feature.";
  }
  if (msg.includes('position unavailable')) {
    return "I couldn't determine your precise location. Please try again later.";
  }

  // Default fallback
  return "Something unexpected happened. Please try again.";
};
