import { Fragment } from 'react';
import React, { useState, useRef, useEffect } from 'react';
import { Send, Mail, MessageCircle, Phone, Paperclip, Filter, Search, MoreVertical, Star, Archive, Reply, Forward, ChevronDown, ChevronUp, X, Calendar, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Separator } from './ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { useIsMobile } from './ui/use-mobile';

interface Message {
  id: string;
  type: 'email' | 'chat' | 'sms';
  from: string;
  fromEmail?: string;
  avatar?: string;
  subject?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  attachments?: string[];
  threadId?: string;
  priority: 'high' | 'medium' | 'low';
}

interface Contact {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  email: string;
  phone?: string;
  isOnline: boolean;
}

const mockMessages: Message[] = [
  {
    id: '1',
    type: 'email',
    from: 'Jennifer Martinez',
    fromEmail: 'j.martinez@realtygroup.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b601?w=32&h=32&fit=crop&crop=face',
    subject: 'Final Walkthrough Scheduled',
    content: 'Hi Sarah!\n\nGreat news - I\'ve scheduled your final walkthrough for January 30th at 2 PM. The seller has completed all the agreed-upon repairs, and everything looks fantastic.\n\nI\'ll send you a detailed checklist tomorrow to review beforehand so you know exactly what to look for during the walkthrough. This will include:\n\n• Checking that all agreed-upon repairs have been completed\n• Verifying all systems are working (lights, plumbing, HVAC)\n• Ensuring the property is in the same condition as when you made your offer\n• Confirming any included appliances are present and functioning\n\nPlease let me know if this time works for you. If you need to reschedule, we have some flexibility, but we want to make sure we complete this at least 24 hours before closing.\n\nLooking forward to getting you those keys!\n\nBest regards,\nJennifer Martinez\nSenior Real Estate Agent\nRealty Group Properties\n\nP.S. I\'ve also attached the walkthrough checklist for your reference. Please review it before our appointment so you know what to expect and what to look for during the inspection.',
    timestamp: '2025-01-14T10:30:00Z',
    isRead: false,
    isStarred: true,
    priority: 'high',
    threadId: 'thread-1'
  },
  {
    id: '2',
    type: 'email',
    from: 'David Chen',
    fromEmail: 'd.chen@titlefirst.com',
    subject: 'Title Search Complete - Clean Title Confirmed',
    content: 'Dear Sarah,\n\nI\'m pleased to inform you that we\'ve completed the title search for 123 Oak Street, and I have excellent news to share.\n\nThe title is completely clean with no liens, encumbrances, or any other issues that would prevent a smooth closing. This means:\n\n• No outstanding mortgages or loans against the property\n• No tax liens or government claims\n• No easement disputes or boundary issues\n• Clear chain of ownership going back 60 years\n\nWe\'re now preparing your settlement statement and will have it ready for your review by January 28th. This will include:\n\n• Final closing costs breakdown\n• Pro-rated taxes and HOA fees\n• Title insurance premium\n• Recording fees\n\nIf you have any questions about the title report or need any clarification on the closing process, please don\'t hesitate to reach out. My team and I are here to ensure everything goes smoothly.\n\nBest regards,\nDavid Chen\nTitle Agent\nFirst Title Company',
    timestamp: '2025-01-14T09:15:00Z',
    isRead: true,
    isStarred: false,
    priority: 'medium',
    threadId: 'thread-2'
  },
  {
    id: '3',
    type: 'chat',
    from: 'Mike Thompson',
    fromEmail: 'm.thompson@firstnational.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    content: 'Hi Sarah! Just wanted to give you a quick update on your mortgage application. We received all your financial documents and everything looks great. The underwriter is reviewing now and we should have approval by Thursday. Appraisal is scheduled for Friday at 10 AM.',
    timestamp: '2025-01-14T08:45:00Z',
    isRead: true,
    isStarred: false,
    priority: 'high'
  },
  {
    id: '4',
    type: 'email',
    from: 'Rebecca Stone',
    fromEmail: 'r.stone@stonelaw.com',
    subject: 'Contract Review Complete - Action Required',
    content: 'Dear Sarah,\n\nI\'ve completed my comprehensive review of your purchase contract and all associated riders. Overall, the terms are very favorable and well-structured for your protection.\n\nHowever, I have a few minor recommendations for clarification that I\'d like to discuss with you:\n\n1. Inspection contingency timeline - I recommend we clarify the specific hours for the 5-day period\n2. Financing contingency - Small wording adjustment to strengthen your position\n3. Seller disclosure addendum - One item needs clarification regarding the HVAC system\n\nCan we schedule a brief 15-minute call tomorrow afternoon to go over these points? I want to ensure you\'re fully informed before we proceed.\n\nI\'ve also prepared a detailed summary document that breaks down all the contract terms in plain language. I\'ll send that separately after our call.\n\nPlease let me know your availability for tomorrow afternoon.\n\nBest regards,\nRebecca Stone\nReal Estate Attorney\nStone Law Firm',
    timestamp: '2025-01-13T16:20:00Z',
    isRead: true,
    isStarred: true,
    priority: 'high',
    attachments: ['Contract_Review_Summary.pdf'],
    threadId: 'thread-3'
  },
  {
    id: '5',
    type: 'sms',
    from: 'Jennifer Martinez',
    content: 'Quick reminder: home inspection is tomorrow at 9 AM. Inspector will meet you at the property. Should take about 2-3 hours. Let me know if you need anything!',
    timestamp: '2025-01-13T18:30:00Z',
    isRead: true,
    isStarred: false,
    priority: 'medium'
  },
  {
    id: '6',
    type: 'email',
    from: 'Alex Rivera',
    fromEmail: 'a.rivera@premiuminsure.com',
    subject: 'Homeowner\'s Insurance Quote Ready',
    content: 'Hello Sarah,\n\nThank you for your interest in our homeowner\'s insurance coverage. I\'ve prepared a comprehensive quote for your new home at 123 Oak Street.\n\nQuote Summary:\n• Annual Premium: $1,240\n• Deductible: $1,000\n• Dwelling Coverage: $675,000\n• Personal Property: $337,500\n• Liability: $300,000\n• Additional Living Expenses: $135,000\n\nThis quote includes excellent coverage options and competitive rates. Some key features:\n\n• Replacement cost coverage for your home and belongings\n• Protection against all standard perils\n• 24/7 claims service\n• Discount for security system (if applicable)\n\nThe quote is valid for 30 days, and we can lock in this rate once you\'re ready to proceed. I\'ve attached the full policy details for your review.\n\nI\'m available to discuss any questions you might have about the coverage or to adjust the policy limits if needed.\n\nBest regards,\nAlex Rivera\nInsurance Agent\nPremium Insurance Services',
    timestamp: '2025-01-13T14:10:00Z',
    isRead: false,
    isStarred: false,
    priority: 'medium',
    attachments: ['Insurance_Quote_OakSt.pdf'],
    threadId: 'thread-4'
  },
  {
    id: '7',
    type: 'chat',
    from: 'David Chen',
    content: 'Just wanted to confirm - we\'ll need your wire transfer information by January 29th for the closing funds. The exact amount will be in your settlement statement. Would you prefer to wire or bring a cashier\'s check?',
    timestamp: '2025-01-13T11:30:00Z',
    isRead: true,
    isStarred: false,
    priority: 'high'
  }
];

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Jennifer Martinez',
    role: 'Real Estate Agent',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b601?w=32&h=32&fit=crop&crop=face',
    email: 'j.martinez@realtygroup.com',
    phone: '(555) 123-4567',
    isOnline: true
  },
  {
    id: '2',
    name: 'Mike Thompson',
    role: 'Mortgage Lender',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
    email: 'm.thompson@firstnational.com',
    phone: '(555) 234-5678',
    isOnline: true
  },
  {
    id: '3',
    name: 'Rebecca Stone',
    role: 'Real Estate Attorney',
    email: 'r.stone@stonelaw.com',
    phone: '(555) 345-6789',
    isOnline: false
  },
  {
    id: '4',
    name: 'David Chen',
    role: 'Title Agent',
    email: 'd.chen@titlefirst.com',
    phone: '(555) 456-7890',
    isOnline: false
  },
  {
    id: '5',
    name: 'Alex Rivera',
    role: 'Insurance Agent',
    email: 'a.rivera@premiuminsure.com',
    phone: '(555) 567-8901',
    isOnline: true
  }
];

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
  
  if (diffInHours < 1) {
    return `${Math.floor(diffInHours * 60)} minutes ago`;
  } else if (diffInHours < 24) {
    return `${Math.floor(diffInHours)} hours ago`;
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString();
  }
};

const formatFullTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'email':
      return <Mail className="w-4 h-4" />;
    case 'chat':
      return <MessageCircle className="w-4 h-4" />;
    case 'sms':
      return <Phone className="w-4 h-4" />;
    default:
      return <MessageCircle className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'email':
      return 'bg-blue-100 text-blue-800';
    case 'chat':
      return 'bg-green-100 text-green-800';
    case 'sms':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-red-500';
    case 'medium':
      return 'border-l-yellow-500';
    case 'low':
      return 'border-l-green-500';
    default:
      return 'border-l-gray-300';
  }
};

// Custom smooth scroll utility
const smoothScrollTo = (element: HTMLElement, target: number) => {
  const start = element.scrollTop;
  const distance = target - start;
  const duration = 500; // 500ms
  let startTime: number;

  function animation(currentTime: number) {
    if (startTime === undefined) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const progress = Math.min(timeElapsed / duration, 1);
    
    // Easing function (ease-in-out)
    const easeInOut = progress < 0.5 
      ? 2 * progress * progress 
      : -1 + (4 - 2 * progress) * progress;
    
    element.scrollTop = start + distance * easeInOut;
    
    if (timeElapsed < duration) {
      requestAnimationFrame(animation);
    }
  }
  
  requestAnimationFrame(animation);
};

