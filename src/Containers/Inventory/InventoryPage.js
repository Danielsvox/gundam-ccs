import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../../Components/Icon/Icon';
import Dialog from '../../Components/Dialog/Dialog';
import StateMessage from '../../Components/StateMessage/StateMessage';
import inventoryService from '../../services/inventoryService';
import { useInventoryRole } from '../../hooks/useInventoryRole';
import { useDocumentTitle } from '../../hooks/hooks';
import { formatCents, toCents } from '../../lib/money';
import { flattenErrors } from '../../lib/apiError';
import styles from './InventoryPage.module.css';

const GRADES = ['HG', 'RG', 'MG', 'PG', 'SD', 'FM', 'RE', 'NG', 'OTHER'];
const EMPTY = {
    name: '', grade: 'HG', scale: '', manufacturer: 'Bandai', price: '', sale_price: '',
    short_description: '', description: '', stock_quantity: '0', is_active: true, cost_usd: '', investor: '',
};

/** Margin on the sale price, e.g. price 36, cost 16 -> 56%. BigInt cents, rounded half up. */
const margin = (price, cost) => {
    if (price === '' || cost === '' || price == null || cost == null) return null;
    try {
        const p = toCents(price); const c = toCents(cost);
        if (p <= 0n) return null;
        return Number(((p - c) * 200n + p) / (2n * p));
    } catch { return null; }
};

const StockCell = ({ product, onChange, busy }) => {
    const { t } = useTranslation();
    return (
        <div className={styles.stock} role="group" aria-label={t('inventory.stock')}>
            <button type="button" className="btn btn-sm" disabled={busy || product.stock_quantity < 1}
                aria-label={t('inventory.decrease', { name: product.name })} onClick={() => onChange(product, -1)}>
                <Icon name="minus" size={14} />
            </button>
            <output className={`${styles.qty} ${product.stock_quantity === 0 ? styles.out : ''}`}>{product.stock_quantity}</output>
            <button type="button" className="btn btn-sm" disabled={busy}
                aria-label={t('inventory.increase', { name: product.name })} onClick={() => onChange(product, 1)}>
                <Icon name="plus" size={14} />
            </button>
        </div>
    );
};

