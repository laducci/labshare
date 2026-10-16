/*
 * ============================================================
 *  LandingPage.jsx  |  Camada: Front-end React (página pública)
 *  Responsável na apresentação: Todos  |  Atividade: 1 (Design Thinking)
 * ------------------------------------------------------------
 *  O que faz: página inicial pública (rota /) com o material da Atividade 1:
 *  problema, público-alvo, personas, mapa de empatia e a solução proposta.
 *  O texto de cada seção fica em data/landingContent.js (conteúdo separado da tela).
 *  Quem chama: App.jsx, rota "/".
 *  Chama: LandingLayout (cabeçalho e rodapé), landingContent (textos). Não chama a API.
 * ============================================================
 */
import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  Ear,
  Eye,
  GraduationCap,
  Heart,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Wrench,
  XCircle,
} from 'lucide-react';
import LandingLayout from '../components/landing/LandingLayout';
import {
  AUDIENCE,
  BENEFITS,
  CONCLUSION_FLOW,
  EMPATHY_MAP,
  FLOW_STEPS,
  HERO_HIGHLIGHTS,
  PERSONAS,
  PROBLEM_ITEMS,
} from '../data/landingContent';

const HIGHLIGHT_ICONS = {
  calendar: Calendar,
  clipboard: ClipboardList,
  rotate: RotateCcw,
  wrench: Wrench,
};

const AUDIENCE_ICONS = {
  graduation: GraduationCap,
  book: BookOpen,
  'clipboard-check': ClipboardCheck,
  'bar-chart': BarChart3,
};

const EMPATHY_ICONS = {
  heart: Heart,
  eye: Eye,
  ear: Ear,
  message: MessageCircle,
  alert: AlertCircle,
  sparkles: Sparkles,
};

