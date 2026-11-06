export interface ApiResponse {
  Data: string; // You might want to parse it later
  IsSuccess: boolean;
  StatusCode: number;
  Message: string;
}

export interface SqlResponseData {
  HasError: boolean;
  Messages: string;
  Script: string;
  Dataset: string;
  HasDataTable: boolean;
}

export interface ApiSqlResponse {
  Data: SqlResponseData;
  IsSuccess: boolean;
  StatusCode: number;
  Message: string;
}

export interface ProcedureParameter {
  object_id: number;
  name: string;
  parameter_name: string | null;
}
