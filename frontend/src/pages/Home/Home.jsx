import Hero from "../../components/Landing/Hero/Hero";
import Features from "../../components/Landing/Features/Features";
import WhyChooseUs from "../../components/Landing/WhyChooseUs/WhyChooseUs";
import SoftwareServices from "../../components/Landing/SoftwareServices/SoftwareServics";
import CTA from "../../components/Landing/Features/CTA/CTA";
import Footer from "../../components/Landing/Footer/Footer";

function Home() {
    return (
        <>
            <Hero />
            <Features/>
            <WhyChooseUs/>
            <SoftwareServices/>
            <CTA/>
            <Footer/>
        </>
    );
}

export default Home;