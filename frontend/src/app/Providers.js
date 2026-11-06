"use client";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { loadFromLocalStorage } from "../features/cart/cartSlice";
import { loadUserFromCookie } from "../features/auth/authSlice";
import store from "../store/store";

export function Providers({ children }) {
    useEffect(() => {
        // 🛒 بارگذاری Cart از localStorage
        const savedCart = loadFromLocalStorage();
        if (savedCart) {
            store.dispatch({ type: 'cart/loadCart', payload: savedCart });
        }
        store.dispatch(loadUserFromCookie());
    }, []);

    return <Provider store={store}>{children}</Provider>;
}
