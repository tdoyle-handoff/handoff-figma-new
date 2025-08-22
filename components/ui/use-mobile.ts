import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Initial check
    const checkIsMobile = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const userAgent = navigator.userAgent;
      
      // Check for mobile devices by user agent
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      
      // Check by screen size (including iPhone 14 which is 390x844)
      const isMobileSize = width < MOBILE_BREAKPOINT;
      
      // Also check for touch device
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      // Mobile if any of these conditions are true
      const mobile = isMobileDevice || isMobileSize || (isTouchDevice && width < 1024);
      
      console.log('Mobile detection:', {
        width,
        height,
        userAgent: userAgent.substring(0, 50) + '...',
        isMobileDevice,
        isMobileSize,
        isTouchDevice,
        result: mobile
      });
      
      return mobile;
    };

    const onChange = () => {
      setIsMobile(checkIsMobile());
    };

    // Set initial value
    setIsMobile(checkIsMobile());

    // Listen for resize events
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    mql.addEventListener("change", onChange);
    window.addEventListener("resize", onChange);
    window.addEventListener("orientationchange", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener("resize", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, []);

  return !!isMobile;
}