import { BaseSearchDto } from "./BaseDto";

export interface StudentDatabaseDisplayDto {
  Id: number;
  StudentId: number;
  DbName?: string;
}

export interface StudentDatabaseCreateDto {
  StudentId: number;
  DbName: string;
}

export interface StudentDatabaseUpdateDto {
  Id: number;
  StudentId?: number;
  DbName: string;
}

export interface GetStudentDatabasesByFilterDto extends BaseSearchDto {
  StudentId?: number;
  DbName?: string;
}

export interface StoredProcedure {
  objectId: number;
  name: string;
  parameters?: string | null;
  body: string;
}
