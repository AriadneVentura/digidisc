// Note: ReactNode since we are returning another page.
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Layout = ( { children }: { children: ReactNode } ) => {
    return (
        <div>
            <Navbar/>
            { children }
            <Footer/>
        </div>
    )
}
export default Layout
