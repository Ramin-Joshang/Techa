import { ApiResponse } from "../types/dtos/ApiResponse";
import { LoginDto, RegisterDto, UserDisplayDto } from "../types/dtos/UserDtos";
import axios from "./axiosInstance";

export const LoginUserApiHandler = async (content: LoginDto) => {
  const result = await axios.post<ApiResponse>("api/Account/Login", {
    ...content,
  });

  return result;
};

export const GetUserByUsername = async (username: string) =>
  await axios.get<ApiResponse & { Data: UserDisplayDto }>(
    "api/Account/GetUserByUsername",
    {
      params: { Username: username },
    }
  );

export const RegisterStudentApiHandler = async (
  params: RegisterDto,
  selectedFile?: File
) => {
  const formData = new FormData();
  // formData.append("SelectedFile", selectedFile);

  const result = await axios.post<ApiResponse>(
    "api/Account/CreateStudent",
    formData,
    {
      params: params,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return result;
};
