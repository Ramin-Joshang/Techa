import { Content } from "../IContent";
import BaseDto from "./BaseDto";
export interface JsSnippetDisplayDTO extends BaseDto {
  Title: string;
  Script: string;
  Description: string;
  Content: Content;
}

export interface JsSnippetCreateDTO {
  Id?: number;
  Title: string;
  Script: string;
  Description: string;
}
