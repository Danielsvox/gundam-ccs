import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import inventoryService from '../services/inventoryService';

/**
 * Role of the signed-in user for the inventory tool: 'owner' | 'inventory' | null.
 * `ready` is false until the backend answered, so pages can avoid flashing "no access".
 */
export function useInventoryRole() {
    const { user } = useAuth();
    const [state, setState] = useState({ role: null, ready: false });

    useEffect(() => {
        if (!user) { setState({ role: null, ready: true }); return undefined; }
        let alive = true;
        setState((s) => ({ ...s, ready: false }));
        inventoryService.me()
            .then((r) => alive && setState({ role: r.role || null, ready: true }))
            .catch(() => alive && setState({ role: null, ready: true }));
        return () => { alive = false; };
    }, [user]);

    return state;
}
