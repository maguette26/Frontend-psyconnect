import Header from './header';
import PiedPage from './PiedPage';
import { Outlet } from 'react-router-dom';

const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header />

      <main className="flex-grow">
        <Outlet />
      </main>

      <PiedPage />
    </div>
  );
};

export default Layout;