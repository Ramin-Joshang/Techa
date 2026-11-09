import { createSlice } from '@reduxjs/toolkit';

const isBrowser = typeof window !== 'undefined';

export const loadFromLocalStorage = () => {
    if (!isBrowser) return undefined;
    try {
        const serializedState = localStorage.getItem('cart');
        if (!serializedState) return undefined;
        return JSON.parse(serializedState);
    } catch (e) {
        console.warn('خطا در خواندن از localStorage:', e);
        return undefined;
    }
};

const saveToLocalStorage = (state) => {
    if (!isBrowser) return;
    try {
        localStorage.setItem('cart', JSON.stringify(state));
    } catch (e) {
        console.warn('خطا در ذخیره در localStorage:', e);
    }
};

const defaultState = {
    items: [],
    totalAmount: 0,
    discountCode: null,
    discountAmount: 0,
    selectedPayment: null,
};

const initialState = isBrowser ? loadFromLocalStorage() || defaultState : defaultState;

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const exists = state.items.some(item => item.Id === action.payload.Id);
            if (!exists) {
                state.items.push(action.payload);
            }
            state.totalAmount = state.items.reduce((sum, item) => sum + item.Price, 0);
            if (state.discountAmount) {
                state.totalAmount -= state.discountAmount;
            }
            saveToLocalStorage(state);
        },

        removeFromCart: (state, action) => {
            state.items = state.items.filter(item => item.Id !== action.payload);
            state.totalAmount = state.items.reduce((sum, item) => sum + item.Price, 0);
            if (state.discountAmount) {
                state.totalAmount -= state.discountAmount;
            }
            saveToLocalStorage(state);
        },

        applyDiscount: (state, action) => {
            const { code, type, value } = action.payload;
            state.discountCode = code;

            const baseTotal = state.items.reduce((sum, item) => sum + item.Price, 0);

            if (type === 'percent') {
                state.discountAmount = Math.round(baseTotal * (value / 100));
            } else if (type === 'fixed') {
                state.discountAmount = value;
            } else {
                state.discountAmount = 0;
            }

            state.totalAmount = baseTotal - state.discountAmount;
            saveToLocalStorage(state);
        },

        selectPayment: (state, action) => {
            state.selectedPayment = action.payload;
            saveToLocalStorage(state);
        },

        clearCart: (state) => {
            state.items = [];
            state.totalAmount = 0;
            state.discountCode = null;
            state.discountAmount = 0;
            state.selectedPayment = null;
            saveToLocalStorage(state);
        },
    },
});

export const { addToCart, removeFromCart, applyDiscount, selectPayment, clearCart } = cartSlice.actions;
export default cartSlice.reducer;