import Layout from '../components/Layout';

export default function PlaceholderPage({ title, subtitle }) {
  return (
    <Layout>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
      <div className="empty-state">
        <p>Esta seção faz parte do protótipo LabShare.</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
          Utilize o menu lateral para navegar pelos fluxos principais.
        </p>
      </div>
    </Layout>
  );
}
