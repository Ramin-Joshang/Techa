import { CdnLinkDisplayDTO } from "./dtos/InlineReactDtos";

// TemplateType.ts
const enum TemplateType {
  GenerateStudentDatabase,
  SetStudentDatabasePermission,
  React,
  Html,
  UserSavedScript,
  SqlScript,
}
export default TemplateType;

export interface Template {
  Title?: string;
  Script?: string;
  Description?: string;
  ContentId?: number;
  TemplateType: TemplateType;
  IsMain: boolean;
}

export interface ReactTemplate extends Template {
  Id: number;
  isImported?: boolean;
  TemplateType: TemplateType.React;
}

export interface RelatedTemplate {
  Id: number;
  ChildId: number;
  ChildTitle: string;
  ChildScript: string;
  ChildDescription: string;
  ChildContentId?: number; // Only in General Templates
  ChildIsMain?: boolean; // Only in User React Templates
  ChildTemplateType: number; // Only in General Templates
}

export interface InlineReactPageData {
  isTutorial?: boolean;
  componentId?: number;
  isMain?: boolean;
  name?: string;
  components?: RelatedTemplate[]; // Replace 'any' with appropriate type
  code?: string;
  procedures?: any[]; // Replace 'any' with appropriate type
  projectId?: number;
}
