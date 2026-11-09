import { Content } from "../../../api/types/IContent";
import BaseDto from "../../../api/types/dtos/BaseDto";
export interface HtmlSnippetDisplayDTO extends BaseDto {
  Title: string;
  Script: string;
  Description: string;
  Content: Content;
}

export interface HtmlSnippetCreateDTO {
  Id?: number;
  Title: string;
  Script: string;
  Description: string;
}
