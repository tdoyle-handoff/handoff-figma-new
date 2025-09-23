import React, { useState, useEffect, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { ComprehensivePropertyDetails } from './ComprehensivePropertyDetails';
import { useIsMobile } from './ui/use-mobile';
import { 
  Home, 
  ArrowLeft,
  Download,
  Share2,
  Printer,
  BarChart3,
  FileText,
  Info
} from 'lucide-react';

interface ComprehensivePropertyAnalysisProps {
  onNavigate?: (page: string) => void;
  initialAttomId?: string;
  initialAddress?: string;
}

export function ComprehensivePropertyAnalysis({ 
  onNavigate,
  initialAttomId,
  initialAddress
}: ComprehensivePropertyAnalysisProps) {
  const isMobile = useIsMobile();
  const [propertyData, setPropertyData] = useState<any>(null);
  const [reportGenerated, setReportGenerated] = useState(false);
  const NOTES_KEY = 'handoff-comprehensive-property-notes';
  const propertyKey = initialAttomId || initialAddress || 'default-report';
  const [reportNotes, setReportNotes] = useState<string>('');
  const { userProfile, isGuestMode, updateUserProfile } = require('../hooks/useAuth').useAuth();
  const notesTimerRef = useRef<number | null>(null);

  // Load any saved property data
  useEffect(() => {
    try {
      const savedData = localStorage.getItem('handoff-comprehensive-property-data');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        setPropertyData(parsed.data);
      }
    } catch (error) {
      console.warn('Failed to load saved property data:', error);
    }
    // Load report notes
    try {
      const raw = localStorage.getItem(NOTES_KEY);
      const all = raw ? JSON.parse(raw) : {};
      if (all[propertyKey] && typeof all[propertyKey].notes === 'string') {
        setReportNotes(all[propertyKey].notes);
      }
    } catch {}
  }, []);

  // Sync notes to user profile (debounced)
  useEffect(() => {
    if (notesTimerRef.current) window.clearTimeout(notesTimerRef.current);
    notesTimerRef.current = window.setTimeout(async () => {
      try {
        if (userProfile && !isGuestMode && typeof updateUserProfile === 'function') {
          const currentPrefs = (userProfile as any)?.preferences || {};
          const prev = (currentPrefs.comprehensivePropertyNotes || {}) as Record<string, any>;
          const next = { ...prev, [propertyKey]: reportNotes };
          await updateUserProfile({ preferences: { ...currentPrefs, comprehensivePropertyNotes: next } as any });
        }
      } catch (e) {
        console.warn('Failed to sync comprehensive analysis notes to profile:', e);
      }
    }, 800) as unknown as number;
    return () => { if (notesTimerRef.current) window.clearTimeout(notesTimerRef.current); };
  }, [reportNotes, propertyKey, userProfile, isGuestMode, updateUserProfile]);

  const handlePropertyFound = (data: any) => {
    setPropertyData(data);
    setReportGenerated(true);

    // Persist analysis snapshot for reloads
    try {
      localStorage.setItem('handoff-comprehensive-property-data', JSON.stringify({
        data,
        timestamp: new Date().toISOString(),
      }));
    } catch (e) {
      console.warn('Failed to save comprehensive property data:', e);
    }
    
    // Auto-scroll to results on mobile
    if (isMobile) {
      setTimeout(() => {
        window.scrollTo({ top: 400, behavior: 'smooth' });
      }, 500);
    }
  };

  const handleExportReport = () => {
    if (!propertyData) return;
    
    // Create a basic JSON export of the property data
    const reportData = {
      generatedAt: new Date().toISOString(),
      propertyData,
      reportType: 'Comprehensive Property Analysis',
      source: 'Handoff Real Estate Platform'
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `property-analysis-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleShareReport = async () => {
    if (navigator.share && propertyData) {
      try {
        await navigator.share({
          title: 'Property Analysis Report',
          text: 'Comprehensive property analysis from Handoff',
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Report URL copied to clipboard!');
    }
  };

  return (
    <div className={`space-y-6 ${isMobile ? 'page-content-mobile' : 'page-content'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onNavigate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('property')}
              className={isMobile ? 'mobile-button' : ''}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-semibold flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              Property Analysis Report
            </h1>
            <p className="text-muted-foreground">
              Comprehensive property data from multiple Attom API sources
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        {reportGenerated && (
          <div className="flex items-center gap-2">
            <Button
              variant="action-download"
              size="sm"
              onClick={handleExportReport}
              className={isMobile ? 'mobile-button-sm' : ''}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrintReport}
              className={isMobile ? 'mobile-button-sm' : ''}
            >
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button
              variant="action-share"
              size="sm"
              onClick={handleShareReport}
              className={isMobile ? 'mobile-button-sm' : ''}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        )}
      </div>

      {/* Report Status */}
      {reportGenerated && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <span>
                Comprehensive analysis report generated with data from {Object.keys(propertyData || {}).length} API sources.
              </span>
              <Badge variant="secondary" className="ml-2">
                Report Ready
              </Badge>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Introduction Card */}
      <Card className="modern-card">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Comprehensive Property Analysis</h2>
              <p className="text-muted-foreground mb-4">
                This analysis tool pulls data from multiple Attom API endpoints to provide a complete 
                picture of any property. Enter an Attom ID or property address below to generate a 
                detailed report including property characteristics, ownership information, financial data, 
                market trends, and risk assessments.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold text-primary">10+</div>
                  <div className="text-xs text-muted-foreground">API Endpoints</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold text-primary">100+</div>
                  <div className="text-xs text-muted-foreground">Data Points</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold text-primary">8</div>
                  <div className="text-xs text-muted-foreground">Categories</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="text-lg font-semibold text-primary">Real-time</div>
                  <div className="text-xs text-muted-foreground">Data</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Report Notes (user editable, persisted) */}
      <Card className="modern-card">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-2">Your Notes</h3>
          <p className="text-sm text-muted-foreground mb-3">Add any personal notes or highlights. These are saved locally and will persist on reload.</p>
          <Textarea
            rows={4}
            placeholder="Add your notes about this property..."
            value={reportNotes}
            onChange={(e) => {
              const val = e.target.value;
              setReportNotes(val);
              try {
                const raw = localStorage.getItem(NOTES_KEY);
                const all = raw ? JSON.parse(raw) : {};
                all[propertyKey] = { ...(all[propertyKey] || {}), notes: val, updatedAt: new Date().toISOString() };
                localStorage.setItem(NOTES_KEY, JSON.stringify(all));
              } catch {}
            }}
          />
        </div>
      </Card>

      {/* Comprehensive Property Details Component */}
      <ComprehensivePropertyDetails 
        defaultAttomId={initialAttomId}
        defaultAddress={initialAddress}
        onPropertyFound={handlePropertyFound}
      />

      {/* Report Footer */}
      {reportGenerated && (
        <Card className="modern-card">
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Report Complete</h3>
            <p className="text-muted-foreground mb-4">
              Your comprehensive property analysis has been generated. You can export, print, or share this report using the buttons above.
            </p>
            
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Data Source: Attom Data API</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Generated: {new Date().toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Platform: Handoff</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            font-size: 12px;
            color: black;
            background: white;
          }
          
          .modern-card {
            border: 1px solid #ccc;
            box-shadow: none;
            margin-bottom: 1rem;
            page-break-inside: avoid;
          }
          
          h1, h2, h3 {
            color: black;
            page-break-after: avoid;
          }
          
          .page-content,
          .page-content-mobile {
            padding: 0;
            max-width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
