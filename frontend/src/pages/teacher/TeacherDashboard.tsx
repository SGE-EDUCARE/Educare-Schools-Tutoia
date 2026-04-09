import React, { useState } from 'react'
import { BookOpen, AlertCircle, ArrowRight, Clock, UserPlus, Users, LayoutDashboard } from 'lucide-react'

export const TeacherDashboard: React.FC = () => {
  const [classes] = useState([
    { id: 1, name: '1º Ano - A', level: 'Fundamental I', studentsCount: 25, subject: 'Matemática' },
    { id: 2, name: '2º Ano - B', level: 'Fundamental I', studentsCount: 22, subject: 'Ciências' },
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      <header className="flex justify-between items-end">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>Painel Docente</h1>
          <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.2rem', fontWeight: 500 }}>Sua central de controle para turmas, diários e planejamento.</p>
        </div>
        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'hsl(var(--surface))', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border) / 0.5)', boxShadow: 'var(--shadow-sm)' }}>
           <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>Semana 12 • 1º Bimestre</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.25rem' }}>
        <TeacherStatCard icon={<BookOpen size={28} />} label="Turmas Ativas" value="02" color="primary" trend="Carga horária: 20h" />
        <TeacherStatCard icon={<Clock size={28} />} label="Aulas Próximas" value="04" color="success" trend="Próxima às 13:30" />
        <TeacherStatCard icon={<AlertCircle size={28} />} label="Faltam Lançar" value="0" color="warning" trend="Tudo em dia" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="flex items-center gap-4">
           <div className="icon-box" style={{ width: '40px', height: '40px', backgroundColor: 'hsl(var(--text) / 0.05)', color: 'hsl(var(--text))' }}>
              <LayoutDashboard size={20} />
           </div>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em' }}>Minhas Atribuições</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem' }}>
          {classes.map(cls => (
             <div key={cls.id} className="card" style={{ 
               display: 'flex', 
               flexDirection: 'column', 
               gap: '2.5rem', 
               borderLeft: '6px solid hsl(var(--primary))',
               position: 'relative',
               overflow: 'hidden'
             }}>
                {/* Background Decoration */}
                <div style={{ position: 'absolute', top: '-20px', right: '-20px', opacity: 0.03 }}>
                   <Users size={160} />
                </div>

                <div className="flex justify-between items-start" style={{ position: 'relative' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--primary))', backgroundColor: 'hsl(var(--primary-light))', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>{cls.subject}</span>
                    <h3 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'hsl(var(--text))', marginTop: '1rem', letterSpacing: '-0.03em' }}>{cls.name}</h3>
                    <p style={{ color: 'hsl(var(--text-light))', fontSize: '1rem', fontWeight: 500, marginTop: '0.25rem' }}>{cls.level} • <span style={{ fontWeight: 700, color: 'hsl(var(--text))' }}>{cls.studentsCount} Alunos</span></p>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', position: 'relative' }}>
                  <button className="btn btn-primary" style={{ padding: '1.1rem' }}>
                    <UserPlus size={20} />Fazer Chamada
                  </button>
                  <button className="btn btn-secondary" style={{ padding: '1.1rem' }}>
                    Ver Diário <ArrowRight size={20} />
                  </button>
                </div>
             </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ backgroundColor: 'hsl(var(--primary-light) / 0.5)', border: '2px dashed hsl(var(--primary) / 0.2)', padding: '2.5rem' }}>
        <div className="flex items-center gap-6">
          <div className="icon-box" style={{ width: '64px', height: '64px', backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--text))', marginBottom: '0.25rem' }}>Comunicados da Coordenação</h3>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1rem', fontWeight: 500 }}>Nenhuma notificação crítica detectada. Seu cronograma de aulas está sincronizado.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const TeacherStatCard = ({ icon, label, value, color, trend }: any) => {
  const colorMap: any = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
  }

  return (
    <div className="card">
      <div className="flex items-center gap-6">
        <div className="icon-box" style={{ 
          width: '64px', 
          height: '64px', 
          backgroundColor: `hsl(${colorMap[color]} / 0.1)`, 
          color: `hsl(${colorMap[color]})`,
          fontSize: '1.5rem',
          boxShadow: `0 8px 16px -4px hsl(${colorMap[color]} / 0.2)`
        }}>
          {icon}
        </div>
        <div>
          <p style={{ color: 'hsl(var(--text-light))', fontSize: '1rem', fontWeight: 600 }}>{label}</p>
          <div className="flex items-baseline gap-2">
            <h3 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.05em' }}>{value}</h3>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-light) / 0.7)' }}>{trend}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
