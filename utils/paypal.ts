
let paypalScriptPromise: Promise<any> | null = null;

export const loadPayPalScript = () => {
  if (paypalScriptPromise) return paypalScriptPromise;

  paypalScriptPromise = new Promise((resolve, reject) => {
    // Check for existing instance with our specific namespace
    if ((window as any).paypal_sdk) {
      resolve((window as any).paypal_sdk);
      return;
    }

    const script = document.createElement('script');
    // Using the specific client ID and components provided
    script.src = "https://www.paypal.com/sdk/js?client-id=BAAEHCd4JmcZm_iKzf4aYb-Y3ugG1fcRtWdLEX1_EGlV0deGE7_AHajNXXY9IGWYIk6B9TYCPnFXdgKLYQ&components=hosted-buttons&disable-funding=venmo&currency=USD";
    script.async = true;
    // Isolate the SDK to avoid conflicts and bootstrap errors
    script.setAttribute('data-namespace', 'paypal_sdk');
    
    script.onload = () => resolve((window as any).paypal_sdk);
    script.onerror = (err) => {
        console.warn("PayPal SDK failed to load (likely due to environment restrictions). Switching to fallback.", err);
        paypalScriptPromise = null; 
        reject(err);
    };
    
    document.body.appendChild(script);
  });

  return paypalScriptPromise;
};
