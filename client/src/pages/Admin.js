import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getContacts,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getHomeContent,
  updateHomeContent,
  updateAdminAccount,
  getAdminTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate
} from '../services/api';
import { normalizeImageUrl } from '../utils/imageUrl';

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-head">
        <Link to="/" className="admin-brand-link">
          <h2 className="admin-brand">
            Sphere<span style={{ color: 'var(--accent)' }}>.</span>
          </h2>
        </Link>
        <p className="admin-subtitle">Admin Panel</p>
      </div>
      <nav className="admin-nav">
        <a href="#overview">Overview</a>
        <a href="#account-settings">Account</a>
        <a href="#homepage-content">Homepage</a>
        <a href="#project-showcase-manager">Projects</a>
        <a href="#template-store-manager">Templates</a>
        <a href="#recent-contacts">Contacts</a>
      </nav>
      <button onClick={handleLogout} className="admin-signout-btn">
        Sign Out
      </button>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const cloudinaryCloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
  const cloudinaryUploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
  const hasCloudinaryConfig = Boolean(cloudinaryCloudName && cloudinaryUploadPreset);

  const [contacts, setContacts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [homeContent, setHomeContent] = useState({
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
  });
  const [contentStatus, setContentStatus] = useState('idle');
  const [accountStatus, setAccountStatus] = useState('idle');
  const [accountForm, setAccountForm] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [templateStatus, setTemplateStatus] = useState('idle');
  const [projectStatus, setProjectStatus] = useState('idle');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    slug: '',
    category: 'web-app',
    description: '',
    techStack: '',
    imageUrl: '',
    imageUrls: '',
    liveUrl: '',
    featured: true,
    order: 0
  });
  const [templateForm, setTemplateForm] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    downloadUrl: '',
    previewUrl: '',
    previewHtml: '',
    category: 'website',
    price: '',
    salePrice: '',
    onSale: false,
    active: true,
    features: ''
  });
  const [loading, setLoading] = useState(true);
  const [uploadState, setUploadState] = useState({
    projectPrimary: 'idle',
    projectGallery: 'idle',
    templateImage: 'idle',
    templateHtml: 'idle',
    error: ''
  });

  useEffect(() => {
    Promise.all([getContacts(), getProjects(), getHomeContent(), getAdminTemplates()])
      .then(([c, p, hc, t]) => {
        setContacts(c.data);
        setProjects(p.data);
        setTemplates(t.data || []);
        setHomeContent(prev => ({ ...prev, ...hc.data }));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user?.email) {
      setAccountForm(prev => ({ ...prev, email: prev.email || user.email }));
    }
  }, [user]);

  const saveHomeContent = async () => {
    setContentStatus('saving');
    try {
      const res = await updateHomeContent(homeContent);
      setHomeContent(res.data);
      setContentStatus('saved');
      setTimeout(() => setContentStatus('idle'), 1800);
    } catch {
      setContentStatus('error');
    }
  };

  const updateStat = (index, field, value) => {
    setHomeContent(prev => {
      const nextStats = [...(prev.stats || [])];
      while (nextStats.length < 4) nextStats.push({ value: '', label: '' });
      nextStats[index] = { ...nextStats[index], [field]: value };
      return { ...prev, stats: nextStats };
    });
  };

  const handleUpdateAccount = async () => {
    if (!accountForm.currentPassword) {
      setAccountStatus('validation');
      return;
    }
    if (accountForm.newPassword && accountForm.newPassword !== accountForm.confirmNewPassword) {
      setAccountStatus('mismatch');
      return;
    }

    setAccountStatus('saving');
    try {
      await updateAdminAccount({
        email: accountForm.email,
        currentPassword: accountForm.currentPassword,
        newPassword: accountForm.newPassword || undefined
      });

      setAccountStatus('saved');
      setAccountForm(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      setTimeout(() => setAccountStatus('idle'), 2200);
    } catch {
      setAccountStatus('error');
    }
  };

  const handleCreateTemplate = async () => {
    if (!templateForm.name || !templateForm.slug || !templateForm.description || !templateForm.price) {
      setTemplateStatus('validation');
      return;
    }

    setTemplateStatus('saving');
    try {
      await createTemplate({
        name: templateForm.name,
        slug: templateForm.slug,
        description: templateForm.description,
        imageUrl: normalizeImageUrl(templateForm.imageUrl),
        downloadUrl: templateForm.downloadUrl,
        previewUrl: templateForm.previewUrl,
        previewHtml: templateForm.previewHtml,
        category: templateForm.category,
        price: Number(templateForm.price),
        salePrice: templateForm.salePrice ? Number(templateForm.salePrice) : undefined,
        onSale: templateForm.onSale,
        active: templateForm.active,
        features: templateForm.features
          .split(',')
          .map(item => item.trim())
          .filter(Boolean)
      });

      const refreshed = await getAdminTemplates();
      setTemplates(refreshed.data || []);
      setTemplateForm({
        name: '', slug: '', description: '', imageUrl: '', downloadUrl: '', previewUrl: '', previewHtml: '', category: 'website', price: '', salePrice: '', onSale: false, active: true, features: ''
      });
      setTemplateStatus('saved');
      setTimeout(() => setTemplateStatus('idle'), 1800);
    } catch {
      setTemplateStatus('error');
    }
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await deleteTemplate(id);
      setTemplates(prev => prev.filter(item => item._id !== id));
    } catch {
      setTemplateStatus('error');
    }
  };

  const handleToggleTemplate = async (template, field) => {
    try {
      const payload = {
        onSale: template.onSale,
        active: template.active,
        salePrice: template.salePrice
      };
      payload[field] = !template[field];
      await updateTemplate(template._id, payload);
      const refreshed = await getAdminTemplates();
      setTemplates(refreshed.data || []);
    } catch {
      setTemplateStatus('error');
    }
  };

  const resetProjectForm = () => {
    setProjectForm({
      title: '',
      slug: '',
      category: 'web-app',
      description: '',
      techStack: '',
      imageUrl: '',
      imageUrls: '',
      liveUrl: '',
      featured: true,
      order: 0
    });
    setEditingProjectId(null);
  };

  const handleEditProject = (project) => {
    setEditingProjectId(project._id);
    setProjectForm({
      title: project.title || '',
      slug: project.slug || '',
      category: project.category || 'web-app',
      description: project.description || '',
      techStack: Array.isArray(project.techStack) ? project.techStack.join(', ') : '',
      imageUrl: project.imageUrl || '',
      imageUrls: Array.isArray(project.imageUrls) ? project.imageUrls.join(', ') : '',
      liveUrl: project.liveUrl || '',
      featured: !!project.featured,
      order: typeof project.order === 'number' ? project.order : 0
    });
  };

  const handleSaveProject = async () => {
    if (!projectForm.title || !projectForm.slug || !projectForm.description) {
      setProjectStatus('validation');
      return;
    }

    setProjectStatus('saving');
    const payload = {
      title: projectForm.title,
      slug: projectForm.slug,
      category: projectForm.category,
      description: projectForm.description,
      techStack: projectForm.techStack.split(',').map(item => item.trim()).filter(Boolean),
      imageUrl: normalizeImageUrl(projectForm.imageUrl),
      imageUrls: projectForm.imageUrls.split(',').map(item => normalizeImageUrl(item.trim())).filter(Boolean),
      liveUrl: projectForm.liveUrl,
      featured: projectForm.featured,
      order: Number(projectForm.order) || 0
    };

    try {
      if (editingProjectId) {
        await updateProject(editingProjectId, payload);
      } else {
        await createProject(payload);
      }
      const refreshed = await getProjects();
      setProjects(refreshed.data || []);
      resetProjectForm();
      setProjectStatus('saved');
      setTimeout(() => setProjectStatus('idle'), 1800);
    } catch {
      setProjectStatus('error');
    }
  };

  const handleDeleteProject = async (id) => {
    try {
      await deleteProject(id);
      setProjects(prev => prev.filter(item => item._id !== id));
    } catch {
      setProjectStatus('error');
    }
  };

  const uploadToCloudinary = async (file) => {
    if (!hasCloudinaryConfig) {
      throw new Error('Cloudinary is not configured. Add REACT_APP_CLOUDINARY_CLOUD_NAME and REACT_APP_CLOUDINARY_UPLOAD_PRESET in client env.');
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryUploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Upload failed. Check your Cloudinary unsigned preset settings.');
    }

    const data = await response.json();
    return data.secure_url || data.url;
  };

  const mergeCsvUrls = (existingCsv, newUrls) => {
    const existing = existingCsv
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);

    const merged = [...existing];
    newUrls.forEach((url) => {
      if (url && !merged.includes(url)) merged.push(url);
    });

    return merged.join(', ');
  };

  const handleProjectPrimaryUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadState(prev => ({ ...prev, projectPrimary: 'uploading', error: '' }));
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      setProjectForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
      setUploadState(prev => ({ ...prev, projectPrimary: 'done' }));
      setTimeout(() => setUploadState(prev => ({ ...prev, projectPrimary: 'idle' })), 1800);
    } catch (err) {
      setUploadState(prev => ({ ...prev, projectPrimary: 'error', error: err.message || 'Could not upload image.' }));
    } finally {
      event.target.value = '';
    }
  };

  const handleProjectGalleryUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setUploadState(prev => ({ ...prev, projectGallery: 'uploading', error: '' }));
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const uploadedUrl = await uploadToCloudinary(file);
        uploadedUrls.push(uploadedUrl);
      }

      setProjectForm(prev => ({
        ...prev,
        imageUrls: mergeCsvUrls(prev.imageUrls, uploadedUrls)
      }));

      setUploadState(prev => ({ ...prev, projectGallery: 'done' }));
      setTimeout(() => setUploadState(prev => ({ ...prev, projectGallery: 'idle' })), 1800);
    } catch (err) {
      setUploadState(prev => ({ ...prev, projectGallery: 'error', error: err.message || 'Could not upload gallery images.' }));
    } finally {
      event.target.value = '';
    }
  };

  const handleTemplateImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadState(prev => ({ ...prev, templateImage: 'uploading', error: '' }));
    try {
      const uploadedUrl = await uploadToCloudinary(file);
      setTemplateForm(prev => ({ ...prev, imageUrl: uploadedUrl }));
      setUploadState(prev => ({ ...prev, templateImage: 'done' }));
      setTimeout(() => setUploadState(prev => ({ ...prev, templateImage: 'idle' })), 1800);
    } catch (err) {
      setUploadState(prev => ({ ...prev, templateImage: 'error', error: err.message || 'Could not upload template image.' }));
    } finally {
      event.target.value = '';
    }
  };

  const handleTemplateHtmlUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.html')) {
      setUploadState(prev => ({ ...prev, templateHtml: 'error', error: 'Please select a .html file for template preview.' }));
      event.target.value = '';
      return;
    }

    setUploadState(prev => ({ ...prev, templateHtml: 'uploading', error: '' }));

    try {
      const fileContent = await file.text();
      setTemplateForm(prev => ({ ...prev, previewHtml: fileContent }));
      setUploadState(prev => ({ ...prev, templateHtml: 'done' }));
      setTimeout(() => setUploadState(prev => ({ ...prev, templateHtml: 'idle' })), 1800);
    } catch {
      setUploadState(prev => ({ ...prev, templateHtml: 'error', error: 'Could not read HTML file.' }));
    } finally {
      event.target.value = '';
    }
  };

  const newContacts = contacts.filter(c => c.status === 'new').length;

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main" style={{ paddingTop: '3rem' }}>
        <div id="overview" style={{ marginBottom: '2rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--accent)', textTransform: 'uppercase' }}>Welcome back</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginTop: '0.3rem' }}>Dashboard</h1>
        </div>

        {loading ? <div className="page-loading">Loading...</div> : (
          <>
            <div className="admin-stats-grid">
              {[
                { label: 'Total Contacts', value: contacts.length },
                { label: 'New Inquiries', value: newContacts, highlight: true },
                { label: 'Total Projects', value: projects.length },
              ].map(stat => (
                <div key={stat.label} className="admin-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', color: stat.highlight ? 'var(--accent)' : 'var(--white)' }}>{stat.value}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="admin-card" id="account-settings">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem' }}>Account Settings</h3>
              <p style={{ color: 'var(--text-mid)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Change your admin email and password. Current password is required to confirm changes.
              </p>
              <div className="admin-form-grid">
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Admin Email</label>
                  <input
                    type="email"
                    value={accountForm.email}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="admin@yourdomain.com"
                  />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Current Password *</label>
                  <input
                    type="password"
                    value={accountForm.currentPassword}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={accountForm.newPassword}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Leave blank to keep existing"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={accountForm.confirmNewPassword}
                    onChange={(e) => setAccountForm(prev => ({ ...prev, confirmNewPassword: e.target.value }))}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1rem' }}>
                <button className="form-submit" onClick={handleUpdateAccount} disabled={accountStatus === 'saving'} style={{ width: 'auto', marginTop: 0, padding: '0.75rem 1.2rem' }}>
                  {accountStatus === 'saving' ? 'Updating...' : 'Update Account'}
                </button>
                {accountStatus === 'saved' && <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Account updated</span>}
                {accountStatus === 'validation' && <span style={{ color: '#e05', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Current password is required</span>}
                {accountStatus === 'mismatch' && <span style={{ color: '#e05', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>New passwords do not match</span>}
                {accountStatus === 'error' && <span style={{ color: '#e05', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Update failed</span>}
              </div>
            </div>

            <div className="admin-card" id="homepage-content">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem' }}>Homepage Content</h3>
              <p style={{ color: 'var(--text-mid)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Customize the Services and "Products we're proud of" section text shown on the homepage.
              </p>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Services Label</label>
                  <input
                    value={homeContent.servicesLabel}
                    onChange={(e) => setHomeContent(prev => ({ ...prev, servicesLabel: e.target.value }))}
                    placeholder="What We Do"
                  />
                </div>
                <div className="form-group">
                  <label>Services Title</label>
                  <input
                    value={homeContent.servicesTitle}
                    onChange={(e) => setHomeContent(prev => ({ ...prev, servicesTitle: e.target.value }))}
                    placeholder="Software that moves the needle"
                  />
                </div>
                <div className="form-group">
                  <label>Work Label</label>
                  <input
                    value={homeContent.workLabel}
                    onChange={(e) => setHomeContent(prev => ({ ...prev, workLabel: e.target.value }))}
                    placeholder="Selected Work"
                  />
                </div>
                <div className="form-group">
                  <label>Work Title</label>
                  <input
                    value={homeContent.workTitle}
                    onChange={(e) => setHomeContent(prev => ({ ...prev, workTitle: e.target.value }))}
                    placeholder="Products we're proud of"
                  />
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <p style={{ color: 'var(--text-mid)', marginBottom: '0.6rem', fontSize: '0.85rem' }}>
                  Stats Section
                </p>
                <div className="admin-form-grid">
                  {Array.from({ length: 4 }).map((_, index) => {
                    const stat = (homeContent.stats || [])[index] || { value: '', label: '' };
                    return (
                    <div key={`stat-${index}`} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      <div className="form-group">
                        <label>{`Stat ${index + 1} Value`}</label>
                        <input
                          value={stat.value || ''}
                          onChange={(e) => updateStat(index, 'value', e.target.value)}
                          placeholder="12+"
                        />
                      </div>
                      <div className="form-group">
                        <label>{`Stat ${index + 1} Label`}</label>
                        <input
                          value={stat.label || ''}
                          onChange={(e) => updateStat(index, 'label', e.target.value)}
                          placeholder="Projects Shipped"
                        />
                      </div>
                    </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1rem' }}>
                <button className="form-submit" onClick={saveHomeContent} disabled={contentStatus === 'saving'} style={{ width: 'auto', marginTop: 0, padding: '0.75rem 1.2rem' }}>
                  {contentStatus === 'saving' ? 'Saving...' : 'Save Homepage Content'}
                </button>
                {contentStatus === 'saved' && <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Saved</span>}
                {contentStatus === 'error' && <span style={{ color: '#e05', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Failed to save</span>}
              </div>
            </div>

            <div className="admin-card" id="recent-contacts">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem' }}>Recent Contacts</h3>
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Service</th><th>Status</th><th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.slice(0, 5).map(c => (
                      <tr key={c._id}>
                        <td>{c.name}</td>
                        <td style={{ color: 'var(--text-mid)' }}>{c.email}</td>
                        <td style={{ color: 'var(--text-mid)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>{c.service}</td>
                        <td>
                          <span className={`badge badge-${c.status}`}>{c.status}</span>
                        </td>
                        <td style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-card" id="project-showcase-manager">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem' }}>Projects Showcase Manager</h3>
              <p style={{ color: 'var(--text-mid)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Manage cards shown in the "Products we're proud of" section, including gallery images for each project.
              </p>
              <div className="admin-form-grid">
                <div className="form-group">
                  <label>Title *</label>
                  <input value={projectForm.title} onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))} placeholder="Project title" />
                </div>
                <div className="form-group">
                  <label>Slug *</label>
                  <input value={projectForm.slug} onChange={(e) => setProjectForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="project-slug" />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input value={projectForm.category} onChange={(e) => setProjectForm(prev => ({ ...prev, category: e.target.value }))} placeholder="web-app" />
                </div>
                <div className="form-group">
                  <label>Order</label>
                  <input type="number" value={projectForm.order} onChange={(e) => setProjectForm(prev => ({ ...prev, order: e.target.value }))} placeholder="0" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Description *</label>
                  <input value={projectForm.description} onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Short description for the card" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Tech Stack (comma-separated)</label>
                  <input value={projectForm.techStack} onChange={(e) => setProjectForm(prev => ({ ...prev, techStack: e.target.value }))} placeholder="React, Node.js, MongoDB" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Primary Image URL</label>
                  <input value={projectForm.imageUrl} onChange={(e) => setProjectForm(prev => ({ ...prev, imageUrl: e.target.value }))} placeholder="https://... (Google Drive share links supported)" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    <input type="file" accept="image/*" onChange={handleProjectPrimaryUpload} style={{ fontSize: '0.75rem', color: 'var(--text-mid)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-dim)' }}>
                      {uploadState.projectPrimary === 'uploading' ? 'Uploading...' : uploadState.projectPrimary === 'done' ? 'Uploaded' : 'Upload to Cloudinary'}
                    </span>
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Gallery Image URLs (comma-separated)</label>
                  <input value={projectForm.imageUrls} onChange={(e) => setProjectForm(prev => ({ ...prev, imageUrls: e.target.value }))} placeholder="https://img1.jpg, https://img2.jpg (Drive links also supported)" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    <input type="file" accept="image/*" multiple onChange={handleProjectGalleryUpload} style={{ fontSize: '0.75rem', color: 'var(--text-mid)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-dim)' }}>
                      {uploadState.projectGallery === 'uploading' ? 'Uploading gallery...' : uploadState.projectGallery === 'done' ? 'Gallery uploaded' : 'Upload one or more images to Cloudinary'}
                    </span>
                  </div>
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Live URL</label>
                  <input value={projectForm.liveUrl} onChange={(e) => setProjectForm(prev => ({ ...prev, liveUrl: e.target.value }))} placeholder="https://project-live-url.com" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-mid)' }}>
                  <input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm(prev => ({ ...prev, featured: e.target.checked }))} style={{ marginRight: '0.35rem' }} />
                  Featured on home
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1rem' }}>
                <button className="form-submit" onClick={handleSaveProject} disabled={projectStatus === 'saving'} style={{ width: 'auto', marginTop: 0, padding: '0.75rem 1.2rem' }}>
                  {projectStatus === 'saving' ? 'Saving...' : editingProjectId ? 'Update Project' : 'Add Project'}
                </button>
                {editingProjectId && (
                  <button onClick={resetProjectForm} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-mid)', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Cancel Edit
                  </button>
                )}
                {projectStatus === 'saved' && <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Saved</span>}
                {projectStatus === 'validation' && <span style={{ color: '#e05', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Please fill title, slug, and description</span>}
                {projectStatus === 'error' && <span style={{ color: '#e05', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Request failed</span>}
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th><th>Category</th><th>Featured</th><th>Order</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map(p => (
                        <tr key={p._id}>
                          <td>{p.title}</td>
                          <td style={{ color: 'var(--text-mid)' }}>{p.category}</td>
                          <td>{p.featured ? 'Yes' : 'No'}</td>
                          <td>{typeof p.order === 'number' ? p.order : 0}</td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <button onClick={() => handleEditProject(p)} style={{ background: 'transparent', color: 'var(--accent)', border: '1px solid var(--border)', padding: '0.35rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                                Edit
                              </button>
                              <button onClick={() => handleDeleteProject(p._id)} style={{ background: 'transparent', color: '#e05', border: '1px solid var(--border)', padding: '0.35rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="admin-card" id="template-store-manager">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem' }}>Template Store Manager</h3>
              <p style={{ color: 'var(--text-mid)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Add templates for purchase, set sale pricing, publish/unpublish, and remove products.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                <div className="form-group">
                  <label>Name</label>
                  <input value={templateForm.name} onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Studio Starter" />
                </div>
                <div className="form-group">
                  <label>Slug</label>
                  <input value={templateForm.slug} onChange={(e) => setTemplateForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="studio-starter" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Description</label>
                  <input value={templateForm.description} onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))} placeholder="Describe the template and ideal customer" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Download URL</label>
                  <input value={templateForm.downloadUrl} onChange={(e) => setTemplateForm(prev => ({ ...prev, downloadUrl: e.target.value }))} placeholder="https://.../template.zip" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Preview URL (optional)</label>
                  <input value={templateForm.previewUrl} onChange={(e) => setTemplateForm(prev => ({ ...prev, previewUrl: e.target.value }))} placeholder="https://.../index.html" />
                </div>
                <div className="form-group">
                  <label>Image URL</label>
                  <input value={templateForm.imageUrl} onChange={(e) => setTemplateForm(prev => ({ ...prev, imageUrl: e.target.value }))} placeholder="https://... (Google Drive share links supported)" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    <input type="file" accept="image/*" onChange={handleTemplateImageUpload} style={{ fontSize: '0.75rem', color: 'var(--text-mid)' }} />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-dim)' }}>
                      {uploadState.templateImage === 'uploading' ? 'Uploading...' : uploadState.templateImage === 'done' ? 'Uploaded' : 'Upload to Cloudinary'}
                    </span>
                  </div>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <input value={templateForm.category} onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value }))} placeholder="business" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>HTML Preview File (.html)</label>
                  <input type="file" accept=".html,text/html" onChange={handleTemplateHtmlUpload} style={{ fontSize: '0.75rem', color: 'var(--text-mid)' }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--text-dim)' }}>
                      {uploadState.templateHtml === 'uploading' ? 'Reading HTML file...' : uploadState.templateHtml === 'done' ? 'HTML file loaded' : templateForm.previewHtml ? 'HTML preview loaded' : 'Upload a single index.html preview file'}
                    </span>
                    {templateForm.previewHtml && (
                      <button
                        type="button"
                        onClick={() => setTemplateForm(prev => ({ ...prev, previewHtml: '' }))}
                        style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-mid)', padding: '0.3rem 0.55rem', fontFamily: 'var(--font-mono)', fontSize: '0.62rem' }}
                      >
                        Clear HTML
                      </button>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Price (USD)</label>
                  <input type="number" value={templateForm.price} onChange={(e) => setTemplateForm(prev => ({ ...prev, price: e.target.value }))} placeholder="149" />
                </div>
                <div className="form-group">
                  <label>Sale Price (USD)</label>
                  <input type="number" value={templateForm.salePrice} onChange={(e) => setTemplateForm(prev => ({ ...prev, salePrice: e.target.value }))} placeholder="99" />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Features (comma-separated)</label>
                  <input value={templateForm.features} onChange={(e) => setTemplateForm(prev => ({ ...prev, features: e.target.value }))} placeholder="Responsive layout, Sales sections, Contact flow" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.8rem' }}>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-mid)' }}>
                  <input type="checkbox" checked={templateForm.onSale} onChange={(e) => setTemplateForm(prev => ({ ...prev, onSale: e.target.checked }))} style={{ marginRight: '0.35rem' }} />
                  On Sale
                </label>
                <label style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'var(--text-mid)' }}>
                  <input type="checkbox" checked={templateForm.active} onChange={(e) => setTemplateForm(prev => ({ ...prev, active: e.target.checked }))} style={{ marginRight: '0.35rem' }} />
                  Active
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '1rem' }}>
                <button className="form-submit" onClick={handleCreateTemplate} disabled={templateStatus === 'saving'} style={{ width: 'auto', marginTop: 0, padding: '0.75rem 1.2rem' }}>
                  {templateStatus === 'saving' ? 'Saving...' : 'Add Template'}
                </button>
                {templateStatus === 'saved' && <span style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Saved</span>}
                {templateStatus === 'validation' && <span style={{ color: '#e05', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Please fill required fields</span>}
                {templateStatus === 'error' && <span style={{ color: '#e05', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>Request failed</span>}
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th><th>Price</th><th>Sale</th><th>Download</th><th>Preview</th><th>Status</th><th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {templates.map(t => (
                        <tr key={t._id}>
                          <td>{t.name}</td>
                          <td>${t.price}</td>
                          <td>{t.onSale && typeof t.salePrice === 'number' ? `$${t.salePrice}` : '-'}</td>
                          <td>{t.downloadUrl ? 'set' : 'missing'}</td>
                          <td>{t.previewUrl || t.previewHtml ? 'set' : 'missing'}</td>
                          <td>
                            <span className={`badge ${t.active ? 'badge-new' : 'badge-read'}`}>
                              {t.active ? 'active' : 'inactive'}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
                              <button onClick={() => handleToggleTemplate(t, 'onSale')} style={{ background: 'transparent', color: 'var(--accent)', border: '1px solid var(--border)', padding: '0.35rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                                {t.onSale ? 'Remove Sale' : 'Put On Sale'}
                              </button>
                              <button onClick={() => handleToggleTemplate(t, 'active')} style={{ background: 'transparent', color: 'var(--text-mid)', border: '1px solid var(--border)', padding: '0.35rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                                {t.active ? 'Unpublish' : 'Publish'}
                              </button>
                              <button onClick={() => handleDeleteTemplate(t._id)} style={{ background: 'transparent', color: '#e05', border: '1px solid var(--border)', padding: '0.35rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {uploadState.error && (
              <div className="admin-card" style={{ borderColor: 'rgba(224, 0, 85, 0.4)', marginTop: '0.5rem' }}>
                <p style={{ color: '#e05', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{uploadState.error}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export { Sidebar };
