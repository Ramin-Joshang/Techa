import { ApiResponse } from "../../api/types/dtos/ApiResponse";
import BaseDto from "../../api/types/dtos/BaseDto";
import {
  HtmlSnippetCreateDTO,
  HtmlSnippetDisplayDTO,
} from "../types/dtos/InlineHtmlDtos";
import axios from "../../api/handlers/axiosInstance";

export const GetHtmlSnippetAllApiHandler = async () => {
  return await axios.get<ApiResponse & { Data: HtmlSnippetDisplayDTO[] }>(
    "/api/HtmlSnippet/"
  );
};

export const GetHtmlSnippetByIdApiHandler = async (id: number) => {
  return await axios.get<ApiResponse & { Data: HtmlSnippetDisplayDTO }>(
    "/api/HtmlSnippet/" + id
  );
};

export const SaveHtmlSnippet = async (dto: HtmlSnippetCreateDTO) => {
  return await axios.post<ApiResponse & { Data: HtmlSnippetDisplayDTO }>(
    "/api/HtmlSnippet",
    {
      ...dto,
    }
  );
};

export const UpdateHtmlSnippet = async (
  dto: HtmlSnippetCreateDTO & BaseDto
) => {
  return await axios.put<ApiResponse & { Data: HtmlSnippetDisplayDTO }>(
    "/api/HtmlSnippet",
    {
      ...dto,
    }
  );
};

export const DeleteHtmlSnippetApiHandler = async (id: number) => {
  return await axios.delete<ApiResponse>(`/api/HtmlSnippet?id=${id}`);
};
