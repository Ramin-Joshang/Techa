// components/ConditionalSidebar.js
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import ExerciseSidebar from "../../components/exercises/ExerciseSidebar";

const HIDDEN_PATHS = ["/questions"];
const EXERCISE_PATHS = ["/exercises", "?tab=1"];

export default function ConditionalSidebar() {
    const pathname = usePathname();
    if (!pathname) return null;

    const shouldHide = HIDDEN_PATHS.some((path) =>
        pathname === path || pathname.includes(path)
    );

    if (shouldHide) return null;

    const isExercisePage = EXERCISE_PATHS.some((path) =>
        pathname === path || pathname.includes(path)
    );

    // ۳. انتخاب کامپوننت مناسب
    if (isExercisePage) {
        return <ExerciseSidebar />;
    }

    // در غیر این صورت → سایدبار معمولی
    return <Sidebar />;
}