"use client"
import { usePathname } from "next/navigation";
import Sidebar from "../../components/account/Sidebar";
import styles from "../../styles/Account.module.css"
import { useEffect } from "react";
export default function DashboardLayout({ children }) {

    const pathname = usePathname()

    // useEffect(() => {
    //     console.log(pathname)
    //     if (pathname.includes('/account')) {
    //         document.body.classList.add(styles.accountBody);
    //     }
    //     return () => {
    //         document.body.classList.remove(styles.accountBody);
    //     };
    // }, [pathname]);

    return (
        <>
            <Sidebar />
            <section className="flex-1 pt-32 lg:mr-72 overflow-hidden">
                {children}
            </section>
        </>
    )
}