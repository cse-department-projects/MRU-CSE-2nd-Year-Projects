import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../common/Header';
import { Footer } from '../common/Footer';

export const AppLayout: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      <Header />
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