const MessageModal = ({ 
  message, 
  isOpen, 
  onClose,
  onReply 
}: { 
  message: Message | null;
  isOpen: boolean;
  onClose: () => void;
  onReply: (message: Message, reply: string) => void;
}) => {
  const [replyText, setReplyText] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Auto-scroll when reply opens
  useEffect(() => {
    if (isReplying && scrollContainerRef.current) {
      setTimeout(() => {
        if (scrollContainerRef.current) {
          smoothScrollTo(scrollContainerRef.current, scrollContainerRef.current.scrollHeight);
        }
      }, 100);
    }
  }, [isReplying]);

  const handleReply = () => {
    if (replyText.trim() && message) {
      onReply(message, replyText);
      setReplyText('');
      setIsReplying(false);
    }
  };

  // Custom scroll handler for smooth scrolling
  const handleScroll = (direction: 'up' | 'down') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientHeight * 0.8; // Scroll 80% of container height
      const targetScroll = direction === 'down' 
        ? container.scrollTop + scrollAmount 
        : container.scrollTop - scrollAmount;
      
      smoothScrollTo(container, Math.max(0, targetScroll));
    }
  };

  if (!message) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-screen h-screen max-w-none p-0 gap-0 m-0 rounded-none border-0' : 'w-screen h-screen max-w-none p-0 gap-0 m-0 rounded-none border-0'} dialog-content bg-white`}>
        <DialogHeader className="sr-only">
          <DialogTitle>
            {message.subject || `${message.type} from ${message.from}`}
          </DialogTitle>
          <DialogDescription>
            View and reply to message from {message.from}
          </DialogDescription>
        </DialogHeader>
        
        <div className="h-full flex bg-white">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Header - Fixed */}
            <div className={`flex-shrink-0 ${isMobile ? 'px-4 py-4' : 'px-12 py-8'} border-b border-gray-200 bg-white`}>
              <div className={`${isMobile ? '' : 'max-w-4xl mx-auto'}`}>
                <div className={`flex items-start justify-between ${isMobile ? 'mb-3' : 'mb-6'}`}>
                  <div className={`flex items-start ${isMobile ? 'gap-3' : 'gap-6'}`}>
                    <Avatar className={`${isMobile ? 'w-10 h-10' : 'w-16 h-16'}`}>
                      {message.avatar ? (
                        <AvatarImage src={message.avatar} alt={message.from} />
                      ) : (
                        <AvatarFallback className={`${isMobile ? 'text-sm' : 'text-lg'}`}>{message.from.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      )}
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className={`flex items-center gap-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
                        <h3 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-semibold text-gray-900 truncate`}>{message.from}</h3>
                        <Badge variant="outline" className={`${isMobile ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'} ${getTypeColor(message.type)}`}>
                          {getTypeIcon(message.type)}
                          <span className={`${isMobile ? 'ml-1' : 'ml-2'} capitalize ${isMobile ? 'hidden sm:inline' : ''}`}>{message.type}</span>
                        </Badge>
                        {message.priority === 'high' && (
                          <Badge variant="outline" className={`${isMobile ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'} bg-red-100 text-red-800`}>
                            {isMobile ? 'High' : 'High Priority'}
                          </Badge>
                        )}
                      </div>
                      <p className={`${isMobile ? 'text-sm' : 'text-lg'} text-gray-600 mb-1 truncate`}>{message.fromEmail || message.from}</p>
                      <div className={`flex items-center gap-2 ${isMobile ? 'text-xs' : 'text-base'} text-gray-500`}>
                        <Clock className={`${isMobile ? 'w-3 h-3' : 'w-5 h-5'}`} />
                        <span className="truncate">{isMobile ? formatTimestamp(message.timestamp) : formatFullTimestamp(message.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-3'} flex-shrink-0`}>
                    {message.isStarred && (
                      <Star className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-yellow-500 fill-current`} />
                    )}
                    {!isMobile && (
                      <Fragment>
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={() => handleScroll('up')}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ChevronUp className="w-5 h-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="lg"
                          onClick={() => handleScroll('down')}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          <ChevronDown className="w-5 h-5" />
                        </Button>
                      </Fragment>
                    )}
                    <Button
                      variant="ghost"
                      size={isMobile ? "sm" : "lg"}
                      onClick={onClose}
                      className="text-gray-500 hover:text-gray-700 mobile-button-sm"
                    >
                      <X className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    </Button>
                  </div>
                </div>
                
                {message.subject && (
                  <div className={`${isMobile ? '' : 'max-w-4xl'}`}>
                    <h2 className={`${isMobile ? 'text-xl' : 'text-3xl'} font-semibold text-gray-900 leading-tight`}>{message.subject}</h2>
                  </div>
                )}
              </div>
            </div>

            {/* Scrollable Content Area */}
            <div 
              ref={scrollContainerRef}
              className={`flex-1 overflow-y-auto min-h-0 modal-scroll ${isMobile ? 'px-4 py-4' : 'px-12 py-8'}`}
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className={`${isMobile ? '' : 'max-w-4xl mx-auto'} space-y-6`}>
                {/* Message Content */}
                <div className="prose prose-lg max-w-none">
                  <div className={`whitespace-pre-wrap ${isMobile ? 'text-base' : 'text-lg'} leading-relaxed text-gray-800 font-normal`}>
                    {message.content}
                  </div>
                </div>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className={`${isMobile ? 'p-4' : 'p-6'} bg-gray-50 rounded-xl border border-gray-200`}>
                    <h4 className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold ${isMobile ? 'mb-3' : 'mb-4'} text-gray-700`}>
                      Attachments ({message.attachments.length})
                    </h4>
                    <div className={`flex flex-wrap ${isMobile ? 'gap-2' : 'gap-3'}`}>
                      {message.attachments.map((attachment, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size={isMobile ? "sm" : "lg"}
                          className={`flex items-center gap-2 hover:bg-gray-100 ${isMobile ? 'text-sm px-3 py-2' : 'text-base px-4 py-3'} mobile-button-sm`}
                          onClick={() => {
                            // Create a temporary link to download the attachment
                            const link = document.createElement('a');
                            link.href = '#'; // In a real app, this would be the file URL
                            link.download = attachment;
                            link.click();

                            // Show download notification
                            alert(`Downloading ${attachment}...`);
                          }}
                        >
                          <Paperclip className={`${isMobile ? 'w-3 h-3' : 'w-5 h-5'}`} />
                          <span className="truncate max-w-[120px]">{attachment}</span>
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Section - Inline when replying */}
                {isReplying && (
                  <div className={`${isMobile ? 'mt-6 p-4' : 'mt-12 p-8'} bg-gray-50 rounded-xl border border-gray-200`}>
                    <div className={`space-y-${isMobile ? '4' : '6'}`}>
                      <div className="flex items-center gap-3">
                        <span className={`${isMobile ? 'text-base' : 'text-lg'} font-semibold text-gray-700`}>Reply to:</span>
                        <span className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-600 truncate`}>{message.from}</span>
                      </div>
                      <Textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Type your reply..."
                        rows={isMobile ? 8 : 12}
                        className={`resize-none ${isMobile ? 'min-h-[200px] text-base' : 'min-h-[300px] text-lg'} bg-white leading-relaxed mobile-input`}
                        style={{ scrollBehavior: 'smooth', fontSize: isMobile ? '16px' : '18px', lineHeight: '1.6' }}
                      />
                      <div className={`flex ${isMobile ? 'flex-col gap-3' : 'items-center justify-between'}`}>
                        <Button
                          variant="outline"
                          size={isMobile ? "default" : "lg"}
                          onClick={() => {
                            // Create file input for attachment
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.multiple = true;
                            input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                            input.onchange = (e) => {
                              const files = (e.target as HTMLInputElement).files;
                              if (files && files.length > 0) {
                                const fileNames = Array.from(files).map(f => f.name).join(', ');
                                alert(`Selected files: ${fileNames}`);
                                // In a real app, files would be uploaded to server
                              }
                            };
                            input.click();
                          }}
                          className={`${isMobile ? 'w-full text-base' : 'text-base'} mobile-button`}
                        >
                          <Paperclip className={`${isMobile ? 'w-4 h-4 mr-2' : 'w-5 h-5 mr-3'}`} />
                          Attach File
                        </Button>
                        <div className={`flex ${isMobile ? 'w-full' : ''} gap-3`}>
                          <Button
                            variant="outline"
                            size={isMobile ? "default" : "lg"}
                            onClick={() => {
                              setIsReplying(false);
                              setReplyText('');
                            }}
                            className={`${isMobile ? 'flex-1 text-base' : 'text-base px-6'} mobile-button`}
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={handleReply}
                            disabled={!replyText.trim()}
                            size={isMobile ? "default" : "lg"}
                            className={`${isMobile ? 'flex-1 text-base' : 'text-base px-6'} mobile-button`}
                          >
                            <Send className={`${isMobile ? 'w-4 h-4 mr-2' : 'w-5 h-5 mr-3'}`} />
                            Send Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className={`flex-shrink-0 border-t border-gray-200 bg-gray-50 ${isMobile ? 'px-4 py-3' : 'px-12 py-6'}`}>
              <div className={`${isMobile ? '' : 'max-w-4xl mx-auto'}`}>
                <div className={`flex ${isMobile ? 'flex-wrap gap-2' : 'items-center gap-4'}`}>
                  <Button
                    onClick={() => setIsReplying(true)}
                    className={`flex items-center gap-2 ${isMobile ? 'text-sm px-4 py-2' : 'text-base px-6 py-3'} mobile-button-sm`}
                    size={isMobile ? "sm" : "lg"}
                    disabled={isReplying}
                  >
                    <Reply className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    Reply
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Open compose modal with forwarded message content
                      const forwardSubject = `Fwd: ${message.subject || 'Message from ' + message.from}`;
                      const forwardContent = `\n\n--- Forwarded Message ---\nFrom: ${message.from}\nDate: ${message.timestamp}\nSubject: ${message.subject || 'No Subject'}\n\n${message.content}`;

                      // In a real app, this would open compose modal with pre-filled content
                      if (confirm('Forward this message?')) {
                        alert('Forward functionality would open compose window with pre-filled content');
                      }
                    }}
                    className={`flex items-center gap-2 ${isMobile ? 'text-sm px-4 py-2' : 'text-base px-6 py-3'} mobile-button-sm`}
                    size={isMobile ? "sm" : "lg"}
                  >
                    <Forward className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    Forward
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Archive the message
                      if (confirm(`Archive message from ${message.from}?`)) {
                        alert('Message archived successfully!');
                        onClose(); // Close the message modal
                        // In a real app, this would call API to archive message
                      }
                    }}
                    className={`flex items-center gap-2 ${isMobile ? 'text-sm px-4 py-2' : 'text-base px-6 py-3'} mobile-button-sm`}
                    size={isMobile ? "sm" : "lg"}
                  >
                    <Archive className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
                    Archive
                  </Button>
                  {!isMobile && (
                    <Button
                      variant="outline"
                      onClick={() => handleScroll('up')}
                      className="flex items-center gap-3 ml-auto text-base px-6 py-3"
                      size="lg"
                    >
                      <ChevronUp className="w-5 h-5" />
                      Scroll to Top
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MessageItem = ({ message, onClick }: { message: Message; onClick: () => void }) => {
  const isMobile = useIsMobile();
  
  return (
    <div 
      className={`${isMobile ? 'p-3' : 'p-4'} border-l-4 hover:bg-gray-50 cursor-pointer transition-colors ${
        getPriorityColor(message.priority)
      } ${!message.isRead ? 'bg-blue-50/30' : ''}`}
      onClick={onClick}
    >
      <div className={`flex items-start ${isMobile ? 'gap-2' : 'gap-3'}`}>
        <Avatar className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} flex-shrink-0`}>
          {message.avatar ? (
            <AvatarImage src={message.avatar} alt={message.from} />
          ) : (
            <AvatarFallback className={isMobile ? 'text-xs' : 'text-sm'}>{message.from.split(' ').map(n => n[0]).join('')}</AvatarFallback>
          )}
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className={`flex items-center gap-1 ${isMobile ? 'mb-1' : 'mb-1'}`}>
            <span className={`${isMobile ? 'text-sm' : 'font-medium'} ${!message.isRead ? 'text-blue-600' : 'text-gray-900'} truncate`}>
              {message.from}
            </span>
            <Badge variant="outline" className={`${isMobile ? 'text-xs px-1' : 'text-xs'} ${getTypeColor(message.type)} flex-shrink-0`}>
              {getTypeIcon(message.type)}
              <span className={`${isMobile ? 'hidden' : 'ml-1'}`}>{message.type}</span>
            </Badge>
            {message.priority === 'high' && (
              <Badge variant="outline" className={`${isMobile ? 'text-xs px-1' : 'text-xs'} bg-red-100 text-red-800 flex-shrink-0`}>
                {isMobile ? 'H' : 'High Priority'}
              </Badge>
            )}
          </div>
          
          {message.subject && (
            <h4 className={`${isMobile ? 'text-sm' : 'font-medium text-sm'} ${isMobile ? 'mb-1' : 'mb-1'} ${!message.isRead ? 'text-gray-900' : 'text-gray-700'} line-clamp-1`}>
              {message.subject}
            </h4>
          )}
          
          <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 line-clamp-2 ${isMobile ? 'mb-1' : 'mb-2'}`}>
            {message.content}
          </p>
          
          <div className="flex items-center justify-between">
            <div className={`flex items-center ${isMobile ? 'gap-1' : 'gap-2'} ${isMobile ? 'text-xs' : 'text-xs'} text-gray-500`}>
              <span className="truncate">{formatTimestamp(message.timestamp)}</span>
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Paperclip className={`${isMobile ? 'w-2 h-2' : 'w-3 h-3'}`} />
                  <span>{message.attachments.length}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              {message.isStarred && (
                <Star className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-yellow-500 fill-current`} />
              )}
              {!message.isRead && (
                <div className={`${isMobile ? 'w-1.5 h-1.5' : 'w-2 h-2'} bg-blue-500 rounded-full`}></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContactItem = ({ contact, onMessage }: { contact: Contact; onMessage: (contact: Contact) => void }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className={`${isMobile ? 'p-2' : 'p-3'} hover:bg-gray-50 cursor-pointer transition-colors`}>
      <div className={`flex items-center ${isMobile ? 'gap-2' : 'gap-3'}`}>
        <div className="relative">
          <Avatar className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'}`}>
            {contact.avatar ? (
              <AvatarImage src={contact.avatar} alt={contact.name} />
            ) : (
              <AvatarFallback className={isMobile ? 'text-xs' : 'text-sm'}>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            )}
          </Avatar>
          {contact.isOnline && (
            <div className={`absolute -bottom-0.5 -right-0.5 ${isMobile ? 'w-2 h-2' : 'w-3 h-3'} bg-green-500 rounded-full border-2 border-white`}></div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className={`${isMobile ? 'text-sm' : 'font-medium text-sm'} truncate`}>{contact.name}</p>
              <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 truncate`}>{contact.role}</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMessage(contact)}
              className={`${isMobile ? 'text-xs px-2 py-1' : 'text-xs'} flex-shrink-0 mobile-button-sm`}
            >
              Message
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ComposeModal = ({ isOpen, onClose, recipient }: { 
  isOpen: boolean; 
  onClose: () => void; 
  recipient?: Contact; 
}) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const isMobile = useIsMobile();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`${isMobile ? 'w-screen h-screen max-w-none p-0 gap-0 m-0 rounded-none border-0' : 'max-w-2xl'} dialog-content bg-white shadow-xl border border-gray-200`}>
        <DialogHeader className={`${isMobile ? 'p-4 border-b' : 'p-6'}`}>
          <DialogTitle className={`${isMobile ? 'text-lg' : 'text-xl'}`}>
            New Message{recipient ? ` to ${recipient.name}` : ''}
          </DialogTitle>
          <DialogDescription className={isMobile ? 'text-sm' : ''}>
            Compose a new message to your team
          </DialogDescription>
        </DialogHeader>
        
        <div className={`${isMobile ? 'flex-1 p-4' : 'p-6 pt-0'} space-y-4`}>
          <div>
            <label className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium mb-2 block`}>To</label>
            <Input
              placeholder="Select recipient..."
              value={recipient?.name || ''}
              readOnly={!!recipient}
              className={`${isMobile ? 'mobile-input' : ''}`}
            />
          </div>
          
          <div>
            <label className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium mb-2 block`}>Subject</label>
            <Input
              placeholder="Enter subject..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={`${isMobile ? 'mobile-input' : ''}`}
            />
          </div>
          
          <div>
            <label className={`${isMobile ? 'text-sm' : 'text-sm'} font-medium mb-2 block`}>Message</label>
            <Textarea
              placeholder="Type your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={isMobile ? 10 : 12}
              className={`resize-none ${isMobile ? 'mobile-input' : ''}`}
            />
          </div>
          
          <div className={`flex ${isMobile ? 'flex-col gap-3' : 'justify-between items-center'}`}>
            <Button
              variant="outline"
              onClick={() => {
                // Create file input for attachment
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = '.pdf,.doc,.docx,.jpg,.jpeg,.png';
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files && files.length > 0) {
                    const fileNames = Array.from(files).map(f => f.name).join(', ');
                    alert(`Selected files for attachment: ${fileNames}`);
                    // In a real app, files would be uploaded and attached to message
                  }
                };
                input.click();
              }}
              className={`${isMobile ? 'w-full mobile-button' : ''}`}
            >
              <Paperclip className="w-4 h-4 mr-2" />
              Attach File
            </Button>
            
            <div className={`flex gap-3 ${isMobile ? 'w-full' : ''}`}>
              <Button
                variant="outline"
                onClick={onClose}
                className={`${isMobile ? 'flex-1 mobile-button' : ''}`}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Validate message content
                  if (!content.trim()) {
                    alert('Please enter a message before sending.');
                    return;
                  }

                  // Simulate sending message
                  const messageData = {
                    to: recipient?.email || recipient?.name,
                    subject: subject || 'No Subject',
                    content: content.trim(),
                    timestamp: new Date().toISOString()
                  };

                  // In a real app, this would call an API to send the message
                  alert(`Message sent successfully to ${recipient?.name || 'recipient'}!`);

                  onClose();
                }}
                disabled={!content.trim()}
                className={`${isMobile ? 'flex-1 mobile-button' : ''}`}
              >
                <Send className="w-4 h-4 mr-2" />
                Send
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function Communications() {
  const [messages, setMessages] = useState(mockMessages);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showCompose, setShowCompose] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('messages');
  const isMobile = useIsMobile();

  const filteredMessages = messages.filter(message =>
    message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter(msg => !msg.isRead).length;

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    // Mark as read
    setMessages(prev => prev.map(msg => 
      msg.id === message.id ? { ...msg, isRead: true } : msg
    ));
  };

  const handleReply = (message: Message, replyText: string) => {
    // Simulate sending reply
    if (!replyText.trim()) {
      alert('Please enter a reply message.');
      return;
    }

    // In a real app, this would call an API to send the reply
    alert(`Reply sent to ${message.from}!`);

    // Add the reply to the conversation (in a real app, this would come from the server)
    const newReply = {
      id: Date.now().toString(),
      type: message.type as 'email' | 'chat' | 'sms',
      from: 'You',
      fromEmail: 'you@handoff.com',
      content: replyText,
      timestamp: new Date().toISOString(),
      isRead: true,
      isStarred: false,
      priority: 'medium' as const,
      threadId: message.threadId
    };

    setMessages(prev => [newReply, ...prev]);
    setSelectedMessage(null);
  };

  const handleContactMessage = (contact: Contact) => {
    setSelectedContact(contact);
    setShowCompose(true);
  };

  const handleNewMessage = () => {
    setSelectedContact(undefined);
    setShowCompose(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication Suite</h2>
          <p className="text-gray-600 mt-1">
            Messages, notifications, and team collaboration tools
          </p>
        </div>
        <Button
          onClick={handleNewMessage}
          className={`${isMobile ? 'text-sm px-3 py-2' : ''} mobile-button-sm`}
          size={isMobile ? "sm" : "default"}
        >
          <Send className={`${isMobile ? 'w-4 h-4 mr-1' : 'w-4 h-4 mr-2'}`} />
          {isMobile ? 'New' : 'New Message'}
        </Button>
      </div>

      <Card className="h-full">
      <CardHeader className={`${isMobile ? 'p-4 pb-3' : 'pb-4'}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className={`${isMobile ? 'text-lg' : 'text-xl'} flex items-center gap-2`}>
              <MessageCircle className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
              <span className="font-medium">Messages</span>
              {unreadCount > 0 && (
                <Badge className={`${isMobile ? 'text-xs' : ''}`}>{unreadCount} new</Badge>
              )}
            </div>
            <p className={`${isMobile ? 'text-sm' : ''} text-black`}>
              Secure chat, email, SMS, and file sharing in one place
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={`${isMobile ? 'p-4 pt-0' : 'pt-0'}`}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full bg-transparent h-auto p-0 border-b border-gray-200 rounded-none flex justify-start overflow-x-auto">
            <TabsTrigger
              value="messages"
              className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
            >
              Messages {unreadCount > 0 && `(${unreadCount})`}
            </TabsTrigger>
            {!isMobile && (
              <Fragment>
                <TabsTrigger
                  value="inbox"
                  className="bg-transparent text-gray-600 hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none border-b-2 border-transparent pb-3 px-6 font-medium transition-all duration-200 whitespace-nowrap"
                >
                  Inbox
                </TabsTrigger>
              </Fragment>
            )}
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                <Input
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-10 ${isMobile ? 'mobile-input' : ''}`}
                />
              </div>
              <Button
                variant="outline"
                size={isMobile ? "sm" : "default"}
                className={`${isMobile ? 'mobile-button-sm' : ''}`}
                onClick={() => {
                  // Open filter modal or dropdown
                  alert('Filter options: Unread, Starred, By Sender, By Date Range');
                  // In a real app, this would open filter UI
                }}
              >
                <Filter className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'}`} />
                {!isMobile && <span className="ml-2">Filter</span>}
              </Button>
            </div>

            {/* Messages List */}
            <ScrollArea className={`${isMobile ? 'h-[400px]' : 'h-[500px]'} border rounded-lg`}>
              <div className="divide-y">
                {filteredMessages.map((message) => (
                  <MessageItem
                    key={message.id}
                    message={message}
                    onClick={() => handleMessageClick(message)}
                  />
                ))}
              </div>
            </ScrollArea>
          </TabsContent>


          {!isMobile && (
            <Fragment>
              <TabsContent value="inbox" className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search inbox..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Open filter modal or dropdown for inbox
                      alert('Inbox filter options: All, Important, Sent, Drafts');
                      // In a real app, this would open filter UI
                    }}
                  >
                    <Filter className="w-4 h-4" />
                    <span className="ml-2">Filter</span>
                  </Button>
                </div>
                <ScrollArea className="h-[500px] border rounded-lg">
                  <div className="divide-y">
                    {filteredMessages.map((message) => (
                      <MessageItem
                        key={message.id}
                        message={message}
                        onClick={() => handleMessageClick(message)}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="chat" className="space-y-4">
                <div className="p-4 border rounded-lg text-sm text-muted-foreground">
                  Real-time chat is coming soon. You’ll be able to start direct and group chats with your team.
                </div>
              </TabsContent>


            </Fragment>
          )}
        </Tabs>
      </CardContent>

      {/* Message Modal */}
      <MessageModal
        message={selectedMessage}
        isOpen={!!selectedMessage}
        onClose={() => setSelectedMessage(null)}
        onReply={handleReply}
      />

      {/* Compose Modal */}
      <ComposeModal
        isOpen={showCompose}
        onClose={() => {
          setShowCompose(false);
          setSelectedContact(undefined);
        }}
        recipient={selectedContact}
      />
    </Card>
    </div>
  );
}
