import React, { useState, useEffect } from 'react';
import { Card, CardContent } from './ui/card';
import { Loader2, Shield, Database, User, CheckCircle } from 'lucide-react';
const handoffLogo = 'https://cdn.builder.io/api/v1/image/assets%2Fd17493787dd14ef798478b15abccc651%2Fdf51dc32668b459882a7a106ef4658d1?format=webp&width=800';

// Enhanced loading component with progress indication
export function AuthLoader() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { id: 0, label: 'Initializing...', icon: Loader2, duration: 200 },
    { id: 1, label: 'Checking session...', icon: Shield, duration: 300 },
    { id: 2, label: 'Loading profile...', icon: User, duration: 200 },
    { id: 3, label: 'Ready!', icon: CheckCircle, duration: 100 },
  ];

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let progressInterval: NodeJS.Timeout;

    // Progress bar animation
    progressInterval = setInterval(() => {
      setProgress(prev => {
        const targetProgress = ((currentStep + 1) / steps.length) * 100;
        const increment = (targetProgress - prev) * 0.1;
        return Math.min(prev + increment, targetProgress);
      });
    }, 16); // 60fps

    // Step progression
    if (currentStep < steps.length - 1) {
      timeoutId = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, steps[currentStep].duration);
    }

    return () => {
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
    };
  }, [currentStep, steps]);

  const CurrentIcon = steps[currentStep].icon;

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 border-0 shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src={handoffLogo}
              alt="Handoff"
              className="h-64 w-auto animate-pulse"
            />
          </div>

          {/* Loading icon and text */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <CurrentIcon 
                className={`h-8 w-8 text-primary ${
                  currentStep < steps.length - 1 ? 'animate-spin' : 'animate-bounce'
                }`} 
              />
            </div>
            
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                {steps[currentStep].label}
              </p>
              
              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              
              <p className="text-sm text-muted-foreground">
                Setting up your secure session...
              </p>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-center space-x-2 pt-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-primary scale-110' 
                    : 'bg-muted scale-100'
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Fast splash screen for very quick loads
export function QuickLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4">
        <img
          src={handoffLogo}
          alt="Handoff"
          className="h-72 w-auto mx-auto animate-pulse"
        />
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      </div>
    </div>
  );
}

// Skeleton loader for dashboard content
export function DashboardSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded-lg w-1/3 animate-pulse" />
        <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
              </div>
              <div className="h-10 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content skeleton */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-1/4 animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-4 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Component loading placeholder
export function ComponentLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <div className="text-center space-y-3">
        <Loader2 className="h-6 w-6 text-primary animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

// Minimal loading spinner
export function LoadingSpinner({ size = "default" }: { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-4 w-4",
    default: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <Loader2 className={`${sizeClasses[size]} text-primary animate-spin`} />
  );
}

// Progress loading bar
export function ProgressLoader({ progress, message }: { progress: number; message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center mb-4">
            <img
              src={handoffLogo}
              alt="Handoff"
              className="h-56 w-auto"
            />
          </div>
          
          <div className="space-y-3">
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="h-full bg-primary transition-all duration-500 ease-out rounded-full"
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
            
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{message || 'Loading...'}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Error loading state
export function LoadingError({ 
  message = "Failed to load", 
  onRetry 
}: { 
  message?: string; 
  onRetry?: () => void; 
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md mx-4 border-destructive/20">
        <CardContent className="p-6 text-center space-y-4">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Database className="h-6 w-6 text-destructive" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="font-medium text-foreground">Loading Failed</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
          </div>

          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
