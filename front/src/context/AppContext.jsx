import { createContext, useContext, useState, useCallback } from 'react';
import { USERS, EQUIPMENTS, TENANTS } from '../data/mockData';

const AppContext = createContext(null);

const initialReservation = {
  equipmentId: 'arduino-uno',
  startDate: '2025-08-20',
  endDate: '2025-08-22',
  status: 'Agendada',
  userId: 'lucas',
};

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [reservation, setReservation] = useState(null);
  const [loanStatus, setLoanStatus] = useState('none'); // none | scheduled | in_use | returned
  const [occurrence, setOccurrence] = useState(null);
  const [equipments, setEquipments] = useState(EQUIPMENTS);
  const [searchQuery, setSearchQuery] = useState('');

  const login = useCallback((userKey) => {
    const u = USERS[userKey];
    if (u) setUser(u);
  }, []);

  const tenant = user ? TENANTS[user.tenantId] : null;

  const hasFeature = useCallback(
    (featureKey) => Boolean(tenant?.features?.[featureKey]),
    [tenant]
  );

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  const createReservation = useCallback((data) => {
    setReservation({ ...initialReservation, ...data, status: 'Agendada' });
    setLoanStatus('scheduled');
  }, []);

  const confirmPickup = useCallback(() => {
    setReservation((prev) => {
      const base = prev || { ...initialReservation };
      return { ...base, status: 'Em uso' };
    });
    setLoanStatus('in_use');
    setEquipments((prev) =>
      prev.map((eq) =>
        eq.id === 'arduino-uno' ? { ...eq, status: 'Em uso' } : eq
      )
    );
  }, []);

  const confirmReturn = useCallback((observations) => {
    setReservation((prev) => (prev ? { ...prev, status: 'Finalizada' } : prev));
    setLoanStatus('returned');
    setOccurrence({
      equipmentId: 'arduino-uno',
      problem: observations || 'Sensor ultrassônico com falha no Trigger.',
      date: '22/08/2025',
      status: 'Aguardando manutenção',
      responsible: 'A definir',
    });
    setEquipments((prev) =>
      prev.map((eq) =>
        eq.id === 'arduino-uno' ? { ...eq, status: 'Em manutenção' } : eq
      )
    );
  }, []);

  const completeMaintenance = useCallback(() => {
    setOccurrence(null);
    setEquipments((prev) =>
      prev.map((eq) =>
        eq.id === 'arduino-uno' ? { ...eq, status: 'Disponível' } : eq
      )
    );
  }, []);

  const updateEquipment = useCallback((id, data) => {
    setEquipments((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, ...data } : eq))
    );
  }, []);

  const addEquipment = useCallback((data) => {
    const id = data.name.toLowerCase().replace(/\s+/g, '-');
    setEquipments((prev) => [...prev, { ...data, id }]);
  }, []);

  const value = {
    user,
    login,
    logout,
    tenant,
    hasFeature,
    reservation,
    setReservation,
    createReservation,
    loanStatus,
    confirmPickup,
    confirmReturn,
    occurrence,
    completeMaintenance,
    equipments,
    updateEquipment,
    addEquipment,
    searchQuery,
    setSearchQuery,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export function formatDateBR(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export function daysBetween(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1;
  return diff;
}

export function getEquipmentById(id, equipments) {
  return equipments.find((eq) => eq.id === id);
}
