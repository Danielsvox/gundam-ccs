import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/hooks';
import StateMessage from '../StateMessage/StateMessage';
import { Field, firstMessage } from './authForm';
import styles from './Auth.module.css';

/**
 * Only fields the backend profile endpoint really accepts are editable
 * (first/last name, phone). Email is read-only on the server; there is no address on the profile.
 */
const UserProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState(null);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  useDocumentTitle(t('auth.profile.title'));

  const load = useCallback(async () => {
    setLoadFailed(false);
    try {
      const u = await authService.getProfile();
      setEmail(u.email || '');
      setForm({ firstName: u.first_name || '', lastName: u.last_name || '', phone: u.phone || '' });
    } catch (err) {
      if (err.response?.status !== 401) setLoadFailed(true);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem('redirectAfterLogin', '/profile');
      navigate('/login', { replace: true });
      return;
    }
    load();
  }, [isAuthenticated, load, navigate]);

  if (loadFailed) {
    return (
      <div className="container" style={{ paddingBlock: 'var(--s-7)' }}>
        <StateMessage tone="error" title={t('errors.unknown')} actions={<button type="button" className="btn" onClick={load}>{t('common.retry')}</button>} />
      </div>
    );
  }
  if (!form) return <p role="status" className="container" style={{ paddingBlock: 'var(--s-7)' }}>{t('common.loading')}</p>;

  const change = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
    setErrors((er) => ({ ...er, [e.target.name]: '', general: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.firstName.trim()) found.firstName = t('auth.errors.firstNameRequired');
    if (!form.lastName.trim()) found.lastName = t('auth.errors.lastNameRequired');
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await authService.updateProfile({ first_name: form.firstName.trim(), last_name: form.lastName.trim(), phone: form.phone.trim() });
      setSaved(true);
    } catch (err) {
      const d = err.response?.data;
      if (!err.response) setErrors({ general: t('errors.network') });
      else setErrors({ firstName: firstMessage(d?.first_name), lastName: firstMessage(d?.last_name), phone: firstMessage(d?.phone), general: err.response.status >= 500 ? t('errors.server') : t('auth.errors.fieldsInvalid') });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.head}><h1>{t('auth.profile.title')}</h1></div>
        {saved && <p className={styles.ok} role="status">{t('auth.profile.saved')}</p>}
        {errors.general && <p className={styles.alert} role="alert">{errors.general}</p>}
        <form className={styles.form} onSubmit={submit} noValidate>
          <div className={styles.two}>
            <Field id="firstName" name="firstName" label={t('auth.profile.firstName')} autoComplete="given-name" value={form.firstName} onChange={change} error={errors.firstName} disabled={saving} />
            <Field id="lastName" name="lastName" label={t('auth.profile.lastName')} autoComplete="family-name" value={form.lastName} onChange={change} error={errors.lastName} disabled={saving} />
          </div>
          <Field id="email" label={t('auth.profile.email')} value={email} readOnly aria-readonly="true" className="input" />
          <Field id="phone" name="phone" type="tel" label={t('auth.profile.phone')} autoComplete="tel" value={form.phone} onChange={change} error={errors.phone} disabled={saving} />
          <div className={styles.actions}>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? t('auth.profile.saving') : t('auth.profile.save')}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserProfile;
