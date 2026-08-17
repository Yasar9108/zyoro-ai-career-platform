import Navbar from "../components/Landing/Navbar/Navbar";
import { Outlet } from "react-router-dom";

function MainLayout() {

    return (
        <>
            <Navbar />

            <main
                style={{
                    padding:"30px"
                }}
            >
                <Outlet />
            </main>
        </>
    );

}

export default MainLayout;