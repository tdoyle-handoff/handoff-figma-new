import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Switch } from './ui/switch';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Plus, Edit, Trash2, Save, X, Code, Info } from 'lucide-react';
import { toast } from 'sonner';

interface AttomParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  description: string;
  example: string;
  validation?: string;
  defaultValue?: string;
}

interface AttomResponseField {
  name: string;
  path: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  description: string;
  isRequired: boolean;
  mapping?: string;
}

interface AttomParameterManagerProps {
  requiredParams: AttomParameter[];
  optionalParams: AttomParameter[];
  responseFields: AttomResponseField[];
  onUpdateParams: (required: AttomParameter[], optional: AttomParameter[]) => void;
  onUpdateFields: (fields: AttomResponseField[]) => void;
}

export function AttomParameterManager({
  requiredParams,
  optionalParams,
  responseFields,
  onUpdateParams,
  onUpdateFields
}: AttomParameterManagerProps) {
  const [editingParam, setEditingParam] = useState<AttomParameter | null>(null);
  const [editingField, setEditingField] = useState<AttomResponseField | null>(null);
  const [isParamDialogOpen, setIsParamDialogOpen] = useState(false);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [paramType, setParamType] = useState<'required' | 'optional'>('required');

  const createNewParameter = (): AttomParameter => ({
    name: '',
    type: 'string',
    description: '',
    example: ''
  });

  const createNewField = (): AttomResponseField => ({
    name: '',
    path: '',
    type: 'string',
    description: '',
    isRequired: true
  });

  const handleSaveParameter = (param: AttomParameter) => {
    if (!param.name || !param.description) {
      toast.error('Parameter name and description are required');
      return;
    }

    const newRequired = [...requiredParams];
    const newOptional = [...optionalParams];

    if (paramType === 'required') {
      const existingIndex = newRequired.findIndex(p => p.name === param.name);
      if (existingIndex >= 0) {
        newRequired[existingIndex] = param;
      } else {
        newRequired.push(param);
      }
      // Remove from optional if it exists there
      const optionalIndex = newOptional.findIndex(p => p.name === param.name);
      if (optionalIndex >= 0) {
        newOptional.splice(optionalIndex, 1);
      }
    } else {
      const existingIndex = newOptional.findIndex(p => p.name === param.name);
      if (existingIndex >= 0) {
        newOptional[existingIndex] = param;
      } else {
        newOptional.push(param);
      }
      // Remove from required if it exists there
      const requiredIndex = newRequired.findIndex(p => p.name === param.name);
      if (requiredIndex >= 0) {
        newRequired.splice(requiredIndex, 1);
      }
    }

    onUpdateParams(newRequired, newOptional);
    setEditingParam(null);
    setIsParamDialogOpen(false);
    toast.success('Parameter saved successfully');
  };

  const handleSaveField = (field: AttomResponseField) => {
    if (!field.name || !field.path || !field.description) {
      toast.error('Field name, path, and description are required');
      return;
    }

    const newFields = [...responseFields];
    const existingIndex = newFields.findIndex(f => f.name === field.name);
    
    if (existingIndex >= 0) {
      newFields[existingIndex] = field;
    } else {
      newFields.push(field);
    }

    onUpdateFields(newFields);
    setEditingField(null);
    setIsFieldDialogOpen(false);
    toast.success('Response field saved successfully');
  };

  const handleDeleteParameter = (paramName: string, type: 'required' | 'optional') => {
    if (type === 'required') {
      const newRequired = requiredParams.filter(p => p.name !== paramName);
      onUpdateParams(newRequired, optionalParams);
    } else {
      const newOptional = optionalParams.filter(p => p.name !== paramName);
      onUpdateParams(requiredParams, newOptional);
    }
    toast.success('Parameter deleted successfully');
  };

  const handleDeleteField = (fieldName: string) => {
    const newFields = responseFields.filter(f => f.name !== fieldName);
    onUpdateFields(newFields);
    toast.success('Response field deleted successfully');
  };

  return (
    <div className="space-y-6">
      {/* Parameters Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>API Parameters</CardTitle>
              <CardDescription>
                Configure required and optional parameters for this endpoint
              </CardDescription>
            </div>
            <Dialog open={isParamDialogOpen} onOpenChange={setIsParamDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingParam(createNewParameter());
                    setParamType('required');
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Parameter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingParam?.name ? 'Edit Parameter' : 'Add New Parameter'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure the parameter details and validation rules
                  </DialogDescription>
                </DialogHeader>
                {editingParam && (
                  <ParameterForm
                    parameter={editingParam}
                    paramType={paramType}
                    onSave={handleSaveParameter}
                    onCancel={() => {
                      setEditingParam(null);
                      setIsParamDialogOpen(false);
                    }}
                    onChange={setEditingParam}
                    onTypeChange={setParamType}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" defaultValue={['required', 'optional']}>
            <AccordionItem value="required">
              <AccordionTrigger>
                Required Parameters ({requiredParams.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {requiredParams.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No required parameters configured</p>
                  ) : (
                    requiredParams.map((param, index) => (
                      <ParameterCard
                        key={index}
                        parameter={param}
                        type="required"
                        onEdit={() => {
                          setEditingParam(param);
                          setParamType('required');
                          setIsParamDialogOpen(true);
                        }}
                        onDelete={() => handleDeleteParameter(param.name, 'required')}
                      />
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="optional">
              <AccordionTrigger>
                Optional Parameters ({optionalParams.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3">
                  {optionalParams.length === 0 ? (
                    <p className="text-muted-foreground text-sm">No optional parameters configured</p>
                  ) : (
                    optionalParams.map((param, index) => (
                      <ParameterCard
                        key={index}
                        parameter={param}
                        type="optional"
                        onEdit={() => {
                          setEditingParam(param);
                          setParamType('optional');
                          setIsParamDialogOpen(true);
                        }}
                        onDelete={() => handleDeleteParameter(param.name, 'optional')}
                      />
                    ))
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Response Fields Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Response Fields</CardTitle>
              <CardDescription>
                Define expected response fields and their mapping paths
              </CardDescription>
            </div>
            <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingField(createNewField());
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Field
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingField?.name ? 'Edit Response Field' : 'Add New Response Field'}
                  </DialogTitle>
                  <DialogDescription>
                    Configure the response field mapping and description
                  </DialogDescription>
                </DialogHeader>
                {editingField && (
                  <ResponseFieldForm
                    field={editingField}
                    onSave={handleSaveField}
                    onCancel={() => {
                      setEditingField(null);
                      setIsFieldDialogOpen(false);
                    }}
                    onChange={setEditingField}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {responseFields.length === 0 ? (
              <p className="text-muted-foreground text-sm">No response fields configured</p>
            ) : (
              responseFields.map((field, index) => (
                <ResponseFieldCard
                  key={index}
                  field={field}
                  onEdit={() => {
                    setEditingField(field);
                    setIsFieldDialogOpen(true);
                  }}
                  onDelete={() => handleDeleteField(field.name)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ParameterCard({
  parameter,
  type,
  onEdit,
  onDelete
}: {
  parameter: AttomParameter;
  type: 'required' | 'optional';
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{parameter.name}</code>
          <Badge variant={type === 'required' ? 'destructive' : 'secondary'}>
            {type}
          </Badge>
          <Badge variant="outline">{parameter.type}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{parameter.description}</p>
      {parameter.example && (
        <div className="text-xs">
          <span className="text-muted-foreground">Example: </span>
          <code className="bg-muted px-1 rounded">{parameter.example}</code>
        </div>
      )}
      {parameter.defaultValue && (
        <div className="text-xs">
          <span className="text-muted-foreground">Default: </span>
          <code className="bg-muted px-1 rounded">{parameter.defaultValue}</code>
        </div>
      )}
    </div>
  );
}

function ResponseFieldCard({
  field,
  onEdit,
  onDelete
}: {
  field: AttomResponseField;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">{field.name}</code>
          <Badge variant={field.isRequired ? 'destructive' : 'secondary'}>
            {field.isRequired ? 'required' : 'optional'}
          </Badge>
          <Badge variant="outline">{field.type}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{field.description}</p>
      <div className="text-xs">
        <span className="text-muted-foreground">Path: </span>
        <code className="bg-muted px-1 rounded">{field.path}</code>
      </div>
      {field.mapping && (
        <div className="text-xs">
          <span className="text-muted-foreground">Mapping: </span>
          <code className="bg-muted px-1 rounded">{field.mapping}</code>
        </div>
      )}
    </div>
  );
}

function ParameterForm({
  parameter,
  paramType,
  onSave,
  onCancel,
  onChange,
  onTypeChange
}: {
  parameter: AttomParameter;
  paramType: 'required' | 'optional';
  onSave: (param: AttomParameter) => void;
  onCancel: () => void;
  onChange: (param: AttomParameter) => void;
  onTypeChange: (type: 'required' | 'optional') => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="param-name">Parameter Name</Label>
          <Input
            id="param-name"
            value={parameter.name}
            onChange={(e) => onChange({ ...parameter, name: e.target.value })}
            placeholder="e.g., address"
          />
        </div>
        <div>
          <Label htmlFor="param-type-select">Parameter Type</Label>
          <Select value={paramType} onValueChange={onTypeChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="required">Required</SelectItem>
              <SelectItem value="optional">Optional</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="param-data-type">Data Type</Label>
          <Select
            value={parameter.type}
            onValueChange={(value: 'string' | 'number' | 'boolean' | 'array') =>
              onChange({ ...parameter, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="array">Array</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="param-example">Example Value</Label>
          <Input
            id="param-example"
            value={parameter.example}
            onChange={(e) => onChange({ ...parameter, example: e.target.value })}
            placeholder="e.g., 123 Main St, City, State"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="param-description">Description</Label>
        <Textarea
          id="param-description"
          value={parameter.description}
          onChange={(e) => onChange({ ...parameter, description: e.target.value })}
          placeholder="Describe what this parameter is used for..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="param-default">Default Value (Optional)</Label>
        <Input
          id="param-default"
          value={parameter.defaultValue || ''}
          onChange={(e) => onChange({ ...parameter, defaultValue: e.target.value })}
          placeholder="Default value if not provided"
        />
      </div>

      <div>
        <Label htmlFor="param-validation">Validation Pattern (Optional)</Label>
        <Input
          id="param-validation"
          value={parameter.validation || ''}
          onChange={(e) => onChange({ ...parameter, validation: e.target.value })}
          placeholder="e.g., regex pattern or validation rule"
        />
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(parameter)}>
          <Save className="w-4 h-4 mr-2" />
          Save Parameter
        </Button>
      </DialogFooter>
    </div>
  );
}

function ResponseFieldForm({
  field,
  onSave,
  onCancel,
  onChange
}: {
  field: AttomResponseField;
  onSave: (field: AttomResponseField) => void;
  onCancel: () => void;
  onChange: (field: AttomResponseField) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="field-name">Field Name</Label>
          <Input
            id="field-name"
            value={field.name}
            onChange={(e) => onChange({ ...field, name: e.target.value })}
            placeholder="e.g., property_address"
          />
        </div>
        <div>
          <Label htmlFor="field-type">Data Type</Label>
          <Select
            value={field.type}
            onValueChange={(value: 'string' | 'number' | 'boolean' | 'object' | 'array') =>
              onChange({ ...field, type: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="string">String</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="object">Object</SelectItem>
              <SelectItem value="array">Array</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="field-path">JSON Path</Label>
        <Input
          id="field-path"
          value={field.path}
          onChange={(e) => onChange({ ...field, path: e.target.value })}
          placeholder="e.g., property[0].address or response.data.building"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Specify the JSON path to extract this field from the API response
        </p>
      </div>

      <div>
        <Label htmlFor="field-description">Description</Label>
        <Textarea
          id="field-description"
          value={field.description}
          onChange={(e) => onChange({ ...field, description: e.target.value })}
          placeholder="Describe what this field contains..."
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="field-mapping">Custom Mapping (Optional)</Label>
        <Input
          id="field-mapping"
          value={field.mapping || ''}
          onChange={(e) => onChange({ ...field, mapping: e.target.value })}
          placeholder="e.g., customPropertyName or transformation rule"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Optional custom field name or transformation to apply
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="field-required"
          checked={field.isRequired}
          onCheckedChange={(checked) => onChange({ ...field, isRequired: checked })}
        />
        <Label htmlFor="field-required">Required Field</Label>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(field)}>
          <Save className="w-4 h-4 mr-2" />
          Save Field
        </Button>
      </DialogFooter>
    </div>
  );
}