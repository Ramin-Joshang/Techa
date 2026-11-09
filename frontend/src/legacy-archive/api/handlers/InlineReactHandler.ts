import { ApiResponse } from "../types/dtos/ApiResponse";
import {
  CdnLinkCreateDTO,
  CdnLinkDisplayDTO,
  CdnLinkUpdateDTO,
  CreateProjectDirectoryDTO,
  CreateReactTemplateDTO,
  GetProjectFilterDTO,
  GetTemplatesByFilterDTO,
  ImportReactTemplateDTO,
  ProjectCreateDTO,
  ProjectDirectoryDisplayDTO,
  ProjectDirectorySearchDto,
  ProjectDisplayDTO,
  ProjectUpdateDTO,
  ReactTemplateDisplayDTO,
  TemplateDisplayDTO,
  UpdateProjectDirectoryDTO,
  UpdateTemplateDTO,
} from "../types/dtos/InlineReactDtos";
import TemplateType from "../types/ITemplateTypes";

import axios from "./axiosInstance";

export const GetTemplateById = async (id: number) => {
  return await axios.get<ApiResponse & { Data: TemplateDisplayDTO }>(
    "/api/template/" + id
  );
};

export const GetTemplatesByFilter = async (filter: GetTemplatesByFilterDTO) => {
  const result = await axios.post<ApiResponse & { Data: TemplateDisplayDTO[] }>(
    "/api/template/getbyfilter",
    {
      ...filter,
    }
  );

  return result;
};

export const GetReactTemplateById = async (id: number) => {
  return await axios.get<ApiResponse & { Data: ReactTemplateDisplayDTO }>(
    "/api/reacttemplate/" + id
  );
};

export const mainComponentFilter: GetTemplatesByFilterDTO = { IsMain: true };
export const GetAllComponentsByFilter = async (
  filter: GetTemplatesByFilterDTO
) => {
  const result = await axios.post<
    ApiResponse & { Data: ReactTemplateDisplayDTO[] }
  >("/api/reacttemplate/getbyfilter", {
    ...filter,
    TemplateType: TemplateType.React,
    CreatedByUserId: filter.CreatedByUserId,
  } as GetTemplatesByFilterDTO);

  return result;
};
export const GetComponentsByProjectApiHandler = async (projectId: number) => {
  return await axios.get<ApiResponse & { Data: ReactTemplateDisplayDTO[] }>(
    "/api/reacttemplate/GetByProject/" + projectId
  );
};

export const SaveReactTemplate = async (dto: CreateReactTemplateDTO) => {
  return await axios.post<ApiResponse & { Data: ReactTemplateDisplayDTO }>(
    "/api/reacttemplate",
    {
      ...dto,
    }
  );
};

export const UpdateReactTempate = async (dto: UpdateTemplateDTO) => {
  return await axios.put<ApiResponse & { Data: ReactTemplateDisplayDTO }>(
    "/api/reacttemplate",
    {
      ...dto,
    }
  );
};

export const DeleteReactTemplateApiHandler = async (id: number) => {
  return await axios.delete<ApiResponse>(`/api/reacttemplate?id=${id}`);
};

export const ImportReactTemplate = async (dto: ImportReactTemplateDTO) => {
  return await axios.post<ApiResponse & { Data: ReactTemplateDisplayDTO }>(
    "/api/reacttemplate/addOrDeleteRelatedTemplate",
    { ...dto }
  );
};

/* Project */
export const SaveProjectApiHandler = async (dto: ProjectCreateDTO) => {
  return await axios.post<ApiResponse & { Data: ProjectDisplayDTO }>(
    "/api/project",
    {
      ...dto,
    }
  );
};

export const UpdateProjectApiHandler = async (dto: ProjectUpdateDTO) => {
  return await axios.put<ApiResponse & { Data: ProjectDisplayDTO }>(
    "/api/Project",
    {
      ...dto,
    }
  );
};

export const GetProjectsByFilter = async (dto: GetProjectFilterDTO) => {
  return await axios.post<ApiResponse & { Data: ProjectDisplayDTO[] }>(
    "/api/project/getbyfilter",
    { ...dto }
  );
};
/* Project End */
export const GetDirectoryByIdApiHandler = async (id: number) => {
  return await axios.get<ApiResponse & { Data: ProjectDirectoryDisplayDTO }>(
    "/api/projectdirectory/" + id
  );
};

export const GetDirectoriesByFilterApiHandler = async (
  filter: ProjectDirectorySearchDto
) => {
  const result = await axios.post<
    ApiResponse & { Data: ProjectDirectoryDisplayDTO[] }
  >("/api/projectdirectory/getbyfilter", {
    ...filter,
  } as ProjectDirectorySearchDto);

  return result;
};

export const SaveProjectDirectoryApiHandler = async (
  dto: CreateProjectDirectoryDTO
) => {
  try {
    const response = await axios.post<
      ApiResponse & { Data: ProjectDirectoryDisplayDTO }
    >("/api/projectdirectory", dto);
    return response.data;
  } catch (error) {
    console.error("Error saving project directory:", error);
    throw error;
  }
};

export const UpdateDirectoryApiHandler = async (
  dto: UpdateProjectDirectoryDTO
) => {
  return await axios.put<ApiResponse & { Data: ProjectDirectoryDisplayDTO }>(
    "/api/projectdirectory",
    {
      ...dto,
    }
  );
};

export const DeleteDirectoryApiHandler = async (id: number) => {
  return await axios.delete<ApiResponse>(`/api/projectdirectory?id=${id}`);
};

export const SaveCdnLinkApiHandler = async (dto: CdnLinkCreateDTO) => {
  try {
    const response = await axios.post<
      ApiResponse & { Data: CdnLinkDisplayDTO }
    >("/api/CdnLink", dto);
    return response.data;
  } catch (error) {
    console.error("Error saving Cdn Link:", error);
    throw error;
  }
};

export const UpdateCdnLinkApiHandler = async (dto: CdnLinkUpdateDTO) => {
  return await axios.put<ApiResponse & { Data: CdnLinkDisplayDTO }>(
    "/api/CdnLink",
    {
      ...dto,
    }
  );
};

export const DeleteCdnLinkApiHandler = async (id: number) => {
  return await axios.delete<ApiResponse>(`/api/CdnLink?id=${id}`);
};
