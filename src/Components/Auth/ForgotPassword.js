import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import { useDocumentTitle } from '../../hooks/hooks';
import { EMAIL_RE, Field, firstMessage } from './authForm';
import styles from './Auth.module.css';

const ForgotPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  useDocumentTitle(t('auth.forgot.title'));

  const submit = async (e) => {
    e.preventDefault();
    setSent(false);
    if (!email) return setError(t('auth.errors.emailRequired'));
    if (!EMAIL_RE.test(email)) return setError(t('auth.errors.emailInvalid'));
    setError('');
    setLoading(true);
    try {
      await authService.resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      if (!err.response) setError(t('errors.network'));
      else if (err.response.status >= 500) setError(t('errors.server'));
      else setError(firstMessage(err.response.data?.email) || t('auth.errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.head}>
          <h1>{t('auth.forgot.title')}</h1>
          <p>{t('auth.forgot.subtitle')}</p>
        </div>
        {sent && <p className={styles.ok} role="status">{t('auth.forgot.sent')}</p>}
        <form className={styles.form} onSubmit={submit} noValidate>
          <Field id="email" type="email" autoComplete="email" label={t('auth.forgot.email')} value={email} onChange={(e) => { setEmail(e.target.value); setError(''); }} error={error} disabled={loading} />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? t('auth.forgot.submitting') : t('auth.forgot.submit')}
          </button>
        </form>
        <p className={styles.foot}><Link to="/login">{t('auth.forgot.back')}</Link></p>
      </div>
    </div>
  );
};

export default ForgotPassword;
