import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import authService from '../../services/authService';
import { useAuth } from '../../contexts/AuthContext';
import { useDocumentTitle } from '../../hooks/hooks';
import { EMAIL_RE, Field, PasswordField, firstMessage } from './authForm';
import styles from './Auth.module.css';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({ firstName: '', lastName: '', username: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const alertRef = useRef(null);
  useDocumentTitle(t('auth.register.title'));

  useEffect(() => {
    if (!isAuthenticated) return;
    const target = localStorage.getItem('redirectAfterLogin');
    localStorage.removeItem('redirectAfterLogin');
    navigate(target && target.startsWith('/') && !target.startsWith('//') ? target : '/', { replace: true });
  }, [isAuthenticated, navigate]);

  const change = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name] || errors.general) setErrors((er) => ({ ...er, [name]: '', general: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = t('auth.errors.firstNameRequired');
    if (!form.lastName.trim()) e.lastName = t('auth.errors.lastNameRequired');
    if (!form.username.trim()) e.username = t('auth.errors.usernameRequired');
    if (!form.email) e.email = t('auth.errors.emailRequired');
    else if (!EMAIL_RE.test(form.email)) e.email = t('auth.errors.emailInvalid');
    if (!form.password) e.password = t('auth.errors.passwordRequired');
    else if (form.password.length < 8) e.password = t('auth.errors.passwordShort');
    if (form.password && form.confirmPassword !== form.password) e.confirmPassword = t('auth.errors.passwordMismatch');
    return e;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      await authService.register({
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        ...(form.phone.trim() ? { phone: form.phone.trim() } : {}),
      });
    } catch (err) {
      const d = err.response?.data;
      if (!err.response) setErrors({ general: t('errors.network') });
      else if (err.response.status >= 500) setErrors({ general: t('errors.server') });
      else {
        // Server messages are shown as returned (they describe the exact rule that failed).
        setErrors({
          username: firstMessage(d?.username), email: firstMessage(d?.email), password: firstMessage(d?.password),
          firstName: firstMessage(d?.first_name), lastName: firstMessage(d?.last_name), phone: firstMessage(d?.phone),
          general: firstMessage(d?.non_field_errors) || firstMessage(d?.message) || t('auth.errors.fieldsInvalid'),
        });
      }
      setTimeout(() => alertRef.current?.focus(), 0);
    } finally {
      setLoading(false);
    }
  };

  const f = (name, label, extra = {}) => (
    <Field id={name} name={name} label={label} value={form[name]} onChange={change} error={errors[name]} disabled={loading} {...extra} />
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.head}>
          <h1>{t('auth.register.title')}</h1>
          <p>{t('auth.register.subtitle')}</p>
        </div>

        {errors.general && <p ref={alertRef} tabIndex={-1} className={styles.alert} role="alert">{errors.general}</p>}

        <form className={styles.form} onSubmit={submit} noValidate>
          <div className={styles.two}>
            {f('firstName', t('auth.register.firstName'), { autoComplete: 'given-name' })}
            {f('lastName', t('auth.register.lastName'), { autoComplete: 'family-name' })}
          </div>
          {f('username', t('auth.register.username'), { autoComplete: 'username' })}
          {f('email', t('auth.register.email'), { type: 'email', autoComplete: 'email' })}
          {f('phone', `${t('auth.register.phone')} (${t('common.optional')})`, { type: 'tel', autoComplete: 'tel' })}
          <PasswordField id="password" name="password" autoComplete="new-password" label={t('auth.register.password')} value={form.password} onChange={change} error={errors.password} disabled={loading} />
          <PasswordField id="confirmPassword" name="confirmPassword" autoComplete="new-password" label={t('auth.register.confirmPassword')} value={form.confirmPassword} onChange={change} error={errors.confirmPassword} disabled={loading} />
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? t('auth.register.submitting') : t('auth.register.submit')}
          </button>
        </form>

        <p className={styles.foot}>
          {t('auth.register.haveAccount')} <Link to="/login">{t('auth.register.signIn')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
