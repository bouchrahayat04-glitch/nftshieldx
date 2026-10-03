import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();

  // Define routes where the footer should be hidden
  const hideFooterRoutes = ['/profile', '/mint'];
  const shouldShowFooter = !hideFooterRoutes.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[#050d1c]">
      <Navbar />
      <main className="flex-grow px-6 lg:px-12 mt-24 lg:mt-36">
        {children}
      </main>
      {/* Show footer only if route is not excluded */}
      {shouldShowFooter && <Footer />}
    </div>
  );
};

export default Layout;
