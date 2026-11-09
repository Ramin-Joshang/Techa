"use client";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { CookiesProvider, useCookies } from "react-cookie";
import { LoginUserApiHandler } from "../../api/handlers/UserHandlers";
import {
  UserAndTokenDisplayDto,
  LoginDto,
  UserDisplayDto,
} from "../../api/types/dtos/UserDtos";
import axios, { parsedData } from "../../api/handlers/axiosInstance";

// Define the type for the context value
interface AuthContextType {
  user: UserDisplayDto | null;
  isAdmin: boolean;
  isStudent: boolean;
  login: (userData: LoginDto) => Promise<boolean | Error>;
  logout: () => Promise<boolean>;
  getSession: () => Promise<UserDisplayDto | null>;
}

// Create the context with an initial value of an empty object
const AuthContext = createContext<AuthContextType>({
  user: null,
  isStudent: false,
  isAdmin: false,
  login: async () => false,
  logout: async () => false,
  getSession: async () => null,
});
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserDisplayDto | null>(null);
  const [cookies, setCookie, removeCookie] = useCookies(["user", "token"]);
  const login = async (userData: LoginDto): Promise<boolean | Error> => {
    try {
      const res = await LoginUserApiHandler(userData);
      if (res.data.IsSuccess) {
        const data = parsedData<UserAndTokenDisplayDto>(
          JSON.stringify(res.data.Data)
        );
        setCookie("user", { ...data, Token: null }, { path: "/" });
        setCookie("token", `${data.Token}`, { path: "/" });

        // Set token in Axios default headers
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.Token}`;

        setUser({ ...data });
        return true;
      } else {
        throw new Error(res.data.Message);
      }
    } catch (error) {
      console.error(error);
      return error as Error;
    }
  };
  const isAdmin = user?.UserRoles.some((x) => x.RoleTitle == "Admin") ?? false;
  const isStudent =
    user?.UserRoles.some((x) => x.RoleTitle == "Student") ?? false;

  const logout = async () => {
    try {
      // Clear user state
      setUser(null);

      // Remove cookies
      removeCookie("user", { path: "/" });
      removeCookie("token", { path: "/" });

      // Ensure headers are cleared
      delete axios.defaults.headers.common["Authorization"];

      // Optionally, reset the headers to a default state
      axios.defaults.headers.common["Authorization"] = undefined;

      // Optionally, you can refresh the page to ensure all headers and states are cleared
      // window.location.reload();

      return true;
    } catch (error) {
      console.error("Logout error:", error);
      return false;
    }
  };

  const getSession = async (): Promise<UserDisplayDto | null> => {
    if (cookies.token) {
      return cookies.user;
    } else {
      logout();
      return null;
    }
  };

  useEffect(() => {
    const checkTokenValidity = async () => {
      if (cookies.user) {
        setUser(cookies.user);
      }
      if (cookies.token) {
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${cookies.token}`;
      }
    };

    checkTokenValidity();
  }, [cookies.user, cookies.token]);

  return (
    <AuthContext.Provider
      value={{ user, login, logout, getSession, isAdmin, isStudent }}
    >
      <CookiesProvider>{children}</CookiesProvider>
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
