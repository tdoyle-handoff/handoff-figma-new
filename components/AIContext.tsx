import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePropertyContext } from './PropertyContext';
import { useTaskContext } from './TaskContext';

export interface AIMessage {
  id: string;
  type: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  context?: {
    page?: string;
    action?: string;
    data?: any;
  };
  suggestions?: AISuggestion[];
}

export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  action: () => void;
  priority: 'high' | 'medium' | 'low';
  icon?: string;
}

export interface AIInsight {
  id: string;
  type: 'warning' | 'info' | 'success' | 'reminder';
  title: string;
  description: string;
  actionText?: string;
  action?: () => void;
  dismissible: boolean;
  page?: string;
  priority: number;
}

interface AIContextType {
  // Chat Interface
  messages: AIMessage[];
  isTyping: boolean;
  isChatOpen: boolean;
  setChatOpen: (open: boolean) => void;
  sendMessage: (content: string, context?: any) => Promise<void>;
  clearMessages: () => void;
  
  // Contextual Guidance
  currentInsights: AIInsight[];
  getCurrentPageGuidance: (page: string) => AIInsight[];
  dismissInsight: (insightId: string) => void;
  
  // Smart Suggestions
  getSmartSuggestions: (context?: any) => AISuggestion[];
  executeSmartAction: (actionId: string) => void;
  
  // Progress Intelligence
  analyzeProgress: () => {
    completionPercentage: number;
    blockers: string[];
    nextSteps: string[];
    timelineRisk: 'low' | 'medium' | 'high';
    recommendations: string[];
  };
  
  // Educational Content
  explainConcept: (concept: string) => Promise<string>;
  getHelpForField: (fieldName: string, context?: any) => string;
  
  // Proactive Features
  enableProactiveMode: boolean;
  setEnableProactiveMode: (enabled: boolean) => void;
  lastActiveTime: Date;
  shouldShowProactiveHelp: () => boolean;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

interface AIProviderProps {
  children: ReactNode;
}

export function AIProvider({ children }: AIProviderProps) {
  const propertyContext = usePropertyContext();
  const taskContext = useTaskContext();
  
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [currentInsights, setCurrentInsights] = useState<AIInsight[]>([]);
  const [enableProactiveMode, setEnableProactiveMode] = useState(true);
  const [lastActiveTime, setLastActiveTime] = useState(new Date());

  // Initialize AI with welcome message
  useEffect(() => {
    const welcomeMessage: AIMessage = {
      id: 'welcome-' + Date.now(),
      type: 'ai',
      content: "Hi! I'm your AI home buying assistant. I'm here to guide you through every step of your real estate transaction. Feel free to ask me anything about the home buying process, and I'll provide personalized guidance based on your specific situation.",
      timestamp: new Date(),
      suggestions: [
        {
          id: 'get-started',
          title: 'Get Started',
          description: 'Help me understand where you are in the buying process',
          action: () => sendMessage('Help me get started with my home buying journey'),
          priority: 'high'
        },
        {
          id: 'explain-process',
          title: 'Explain the Process',
          description: 'Learn about the home buying timeline and steps',
          action: () => sendMessage('Explain the home buying process to me'),
          priority: 'medium'
        }
      ]
    };
    
    setMessages([welcomeMessage]);
  }, []);

  // Update last active time and analyze for proactive help
  useEffect(() => {
    const updateActivity = () => {
      setLastActiveTime(new Date());
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, updateActivity));

    return () => {
      events.forEach(event => document.removeEventListener(event, updateActivity));
    };
  }, []);

  // Generate insights based on context changes
  useEffect(() => {
    generateContextualInsights();
  }, [propertyContext.propertyData, taskContext.tasks]);

  const setChatOpen = (open: boolean) => {
    setIsChatOpen(open);
  };

