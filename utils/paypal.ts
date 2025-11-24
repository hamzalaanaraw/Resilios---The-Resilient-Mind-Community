
let paypalScriptPromise: Promise<any> | null = null;

export const loadPayPalScript = () => {
  if (paypalScriptPromise) return paypalScriptPromise;

  paypalScriptPromise = new Promise((resolve, reject) => {
    if ((window as any).paypal) {
      resolve((window as any).paypal);
      return;
    }

    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=BAAEHCd4JmcZm_iKzf4aYb-Y3ugG1fcRtWdLEX1_EGlV0deGE7_AHajNXXY9IGWYIk6B9TYCPnFXdgKLYQ&components=hosted-buttons&disable-funding=venmo&currency=USD";
    script.async = true;
    
    script.onload = () => {
      if ((window as any).paypal) {
        resolve((window as any).paypal);
      } else {
        reject(new Error("PayPal SDK loaded but window.paypal is missing"));
      }
    };
    
    script.onerror = (err) => {
        console.warn("PayPal SDK failed to load (likely due to environment restrictions). Switching to fallback.", err);
        paypalScriptPromise = null; 
        reject(err);
    };
    
    document.body.appendChild(script);
  });

  return paypalScriptPromise;
};
