import { useEffect, useRef, useState } from 'react';
import ContactForm from '../components/ContactForm';
import { getProjects, getHomeContent } from '../services/api';

const SERVICES = [
  { num: '01', icon: '🤖', title: 'Chat System', desc: 'Custom bots that engage communities, automate moderation, run events, and create unforgettable server experiences.' },
  { num: '02', icon: '🌐', title: 'Web Applications', desc: 'Full-stack platforms built with React and Node.js — scalable, performant, and beautifully designed.' },
  { num: '03', icon: '📚', title: 'Course Platforms', desc: 'End-to-end digital course ecosystems with payments, progress tracking, video delivery, and community.' },
  { num: '04', icon: '📅', title: 'Scheduling Systems', desc: 'Intelligent scheduling tools that eliminate friction for businesses managing appointments, staff, or resources.' },
];

const MARQUEE_ITEMS = ['React', '●', 'Node.js', '●', 'MongoDB', '●', 'Chat API', '●', 'Full Stack', '●', 'Custom Software', '●', 'Digital Products', '●', 'Sphere Digital', '●'];

const FALLBACK_PROJECTS = [
  { _id: '1', title: 'Community Hub Bot', category: 'chat-system', description: 'A feature-rich Community Hub Bot powering 50,000+ member communities with moderation, games, and analytics.', techStack: ['Node.js', 'Chat SDK', 'MongoDB'], featured: true },
  { _id: '2', title: 'LearnFlow LMS', category: 'digital-courses', description: 'A full-featured learning management system with video streaming, progress tracking, and certificates.', techStack: ['React', 'Node.js', 'Stripe'] },
  { _id: '3', title: 'ShiftSync', category: 'scheduling', description: 'Intelligent workforce scheduling platform reducing no-shows by 60% with smart reminders.', techStack: ['React', 'Express', 'MongoDB'] },
];

const DEFAULT_HOME_CONTENT = {
  servicesLabel: 'What We Do',
  servicesTitle: 'Software that moves the needle',
  workLabel: 'Selected Work',
  workTitle: "Products we're proud of",
  stats: [
    { value: '12+', label: 'Projects Shipped' },
    { value: '50k+', label: 'Users Reached' },
    { value: '4', label: 'Product Categories' },
    { value: '100%', label: 'Client Satisfaction' }
  ]
};

const TEMPLATE_PACKS = [
  {
    id: 'starter',
    name: 'Studio Starter',
    type: 'Business Website',
    price: '$149',
    desc: 'A polished 5-page template for service businesses with conversion-focused sections.',
    features: ['Landing + Services + Contact', 'Mobile-first layouts', 'Easy CMS-ready structure'],
  },
  {
    id: 'course',
    name: 'Course Launch Kit',
    type: 'Digital Product',
    price: '$199',
    desc: 'A product-focused site template designed for creators launching a course or membership.',
    features: ['Sales page blocks', 'Pricing + FAQ sections', 'Checkout-ready flow'],
  },
  {
    id: 'agency',
    name: 'Agency Showcase',
    type: 'Portfolio',
    price: '$249',
    desc: 'A premium portfolio template with case-study sections and high-impact hero layouts.',
    features: ['Case study pages', 'Team + testimonials', 'Lead capture CTA system'],
  },
];

