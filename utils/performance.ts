// Performance monitoring utility for tracking login and app performance
class PerformanceMonitor {
  private timers: Map<string, number> = new Map();
  private metrics: Map<string, number[]> = new Map();
  
  startTimer(name: string) {
    this.timers.set(name, performance.now());
  }
  
  endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer "${name}" was not started`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.timers.delete(name);
    
    // Store metric for analysis
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(duration);
    
    console.log(`⏱️ ${name}: ${duration.toFixed(2)}ms`);
    return duration;
  }
  
  getMetrics() {
    const summary: Record<string, { avg: number; min: number; max: number; count: number }> = {};
    
    for (const [name, values] of this.metrics) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      summary[name] = {
        avg: Math.round(avg * 100) / 100,
        min: Math.round(min * 100) / 100,
        max: Math.round(max * 100) / 100,
        count: values.length
      };
    }
    
    return summary;
  }
  
  clearMetrics() {
    this.metrics.clear();
  }
  
  // Report performance bottlenecks
  reportBottlenecks() {
    const metrics = this.getMetrics();
    const slowOperations = Object.entries(metrics)
      .filter(([_, data]) => data.avg > 500) // Operations taking more than 500ms
      .sort(([_, a], [__, b]) => b.avg - a.avg);
    
    if (slowOperations.length > 0) {
      console.warn('🐌 Performance bottlenecks detected:');
      slowOperations.forEach(([name, data]) => {
        console.warn(`  ${name}: ${data.avg}ms avg (${data.min}ms - ${data.max}ms)`);
      });
    }
    
    return slowOperations;
  }
}

export const perfMonitor = new PerformanceMonitor();

// Specific performance tracking for authentication
export const authPerformance = {
  trackLogin: <T extends (...args: any[]) => Promise<any>>(callback: T): T => {
    return (async (...args: Parameters<T>) => {
      perfMonitor.startTimer('auth_login_total');
      try {
        const result = await callback(...args);
        return result;
      } finally {
        perfMonitor.endTimer('auth_login_total');
      }
    }) as T;
  },
  
  trackSessionCheck: <T extends (...args: any[]) => Promise<any>>(callback: T): T => {
    return (async (...args: Parameters<T>) => {
      perfMonitor.startTimer('auth_session_check');
      try {
        const result = await callback(...args);
        return result;
      } finally {
        perfMonitor.endTimer('auth_session_check');
      }
    }) as T;
  },
  
  trackProfileLoad: <T extends (...args: any[]) => Promise<any>>(callback: T): T => {
    return (async (...args: Parameters<T>) => {
      perfMonitor.startTimer('auth_profile_load');
      try {
        const result = await callback(...args);
        return result;
      } finally {
        perfMonitor.endTimer('auth_profile_load');
      }
    }) as T;
  }
};

// Enhanced network performance monitoring
export const networkPerformance = {
  async measureLatency(url: string): Promise<number> {
    const start = performance.now();
    try {
      await fetch(url, { method: 'HEAD' });
      return performance.now() - start;
    } catch (error) {
      console.error('Network latency measurement failed:', error);
      return -1;
    }
  },
  
  async checkConnection(): Promise<{ type: string; speed: number; latency: number }> {
    const connection = (navigator as any).connection;
    
    // Measure actual latency to Supabase
    const latency = await this.measureLatency(`https://${window.location.hostname === 'localhost' ? 'google.com' : window.location.hostname}`);
    
    let speed = 0;
    let type = 'unknown';
    
    if (connection) {
      speed = connection.downlink || 0;
      type = connection.effectiveType || 'unknown';
    }
    
    // Fallback speed detection based on latency
    if (!speed && latency > 0) {
      if (latency < 100) speed = 10; // Fast connection
      else if (latency < 300) speed = 5; // Medium connection
      else if (latency < 1000) speed = 1; // Slow connection
      else speed = 0.5; // Very slow connection
    }
    
    return { type, speed, latency };
  },
  
  // Adaptive timeout based on connection quality
  getAdaptiveTimeout(baseTimeout: number = 5000): number {
    const connection = (navigator as any).connection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      
      switch (effectiveType) {
        case 'slow-2g':
          return baseTimeout * 4; // 20s
        case '2g':
          return baseTimeout * 3; // 15s
        case '3g':
          return baseTimeout * 2; // 10s
        case '4g':
        default:
          return baseTimeout; // 5s
      }
    }
    
    return baseTimeout;
  },
  
  // Connection speed detection with caching
  connectionCache: {
    speed: 'unknown' as 'slow' | 'medium' | 'fast' | 'unknown',
    timestamp: 0,
    latency: 0
  },
  
  async detectConnectionSpeed(forceRefresh: boolean = false): Promise<{ speed: string; latency: number }> {
    // Use cached result if less than 5 minutes old
    if (!forceRefresh && Date.now() - this.connectionCache.timestamp < 5 * 60 * 1000) {
      return {
        speed: this.connectionCache.speed,
        latency: this.connectionCache.latency
      };
    }
    
    try {
      const connectionInfo = await this.checkConnection();
      let speed: 'slow' | 'medium' | 'fast' | 'unknown' = 'unknown';
      
      // Determine speed based on latency and connection info
      if (connectionInfo.latency < 200 && connectionInfo.speed > 5) {
        speed = 'fast';
      } else if (connectionInfo.latency < 500 && connectionInfo.speed > 1) {
        speed = 'medium';
      } else if (connectionInfo.latency < 1500) {
        speed = 'slow';
      } else {
        speed = 'unknown';
      }
      
      // Update cache
      this.connectionCache = {
        speed,
        latency: connectionInfo.latency,
        timestamp: Date.now()
      };
      
      console.log(`🌐 Connection detected: ${speed} (${connectionInfo.latency.toFixed(0)}ms, ${connectionInfo.speed}Mbps)`);
      
      return {
        speed,
        latency: connectionInfo.latency
      };
    } catch (error) {
      console.warn('Connection speed detection failed:', error);
      return {
        speed: 'unknown',
        latency: 0
      };
    }
  }
};

