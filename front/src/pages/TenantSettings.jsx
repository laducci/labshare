import { useState } from 'react';
import Layout from '../components/Layout';
import { TENANTS } from '../data/mockData';

const FEATURE_LABELS = {
  approvalRequired: 'Exigir aprovação de gestor antes da retirada',
  costCenter: 'Vincular reservas a centro de custo',
  lateFee: 'Cobrar multa por devolução em atraso',
};

export default function TenantSettings() {
  const [tenants, setTenants] = useState(TENANTS);

  const toggleFeature = (tenantId, featureKey) => {
    setTenants((prev) => ({
      ...prev,
      [tenantId]: {
        ...prev[tenantId],
        features: {
          ...prev[tenantId].features,
          [featureKey]: !prev[tenantId].features[featureKey],
        },
      },
    }));
  };

  return (
    <Layout>
      <h1 className="page-title">Personalização por cliente</h1>
      <p className="page-subtitle">
        Cada instituição que utiliza o LabShare é um cliente (tenant) independente, com seu
        próprio conjunto de recursos habilitados — sem duplicar código-fonte.
      </p>

      <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
        {Object.values(tenants).map((tenant) => (
          <div key={tenant.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h3 className="section-title" style={{ marginBottom: '0.25rem' }}>{tenant.name}</h3>
              <span className="badge badge-neutral">{tenant.segment}</span>
            </div>

            <div style={{ display: 'grid', gap: '0.75rem', marginTop: '1rem' }}>
              {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                <label key={key} className="form-checkbox">
                  <input
                    type="checkbox"
                    checked={Boolean(tenant.features[key])}
                    onChange={() => toggleFeature(tenant.id, key)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}