export default function Home() {
  const [projects, setProjects] = useState(FALLBACK_PROJECTS);
  const [homeContent, setHomeContent] = useState(DEFAULT_HOME_CONTENT);
  const [galleryState, setGalleryState] = useState({ open: false, title: '', images: [], index: 0 });
  const observerRef = useRef(null);

  useEffect(() => {
    getProjects({ featured: true }).then(res => {
      if (res.data.length > 0) setProjects(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    getHomeContent()
      .then(res => setHomeContent({ ...DEFAULT_HOME_CONTENT, ...res.data }))
      .catch(() => {});
  }, []);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.fade-up').forEach(el => observerRef.current.observe(el));
    return () => observerRef.current?.disconnect();
  }, [projects]);

  const displayProjects = projects.slice(0, 3);

  const getProjectImages = (project) => {
    const list = [];
    if (Array.isArray(project.imageUrls)) {
      project.imageUrls.forEach(url => {
        if (typeof url === 'string' && url.trim()) list.push(url.trim());
      });
    }
    if (project.imageUrl && !list.includes(project.imageUrl)) list.unshift(project.imageUrl);
    return list;
  };

  const openGallery = (project) => {
    const images = getProjectImages(project);
    if (images.length === 0) return;
    setGalleryState({ open: true, title: project.title, images, index: 0 });
  };

  const closeGallery = () => setGalleryState({ open: false, title: '', images: [], index: 0 });

  const stepGallery = (dir) => {
    setGalleryState(prev => {
      const total = prev.images.length;
      if (!total) return prev;
      return { ...prev, index: (prev.index + dir + total) % total };
    });
  };

  return (
    <>
      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-bg-grid" />
        <div className="hero-orb" />
        <div className="hero-eyebrow">Sphere Digital — Est. 2024</div>
        <h1>We Build<br />Digital <em>Empires</em></h1>
        <p className="hero-sub">From Chat to full-scale web platforms — we craft the software that puts your brand in a different league.</p>
        <div className="hero-actions">
          <a href="#contact" className="btn-primary">Start a Project</a>
          <a href="#work" className="btn-ghost">View Our Work →</a>
        </div>
        <div className="hero-scroll">Scroll to explore</div>
      </section>

      {/* MARQUEE */}
      <section className="marquee-section">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className={item === '●' ? 'dot' : ''}>{item}</span>
          ))}
        </div>
      </section>

      {/* SERVICES */}
      <section className="services" id="services">
        <div className="section-label fade-up">{homeContent.servicesLabel}</div>
        <h2 className="section-title fade-up">{homeContent.servicesTitle}</h2>
        <div className="services-grid">
          {SERVICES.map(s => (
            <div key={s.num} className="service-card fade-up">
              <div className="service-number">{s.num}</div>
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="stats">
        <div className="stats-grid">
          {(homeContent.stats || DEFAULT_HOME_CONTENT.stats).slice(0, 4).map((stat, i) => (
            <div key={`${stat.label}-${i}`} className="stat fade-up">
              <div className="stat-number">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* WORK */}
      <section className="work" id="work">
        <div className="work-header">
          <div>
            <div className="section-label fade-up">{homeContent.workLabel}</div>
            <h2 className="section-title fade-up" style={{ marginBottom: 0 }}>{homeContent.workTitle}</h2>
          </div>
        </div>
        <div className="work-grid">
          {displayProjects.map((project, i) => (
            <div key={project._id} className={`project-card fade-up ${i === 0 ? 'large' : 'small'}`}>
              <button
                className={`project-media project-media-btn media-${(i % 3) + 1}`}
                style={project.imageUrl ? { backgroundImage: `url(${project.imageUrl})` } : undefined}
                onClick={() => openGallery(project)}
                disabled={getProjectImages(project).length === 0}
              >
                {!project.imageUrl && <span>Project sample preview</span>}
                {getProjectImages(project).length > 0 && <span className="project-media-cta">Open gallery</span>}
              </button>
              <div className="project-category">{project.category?.replace('-', ' ')}</div>
              <h3>{project.title}</h3>
              <p>{project.description}</p>
              <div className="project-footer">
                <div className="project-tags">
                  {(project.techStack || []).map(t => <span key={t} className="tag">{t}</span>)}
                </div>
                {project.liveUrl && <span className="project-arrow">↗</span>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TEMPLATES */}
      <section className="templates" id="templates">
        <div className="section-label fade-up">Template Shop</div>
        <h2 className="section-title fade-up">Buy ready-made <em>website templates</em></h2>
        <div className="templates-grid">
          {TEMPLATE_PACKS.map((pack, i) => (
            <article key={pack.id} className="template-card fade-up">
              <div className={`template-preview variant-${i + 1}`}>
                <span>{pack.type}</span>
              </div>
              <div className="template-meta">
                <p>{pack.type}</p>
                <strong>{pack.price}</strong>
              </div>
              <h3>{pack.name}</h3>
              <p>{pack.desc}</p>
              <ul className="template-list">
                {pack.features.map(item => <li key={item}>{item}</li>)}
              </ul>
              <a href="/templates" className="btn-primary template-btn">Buy This Template</a>
            </article>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact" id="contact">
        <div className="contact-grid">
          <div className="contact-info">
            <div className="section-label fade-up">Get In Touch</div>
            <h2 className="fade-up">Ready to build<br /><em>something great?</em></h2>
            <p className="fade-up">Tell us about your project. We'll get back to you within 24 hours with a plan to make it happen.</p>
            <div className="contact-detail fade-up">
              <span>✉</span>
              <a href="mailto:hello@spheredigital.io">hello@spheredigital.io</a>
            </div>
            <div className="contact-detail fade-up">
              <span>◎</span>
              <span>Available worldwide, remote-first</span>
            </div>
          </div>
          <div className="fade-up">
            <ContactForm />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-copy">
          © {new Date().getFullYear()} Sphere Digital. All rights reserved.
        </div>
        <div className="footer-links">
          <a href="#services">Services</a>
          <a href="#work">Work</a>
          <a href="#templates">Templates</a>
          <a href="#contact">Contact</a>
          <a href="/admin">Admin</a>
        </div>
      </footer>

      {galleryState.open && (
        <div className="gallery-modal" onClick={closeGallery}>
          <div className="gallery-panel" onClick={(e) => e.stopPropagation()}>
            <div className="gallery-head">
              <h3>{galleryState.title}</h3>
              <button className="gallery-close" onClick={closeGallery}>Close</button>
            </div>
            <div className="gallery-main">
              <button className="gallery-nav" onClick={() => stepGallery(-1)} aria-label="Previous image">‹</button>
              <div className="gallery-image-wrap">
                <img src={galleryState.images[galleryState.index]} alt={`${galleryState.title} screenshot ${galleryState.index + 1}`} className="gallery-image" />
              </div>
              <button className="gallery-nav" onClick={() => stepGallery(1)} aria-label="Next image">›</button>
            </div>
            <div className="gallery-thumbs">
              {galleryState.images.map((url, idx) => (
                <button key={`${url}-${idx}`} className={`gallery-thumb ${idx === galleryState.index ? 'active' : ''}`} onClick={() => setGalleryState(prev => ({ ...prev, index: idx }))}>
                  <img src={url} alt={`Thumbnail ${idx + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
