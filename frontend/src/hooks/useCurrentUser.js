"use client";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadUserFromCookie } from "@/store/authSlice";

export default function useCurrentUser() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    if (!user) {
      dispatch(loadUserFromCookie());
    }
  }, [dispatch, user]);

  return user;
}
