import React from 'react';
import Navbar from './Navbar';
import { Breadcrumb } from './Breadcrumb';
import Footer from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <Breadcrumb />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
};