  const sendMessage = async (content: string, context?: any): Promise<void> => {
    const userMessage: AIMessage = {
      id: 'user-' + Date.now(),
      type: 'user',
      content,
      timestamp: new Date(),
      context
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const aiResponse = await generateAIResponse(content, context);
    setIsTyping(false);

    const aiMessage: AIMessage = {
      id: 'ai-' + Date.now(),
      type: 'ai',
      content: aiResponse.content,
      timestamp: new Date(),
      context,
      suggestions: aiResponse.suggestions
    };

    setMessages(prev => [...prev, aiMessage]);
  };

  const generateAIResponse = async (userMessage: string, context?: any) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Analyze user intent and provide contextual responses
    if (lowerMessage.includes('get started') || lowerMessage.includes('begin')) {
      return generateGettingStartedResponse();
    } else if (lowerMessage.includes('timeline') || lowerMessage.includes('schedule')) {
      return generateTimelineResponse();
    } else if (lowerMessage.includes('financing') || lowerMessage.includes('mortgage') || lowerMessage.includes('loan')) {
      return generateFinancingResponse();
    } else if (lowerMessage.includes('inspection') || lowerMessage.includes('inspect')) {
      return generateInspectionResponse();
    } else if (lowerMessage.includes('closing') || lowerMessage.includes('close')) {
      return generateClosingResponse();
    } else if (lowerMessage.includes('help') && lowerMessage.includes('form')) {
      return generateFormHelpResponse(context);
    } else if (lowerMessage.includes('next step') || lowerMessage.includes('what should')) {
      return generateNextStepsResponse();
    } else if (lowerMessage.includes('explain') || lowerMessage.includes('what is')) {
      return generateExplanationResponse(userMessage);
    } else {
      return generateGenericHelpfulResponse(userMessage);
    }
  };

