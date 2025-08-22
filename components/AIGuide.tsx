import { Fragment } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Alert, AlertDescription } from './ui/alert';
import { useAI, AIMessage, AISuggestion, AIInsight } from './AIContext';
import { useIsMobile } from './ui/use-mobile';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  X, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  Clock,
  Sparkles,
  Brain,
  ArrowRight,
  HelpCircle,
  Minimize2,
  Maximize2
} from 'lucide-react';

// Helper functions moved outside component scope for reusability
const getInsightIcon = (type: AIInsight['type']) => {
  switch (type) {
    case 'warning': return <AlertCircle className="w-4 h-4 text-amber-500" />;
    case 'info': return <Info className="w-4 h-4 text-blue-500" />;
    case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
    case 'reminder': return <Clock className="w-4 h-4 text-purple-500" />;
  }
};

const getInsightBorderColor = (type: AIInsight['type']) => {
  switch (type) {
    case 'warning': return 'border-l-amber-500';
    case 'info': return 'border-l-blue-500';
    case 'success': return 'border-l-green-500';
    case 'reminder': return 'border-l-purple-500';
  }
};

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

interface AIGuideProps {
  page?: string;
  context?: any;
}

export function AIGuide({ page, context }: AIGuideProps) {
  const ai = useAI();
  const isMobile = useIsMobile();
  const [inputMessage, setInputMessage] = useState('');
  const [showInsights, setShowInsights] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ai.messages, ai.isTyping]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    
    await ai.sendMessage(inputMessage, { page, ...context });
    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleHideAssistant = () => {
    ai.setChatOpen(false);
  };

  const handleMinimizeToggle = () => {
    setIsMinimized(!isMinimized);
  };

  const pageInsights = ai.getCurrentPageGuidance(page || '');
  const suggestions = ai.getSmartSuggestions(context);

  const ChatContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-medium">AI Home Buying Assistant</h3>
              <p className="text-sm text-muted-foreground">
                {ai.isTyping ? 'Thinking...' : 'Ready to help'}
              </p>
            </div>
          </div>
          
          {/* Header controls */}
          <div className="flex items-center gap-2">
            {!isMobile && (
              <Fragment>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMinimizeToggle}
                  className="h-auto p-1"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHideAssistant}
                  className="h-auto p-1"
                  title="Hide Assistant"
                >
                  <X className="w-4 h-4" />
                </Button>
              </Fragment>
            )}
          </div>
        </div>
      </div>

      {/* Messages - only show if not minimized */}
      {!isMinimized && (
        <Fragment>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {ai.messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              
              {ai.isTyping && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-muted-foreground">AI is thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about home buying..."
                className="flex-1"
                disabled={ai.isTyping}
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={!inputMessage.trim() || ai.isTyping}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Quick suggestions */}
            {suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.slice(0, 3).map((suggestion) => (
                  <Button
                    key={suggestion.id}
                    variant="outline"
                    size="sm"
                    onClick={suggestion.action}
                    className="text-xs"
                  >
                    {suggestion.title}
                  </Button>
                ))}
              </div>
            )}
          </div>
        </Fragment>
      )}

      {/* Minimized state */}
      {isMinimized && (
        <div className="p-4 text-center">
          <p className="text-sm text-muted-foreground">Assistant minimized</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMinimizeToggle}
            className="mt-2 text-xs"
          >
            <Maximize2 className="w-3 h-3 mr-1" />
            Expand
          </Button>
        </div>
      )}
    </div>
  );

  const MessageBubble = ({ message }: { message: AIMessage }) => (
    <div className={`flex items-start gap-3 ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        message.type === 'user' 
          ? 'bg-secondary' 
          : message.type === 'ai'
          ? 'bg-primary'
          : 'bg-muted'
      }`}>
        {message.type === 'user' ? (
          <User className="w-4 h-4 text-secondary-foreground" />
        ) : message.type === 'ai' ? (
          <Bot className="w-4 h-4 text-primary-foreground" />
        ) : (
          <Info className="w-4 h-4 text-muted-foreground" />
        )}
      </div>
      
      <div className={`max-w-[80%] ${message.type === 'user' ? 'text-right' : ''}`}>
        <div className={`rounded-lg p-3 ${
          message.type === 'user' 
            ? 'bg-secondary text-secondary-foreground' 
            : 'bg-muted'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        {message.suggestions && message.suggestions.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.suggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="ghost"
                size="sm"
                onClick={suggestion.action}
                className="text-xs h-auto p-2 justify-start w-full"
              >
                <ArrowRight className="w-3 h-3 mr-2" />
                {suggestion.title}
              </Button>
            ))}
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-1">
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );

  const InsightCard = ({ insight }: { insight: AIInsight }) => (
    <Alert className={`border-l-4 ${getInsightBorderColor(insight.type)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 flex-1">
          {getInsightIcon(insight.type)}
          <div className="flex-1">
            <h4 className="font-medium text-sm">{insight.title}</h4>
            <AlertDescription className="text-xs mt-1">
              {insight.description}
            </AlertDescription>
            {insight.actionText && insight.action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={insight.action}
                className="mt-2 h-auto p-1 text-xs"
              >
                {insight.actionText}
                <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
        {insight.dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => ai.dismissInsight(insight.id)}
            className="h-auto p-1"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
    </Alert>
  );

  // Don't render anything if chat is closed
  if (!ai.isChatOpen) {
    return (
      <Fragment>
        {/* Show floating action button when closed */}
        <Button
          onClick={() => ai.setChatOpen(true)}
          className={`fixed ${isMobile ? 'bottom-20 right-4' : 'right-6 bottom-6'} z-50 rounded-full w-12 h-12 shadow-lg`}
          size="icon"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>

        {/* Mobile Insights Banner when chat is closed */}
        {isMobile && pageInsights.length > 0 && showInsights && (
          <div className="fixed top-16 left-4 right-4 z-40 space-y-2">
            {pageInsights.slice(0, 1).map((insight) => (
              <Alert key={insight.id} className={`border-l-4 ${getInsightBorderColor(insight.type)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2 flex-1">
                    {getInsightIcon(insight.type)}
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <AlertDescription className="text-xs mt-1">
                        {insight.description}
                      </AlertDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => ai.setChatOpen(true)}
                      className="h-auto p-1 text-xs"
                    >
                      <MessageSquare className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowInsights(false)}
                      className="h-auto p-1"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </Fragment>
    );
  }

  if (isMobile) {
    return (
      <Fragment>
        {/* Mobile Floating Action Button */}
        <div className="fixed bottom-20 right-4 z-50">
          <Sheet open={ai.isChatOpen} onOpenChange={ai.setChatOpen}>
            <SheetTrigger asChild>
              <Button
                size="lg"
                className="w-14 h-14 rounded-full shadow-lg bg-primary hover:bg-primary/90"
              >
                <MessageSquare className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <SheetHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    <div>
                      <SheetTitle>AI Assistant</SheetTitle>
                      <SheetDescription>
                        Get personalized guidance for your home buying journey
                      </SheetDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => ai.setChatOpen(false)}
                    className="h-auto p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </SheetHeader>
              <div className="flex-1 mt-4 h-full">
                <ChatContent />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Mobile Insights Banner */}
        {pageInsights.length > 0 && showInsights && (
          <div className="fixed top-16 left-4 right-4 z-40 space-y-2">
            {pageInsights.slice(0, 2).map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </Fragment>
    );
  }

  return (
    <Fragment>
      {/* Desktop Sidebar */}
      <div className={`fixed right-6 top-20 bottom-6 z-40 transition-all duration-300 ${
        isMinimized ? 'w-80' : 'w-80'
      }`}>
        <Card className="h-full flex flex-col shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Brain className="w-5 h-5 text-primary" />
                AI Assistant
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMinimizeToggle}
                  className="h-auto p-1"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHideAssistant}
                  className="h-auto p-1"
                  title="Hide Assistant"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
            
            {!isMinimized && pageInsights.length > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {pageInsights.length} insight{pageInsights.length !== 1 ? 's' : ''}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInsights(!showInsights)}
                  className="h-auto p-1 text-xs"
                >
                  {showInsights ? 'Hide' : 'Show'}
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Insights Section - only show if not minimized */}
            {!isMinimized && pageInsights.length > 0 && showInsights && (
              <div className="p-4 border-b border-border space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <span className="font-medium text-sm">Insights</span>
                </div>
                {pageInsights.slice(0, 3).map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            )}
            
            {/* Chat Section */}
            <div className="flex-1 flex flex-col min-h-0">
              <ChatContent />
            </div>
          </CardContent>
        </Card>
      </div>
    </Fragment>
  );
}

// Smart Help Button Component for contextual help
export function SmartHelpButton({ 
  field, 
  context, 
  className = "" 
}: { 
  field: string; 
  context?: any; 
  className?: string; 
}) {
  const ai = useAI();
  
  const handleHelp = () => {
    const helpText = ai.getHelpForField(field, context);
    ai.sendMessage(`Help me understand: ${field}`, { field, context, helpText });
    ai.setChatOpen(true);
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleHelp}
      className={`h-auto p-1 text-muted-foreground hover:text-foreground ${className}`}
    >
      <HelpCircle className="w-4 h-4" />
    </Button>
  );
}

// Proactive Help Notification
export function ProactiveHelpNotification() {
  const ai = useAI();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const checkProactiveHelp = () => {
      if (ai.shouldShowProactiveHelp() && ai.currentInsights.length > 0) {
        setShow(true);
      }
    };

    const interval = setInterval(checkProactiveHelp, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [ai]);

  if (!show || !ai.enableProactiveMode) return null;

  const highPriorityInsights = ai.currentInsights.filter(insight => insight.priority <= 2);

  return (
    <Card className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-96 shadow-xl border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="w-4 h-4 text-primary" />
            I noticed you might need help
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShow(false)}
            className="h-auto p-1"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          You've been away for a while. Here are some things that might need your attention:
        </p>
        
        {highPriorityInsights.slice(0, 2).map((insight) => (
          <Alert key={insight.id} className="py-2">
            <div className="flex items-start gap-2">
              {getInsightIcon(insight.type)}
              <div className="flex-1">
                <p className="text-sm font-medium">{insight.title}</p>
                <p className="text-xs text-muted-foreground">{insight.description}</p>
              </div>
            </div>
          </Alert>
        ))}
        
        <div className="flex gap-2 pt-2">
          <Button
            size="sm"
            onClick={() => {
              ai.setChatOpen(true);
              setShow(false);
            }}
            className="flex-1"
          >
            Get Help
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShow(false)}
            className="flex-1"
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}