type Type = Picture; // Define the union type for flexibility

export interface Picture {
  Url: string;
  Alt: string | null;
  ProductId: number | null;
  Product: any; // Type it properly if it's available
  Id: number;
  CreatedDate: string;
  ModifiedDate: string | null;
  CreatedByUserId: number | null;
  CreatedByUser: any; // Type it properly if it's available
  ModifiedByUserId: number | null;
  ModifiedByUser: any; // Type it properly if it's available

  deleted?: boolean | false;
}

export interface Content {
  Id: number;
  CourseId: number;
  ParentId: number | null;
  Title: string | null;
  Description: string | null;
  SortIndex: number;
  Disabled: boolean;
  Price: number | null;
}
