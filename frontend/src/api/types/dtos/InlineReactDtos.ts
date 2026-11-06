import TemplateType, { RelatedTemplate } from "../ITemplateTypes";
import BaseDto, { BaseSearchDto } from "./BaseDto";
import { StudentDatabaseDisplayDto } from "./InlineSqlDtos";

export interface CreateReactTemplateDTO {
  Title?: string;
  Script?: string;
  Description?: string;
  ContentId?: number;
  DirectoryId?: number;
  IsMain?: boolean;
  RelatedTemplates?: number[];
}

export interface UpdateTemplateDTO extends BaseDto {
  Title?: string;
  Script?: string;
  Description?: string;
  ContentId?: number;
  IsMain?: boolean;
  DirectoryId?: number | null;
  RelatedTemplateIds?: number[];
}

export interface GetTemplatesByFilterDTO extends BaseSearchDto {
  Title?: string;
  ContentId?: number;
  TemplateType?: number;
  IsMain?: boolean;
  CreatedByUserId?: number;
}

export interface ReactTemplateDisplayDTO {
  Id: number;
  Title: string;
  Script: string;
  Description: string;
  ContentId: number;
  TemplateType: number;
  IsMain: boolean;
  DirectoryId: number;
  DirectoryTitle: string;
  RelatedTemplates: RelatedTemplate[];
}
export interface TemplateDisplayDTO {
  Id: number;
  Title: string;
  Script: string;
  Description: string;
  ContentId: number;
  TemplateType: number;
  RelatedTemplates: RelatedTemplate[];
}
export interface ReactTemplateDisplayDTO {
  Id: number;
  Title: string;
  Script: string;
  Description: string;
  ContentId: number;
  TemplateType: number;
  IsMain: boolean;
  DirectoryId: number;
  DirectoryTitle: string;
  RelatedTemplates: RelatedTemplate[];
  isImported: boolean;
}
export interface ImportReactTemplateDTO {
  Id: number;
  RelatedTemplateIds: number[];
  OperationType: number;
}

/* Projects DTO */

export interface ProjectDisplayDTO {
  Id: number;
  Title: string;
  Description: string;
  StudentId: number;
  StudentDBId?: number;
  StudentDatabase?: StudentDatabaseDisplayDto;
  CdnLinks: CdnLinkDisplayDTO[];
}

export interface ProjectCreateDTO {
  Title: string;
  Description: string;
  StudentId: number;
}

export interface ProjectUpdateDTO {
  Id: number;
  Title?: string;
  Description?: string;
  StudentId?: number;
  StudentDBId?: number;
}

/* Projects DTO End */

export interface GetProjectFilterDTO {
  Id?: number;
  Take?: number;
  Skip?: number;
  GetAllItems?: boolean;
  Title?: string;
  StudentId?: number;
}

export interface CreateProjectDirectoryDTO {
  ProjectId: number;
  ParentDirectoryId?: number;
  Title: string;
}
export interface UpdateProjectDirectoryDTO {
  Id: number;
  ProjectId?: number;
  ParentDirectoryId?: number | null;
  Title?: string;
}

export interface ProjectDirectorySearchDto extends BaseSearchDto {
  ProjectId?: number;
  ParentDirectoryId?: number;
  Title?: string;
}

export interface ProjectDirectoryDisplayDTO {
  Id: number;
  ProjectId: number;
  ParentDirectoryId: number;
  ParentDirectoryTitle: string;
  Title: string;
}

export interface Directory {
  Id: number;
  Title: string;
  ParentDirectoryId: number | null;
  SubDirectories?: Directory[];
}

export interface CdnLinkCreateDTO {
  Url: string;
  Description?: string;
  ProjectId: number;
}

export interface CdnLinkDisplayDTO extends CdnLinkCreateDTO {
  Id: number;
}

export interface CdnLinkUpdateDTO {
  Id: number;
  Url?: string;
  Description?: string;
  ProjectId?: number;
}
