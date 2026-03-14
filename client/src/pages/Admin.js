import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getContacts,
  updateContactStatus,
  replyToContact,
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getHomeContent,
  updateHomeContent,
  updateAdminAccount,
  getAdminTemplates,
  getTemplateSalesStats,
  createTemplate,
  updateTemplate,
  deleteTemplate
} from '../services/api';
import { normalizeImageUrl } from '../utils/imageUrl';
import API from '../services/api';

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-head">
        <div className="admin-sidebar-head-row">
          <Link to="/" className="admin-brand-link">
            <h2 className="admin-brand">
              Sphere<span style={{ color: 'var(--accent)' }}>.</span>
            </h2>
          </Link>
          <button
            type="button"
            className="admin-nav-toggle"
            onClick={() => setIsMobileNavOpen((prev) => !prev)}
            aria-label="Toggle admin navigation"
            aria-expanded={isMobileNavOpen}
          >
            {isMobileNavOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        <p className="admin-subtitle">Admin Panel</p>
      </div>
      <nav className={`admin-nav ${isMobileNavOpen ? 'open' : ''}`}>
        <a href="#overview" onClick={() => setIsMobileNavOpen(false)}>Overview</a>
        <a href="#account-settings" onClick={() => setIsMobileNavOpen(false)}>Account</a>
        <a href="#homepage-content" onClick={() => setIsMobileNavOpen(false)}>Homepage</a>
        <a href="#project-showcase-manager" onClick={() => setIsMobileNavOpen(false)}>Projects</a>
        <a href="#template-store-manager" onClick={() => setIsMobileNavOpen(false)}>Templates</a>
        <a href="#template-sales" onClick={() => setIsMobileNavOpen(false)}>Sales</a>
        <a href="#recent-contacts" onClick={() => setIsMobileNavOpen(false)}>Contacts</a>
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
  const [contactSearch, setContactSearch] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('all');
  const [contactVisibleCount, setContactVisibleCount] = useState(8);
  const [contactUpdatingId, setContactUpdatingId] = useState('');
  const [contactActionError, setContactActionError] = useState('');
  const [activeContact, setActiveContact] = useState(null);
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [replyStatus, setReplyStatus] = useState('idle');
  const [replyError, setReplyError] = useState('');
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
  const [salesStatus, setSalesStatus] = useState('idle');
  const [salesSummary, setSalesSummary] = useState({
    paidSessions: 0,
    totalUnitsSold: 0,
    totalRevenue: 0,
    topSeller: null
  });
  const [salesRows, setSalesRows] = useState([]);
  const [salesSearch, setSalesSearch] = useState('');
  const [salesMessage, setSalesMessage] = useState('');
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
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
  const [templateFileUpload, setTemplateFileUpload] = useState('idle');

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
    let cancelled = false;

    const loadSales = async () => {
      setSalesStatus('loading');
      try {
        const response = await getTemplateSalesStats();
        if (cancelled) return;
        setSalesRows(response.data?.data || []);
        setSalesSummary(response.data?.summary || {
          paidSessions: 0,
          totalUnitsSold: 0,
          totalRevenue: 0,
          topSeller: null
        });
        setSalesMessage(response.data?.message || '');
        setSalesStatus('ready');
      } catch {
        if (cancelled) return;
        setSalesStatus('error');
      }
    };

    loadSales();
    return () => {
      cancelled = true;
    };
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

  const resetTemplateForm = () => {
    setTemplateForm({
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
    setEditingTemplateId(null);
  };

  const handleEditTemplate = (template) => {
    setEditingTemplateId(template._id);
    setTemplateForm({
      name: template.name || '',
      slug: template.slug || '',
      description: template.description || '',
      imageUrl: template.imageUrl || '',
      downloadUrl: template.downloadUrl || '',
      previewUrl: template.previewUrl || '',
      previewHtml: template.previewHtml || '',
      category: template.category || 'website',
      price: typeof template.price === 'number' ? String(template.price) : '',
      salePrice: typeof template.salePrice === 'number' ? String(template.salePrice) : '',
      onSale: !!template.onSale,
      active: typeof template.active === 'boolean' ? template.active : true,
      features: Array.isArray(template.features) ? template.features.join(', ') : ''
    });
    setTemplateStatus('idle');
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name || !templateForm.slug || !templateForm.description || !templateForm.price) {
      setTemplateStatus('validation');
      return;
    }

    setTemplateStatus('saving');
    try {
      const payload = {
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
      };

      if (editingTemplateId) {
        await updateTemplate(editingTemplateId, payload);
      } else {
        await createTemplate(payload);
      }

      const refreshed = await getAdminTemplates();
      setTemplates(refreshed.data || []);
      resetTemplateForm();
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

  const handleTemplateFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setTemplateFileUpload('uploading');
    try {
      const { data } = await API.post('/templates/r2-presign', {
        filename: file.name,
        contentType: file.type || 'application/octet-stream',
      });
      await fetch(data.uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
        body: file,
      });
      setTemplateForm(prev => ({ ...prev, downloadUrl: data.publicUrl }));
      setTemplateFileUpload('done');
      setTimeout(() => setTemplateFileUpload('idle'), 2000);
    } catch {
      setTemplateFileUpload('error');
      setTimeout(() => setTemplateFileUpload('idle'), 3000);
    } finally {
      event.target.value = '';
    }
  };

  const filteredContacts = useMemo(() => {
    const query = contactSearch.trim().toLowerCase();

    return contacts.filter((contact) => {
      const matchesStatus = contactStatusFilter === 'all' || contact.status === contactStatusFilter;
      if (!matchesStatus) return false;

      if (!query) return true;

      return [
        contact.name,
        contact.email,
        contact.company,
        contact.service,
        contact.message
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [contacts, contactSearch, contactStatusFilter]);

  const visibleContacts = filteredContacts.slice(0, contactVisibleCount);

  const humanizeService = (service) => {
    return String(service || 'other')
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  };

  const truncateText = (text, maxLength = 90) => {
    const value = String(text || '').trim();
    if (value.length <= maxLength) return value;
    return `${value.slice(0, maxLength)}...`;
  };

  const handleUpdateContactStatus = async (contactId, status) => {
    setContactActionError('');
    setContactUpdatingId(contactId);
    try {
      const updated = await updateContactStatus(contactId, status);
      setContacts((prev) => prev.map((item) => (item._id === contactId ? updated.data : item)));
    } catch {
      setContactActionError('Could not update contact status.');
    } finally {
      setContactUpdatingId('');
    }
  };

  const openContactModal = async (contact) => {
    if (!contact) return;

    setActiveContact(contact);
    setReplyStatus('idle');
    setReplyError('');
    setReplySubject(`Re: Your ${humanizeService(contact.service)} inquiry`);
    setReplyMessage(`Hi ${contact.name || 'there'},\n\nThanks for reaching out to Sphere Digital.\n\n`);

    if (contact.status === 'new') {
      try {
        const updated = await updateContactStatus(contact._id, 'read');
        setContacts((prev) => prev.map((item) => (item._id === contact._id ? updated.data : item)));
        setActiveContact(updated.data);
      } catch {
        setContactActionError('Could not mark message as read.');
      }
    }
  };

  const closeContactModal = () => {
    setActiveContact(null);
    setReplyStatus('idle');
    setReplyError('');
  };

  const handleSendReply = async () => {
    if (!activeContact?._id) return;

    const cleanSubject = replySubject.trim();
    const cleanMessage = replyMessage.trim();

    if (!cleanSubject || !cleanMessage) {
      setReplyError('Subject and message are required.');
      setReplyStatus('error');
      return;
    }

    setReplyStatus('sending');
    setReplyError('');

    try {
      const response = await replyToContact(activeContact._id, {
        subject: cleanSubject,
        message: cleanMessage
      });

      const updatedContact = response.data?.contact;
      if (updatedContact) {
        setContacts((prev) => prev.map((item) => (item._id === updatedContact._id ? updatedContact : item)));
        setActiveContact(updatedContact);
      }

      setReplyStatus('sent');
    } catch (error) {
      setReplyStatus('error');
      const message = error?.response?.data?.message || 'Could not send reply email.';
      const detail = error?.response?.data?.details;
      setReplyError(detail ? `${message} (${detail})` : message);
    }
  };

  const filteredSalesRows = useMemo(() => {
    const query = salesSearch.trim().toLowerCase();
    if (!query) return salesRows;

    return salesRows.filter((row) => {
      return [row.name, row.slug, row.category]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
    });
  }, [salesRows, salesSearch]);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(Number(value || 0));
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main admin-main-content">
        <div id="overview" style={{ marginBottom: '2rem' }}>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.3em', color: 'var(--accent)', textTransform: 'uppercase' }}>Welcome back</p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', marginTop: '0.3rem' }}>Dashboard</h1>
        </div>

        {loading ? <div className="page-loading">Loading...</div> : (
          <>
            <div className="admin-stats-grid admin-stats-grid-overview">
              {[
                { label: 'Total Contacts', value: contacts.length },
                { label: 'New Inquiries', value: newContacts, highlight: true },
                { label: 'Total Products', value: templates.length },
                { label: 'Total Projects', value: projects.length },
              ].map(stat => (
                <div key={stat.label} className="admin-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.35rem', color: stat.highlight ? 'var(--accent)' : 'var(--white)' }}>{stat.value}</div>
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
              <p style={{ color: 'var(--text-mid)', marginBottom: '0.8rem', fontSize: '0.85rem' }}>
                Search and triage incoming inquiries without leaving the dashboard.
              </p>

              {newContacts > 0 && (
                <div className="admin-new-email-banner">
                  <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {newContacts} new {newContacts === 1 ? 'email' : 'emails'} waiting
                  </p>
                  <button
                    type="button"
                    onClick={() => openContactModal(contacts.find((item) => item.status === 'new'))}
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(201, 169, 110, 0.45)',
                      color: 'var(--accent)',
                      padding: '0.35rem 0.6rem',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.62rem',
                      letterSpacing: '0.11em',
                      textTransform: 'uppercase'
                    }}
                  >
                    Open Latest
                  </button>
                </div>
              )}

              <div className="admin-contact-controls">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Search contacts</label>
                  <input
                    value={contactSearch}
                    onChange={(e) => {
                      setContactSearch(e.target.value);
                      setContactVisibleCount(8);
                    }}
                    placeholder="Name, email, company, service, message"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label>Status filter</label>
                  <select
                    value={contactStatusFilter}
                    onChange={(e) => {
                      setContactStatusFilter(e.target.value);
                      setContactVisibleCount(8);
                    }}
                  >
                    <option value="all">All statuses</option>
                    <option value="new">New</option>
                    <option value="read">Read</option>
                    <option value="replied">Replied</option>
                  </select>
                </div>
              </div>

              <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginBottom: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                Showing {visibleContacts.length} of {filteredContacts.length} matching contacts ({contacts.length} total)
              </p>

              {contactActionError && (
                <p style={{ color: '#e05', fontSize: '0.75rem', marginBottom: '0.7rem' }}>{contactActionError}</p>
              )}

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Email</th><th>Company</th><th>Service</th><th>Message</th><th>Status</th><th>Date</th><th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleContacts.length > 0 ? visibleContacts.map(c => (
                      <tr key={c._id}>
                        <td>{c.name}</td>
                        <td style={{ color: 'var(--text-mid)' }}>
                          <a href={`mailto:${c.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>{c.email}</a>
                        </td>
                        <td style={{ color: 'var(--text-mid)' }}>{c.company || '-'}</td>
                        <td style={{ color: 'var(--text-mid)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem' }}>{humanizeService(c.service)}</td>
                        <td style={{ maxWidth: '340px', color: 'var(--text-mid)' }} title={c.message || ''}>{truncateText(c.message)}</td>
                        <td>
                          <select
                            value={c.status}
                            onChange={(e) => handleUpdateContactStatus(c._id, e.target.value)}
                            disabled={contactUpdatingId === c._id}
                            style={{
                              background: 'var(--card)',
                              color: 'var(--text)',
                              border: '1px solid var(--border)',
                              padding: '0.35rem 0.4rem',
                              fontSize: '0.7rem',
                              fontFamily: 'var(--font-mono)',
                              minWidth: '92px'
                            }}
                          >
                            <option value="new">new</option>
                            <option value="read">read</option>
                            <option value="replied">replied</option>
                          </select>
                        </td>
                        <td style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                          {new Date(c.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            type="button"
                            onClick={() => openContactModal(c)}
                            style={{
                              background: 'transparent',
                              color: 'var(--accent)',
                              border: '1px solid var(--border)',
                              padding: '0.35rem 0.55rem',
                              fontFamily: 'var(--font-mono)',
                              fontSize: '0.64rem',
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase'
                            }}
                          >
                            Open
                          </button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={8} style={{ color: 'var(--text-mid)', textAlign: 'center', padding: '1rem' }}>
                          No contacts match your current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {visibleContacts.length < filteredContacts.length && (
                <button
                  type="button"
                  onClick={() => setContactVisibleCount((prev) => prev + 8)}
                  style={{
                    marginTop: '0.9rem',
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    color: 'var(--text-mid)',
                    padding: '0.55rem 0.9rem',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.65rem',
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}
                >
                  Load 8 More
                </button>
              )}
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                    <input
                      type="file"
                      accept=".zip,.html,.htm"
                      onChange={handleTemplateFileUpload}
                      disabled={templateFileUpload === 'uploading'}
                      style={{ fontSize: '0.75rem', color: 'var(--text-mid)' }}
                    />
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: templateFileUpload === 'error' ? 'var(--accent)' : 'var(--text-dim)' }}>
                      {templateFileUpload === 'uploading' ? 'Uploading to R2...' : templateFileUpload === 'done' ? '✓ Uploaded — URL filled' : templateFileUpload === 'error' ? 'Upload failed (check R2 config)' : 'Or upload to R2'}
                    </span>
                  </div>
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
                <button className="form-submit" onClick={handleSaveTemplate} disabled={templateStatus === 'saving'} style={{ width: 'auto', marginTop: 0, padding: '0.75rem 1.2rem' }}>
                  {templateStatus === 'saving' ? 'Saving...' : editingTemplateId ? 'Update Template' : 'Add Template'}
                </button>
                {editingTemplateId && (
                  <button onClick={resetTemplateForm} style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-mid)', padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.68rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Cancel Edit
                  </button>
                )}
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
                              <button onClick={() => handleEditTemplate(t)} style={{ background: 'transparent', color: 'var(--accent)', border: '1px solid var(--border)', padding: '0.35rem 0.6rem', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                                Edit
                              </button>
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

            <div className="admin-card" id="template-sales">
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '1rem' }}>Template Sales</h3>
              <p style={{ color: 'var(--text-mid)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Search sold templates and quickly identify what has sold the most.
              </p>

              <div className="admin-stats-grid" style={{ marginBottom: '1rem' }}>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--white)' }}>{salesSummary.totalUnitsSold || 0}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Units Sold</div>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--white)' }}>{formatCurrency(salesSummary.totalRevenue || 0)}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Revenue</div>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', color: 'var(--accent)' }}>{salesSummary.topSeller?.name || '-'}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-dim)', marginTop: '0.3rem' }}>Top Seller</div>
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Search by template name, slug, or category</label>
                <input
                  value={salesSearch}
                  onChange={(e) => setSalesSearch(e.target.value)}
                  placeholder="Try: studio, portfolio, business"
                />
              </div>

              {salesMessage && (
                <p style={{ color: 'var(--text-mid)', fontSize: '0.8rem', marginBottom: '1rem' }}>{salesMessage}</p>
              )}

              {salesStatus === 'loading' && (
                <p style={{ color: 'var(--text-mid)', fontSize: '0.8rem', marginBottom: '1rem' }}>Loading sales analytics...</p>
              )}

              {salesStatus === 'error' && (
                <p style={{ color: '#e05', fontSize: '0.8rem', marginBottom: '1rem' }}>Could not load sales analytics.</p>
              )}

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Template</th><th>Category</th><th>Units Sold</th><th>Orders</th><th>Revenue</th><th>Last Sold</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSalesRows.length > 0 ? filteredSalesRows.map((sale) => (
                      <tr key={`${sale.templateId || sale.name}-${sale.category}`}>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span>{sale.name}</span>
                            {sale.slug ? (
                              <span style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.64rem' }}>
                                {sale.slug}
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-mid)' }}>{sale.category || '-'}</td>
                        <td>{sale.soldCount || 0}</td>
                        <td>{sale.orderCount || 0}</td>
                        <td>{formatCurrency(sale.revenue || 0)}</td>
                        <td style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                          {sale.lastSoldAt ? new Date(sale.lastSoldAt).toLocaleDateString() : '-'}
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-mid)', padding: '1rem' }}>
                          {salesRows.length === 0 ? 'No sold templates yet.' : 'No sales match your search.'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {activeContact && (
              <div
                role="button"
                tabIndex={0}
                onClick={closeContactModal}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    closeContactModal();
                    return;
                  }

                  // Ignore key events bubbled from inputs/textareas to prevent accidental close while typing.
                  if (e.currentTarget !== e.target) return;
                }}
                style={{
                  position: 'fixed',
                  inset: 0,
                  background: 'rgba(8, 8, 8, 0.84)',
                  zIndex: 1600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '1rem'
                }}
              >
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    width: 'min(980px, 100%)',
                    border: '1px solid var(--border)',
                    background: 'var(--card)',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '1rem',
                    padding: '1rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.6rem', marginBottom: '0.7rem' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem' }}>Email Details</h3>
                      <button
                        type="button"
                        onClick={closeContactModal}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          color: 'var(--text-mid)',
                          padding: '0.4rem 0.6rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.62rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase'
                        }}
                      >
                        Close
                      </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.7rem', marginBottom: '0.7rem' }}>
                      <div style={{ border: '1px solid var(--border)', padding: '0.6rem' }}>
                        <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>From</p>
                        <p style={{ marginTop: '0.3rem', color: 'var(--white)' }}>{activeContact.name}</p>
                      </div>
                      <div style={{ border: '1px solid var(--border)', padding: '0.6rem' }}>
                        <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Email</p>
                        <p style={{ marginTop: '0.3rem', color: 'var(--white)' }}>{activeContact.email}</p>
                      </div>
                      <div style={{ border: '1px solid var(--border)', padding: '0.6rem' }}>
                        <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Service</p>
                        <p style={{ marginTop: '0.3rem', color: 'var(--white)' }}>{humanizeService(activeContact.service)}</p>
                      </div>
                      <div style={{ border: '1px solid var(--border)', padding: '0.6rem' }}>
                        <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Received</p>
                        <p style={{ marginTop: '0.3rem', color: 'var(--white)' }}>{new Date(activeContact.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div style={{ border: '1px solid var(--border)', padding: '0.75rem' }}>
                      <p style={{ color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', fontSize: '0.62rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '0.45rem' }}>Message</p>
                      <p style={{ color: 'var(--text-mid)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{activeContact.message}</p>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: '0.7rem' }}>Reply</h3>
                    <div className="form-group" style={{ marginBottom: '0.7rem' }}>
                      <label>Subject</label>
                      <input
                        value={replySubject}
                        onChange={(e) => setReplySubject(e.target.value)}
                        placeholder="Reply subject"
                      />
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.7rem' }}>
                      <label>Message</label>
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        rows={10}
                        placeholder="Write your reply..."
                      />
                    </div>

                    {activeContact.lastReply?.sentAt && (
                      <p style={{ color: 'var(--text-dim)', fontSize: '0.72rem', marginBottom: '0.6rem', fontFamily: 'var(--font-mono)' }}>
                        Last reply sent: {new Date(activeContact.lastReply.sentAt).toLocaleString()}
                      </p>
                    )}

                    {replyStatus === 'sent' && (
                      <p style={{ color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', marginBottom: '0.6rem' }}>
                        Reply sent and contact marked as replied.
                      </p>
                    )}

                    {(replyError || replyStatus === 'error') && (
                      <p style={{ color: '#e05', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', marginBottom: '0.6rem' }}>
                        {replyError || 'Could not send reply.'}
                      </p>
                    )}

                    <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={handleSendReply}
                        disabled={replyStatus === 'sending'}
                        style={{
                          background: 'var(--accent)',
                          color: 'var(--black)',
                          border: 'none',
                          padding: '0.65rem 0.9rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.68rem',
                          letterSpacing: '0.1em',
                          textTransform: 'uppercase'
                        }}
                      >
                        {replyStatus === 'sending' ? 'Sending...' : 'Send Reply'}
                      </button>

                      <button
                        type="button"
                        onClick={() => window.open(`mailto:${activeContact.email}`, '_blank')}
                        style={{
                          background: 'transparent',
                          border: '1px solid var(--border)',
                          color: 'var(--text-mid)',
                          padding: '0.65rem 0.85rem',
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.65rem',
                          letterSpacing: '0.09em',
                          textTransform: 'uppercase'
                        }}
                      >
                        Open Mail App
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
