import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Dialog from '../Dialog/Dialog';
import authService from '../../services/authService';

const LogoutModal = ({ isOpen, onClose, onLogoutSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const confirm = async () => {
    setBusy(true);
    try {
      await authService.logout(); // clears the local session even if the API call fails
    } finally {
      setBusy(false);
      onLogoutSuccess?.();
      navigate('/');
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      title={t('auth.logout.title')}
      placement="center"
      footer={(
        <div style={{ display: 'flex', gap: 'var(--s-3)', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={onClose} disabled={busy}>{t('auth.logout.cancel')}</button>
          <button type="button" className="btn btn-primary" onClick={confirm} disabled={busy}>
            {busy ? t('auth.logout.confirming') : t('auth.logout.confirm')}
          </button>
        </div>
      )}
    >
      <p>{t('auth.logout.message')}</p>
    </Dialog>
  );
};

export default LogoutModal;
