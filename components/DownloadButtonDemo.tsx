import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { DownloadButton, PrimaryDownloadButton, DarkDownloadButton, LightDownloadButton, DarkRectDownloadButton } from './ui/download-button';

export default function DownloadButtonDemo() {
  const handleDownload = async () => {
    // Simulate download process
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Download completed!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Download Button Demo</h1>
        <p className="text-muted-foreground">
          Modern download buttons matching the Dribbble design implementation
        </p>
      </div>

      {/* Primary Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Download Buttons</CardTitle>
          <CardDescription>
            Blue download buttons with text and icons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <DownloadButton
              variant="primary"
              size="sm"
              onDownload={handleDownload}
            >
              Download Small
            </DownloadButton>
            
            <DownloadButton
              variant="primary"
              size="md"
              onDownload={handleDownload}
            >
              Download Medium
            </DownloadButton>
            
            <DownloadButton
              variant="primary"
              size="lg"
              onDownload={handleDownload}
            >
              Download Large
            </DownloadButton>
          </div>
        </CardContent>
      </Card>

      {/* Square Icon Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Square Icon Buttons</CardTitle>
          <CardDescription>
            Compact square buttons with just download icons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <DarkDownloadButton
              size="sm"
              onDownload={handleDownload}
            />
            
            <DarkDownloadButton
              size="md"
              onDownload={handleDownload}
            />
            
            <DarkDownloadButton
              size="lg"
              onDownload={handleDownload}
            />
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            <LightDownloadButton
              size="sm"
              onDownload={handleDownload}
            />
            
            <LightDownloadButton
              size="md"
              onDownload={handleDownload}
            />
            
            <LightDownloadButton
              size="lg"
              onDownload={handleDownload}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dark Rectangular Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Dark Rectangular Buttons</CardTitle>
          <CardDescription>
            Dark theme buttons with text and icons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <DarkRectDownloadButton
              size="sm"
              onDownload={handleDownload}
            >
              Download Report
            </DarkRectDownloadButton>
            
            <DarkRectDownloadButton
              size="md"
              onDownload={handleDownload}
            >
              Download Document
            </DarkRectDownloadButton>
            
            <DarkRectDownloadButton
              size="lg"
              onDownload={handleDownload}
            >
              Download Analysis
            </DarkRectDownloadButton>
          </div>
        </CardContent>
      </Card>

      {/* States Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Button States</CardTitle>
          <CardDescription>
            Different states: normal, loading, and completed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 flex-wrap">
            <DownloadButton
              variant="primary"
              onDownload={handleDownload}
            >
              Try Download
            </DownloadButton>
            
            <DownloadButton
              variant="primary"
              loading={true}
            >
              Loading State
            </DownloadButton>
            
            <DownloadButton
              variant="primary"
              disabled={true}
            >
              Disabled State
            </DownloadButton>
          </div>
        </CardContent>
      </Card>

      {/* Usage Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Real-world Usage Examples</CardTitle>
          <CardDescription>
            How these buttons are used throughout the application
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Document List Example */}
          <div>
            <h4 className="font-medium mb-3">Document List</h4>
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <h5 className="font-medium">Purchase_Agreement.pdf</h5>
                    <p className="text-sm text-muted-foreground">2.3 MB • Uploaded today</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <DarkDownloadButton
                    size="sm"
                    onDownload={() => console.log('Download PDF')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Template Example */}
          <div>
            <h4 className="font-medium mb-3">Template Download</h4>
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Standard Purchase Agreement</h5>
                  <p className="text-sm text-muted-foreground">Professional real estate template</p>
                </div>
                <DownloadButton
                  variant="primary"
                  size="sm"
                  onDownload={() => console.log('Download template')}
                >
                  Download Template
                </DownloadButton>
              </div>
            </div>
          </div>

          {/* Report Example */}
          <div>
            <h4 className="font-medium mb-3">Inspection Report</h4>
            <div className="border rounded-lg p-4 bg-muted/30">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium">Home Inspection Report</h5>
                  <p className="text-sm text-muted-foreground">Completed by John Smith • 45 pages</p>
                </div>
                <DarkRectDownloadButton
                  size="sm"
                  onDownload={() => console.log('Download report')}
                >
                  Download Report
                </DarkRectDownloadButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