const ProductForm = ({ product, role, onClose, onSaved }) => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.resolvedLanguage || 'es').slice(0, 2);
    const editing = Boolean(product?.id);
    const [form, setForm] = useState(() => (editing ? {
        ...EMPTY, ...Object.fromEntries(Object.entries(product).map(([k, v]) => [k, v ?? ''])),
        stock_quantity: String(product.stock_quantity),
    } : EMPTY));
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(product?.image || null);
    const [error, setError] = useState(null);
    const [saving, setSaving] = useState(false);
    const [history, setHistory] = useState(null);

    useEffect(() => () => { if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview); }, [preview]);

    const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const onFile = (e) => {
        const f = e.target.files?.[0];
        if (!f) return;
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const submit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);
        const data = new FormData();
        const keys = ['name', 'grade', 'scale', 'manufacturer', 'price', 'short_description', 'description', 'stock_quantity'];
        if (role === 'owner') keys.push('cost_usd', 'investor');
        keys.forEach((k) => data.append(k, form[k] ?? ''));
        data.append('is_active', form.is_active ? 'true' : 'false');
        // An empty sale price means "no sale": send nothing for new products, clear it when editing.
        if (form.sale_price !== '') data.append('sale_price', form.sale_price);
        else if (editing) data.append('sale_price', '');
        if (role === 'owner' && form.cost_usd === '') data.delete('cost_usd');
        if (file) data.append('new_image', file);
        try {
            const saved = editing ? await inventoryService.update(product.id, data) : await inventoryService.create(data);
            onSaved(saved);
        } catch (err) {
            setError(flattenErrors(err.response?.data) || t('errors.unknown'));
        } finally {
            setSaving(false);
        }
    };

    const loadHistory = async () => {
        try { setHistory(await inventoryService.movements(product.id)); } catch { setHistory([]); }
    };

    const field = (key, label, props = {}) => (
        <div className="field">
            <label htmlFor={`inv-${key}`}>{label}</label>
            <input id={`inv-${key}`} className="input" value={form[key]} onChange={set(key)} {...props} />
        </div>
    );

    return (
        <form onSubmit={submit} className={styles.form}>
            <div className={styles.photoRow}>
                <div className={styles.photo}>
                    {preview ? <img src={preview} alt="" /> : <span>{t('inventory.noPhoto')}</span>}
                </div>
                <div className="field">
                    <label htmlFor="inv-photo">{t('inventory.photo')}</label>
                    <input id="inv-photo" type="file" accept="image/*" onChange={onFile} />
                    <p className={styles.hint}>{t('inventory.photoHint')}</p>
                </div>
            </div>

            {field('name', t('inventory.name'), { required: true, maxLength: 200 })}
            <div className={styles.grid2}>
                <div className="field">
                    <label htmlFor="inv-grade">{t('inventory.grade')}</label>
                    <select id="inv-grade" className="input" value={form.grade} onChange={set('grade')}>
                        {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
                {field('scale', t('inventory.scale'), { placeholder: '1/144', maxLength: 20 })}
                {field('manufacturer', t('inventory.brand'), { maxLength: 100 })}
                {field('stock_quantity', t('inventory.stock'), { type: 'number', min: 0, step: 1, required: true })}
                {field('price', t('inventory.price'), { type: 'number', min: 0, step: '0.01', required: true })}
                {field('sale_price', t('inventory.salePrice'), { type: 'number', min: 0, step: '0.01' })}
            </div>
            {field('short_description', t('inventory.shortDescription'), { maxLength: 255 })}
            <div className="field">
                <label htmlFor="inv-description">{t('inventory.description')}</label>
                <textarea id="inv-description" className="input" rows={3} value={form.description} onChange={set('description')} />
            </div>

            {role === 'owner' && (
                <fieldset className={styles.private}>
                    <legend>{t('inventory.privateData')}</legend>
                    <p className={styles.hint}>{t('inventory.privateHint')}</p>
                    <div className={styles.grid2}>
                        {field('cost_usd', t('inventory.cost'), { type: 'number', min: 0, step: '0.01' })}
                        {field('investor', t('inventory.investor'), { maxLength: 200 })}
                    </div>
                    {margin(form.price, form.cost_usd) !== null && (
                        <p className={styles.hint}>
                            {t('inventory.margin')}: {margin(form.price, form.cost_usd)}%
                            {' · '}{formatCents(toCents(form.price) - toCents(form.cost_usd), 'USD', lang)}
                        </p>
                    )}
                </fieldset>
            )}

            <label className={styles.check}>
                <input type="checkbox" checked={Boolean(form.is_active)} onChange={set('is_active')} />
                <span>{t('inventory.visible')}</span>
            </label>

            {error && <p className="field-error" role="alert">{error}</p>}

            {editing && (
                <div>
                    <button type="button" className="btn btn-sm" onClick={loadHistory}>{t('inventory.history')}</button>
                    {history && (
                        <ul className={styles.history}>
                            {history.length === 0 && <li>{t('inventory.noHistory')}</li>}
                            {history.map((m) => (
                                <li key={m.id}>
                                    <strong>{m.delta > 0 ? `+${m.delta}` : m.delta}</strong> → {m.quantity_after}
                                    {' · '}{t(`inventory.reason.${m.reason}`)}
                                    {m.order_number ? ` ${m.order_number}` : ''}{m.user ? ` · ${m.user}` : ''}
                                    {' · '}{new Date(m.created_at).toLocaleString(lang === 'es' ? 'es-VE' : 'en-US')}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            <div className={styles.formActions}>
                <button type="button" className="btn" onClick={onClose}>{t('common.cancel')}</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? t('common.saving') : t('common.save')}</button>
            </div>
        </form>
    );
};

const InventoryPage = () => {
    const { t, i18n } = useTranslation();
    const lang = (i18n.resolvedLanguage || 'es').slice(0, 2);
    useDocumentTitle(t('inventory.title'));
    const { role, ready } = useInventoryRole();

    const [products, setProducts] = useState(null);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [view, setView] = useState('active'); // active | archived | all
    const [editing, setEditing] = useState(null); // product | {} (new) | null
    const [busyId, setBusyId] = useState(null);
    const [notice, setNotice] = useState(null);

    const load = useCallback(async () => {
        try { setError(null); setProducts(await inventoryService.list()); } catch { setError(true); }
    }, []);
    useEffect(() => { if (role) load(); }, [role, load]);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (products || []).filter((p) => (view === 'all' || (view === 'active') === p.is_active)
            && (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)));
    }, [products, search, view]);

    const replace = (saved) => setProducts((list) => {
        const exists = list.some((p) => p.id === saved.id);
        return exists ? list.map((p) => (p.id === saved.id ? saved : p)) : [...list, saved].sort((a, b) => a.name.localeCompare(b.name));
    });

    const changeStock = async (product, delta) => {
        setBusyId(product.id);
        try { replace(await inventoryService.adjustStock(product.id, { delta, reason: 'adjustment' })); }
        catch (err) { setNotice(flattenErrors(err.response?.data) || t('errors.unknown')); }
        finally { setBusyId(null); }
    };

    const toggleActive = async (product) => {
        setBusyId(product.id);
        try {
            const data = new FormData();
            data.append('is_active', product.is_active ? 'false' : 'true');
            replace(await inventoryService.update(product.id, data));
        } catch (err) { setNotice(flattenErrors(err.response?.data) || t('errors.unknown')); }
        finally { setBusyId(null); }
    };

    if (!ready) return <p role="status" className="container" style={{ paddingBlock: 'var(--s-7)' }}>{t('common.loading')}</p>;
    if (!role) {
        return (
            <div className="container" style={{ paddingBlock: 'var(--s-7)' }}>
                <StateMessage tone="error" title={t('inventory.noAccessTitle')} actions={<Link to="/" className="btn">{t('notFound.goHome')}</Link>}>
                    {t('inventory.noAccess')}
                </StateMessage>
            </div>
        );
    }

    const owner = role === 'owner';
    const money = (v) => formatCents(toCents(v), 'USD', lang);
    const lowCount = (products || []).filter((p) => p.is_active && p.stock_quantity === 0).length;

    return (
        <div className={`container ${styles.page}`}>
            <header className={styles.head}>
                <div>
                    <h1>{t('inventory.title')}</h1>
                    <p className={styles.hint}>{t('inventory.intro')}</p>
                </div>
                <button type="button" className="btn btn-primary" onClick={() => setEditing({})}>
                    <Icon name="plus" size={16} /> {t('inventory.add')}
                </button>
            </header>

            <div className={styles.toolbar}>
                <div className="field">
                    <label htmlFor="inv-search" className="sr-only">{t('inventory.search')}</label>
                    <input id="inv-search" type="search" className="input" placeholder={t('inventory.search')}
                        value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className={styles.views} role="group" aria-label={t('inventory.show')}>
                    {['active', 'archived', 'all'].map((v) => (
                        <button key={v} type="button" className={`btn btn-sm ${view === v ? 'btn-primary' : ''}`} aria-pressed={view === v}
                            onClick={() => setView(v)}>{t(`inventory.view.${v}`)}</button>
                    ))}
                </div>
                {products && <p className={styles.summary}>
                    {t('inventory.count', { count: visible.length })}
                    {lowCount > 0 && <span className={styles.warn}> · {t('inventory.outCount', { count: lowCount })}</span>}
                </p>}
            </div>

            {notice && <p className="field-error" role="alert">{notice} <button type="button" className="btn btn-sm" onClick={() => setNotice(null)}>{t('common.close')}</button></p>}

            {error ? (
                <StateMessage tone="error" title={t('catalog.errorTitle')} actions={<button type="button" className="btn" onClick={load}>{t('common.retry')}</button>}>
                    {t('errors.network')}
                </StateMessage>
            ) : !products ? (
                <p role="status">{t('common.loading')}</p>
            ) : visible.length === 0 ? (
                <p>{t('inventory.empty')}</p>
            ) : (
                <div className={styles.tableWrap}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th scope="col"><span className="sr-only">{t('inventory.photo')}</span></th>
                                <th scope="col">{t('inventory.name')}</th>
                                <th scope="col">{t('inventory.price')}</th>
                                <th scope="col">{t('inventory.stock')}</th>
                                {owner && <th scope="col">{t('inventory.cost')}</th>}
                                {owner && <th scope="col">{t('inventory.investor')}</th>}
                                <th scope="col">{t('inventory.visibleShort')}</th>
                                <th scope="col"><span className="sr-only">{t('inventory.edit')}</span></th>
                            </tr>
                        </thead>
                        <tbody>
                            {visible.map((p) => (
                                <tr key={p.id} className={p.is_active ? '' : styles.archived}>
                                    <td data-label="">{p.image ? <img className={styles.thumb} src={p.image} alt="" /> : <span className={styles.thumb} aria-hidden="true" />}</td>
                                    <th scope="row" data-label={t('inventory.name')}>
                                        <span className={styles.pname}>{p.name}</span>
                                        <span className="tag tag-grade">{p.grade}</span> <span className={styles.sku}>{p.sku}</span>
                                    </th>
                                    <td data-label={t('inventory.price')}>
                                        {money(p.price)}{p.sale_price && Number(p.sale_price) < Number(p.price) && <><br /><small>{t('inventory.sale')}: {money(p.sale_price)}</small></>}
                                    </td>
                                    <td data-label={t('inventory.stock')}><StockCell product={p} onChange={changeStock} busy={busyId === p.id} /></td>
                                    {owner && <td data-label={t('inventory.cost')}>{p.cost_usd ? `${money(p.cost_usd)} (${margin(p.price, p.cost_usd)}%)` : '—'}</td>}
                                    {owner && <td data-label={t('inventory.investor')}>{p.investor || '—'}</td>}
                                    <td data-label={t('inventory.visibleShort')}>
                                        <button type="button" className="btn btn-sm" aria-pressed={p.is_active} disabled={busyId === p.id}
                                            onClick={() => toggleActive(p)}>
                                            {p.is_active ? t('inventory.visibleOn') : t('inventory.visibleOff')}
                                        </button>
                                    </td>
                                    <td data-label=""><button type="button" className="btn btn-sm" onClick={() => setEditing(p)}>{t('inventory.edit')}</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Dialog open={Boolean(editing)} onClose={() => setEditing(null)} placement="center"
                title={editing?.id ? t('inventory.editTitle') : t('inventory.addTitle')}>
                {editing && (
                    <ProductForm key={editing.id || 'new'} product={editing} role={role} onClose={() => setEditing(null)}
                        onSaved={(saved) => { replace(saved); setEditing(null); }} />
                )}
            </Dialog>
        </div>
    );
};

export default InventoryPage;