// Web Vitals tracking for overall app performance
export const webVitals = {
  // Measure Largest Contentful Paint (LCP)
  measureLCP: () => {
    if ('web-vitals' in window) return;
    
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      
      console.log('🎯 LCP:', lastEntry.startTime);
      perfMonitor.metrics.set('lcp', [lastEntry.startTime]);
    });
    
    try {
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP measurement not supported');
    }
  },
  
  // Measure First Input Delay (FID)
  measureFID: () => {
    if ('web-vitals' in window) return;
    
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        console.log('👆 FID:', entry.processingStart - entry.startTime);
        perfMonitor.metrics.set('fid', [entry.processingStart - entry.startTime]);
      });
    });
    
    try {
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID measurement not supported');
    }
  },
  
  // Measure Cumulative Layout Shift (CLS)
  measureCLS: () => {
    if ('web-vitals' in window) return;
    
    let clsValue = 0;
    const observer = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      console.log('📏 CLS:', clsValue);
      perfMonitor.metrics.set('cls', [clsValue]);
    });
    
    try {
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS measurement not supported');
    }
  },
  
  // Initialize all measurements
  init: () => {
    webVitals.measureLCP();
    webVitals.measureFID();
    webVitals.measureCLS();
  }
};

// Performance optimization suggestions
export const performanceOptimizer = {
  analyzeAndSuggest: () => {
    const metrics = perfMonitor.getMetrics();
    const suggestions: string[] = [];
    
    // Check login performance
    if (metrics.auth_login_total?.avg > 3000) {
      suggestions.push('Login is taking too long (>3s). Consider implementing more aggressive caching.');
    }
    
    // Check session check performance
    if (metrics.auth_session_check?.avg > 1000) {
      suggestions.push('Session check is slow (>1s). Consider using cached session data.');
    }
    
    // Check profile loading performance
    if (metrics.auth_profile_load?.avg > 2000) {
      suggestions.push('Profile loading is slow (>2s). Consider preloading or better caching.');
    }
    
    // Check component loading performance
    if (metrics.component_render?.avg > 500) {
      suggestions.push('Component rendering is slow (>500ms). Consider React.memo or code splitting.');
    }
    
    // Check network performance
    const connectionSpeed = networkPerformance.connectionCache.speed;
    if (connectionSpeed === 'slow') {
      suggestions.push('Slow connection detected. Using optimized settings for better performance.');
    }
    
    return suggestions;
  },
  
  reportPerformance: () => {
    console.group('📊 Performance Report');
    console.table(perfMonitor.getMetrics());
    
    const bottlenecks = perfMonitor.reportBottlenecks();
    const suggestions = performanceOptimizer.analyzeAndSuggest();
    
    if (suggestions.length > 0) {
      console.group('💡 Optimization Suggestions');
      suggestions.forEach(suggestion => console.log(`• ${suggestion}`));
      console.groupEnd();
    }
    
    // Report connection status
    const connection = networkPerformance.connectionCache;
    console.log(`🌐 Connection: ${connection.speed} (${connection.latency.toFixed(0)}ms)`);
    
    console.groupEnd();
  }
};

// Enhanced retry utility with exponential backoff
export const retryUtil = {
  async withRetry<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
      backoffFactor?: number;
      shouldRetry?: (error: Error) => boolean;
    } = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      baseDelay = 1000,
      maxDelay = 10000,
      backoffFactor = 2,
      shouldRetry = () => true
    } = options;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          const delay = Math.min(baseDelay * Math.pow(backoffFactor, attempt - 1), maxDelay);
          console.log(`🔄 Retry attempt ${attempt} after ${delay}ms delay`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ Attempt ${attempt + 1} failed:`, error);
        
        // Don't retry if shouldRetry returns false
        if (!shouldRetry(lastError)) {
          throw lastError;
        }
      }
    }
    
    throw lastError || new Error('Max retries exceeded');
  },
  
  async withTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      operation(),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error(`Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }
};

// Auto-report performance every 30 seconds in development
if (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development') {
  setInterval(() => {
    performanceOptimizer.reportPerformance();
  }, 30000);
}

// Suppress common development warnings that don't affect functionality
if (typeof window !== 'undefined' && process.env?.NODE_ENV === 'development') {
  // Filter out hydration warnings and other development-only warnings
  const originalConsoleWarn = console.warn;
  console.warn = (...args: any[]) => {
    const message = args.join(' ');
    
    // Suppress specific development warnings that don't affect functionality
    if (
      message.includes('No breakpoints elements found during hydration') ||
      message.includes('hydration') ||
      message.includes('useLayoutEffect does nothing on the server') ||
      message.includes('Warning: React.jsx: type is invalid') ||
      message.includes('Warning: validateDOMNesting')
    ) {
      return; // Suppress these warnings
    }
    
    // Allow other warnings to show
    originalConsoleWarn.apply(console, args);
  };
}

// Initialize performance monitoring on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      webVitals.init();
      // Detect initial connection speed
      networkPerformance.detectConnectionSpeed();
    }, 1000);
  });
  
  // Monitor connection changes
  window.addEventListener('online', () => {
    console.log('🌐 Connection restored');
    networkPerformance.detectConnectionSpeed(true);
  });
  
  window.addEventListener('offline', () => {
    console.log('🔌 Connection lost');
  });
}