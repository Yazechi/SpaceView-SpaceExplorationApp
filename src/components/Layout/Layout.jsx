import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import Starfield from '../Starfield/Starfield';
import PageTransition from '../PageTransition/PageTransition';

function Layout() {
  return (
    <>
      <Starfield />
      <Navbar />
      <main>
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      <Footer />
    </>
  );
}

export default Layout;
