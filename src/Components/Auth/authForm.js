import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Auth.module.css';

export const EMAIL_RE = /^\S+@\S+\.\S+$/;

/** Labelled input with inline error wired through aria-describedby/aria-invalid. */
export const Field = ({ id, label, error, hint, children, ...inputProps }) => (
  <div className="field">
    <label htmlFor={id}>{label}</label>
    {children || (
      <input
        id={id}
        className="input"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${id}-err` : hint ? `${id}-hint` : undefined}
        {...inputProps}
      />
    )}
    {hint && !error && <p id={`${id}-hint`} className="field-hint">{hint}</p>}
    {error && <p id={`${id}-err`} className="field-error">{error}</p>}
  </div>
);

export const PasswordField = ({ id, label, error, ...rest }) => {
  const { t } = useTranslation();
  const [show, setShow] = useState(false);
  return (
    <Field id={id} label={label} error={error}>
      <div className={styles.passwordRow}>
        <input
          id={id}
          className="input"
          type={show ? 'text' : 'password'}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          {...rest}
        />
        <button type="button" className={styles.toggle} aria-pressed={show} onClick={() => setShow((v) => !v)}>
          {show ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
        </button>
      </div>
    </Field>
  );
};

/** First message from a DRF field error ({field: ["msg"]}) or a plain string. */
export const firstMessage = (value) => (Array.isArray(value) ? value[0] : typeof value === 'string' ? value : '');
