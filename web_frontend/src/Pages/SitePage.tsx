import Hero from "../Components/SiteHome/Hero/Hero";
import Success from "../Components/SiteHome/Success/Success";
import Choose from "../Components/SiteHome/Choose/Choose";
import Features from "../Components/SiteHome/Features/Features";
import Work from "../Components/SiteHome/Work/Work";
import SiteNavbar from "../Components/SiteHome/SiteNavbar/SiteNavbar.tsx";
import Faq from "../Components/SiteHome/Faq/Faq";
import Contact from "../Components/SiteHome/Contact/Contact";
import Footer from "../Components/SiteHome/Footer/Footer";
const SitePage = () => {
  return (
    <>
    <SiteNavbar/>
    <Hero/>
    <Success/>
    <Choose/>
    <Features/>
    <Work/>
    <Faq/>
    <Contact/>
    <Footer/>
    </>
  );
};

export default SitePage;
