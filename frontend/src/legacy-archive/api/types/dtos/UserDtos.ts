import BaseDto from "./BaseDto";

export interface LoginDto {
  UserName: string;
  Password: string;
}

export interface RegisterDto {
  // UserName: string;
  Password: string;
  FirstName: string;
  // LastName: string;
  // Email: string;
  Mobile: string;
  // NationalCode: string;
  Id: number;
}

export interface UserDisplayDto extends BaseDto {
  UserName: string;
  FullName: string;
  UserRoles: UserRole[];
}
export interface UserAndTokenDisplayDto extends UserDisplayDto {
  Token: string;
}

export default interface IUserDisplayDto extends BaseDto {
  userName: string;
  passwordHash: string;
  fullName: string;
}

export interface Role extends BaseDto {
  Title: string;
}

export interface UserRole extends BaseDto {
  RoleId: number;
  RoleTitle: string;
}
