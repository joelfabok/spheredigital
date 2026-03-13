import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdmin = location.pathname.startsWith('/admin');
  if (isAdmin) return null;

  return (
    <nav className={`site-nav ${scrolled ? 'scrolled' : ''}`}>
      <Link to="/" className="nav-logo">Sphere<span>.</span></Link>
      <ul className="nav-links">
        <li><a href="/#services">Services</a></li>
        <li><a href="/#work">Work</a></li>
        <li><Link className="nav-link" to="/templates">Templates</Link></li>
        <li><a href="/#contact">Contact</a></li>
      </ul>
      <a href="/#contact" className="nav-cta">Start a Project</a>
    </nav>
  );
}
