"use client";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import cartReducer from "../features/cart/cartSlice";
import docsReducer from "../features/main/docs/docsSlice";
import packagesReducer from "../features/main/packages/packagesSlice";
import blogsReducer from "../features/main/blog/blogsSlice";
import contentsReducer from "../features/main/contents/contentsSlice";
import exercisesReducer from "../features/main/exercises/exercisesSlice";
import quizzesReducer from "../features/main/quizzes/quizzesSlice";
import reviewsReducer from "../features/main/reviews/reviewsSlice";
import questionsReducer from "../features/main/questions/questionsSlice";
import userRedcer from "../features/account/user/UserSlice";
import newsletterReducer from "../features/main/newsletter/newsletterSlice";
import userCoursesReducer from "../features/account/userCourses/UserCoursesSlice";
import roadmapReducer from "../features/account/roadmap/roadmapSlice";
import dashboardReducer from "../features/account/dashboard/dashboardSlice";
import ticketsReducer from "../features/account/ticket/ticketsSlice";
import { injectStore } from "../lib/utils/axios";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    auth: authReducer,
    user: userRedcer,
    dashboard: dashboardReducer,
    docs: docsReducer,
    packages: packagesReducer,
    blogs: blogsReducer,
    contents: contentsReducer,
    exercises: exercisesReducer,
    quizzes: quizzesReducer,
    reviews: reviewsReducer,
    questions: questionsReducer,
    newsletter: newsletterReducer,
    userCourses: userCoursesReducer,
    roadmap: roadmapReducer,
    tickets: ticketsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

injectStore(store);
export default store;
