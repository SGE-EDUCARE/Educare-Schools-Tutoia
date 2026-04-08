import React, { useState } from 'react'
import { Calendar, FileText, CheckCircle, Bell, User, ArrowRight, Star, Heart, TrendingUp } from 'lucide-react'

export const ParentDashboard: React.FC = () => {
  const [children] = useState([
    { id: 1, name: 'Joãozinho Silva', grade: '1º Ano - A', level: 'Ensino Fundamental I', attendance: '98%', performance: 'Excelente' },
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      <header>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>Portal do Responsável</h1>
        <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.2rem', fontWeight: 500 }}>Acompanhe em tempo real a evolução educacional dos seus filhos.</p>
      </header>

      {children.map(child => (
        <div key={child.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 380px', gap: '3rem' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {/* Child Profile Card - Massive & Premium */}
            <div className="card" style={{ 
              background: 'linear-gradient(135deg, hsl(var(--surface)), hsl(var(--primary-light) / 0.5))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '3rem',
              borderLeft: '8px solid hsl(var(--primary))'
            }}>
              <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center' }}>
                <div className="icon-box" style={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '32px', 
                  backgroundColor: 'hsl(var(--primary))', 
                  color: 'white', 
                  fontSize: '3rem', 
                  fontWeight: 800,
                  boxShadow: '0 20px 40px -10px hsl(var(--primary) / 0.4)'
                }}>
                  {child.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h3 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>{child.name}</h3>
                    <div className="badge" style={{ backgroundColor: 'hsl(var(--success) / 0.1)', color: 'hsl(var(--success))', padding: '0.6rem 1.25rem' }}>
                       <TrendingUp size={14} style={{ marginRight: '0.5rem' }} />
                       {child.performance.toUpperCase()}
                    </div>
                  </div>
                  <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem', fontWeight: 500 }}>{child.grade} • <span style={{ color: 'hsl(var(--primary))', fontWeight: 700 }}>{child.level}</span></p>
                </div>
              </div>
              <button className="btn btn-secondary" style={{ padding: '1rem 2rem' }}>
                Perfil Detalhado <ArrowRight size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.25rem' }}>
               <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div className="icon-box" style={{ 
                    width: '72px', 
                    height: '72px', 
                    backgroundColor: 'hsl(var(--success) / 0.1)', 
                    color: 'hsl(var(--success))',
                  }}>
                    <CheckCircle size={36} />
                  </div>
                  <div>
                    <p style={{ color: 'hsl(var(--text-light))', fontSize: '1rem', fontWeight: 600 }}>Frequência</p>
                    <p style={{ fontWeight: 800, fontSize: '1.75rem', color: 'hsl(var(--text))' }}>{child.attendance}</p>
                  </div>
               </div>
               
               <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div className="icon-box" style={{ 
                    width: '72px', 
                    height: '72px', 
                    backgroundColor: 'hsl(var(--primary) / 0.1)', 
                    color: 'hsl(var(--primary))',
                  }}>
                    <FileText size={36} />
                  </div>
                  <div>
                    <p style={{ color: 'hsl(var(--text-light))', fontSize: '1rem', fontWeight: 600 }}>Boletim</p>
                    <button className="btn btn-ghost" style={{ padding: '0', fontSize: '1.1rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>Ver Notas</button>
                  </div>
               </div>
            </div>

            <div className="card" style={{ padding: '3rem' }}>
              <div className="flex items-center justify-between mb-8">
                <h3 className="card-title" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div className="icon-box" style={{ width: '48px', height: '48px', backgroundColor: 'hsl(var(--primary-light))', color: 'hsl(var(--primary))' }}>
                    <Calendar size={24} />
                  </div>
                  Agenda de Tarefas de Casa
                </h3>
                <span className="badge" style={{ backgroundColor: 'hsl(var(--secondary))', color: 'hsl(var(--text-light))' }}>MAIO 2026</span>
              </div>
              <div style={{ 
                padding: '4rem 2rem', 
                border: '3px dashed hsl(var(--border) / 0.6)', 
                borderRadius: 'var(--radius-xl)', 
                textAlign: 'center', 
                backgroundColor: 'hsl(var(--background) / 0.5)' 
              }}>
                <div style={{ marginBottom: '1.5rem', color: 'hsl(var(--success))' }}>
                  <div className="icon-box" style={{ margin: '0 auto', width: '64px', height: '64px', backgroundColor: 'hsl(var(--success) / 0.1)' }}>
                    <CheckCircle size={40} />
                  </div>
                </div>
                <h4 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--text))' }}>Sem pendências!</h4>
                <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem', fontWeight: 500, marginTop: '0.5rem' }}>Joãozinho completou todas as atividades programadas para hoje.</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="card" style={{ padding: '2.25rem' }}>
              <h3 className="card-title mb-8 flex items-center gap-3">
                <Bell size={24} color="hsl(var(--warning))" />
                Mural da Escola
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
                <NoticeCard 
                  title="Reunião de Pais" 
                  date="18 Mai" 
                  content="Pauta: Resultados do 1º Bimestre e novos projetos extracurriculares da Educare."
                />
                <NoticeCard 
                  title="Evento Cultural" 
                  date="25 Mai" 
                  content="Festa das Nações: Participe da nossa feira cultural anual com a família."
                />
              </div>
              <button className="btn btn-secondary" style={{ width: '100%', marginTop: '2rem' }}>Visualizar Todos</button>
            </div>

            <div className="card" style={{ 
              background: 'linear-gradient(135deg, hsl(var(--primary)), hsl(255 85% 60%))', 
              color: 'white',
              padding: '2.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              boxShadow: '0 15px 30px -10px hsl(var(--primary) / 0.5)'
            }}>
               <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1.25rem', fontWeight: 800 }}>
                  <Star size={24} fill="white" />
                  Educare Premium
               </h4>
               <p style={{ fontSize: '0.95rem', opacity: 0.9, fontWeight: 500, lineHeight: 1.5 }}>
                 Libere acesso a videoaulas exclusivas e acompanhamento pedagógico 24h para reforçar o aprendizado em casa.
               </p>
               <button className="btn" style={{ backgroundColor: 'white', color: 'hsl(var(--primary))', marginTop: '0.5rem', fontWeight: 700 }}>Conhecer Planos</button>
            </div>
          </div>
          
        </div>
      ))}

    </div>
  )
}

const NoticeCard = ({ title, date, content }: any) => (
  <div style={{ display: 'flex', gap: '1.5rem' }}>
    <div className="icon-box" style={{ 
      minWidth: '60px', 
      height: '60px', 
      backgroundColor: 'hsl(var(--background))', 
      border: '1px solid hsl(var(--border) / 0.5)',
      flexDirection: 'column',
    }}>
      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase' }}>{date.split(' ')[1]}</span>
      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--primary))', lineHeight: 1 }}>{date.split(' ')[0]}</span>
    </div>
    <div style={{ flex: 1 }}>
      <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--text))' }}>{title}</h4>
      <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text-light))', lineHeight: 1.5, marginTop: '0.4rem', fontWeight: 500 }}>{content}</p>
    </div>
  </div>
)
