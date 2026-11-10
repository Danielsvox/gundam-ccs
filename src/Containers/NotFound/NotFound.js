import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import StateMessage from '../../Components/StateMessage/StateMessage';
import { useDocumentTitle } from '../../hooks/hooks';

const NotFound = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  useDocumentTitle(t('notFound.title'));
  return (
    <div className="container" style={{ paddingBlock: 'var(--s-7)' }}>
      <StateMessage
        headingLevel={1}
        title={t('notFound.title')}
        actions={(
          <>
            <Link to="/" className="btn btn-primary">{t('notFound.goHome')}</Link>
            <Link to="/browse" className="btn">{t('notFound.goCatalog')}</Link>
          </>
        )}
      >
        {t('notFound.body', { path: pathname })}
      </StateMessage>
    </div>
  );
};

export default NotFound;