function FlowSteps({ steps }) {
  return (
    <div className="landing-flow" role="list" aria-label="Fluxo do processo">
      {steps.map((step, index) => (
        <span key={step} role="listitem" style={{ display: 'contents' }}>
          <span className="landing-flow__step">{step}</span>
          {index < steps.length - 1 && <span className="landing-flow__arrow" aria-hidden="true">→</span>}
        </span>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <LandingLayout>
      {/* Seção 1 — Abertura */}
      <section id="inicio" className="landing-section landing-hero">
        <div className="landing-container landing-hero__grid">
          <div>
            <h1 className="landing-hero__title">LabShare</h1>
            <p className="landing-hero__subtitle">
              Sistema de Gestão de Laboratórios e Empréstimo de Equipamentos
            </p>
            <p className="landing-hero__text">
              O LabShare foi pensado para facilitar o compartilhamento de equipamentos em ambientes
              acadêmicos, permitindo consultar disponibilidade, realizar reservas, acompanhar
              empréstimos, registrar devoluções e controlar manutenções em um único lugar.
            </p>
            <div className="landing-hero__actions">
              <a href="#problema" className="landing-btn landing-btn--primary">
                Conhecer o projeto
              </a>
              <a href="#solucao" className="landing-btn landing-btn--outline">
                Ver a solução
              </a>
            </div>
          </div>

          <aside className="landing-hero__visual" aria-label="Principais funcionalidades">
            <p className="landing-hero__visual-title">Destaques do sistema</p>
            <div className="landing-highlights">
              {HERO_HIGHLIGHTS.map(({ icon, label }) => {
                const Icon = HIGHLIGHT_ICONS[icon];
                return (
                  <div key={label} className="landing-highlight">
                    <div className="landing-highlight__icon">
                      <Icon size={18} />
                    </div>
                    <span className="landing-highlight__label">{label}</span>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </section>

      {/* Seção 2 — Problema */}
      <section id="problema" className="landing-section landing-section--alt">
        <div className="landing-container">
          <span className="landing-eyebrow">Empatizar</span>
          <h2 className="landing-title">O problema</h2>
          <div className="landing-problem-grid">
            <div>
              <p className="landing-lead">
                Em muitos laboratórios acadêmicos, o controle de equipamentos ainda depende de
                planilhas, mensagens, registros manuais ou atendimento presencial.
              </p>
              <p className="landing-lead" style={{ marginTop: '1rem' }}>
                Isso pode gerar dificuldades como:
              </p>
            </div>
            <ul className="landing-check-list">
              {PROBLEM_ITEMS.map((item) => (
                <li key={item}>
                  <XCircle size={16} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <blockquote className="landing-quote">
            Como tornar o empréstimo e a gestão de equipamentos acadêmicos mais simples,
            previsíveis e rastreáveis?
          </blockquote>
        </div>
      </section>

      {/* Seção 4 — Público-alvo (antes de personas, conforme menu sugerido) */}
      <section id="publico" className="landing-section">
        <div className="landing-container">
          <span className="landing-eyebrow">Definir</span>
          <h2 className="landing-title">Público-alvo</h2>
          <p className="landing-lead">
            O LabShare atende diferentes perfis que participam do ciclo de empréstimo, utilização,
            controle e manutenção dos equipamentos.
          </p>

          <div className="landing-cards">
            {AUDIENCE.map((group) => {
              const Icon = AUDIENCE_ICONS[group.icon];
              return (
                <article key={group.id} className="landing-card">
                  <div className="landing-card__icon">
                    <Icon size={20} />
                  </div>
                  <h3 className="landing-card__title">{group.title}</h3>
                  <p className="landing-card__text">{group.description}</p>
                  <p className="landing-card__field-label" style={{ fontSize: '0.6875rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                    Principais necessidades
                  </p>
                  <ul className="landing-card__needs">
                    {group.needs.map((need) => (
                      <li key={need}>{need}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <div className="landing-callout">
            <strong>Necessidade em comum</strong>
            <span>
              Organizar o compartilhamento de equipamentos com mais controle, praticidade e
              rastreabilidade.
            </span>
          </div>
        </div>
      </section>

      {/* Seção 5 — Personas */}
      <section id="personas" className="landing-section landing-section--beige">
        <div className="landing-container">
          <span className="landing-eyebrow">Personas</span>
          <h2 className="landing-title">Quem usa o LabShare</h2>
          <p className="landing-lead">
            Foram criadas seis personas para representar diferentes necessidades e responsabilidades
            dentro do LabShare.
          </p>

          <div className="landing-personas">
            {PERSONAS.map((persona) => (
              <article key={persona.name} className="landing-persona">
                <div className="landing-persona__head">
                  <div className="landing-persona__avatar">{persona.initials}</div>
                  <div>
                    <div className="landing-persona__name">{persona.name}</div>
                    <div className="landing-persona__meta">
                      {persona.age} anos · {persona.profile}
                    </div>
                  </div>
                </div>

                <div className="landing-persona__field">
                  <div className="landing-persona__field-label">Objetivo</div>
                  <p>{persona.objective}</p>
                </div>

                <div className="landing-persona__field">
                  <div className="landing-persona__field-label">Necessidades</div>
                  <p>{persona.needs.join(' · ')}</p>
                </div>

                <div className="landing-persona__field">
                  <div className="landing-persona__field-label">Dores</div>
                  <p>{persona.pains}</p>
                </div>

                <div className="landing-persona__field">
                  <div className="landing-persona__field-label">Comportamento</div>
                  <p>{persona.behavior}</p>
                </div>

                <p className="landing-persona__quote">{persona.quote}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 6 — Mapa de Empatia */}
      <section id="empatia" className="landing-section landing-section--alt">
        <div className="landing-container">
          <div className="landing-empathy-header">
            <span className="landing-eyebrow">Mapa de Empatia</span>
            <h2 className="landing-title">Entendendo o usuário</h2>
            <p className="landing-lead">
              Persona analisada: <strong>Lucas Almeida</strong>, 21 anos, aluno de Engenharia
            </p>
          </div>

          <div className="landing-empathy-grid">
            {EMPATHY_MAP.map((block) => {
              const Icon = EMPATHY_ICONS[block.icon];
              const isHighlight = block.title === 'Ganhos' || block.title === 'Dores';
              return (
                <article
                  key={block.title}
                  className={`landing-empathy-block ${isHighlight ? 'landing-empathy-block--highlight' : ''}`}
                >
                  <div className="landing-empathy-block__head">
                    <div className="landing-empathy-block__icon">
                      <Icon size={16} />
                    </div>
                    <h3 className="landing-empathy-block__title">{block.title}</h3>
                  </div>
                  <ul>
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Seção 3 — Solução (após empatia, fechando o raciocínio) */}
      <section id="solucao" className="landing-section">
        <div className="landing-container">
          <span className="landing-eyebrow">Ideação</span>
          <h2 className="landing-title">A solução</h2>
          <p className="landing-lead">
            O LabShare centraliza todo o ciclo de uso dos equipamentos, desde a pesquisa e reserva
            até a devolução e manutenção.
          </p>

          <p style={{ marginTop: '1.5rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.875rem' }}>
            Fluxo resumido
          </p>
          <FlowSteps steps={FLOW_STEPS} />

          <p style={{ marginTop: '1.5rem', fontWeight: 600, color: 'var(--color-primary)', fontSize: '0.875rem' }}>
            Benefícios
          </p>
          <div className="landing-benefits">
            {BENEFITS.map((benefit) => (
              <div key={benefit} className="landing-benefit">
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Seção 7 — Conclusão */}
      <section id="conclusao" className="landing-section landing-section--beige">
        <div className="landing-container landing-conclusion">
          <span className="landing-eyebrow">Conclusão</span>
          <h2 className="landing-title">Do problema à solução</h2>
          <p className="landing-lead">
            A análise do público, das personas e do mapa de empatia mostrou que o principal problema
            não era apenas “reservar equipamentos”, mas reduzir a falta de informação e organizar
            toda a jornada do usuário.
          </p>
          <p className="landing-lead" style={{ marginTop: '1rem' }}>
            A partir dessas necessidades, o LabShare foi pensado para acompanhar o equipamento
            durante todo o seu ciclo:
          </p>

          <FlowSteps steps={CONCLUSION_FLOW} />

          <p className="landing-final-quote">
            O LabShare conecta quem precisa do equipamento com quem precisa controlar e manter esses
            recursos.
          </p>
        </div>
      </section>
    </LandingLayout>
  );
}
