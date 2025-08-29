import React, { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { Progress } from '../ui/progress';
import { 
  FileText, 
  Save, 
  Download, 
  AlertCircle, 
  CheckCircle2,
  DollarSign,
  Calendar,
  User,
  Home,
  FileCheck,
  Signature
} from 'lucide-react';
import { DocumentTemplate, TemplateField, GeneratedDocument } from '../../types/documentTemplates';
import { cn } from '../ui/utils';

interface DocumentTemplateFormProps {
  template: DocumentTemplate;
  initialData?: any;
  onSave: (data: any, isDraft: boolean) => Promise<void>;
  onGeneratePDF: (data: any) => Promise<string>;
  isLoading?: boolean;
}

export function DocumentTemplateForm({ 
  template, 
  initialData = {}, 
  onSave, 
  onGeneratePDF,
  isLoading = false
}: DocumentTemplateFormProps) {
  const [activeSection, setActiveSection] = useState(template.sections?.[0]?.id || 'all');
  const [savedAsDraft, setSavedAsDraft] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);

  const { 
    control, 
    handleSubmit, 
    watch, 
    formState: { errors, isDirty, isValid },
    setValue,
    getValues
  } = useForm({
    defaultValues: initialData,
    mode: 'onChange'
  });

  const watchedValues = watch();

  // Calculate form completion percentage
  const calculateProgress = () => {
    const requiredFields = template.fields.filter(field => field.required);
    const completedFields = requiredFields.filter(field => {
      const value = watchedValues[field.name];
      return value && value !== '';
    });
    return Math.round((completedFields.length / requiredFields.length) * 100);
  };

  const progress = calculateProgress();

  const getSectionIcon = (sectionId: string) => {
    const iconMap: Record<string, React.ElementType> = {
      'parties': User,
      'property': Home,
      'items': FileCheck,
      'purchase-price': DollarSign,
      'mortgage': FileText,
      'closing': Calendar,
      'signatures': Signature,
      'reference': FileText,
      'counteroffer': FileCheck,
      'response': CheckCircle2,
      'distribution': DollarSign
    };
    return iconMap[sectionId] || FileText;
  };

  const renderField = (field: TemplateField) => {
    const fieldError = errors[field.name];
    const hasError = !!fieldError;

    const baseProps = {
      className: cn(
        "w-full",
        hasError && "border-red-500 focus:border-red-500"
      )
    };

    switch (field.type) {
      case 'text':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ 
              required: field.required ? `${field.label} is required` : false,
              pattern: field.validation?.pattern ? {
                value: new RegExp(field.validation.pattern),
                message: `${field.label} format is invalid`
              } : undefined,
              minLength: field.validation?.minLength ? {
                value: field.validation.minLength,
                message: `${field.label} must be at least ${field.validation.minLength} characters`
              } : undefined,
              maxLength: field.validation?.maxLength ? {
                value: field.validation.maxLength,
                message: `${field.label} must be no more than ${field.validation.maxLength} characters`
              } : undefined
            }}
            render={({ field: { onChange, value, name } }) => (
              <Input
                {...baseProps}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={field.placeholder}
              />
            )}
          />
        );

      case 'textarea':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: { onChange, value, name } }) => (
              <Textarea
                {...baseProps}
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={field.placeholder}
                rows={4}
              />
            )}
          />
        );

      case 'select':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: { onChange, value, name } }) => (
              <Select value={value || ''} onValueChange={onChange}>
                <SelectTrigger className={cn(baseProps.className)}>
                  <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((option) => (
                    <SelectItem key={option} value={option.toLowerCase()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case 'date':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: { onChange, value, name } }) => (
              <Input
                {...baseProps}
                type="date"
                name={name}
                value={value || ''}
                onChange={onChange}
              />
            )}
          />
        );

      case 'number':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ 
              required: field.required ? `${field.label} is required` : false,
              min: field.validation?.min ? {
                value: field.validation.min,
                message: `${field.label} must be at least ${field.validation.min}`
              } : undefined,
              max: field.validation?.max ? {
                value: field.validation.max,
                message: `${field.label} must be no more than ${field.validation.max}`
              } : undefined
            }}
            render={({ field: { onChange, value, name } }) => (
              <Input
                {...baseProps}
                type="number"
                name={name}
                value={value || ''}
                onChange={onChange}
                placeholder={field.placeholder}
              />
            )}
          />
        );

      case 'currency':
        return (
          <Controller
            name={field.name}
            control={control}
            rules={{ required: field.required ? `${field.label} is required` : false }}
            render={({ field: { onChange, value, name } }) => (
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  {...baseProps}
                  type="number"
                  name={name}
                  value={value || ''}
                  onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  className="pl-10"
                  step="0.01"
                />
              </div>
            )}
          />
        );

      case 'checkbox':
        return (
          <Controller
            name={field.name}
            control={control}
            render={({ field: { onChange, value, name } }) => (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={name}
                  checked={value || false}
                  onCheckedChange={onChange}
                />
                <Label htmlFor={name} className="text-sm font-normal">
                  {field.label}
                </Label>
              </div>
            )}
          />
        );

      case 'signature':
        return (
          <div className="space-y-2">
            <canvas
              ref={signatureCanvasRef}
              width={400}
              height={100}
              className="border border-gray-300 rounded-md w-full"
              style={{ maxWidth: '400px', height: '100px' }}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const canvas = signatureCanvasRef.current;
                  if (canvas) {
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                      ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }
                  }
                }}
              >
                Clear
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const canvas = signatureCanvasRef.current;
                  if (canvas) {
                    const dataURL = canvas.toDataURL();
                    setValue(field.name, dataURL);
                  }
                }}
              >
                Save Signature
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <Input
            {...baseProps}
            value={watchedValues[field.name] || ''}
            onChange={(e) => setValue(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  const handleSaveDraft = async () => {
    const data = getValues();
    try {
      await onSave(data, true);
      setSavedAsDraft(true);
      setTimeout(() => setSavedAsDraft(false), 3000);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  const handleGeneratePDF = async () => {
    const data = getValues();
    setIsGeneratingPDF(true);
    try {
      const url = await onGeneratePDF(data);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      await onSave(data, false);
    } catch (error) {
      console.error('Error saving document:', error);
    }
  };

  const renderSectionFields = (sectionId: string) => {
    const section = template.sections?.find(s => s.id === sectionId);
    if (!section) return null;

    const sectionFields = template.fields.filter(field => 
      section.fields.includes(field.id)
    );

    return (
      <div className="space-y-6">
        {sectionFields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderField(field)}
            {errors[field.name] && (
              <p className="text-red-500 text-sm">
                {errors[field.name]?.message as string}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderAllFields = () => {
    return (
      <div className="space-y-6">
        {template.fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            {renderField(field)}
            {errors[field.name] && (
              <p className="text-red-500 text-sm">
                {errors[field.name]?.message as string}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {template.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Completion Progress</span>
            <span className={cn(
              "font-medium",
              progress === 100 ? "text-green-600" : "text-blue-600"
            )}>
              {progress}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Status Alerts */}
      {savedAsDraft && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Draft saved successfully!
          </AlertDescription>
        </Alert>
      )}

      {pdfUrl && (
        <Alert className="border-blue-200 bg-blue-50">
          <FileText className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            PDF generated successfully! 
            <a 
              href={pdfUrl} 
              download 
              className="ml-2 underline hover:no-underline"
            >
              Download PDF
            </a>
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Form Content */}
        <Card>
          <CardContent className="p-6">
            {template.sections && template.sections.length > 1 ? (
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 gap-1">
                  {template.sections.map((section) => {
                    const Icon = getSectionIcon(section.id);
                    return (
                      <TabsTrigger key={section.id} value={section.id} className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{section.title}</span>
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                {template.sections.map((section) => (
                  <TabsContent key={section.id} value={section.id} className="mt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-medium">{section.title}</h3>
                        {section.description && (
                          <p className="text-sm text-muted-foreground">{section.description}</p>
                        )}
                      </div>
                      <Separator />
                      {renderSectionFields(section.id)}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              renderAllFields()
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          <div className="flex gap-2 flex-1">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF || progress < 100}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? 'Generating...' : 'Generate PDF'}
            </Button>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !isValid}
            className="flex items-center gap-2"
          >
            <FileCheck className="w-4 h-4" />
            Complete Document
          </Button>
        </div>
      </form>
    </div>
  );
}
