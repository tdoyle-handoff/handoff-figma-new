import { DocumentTemplate } from '../types/documentTemplates';

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [];

export const getTemplateById = (id: string): DocumentTemplate | undefined => {
  return DOCUMENT_TEMPLATES.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: string): DocumentTemplate[] => {
  return DOCUMENT_TEMPLATES.filter(template => template.category === category);
};
