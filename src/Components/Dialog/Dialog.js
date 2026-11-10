import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../Icon/Icon';
import { useScrollLock } from '../../hooks/hooks';
import styles from './Dialog.module.css';

/**
 * Modal surface built on the native <dialog> element: focus is trapped, the page behind is
 * inert, Esc closes it and focus returns to the opener without any bespoke key handling.
 * `placement` = 'right' (drawer) | 'bottom' (sheet) | 'center'.
 */
const Dialog = ({ open, onClose, title, placement = 'right', children, footer, labelledBy }) => {
  const { t } = useTranslation();
  const ref = useRef(null);
  const titleId = useRef(`dlg-${Math.random().toString(36).slice(2, 8)}`).current;

  useScrollLock(open);

  useEffect(() => {
    const dlg = ref.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      if (typeof dlg.showModal === 'function') dlg.showModal();
      else dlg.setAttribute('open', '');
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  const onBackdrop = (event) => {
    // Clicks on the <dialog> element itself (not its content) are backdrop clicks.
    if (event.target === ref.current) onClose();
  };

  // The <dialog> stays mounted (so showModal/close and focus return work); its content only renders while open.
  return (
    <dialog
      ref={ref}
      className={`${styles.dialog} ${styles[placement]}`}
      aria-labelledby={labelledBy || titleId}
      onCancel={(e) => { e.preventDefault(); onClose(); }}
      onClick={onBackdrop}
    >
      {open && (
        <div className={styles.panel}>
          <header className={styles.header}>
            <h2 id={titleId} className={styles.title}>{title}</h2>
            <button type="button" className={styles.close} onClick={onClose} aria-label={t('common.close')}>
              <Icon name="close" />
            </button>
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      )}
    </dialog>
  );
};

export default Dialog;
