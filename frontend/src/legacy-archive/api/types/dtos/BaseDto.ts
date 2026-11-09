export default interface BaseDto {
  Id: number;
}

export interface BaseSearchDto {
  Id?: number;
  Take?: number;
  Skip?: number;
  GetAllItems?: boolean;
}
