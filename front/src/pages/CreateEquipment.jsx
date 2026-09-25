import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { CATEGORIES, STATUS_OPTIONS } from '../data/mockData';
import { useApp } from '../context/AppContext';

export default function CreateEquipment() {
  const navigate = useNavigate();
  const { addEquipment } = useApp();

  const [form, setForm] = useState({
    name: '',
    description: '',
    patrimonio: '',
    category: CATEGORIES[0].name,
    local: '',
    status: 'Disponível',
    includedItems: '',
  });

  const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    addEquipment({
      ...form,
      categoryId: CATEGORIES.find((c) => c.name === form.category)?.id || 'eletronica',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=300&fit=crop',
      includedItems: form.includedItems.split('\n').filter(Boolean),
      checklistItems: form.includedItems.split('\n').filter(Boolean),
    });
    navigate('/equipamentos');
  };

  return (
    <Layout>
      <div className="page-header">
        <h1 className="page-title">Cadastrar equipamento</h1>
        <p className="page-subtitle">Preencha as informações para adicionar um item ao acervo.</p>
      </div>

      <form className="card" style={{ maxWidth: '860px' }} onSubmit={handleSubmit}>
        <section className="form-section">
          <h2 className="form-section__title">Informações básicas</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Nome</label>
              <input id="name" className="form-input" value={form.name} onChange={(e) => update('name', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="patrimonio">Número de patrimônio</label>
              <input id="patrimonio" className="form-input" value={form.patrimonio} onChange={(e) => update('patrimonio', e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="category">Categoria</label>
            <select id="category" className="form-select" value={form.category} onChange={(e) => update('category', e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Localização e status</h2>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="local">Localização</label>
              <input id="local" className="form-input" value={form.local} onChange={(e) => update('local', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select id="status" className="form-select" value={form.status} onChange={(e) => update('status', e.target.value)}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Descrição</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="description">Descrição do equipamento</label>
            <textarea id="description" className="form-textarea" value={form.description} onChange={(e) => update('description', e.target.value)} />
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Itens inclusos</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="includedItems">Itens inclusos (um por linha)</label>
            <textarea
              id="includedItems"
              className="form-textarea"
              value={form.includedItems}
              onChange={(e) => update('includedItems', e.target.value)}
              placeholder="1x Placa Arduino Uno R3&#10;1x Cabo USB"
            />
          </div>
        </section>

        <section className="form-section">
          <h2 className="form-section__title">Imagem</h2>
          <div className="form-group">
            <label className="form-label" htmlFor="photo">Foto</label>
            <input id="photo" type="file" className="form-input" accept="image/*" />
          </div>
        </section>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/equipamentos')}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">Salvar equipamento</button>
        </div>
      </form>
    </Layout>
  );
}