  const generateGettingStartedResponse = () => {
    const completion = propertyContext.getCompletionStatus();
    const progress = analyzeProgress();
    
    if (completion.percentage < 20) {
      return {
        content: "Great! Let's get you started. I can see you're just beginning your home buying journey. The first step is to gather some basic information about your ideal property and your financing situation. Would you like me to help you fill out your property preferences, or should we start with understanding your budget?",
        suggestions: [
          {
            id: 'property-details',
            title: 'Set Up Property Details',
            description: 'Tell me about your ideal home',
            action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'property' })),
            priority: 'high' as const
          },
          {
            id: 'budget-help',
            title: 'Budget Planning',
            description: 'Help me understand my budget',
            action: () => sendMessage('Help me plan my home buying budget'),
            priority: 'high' as const
          }
        ]
      };
    } else if (completion.percentage < 60) {
      return {
        content: `You're making good progress! I can see you've completed ${completion.percentage}% of your initial setup. Let's focus on filling in the remaining details to get you a complete picture of your home buying journey.`,
        suggestions: progress.nextSteps.slice(0, 3).map((step, index) => ({
          id: `next-step-${index}`,
          title: step,
          description: 'Complete this important step',
          action: () => sendMessage(`Help me with: ${step}`),
          priority: index === 0 ? 'high' as const : 'medium' as const
        }))
      };
    } else {
      return {
        content: "Excellent! You've got your basic information set up. Now we can focus on the active parts of your home buying process. Let me help you stay on track with your timeline and tasks.",
        suggestions: [
          {
            id: 'view-timeline',
            title: 'Review Timeline',
            description: 'Check your closing timeline',
            action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'tasks' })),
            priority: 'high' as const
          },
          {
            id: 'next-actions',
            title: 'What\'s Next?',
            description: 'Get your next action items',
            action: () => sendMessage('What should I do next in my home buying process?'),
            priority: 'medium' as const
          }
        ]
      };
    }
  };

  const generateTimelineResponse = () => {
    const timelineStatus = propertyContext.getTimelineStatus();
    const progress = analyzeProgress();
    
    if (!propertyContext.propertyData?.targetClosingDate) {
      return {
        content: "I'd love to help you with your timeline! First, I need to know your target closing date. This is crucial for planning all the steps in your home buying process. Once we have that, I can create a detailed timeline with all the important milestones.",
        suggestions: [
          {
            id: 'set-closing-date',
            title: 'Set Closing Date',
            description: 'Enter your target closing date',
            action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'property' })),
            priority: 'high' as const
          }
        ]
      };
    }

    return {
      content: `Based on your target closing date, you have ${timelineStatus.daysUntilClosing} days until closing. ${progress.timelineRisk === 'high' ? 'We need to move quickly on some items!' : progress.timelineRisk === 'medium' ? 'You\'re on track, but let\'s stay focused.' : 'You\'re in good shape timeline-wise!'} Here are the key milestones coming up:`,
      suggestions: timelineStatus.milestones
        .filter(m => !m.completed && m.daysFromNow <= 30)
        .slice(0, 3)
        .map(milestone => ({
          id: `milestone-${milestone.title.replace(/\s+/g, '-').toLowerCase()}`,
          title: milestone.title,
          description: `Due in ${milestone.daysFromNow} days`,
          action: () => sendMessage(`Help me prepare for: ${milestone.title}`),
          priority: milestone.daysFromNow <= 7 ? 'high' as const : 'medium' as const
        }))
    };
  };

  const generateFinancingResponse = () => {
    const hasLender = propertyContext.propertyData?.hasLender;
    const preApproval = propertyContext.propertyData?.preApprovalAmount;
    
    if (!hasLender) {
      return {
        content: "Getting your financing in order is crucial! I notice you haven't set up a lender yet. This should be one of your first priorities. A pre-approval letter will make you a much stronger buyer and help you understand exactly what you can afford.",
        suggestions: [
          {
            id: 'find-lender',
            title: 'Find a Lender',
            description: 'Get recommendations for mortgage lenders',
            action: () => sendMessage('How do I find a good mortgage lender?'),
            priority: 'high' as const
          },
          {
            id: 'preapproval-process',
            title: 'Pre-approval Process',
            description: 'Learn about getting pre-approved',
            action: () => sendMessage('Explain the mortgage pre-approval process'),
            priority: 'high' as const
          }
        ]
      };
    }

    if (!preApproval) {
      return {
        content: "Great that you have a lender! The next step is getting pre-approved for your mortgage. This will give you a clear budget and make your offers much more competitive.",
        suggestions: [
          {
            id: 'preapproval-docs',
            title: 'Pre-approval Documents',
            description: 'What documents do I need?',
            action: () => sendMessage('What documents do I need for mortgage pre-approval?'),
            priority: 'high' as const
          },
          {
            id: 'improve-approval',
            title: 'Improve Approval Odds',
            description: 'Tips to strengthen your application',
            action: () => sendMessage('How can I improve my mortgage approval chances?'),
            priority: 'medium' as const
          }
        ]
      };
    }

    return {
      content: "Your financing looks good! You have a lender and pre-approval amount set. Let's make sure you're prepared for the next steps in the mortgage process, including appraisal and final underwriting.",
      suggestions: [
        {
          id: 'mortgage-timeline',
          title: 'Mortgage Timeline',
          description: 'What happens next with my loan?',
          action: () => sendMessage('What are the next steps in my mortgage process?'),
          priority: 'medium' as const
        },
        {
          id: 'closing-costs',
          title: 'Closing Costs',
          description: 'Estimate my closing costs',
          action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'financing' })),
          priority: 'medium' as const
        }
      ]
    };
  };

  const generateInspectionResponse = () => {
    return {
      content: "Home inspection is a crucial step that protects your investment! Even if you're waiving inspection contingencies to be competitive, you should still get an inspection for your peace of mind. Let me help you understand the process and what to look for.",
      suggestions: [
        {
          id: 'inspection-checklist',
          title: 'Inspection Checklist',
          description: 'What should the inspector check?',
          action: () => sendMessage('What should be included in a home inspection?'),
          priority: 'high' as const
        },
        {
          id: 'find-inspector',
          title: 'Find an Inspector',
          description: 'How to choose a good inspector',
          action: () => sendMessage('How do I find a qualified home inspector?'),
          priority: 'high' as const
        },
        {
          id: 'inspection-timeline',
          title: 'Inspection Timeline',
          description: 'When should I schedule inspection?',
          action: () => sendMessage('When should I schedule my home inspection?'),
          priority: 'medium' as const
        }
      ]
    };
  };

  const generateClosingResponse = () => {
    const timelineStatus = propertyContext.getTimelineStatus();
    
    return {
      content: `Closing is the final step where you'll get the keys to your new home! ${timelineStatus.daysUntilClosing > 0 ? `With ${timelineStatus.daysUntilClosing} days until your target closing,` : 'Since you\'re near closing,'} let me help you prepare for this important milestone.`,
      suggestions: [
        {
          id: 'closing-checklist',
          title: 'Closing Checklist',
          description: 'What do I need to prepare for closing?',
          action: () => sendMessage('What do I need to prepare for closing?'),
          priority: 'high' as const
        },
        {
          id: 'closing-costs-breakdown',
          title: 'Closing Costs',
          description: 'Understand what you\'ll pay at closing',
          action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'financing' })),
          priority: 'high' as const
        },
        {
          id: 'final-walkthrough',
          title: 'Final Walkthrough',
          description: 'What to check during final walkthrough',
          action: () => sendMessage('What should I look for during the final walkthrough?'),
          priority: 'medium' as const
        }
      ]
    };
  };

  const generateFormHelpResponse = (context?: any) => {
    return {
      content: "I'd be happy to help you fill out any forms! I can provide guidance on property details, financing information, or any other sections. What specific information are you trying to enter?",
      suggestions: [
        {
          id: 'property-form-help',
          title: 'Property Details Help',
          description: 'Get help with property information',
          action: () => sendMessage('Help me fill out my property details'),
          priority: 'high' as const
        },
        {
          id: 'financing-form-help',
          title: 'Financing Information',
          description: 'Get help with financial details',
          action: () => sendMessage('Help me with financing information'),
          priority: 'medium' as const
        }
      ]
    };
  };

  const generateNextStepsResponse = () => {
    const progress = analyzeProgress();
    const completion = propertyContext.getCompletionStatus();
    
    if (completion.percentage < 50) {
      return {
        content: "Let's focus on completing your initial setup first. This will help me give you more personalized guidance for your specific situation.",
        suggestions: completion.missingFields.slice(0, 3).map((field, index) => ({
          id: `missing-field-${index}`,
          title: `Complete ${field}`,
          description: 'This information is needed for your profile',
          action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'property' })),
          priority: index === 0 ? 'high' as const : 'medium' as const
        }))
      };
    }

    return {
      content: `Based on your current progress, here are your next priority steps: ${progress.nextSteps.slice(0, 2).join(', ')}. ${progress.blockers.length > 0 ? `I also notice some potential issues that might slow you down: ${progress.blockers.join(', ')}.` : ''}`,
      suggestions: progress.nextSteps.slice(0, 3).map((step, index) => ({
        id: `next-step-${index}`,
        title: step,
        description: 'Important next step',
        action: () => sendMessage(`Help me with: ${step}`),
        priority: index === 0 ? 'high' as const : 'medium' as const
      }))
    };
  };

  const generateExplanationResponse = (userMessage: string) => {
    const concept = extractConceptFromMessage(userMessage);
    
    const explanations = {
      'pre-approval': "Pre-approval is when a lender reviews your financial information and tells you how much they're willing to lend you. It's different from pre-qualification because it involves a credit check and document verification. Having a pre-approval letter makes you a serious buyer in sellers' eyes.",
      'closing costs': "Closing costs are fees paid at the end of a real estate transaction. They typically range from 2-5% of the home price and include items like loan origination fees, appraisal costs, title insurance, attorney fees, and prepaid items like property taxes and insurance.",
      'home inspection': "A home inspection is a thorough examination of a property's condition by a qualified professional. They check structural elements, electrical, plumbing, HVAC, and other systems. The inspection helps you understand any issues before finalizing the purchase.",
      'escrow': "Escrow is a neutral third party that holds funds and documents during the transaction. They ensure all conditions are met before money and property change hands. Escrow protects both buyer and seller.",
      'contingencies': "Contingencies are conditions in your purchase contract that must be met for the sale to proceed. Common ones include financing, inspection, and appraisal contingencies. They protect buyers by allowing them to cancel if conditions aren't met."
    };

    const explanation = (explanations as Record<string, string>)[concept] || "I'd be happy to explain real estate concepts! Could you be more specific about what you'd like to understand?";
    
    return {
      content: explanation,
      suggestions: [
        {
          id: 'more-questions',
          title: 'Ask Another Question',
          description: 'I can explain other real estate terms',
          action: () => sendMessage('Explain another real estate concept to me'),
          priority: 'medium' as const
        }
      ]
    };
  };

  const generateGenericHelpfulResponse = (userMessage: string) => {
    return {
      content: "I'm here to help with your home buying journey! I can assist with understanding the process, filling out forms, staying on timeline, and answering questions about real estate. What would you like to know more about?",
      suggestions: [
        {
          id: 'process-help',
          title: 'Buying Process',
          description: 'Learn about the home buying steps',
          action: () => sendMessage('Explain the home buying process to me'),
          priority: 'medium' as const
        },
        {
          id: 'timeline-help',
          title: 'My Timeline',
          description: 'Help me stay on track',
          action: () => sendMessage('Help me with my home buying timeline'),
          priority: 'medium' as const
        },
        {
          id: 'specific-question',
          title: 'Specific Question',
          description: 'Ask about a specific topic',
          action: () => setChatOpen(true),
          priority: 'low' as const
        }
      ]
    };
  };

  const extractConceptFromMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pre-approval') || lowerMessage.includes('preapproval')) return 'pre-approval';
    if (lowerMessage.includes('closing cost')) return 'closing costs';
    if (lowerMessage.includes('inspection')) return 'home inspection';
    if (lowerMessage.includes('escrow')) return 'escrow';
    if (lowerMessage.includes('contingenc')) return 'contingencies';
    
    return 'general';
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const generateContextualInsights = () => {
    const insights: AIInsight[] = [];
    const completion = propertyContext.getCompletionStatus();
    const progress = analyzeProgress();
    const timeline = propertyContext.getTimelineStatus();

    // Setup completion insights
    if (completion.percentage < 30) {
      insights.push({
        id: 'setup-incomplete',
        type: 'warning',
        title: 'Complete Your Profile',
        description: 'Finish setting up your property preferences to get personalized guidance.',
        actionText: 'Complete Setup',
        action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'property' })),
        dismissible: true,
        priority: 1
      });
    }

    // Timeline risk insights
    if (progress.timelineRisk === 'high') {
      insights.push({
        id: 'timeline-risk',
        type: 'warning',
        title: 'Timeline Risk Detected',
        description: 'Some tasks may cause delays. Review your timeline and prioritize critical items.',
        actionText: 'Review Tasks',
        action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'tasks' })),
        dismissible: false,
        priority: 0
      });
    }

    // Financing insights
    if (!propertyContext.propertyData?.hasLender && completion.percentage > 20) {
      insights.push({
        id: 'need-lender',
        type: 'info',
        title: 'Find a Lender',
        description: 'Getting pre-approved should be a top priority to strengthen your offers.',
        actionText: 'Learn More',
        action: () => sendMessage('Help me find a mortgage lender'),
        dismissible: true,
        priority: 2
      });
    }

    // Progress celebration
    if (completion.percentage > 80) {
      insights.push({
        id: 'good-progress',
        type: 'success',
        title: 'Great Progress!',
        description: `You've completed ${completion.percentage}% of your setup. You're well-prepared for the home buying process.`,
        dismissible: true,
        priority: 5
      });
    }

    // Proactive reminders based on timeline
    if (timeline.daysUntilClosing > 0 && timeline.daysUntilClosing <= 30) {
      insights.push({
        id: 'closing-approaching',
        type: 'reminder',
        title: 'Closing Approaching',
        description: `${timeline.daysUntilClosing} days until your target closing date. Make sure all your tasks are on track.`,
        actionText: 'Review Timeline',
        action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'tasks' })),
        dismissible: false,
        priority: 1
      });
    }

    setCurrentInsights(insights.sort((a, b) => a.priority - b.priority));
  };

  const getCurrentPageGuidance = (page: string): AIInsight[] => {
    return currentInsights.filter(insight => !insight.page || insight.page === page);
  };

  const dismissInsight = (insightId: string) => {
    setCurrentInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const getSmartSuggestions = (context?: any): AISuggestion[] => {
    const suggestions: AISuggestion[] = [];
    const completion = propertyContext.getCompletionStatus();
    const progress = analyzeProgress();

    if (completion.missingFields.length > 0) {
      suggestions.push({
        id: 'complete-profile',
        title: 'Complete Your Profile',
        description: `${completion.missingFields.length} fields remaining`,
        action: () => window.dispatchEvent(new CustomEvent('navigate', { detail: 'property' })),
        priority: 'high'
      });
    }

    if (progress.nextSteps.length > 0) {
      suggestions.push({
        id: 'next-step',
        title: 'Next Priority Step',
        description: progress.nextSteps[0],
        action: () => sendMessage(`Help me with: ${progress.nextSteps[0]}`),
        priority: 'medium'
      });
    }

    return suggestions;
  };

  const executeSmartAction = (actionId: string) => {
    // Implementation for executing smart actions
    console.log('Executing smart action:', actionId);
  };

  const analyzeProgress = () => {
    const completion = propertyContext.getCompletionStatus();
    const timeline = propertyContext.getTimelineStatus();
    const tasks = taskContext.tasks || [];
    
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    
    const blockers: string[] = [];
    const nextSteps: string[] = [];
    const recommendations: string[] = [];
    
    // Analyze completion status
    if (!propertyContext.propertyData?.hasLender) {
      blockers.push('No lender selected');
      nextSteps.push('Find and connect with a mortgage lender');
    }
    
    if (!propertyContext.propertyData?.preApprovalAmount) {
      nextSteps.push('Get pre-approved for mortgage');
    }
    
    if (completion.missingFields.length > 0) {
      nextSteps.push(`Complete missing information: ${completion.missingFields[0]}`);
    }
    
    // Timeline risk assessment
    let timelineRisk: 'low' | 'medium' | 'high' = 'low';
    if (timeline.daysUntilClosing < 30 && completion.percentage < 70) {
      timelineRisk = 'high';
    } else if (timeline.daysUntilClosing < 60 && completion.percentage < 50) {
      timelineRisk = 'medium';
    }
    
    // Generate recommendations
    if (completion.percentage > 80) {
      recommendations.push('Focus on active tasks and timeline management');
    } else {
      recommendations.push('Complete your property and financing setup first');
    }
    
    if (timelineRisk === 'high') {
      recommendations.push('Consider extending timeline or prioritizing critical tasks');
    }
    
    return {
      completionPercentage: completion.percentage,
      blockers,
      nextSteps: nextSteps.slice(0, 5),
      timelineRisk,
      recommendations
    };
  };

  const explainConcept = async (concept: string): Promise<string> => {
    // This would integrate with a knowledge base or AI service
    return `Let me explain ${concept} in the context of your home buying process...`;
  };

  const getHelpForField = (fieldName: string, context?: any): string => {
    const fieldHelp: Record<string, string> = {
      'address': 'Enter the full address of the property you\'re interested in or have under contract.',
      'price': 'Enter the purchase price or your target budget range.',
      'homeType': 'Select the type of property: single family, condo, townhouse, etc.',
      'bedrooms': 'Number of bedrooms you need or the property has.',
      'bathrooms': 'Number of bathrooms (can include half baths like 2.5).',
      'targetClosingDate': 'When you want to close on the property. This drives your entire timeline.',
      'downPaymentPercent': 'What percentage you plan to put down (typically 3-20%).',
      'mustHaveFeatures': 'Features that are non-negotiable for you (garage, yard, etc.).'
    };
    
    return fieldHelp[fieldName] || 'I can help explain what information is needed for this field.';
  };

  const shouldShowProactiveHelp = (): boolean => {
    if (!enableProactiveMode) return false;
    
    const timeSinceActive = Date.now() - lastActiveTime.getTime();
    const fiveMinutes = 5 * 60 * 1000;
    
    // Show proactive help if user has been inactive for 5 minutes
    // and there are high-priority insights
    return timeSinceActive > fiveMinutes && 
           currentInsights.some(insight => insight.priority <= 2);
  };

  const contextValue: AIContextType = {
    messages,
    isTyping,
    isChatOpen,
    setChatOpen,
    sendMessage,
    clearMessages,
    currentInsights,
    getCurrentPageGuidance,
    dismissInsight,
    getSmartSuggestions,
    executeSmartAction,
    analyzeProgress,
    explainConcept,
    getHelpForField,
    enableProactiveMode,
    setEnableProactiveMode,
    lastActiveTime,
    shouldShowProactiveHelp
  };

  return (
    <AIContext.Provider value={contextValue}>
      {children}
    </AIContext.Provider>
  );
}

export function useAI(): AIContextType {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
}