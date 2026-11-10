import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/hooks';
import { EMAIL_RE, Field, PasswordField, firstMessage } from './authForm';
import styles from './Auth.module.css';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const alertRef = useRef(null);
  useDocumentTitle(t('auth.login.title'));

  const goBack = () => {
    const target = localStorage.getItem('redirectAfterLogin');
    localStorage.removeItem('redirectAfterLogin');
    // Only follow in-app paths (guards against a tampered value).
    navigate(target && target.startsWith('/') && !target.startsWith('//') ? target : '/', { replace: true });
  };

  useEffect(() => { if (isAuthenticated) goBack(); }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name] || errors.general) setErrors((er) => ({ ...er, [name]: '', general: '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const next = {};
    if (!form.email) next.email = t('auth.errors.emailRequired');
    else if (!EMAIL_RE.test(form.email)) next.email = t('auth.errors.emailInvalid');
    if (!form.password) next.password = t('auth.errors.passwordRequired');
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await authService.login({ email: form.email.trim(), password: form.password });
      // AuthContext flips to authenticated; the effect above performs the redirect exactly once.
    } catch (err) {
      const data = err.response?.data;
      if (!err.response) setErrors({ general: t('errors.network') });
      else if (err.response.status >= 500) setErrors({ general: t('errors.server') });
      else if (err.response.status === 401 || data?.non_field_errors) setErrors({ general: t('auth.errors.invalidCredentials') });
      else setErrors({ email: firstMessage(data?.email), password: firstMessage(data?.password), general: firstMessage(data?.message) || (!data?.email && !data?.password ? t('auth.errors.generic') : '') });
      setTimeout(() => alertRef.current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.head}>
          <h1>{t('auth.login.title')}</h1>
          <p>{t('auth.login.subtitle')}</p>
        </div>

        {errors.general && <p ref={alertRef} tabIndex={-1} className={styles.alert} role="alert">{errors.general}</p>}

        <form className={styles.form} onSubmit={submit} noValidate>
          <Field id="email" name="email" type="email" autoComplete="email" label={t('auth.login.email')} value={form.email} onChange={change} error={errors.email} disabled={loading} />
          <PasswordField id="password" name="password" autoComplete="current-password" label={t('auth.login.password')} value={form.password} onChange={change} error={errors.password} disabled={loading} />
          <Link to="/forgot-password">{t('auth.login.forgot')}</Link>
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? t('auth.login.submitting') : t('auth.login.submit')}
          </button>
        </form>

        <p className={styles.foot}>
          {t('auth.login.noAccount')} <Link to="/register">{t('auth.login.register')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
