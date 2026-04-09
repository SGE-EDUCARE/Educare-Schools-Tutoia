import React, { useEffect, useState } from 'react'
import { Users, UserSquare2, ClipboardList, TrendingDown, ArrowUpRight, ArrowRight } from 'lucide-react'
import { api } from '../../utils/api'

interface Stats {
  totalStudents: number;
  activeTeachers: number;
  pendingPlans: number;
  dropoutRate: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api('/admin/stats')
        setStats(data)
      } catch (error) {
        setStats({
          totalStudents: 1248,
          activeTeachers: 84,
          pendingPlans: 12,
          dropoutRate: 1.2
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
      <header>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>Painel Executivo</h1>
        <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem', fontWeight: 500 }}>Resumo operacional e métricas de desempenho da rede Educare.</p>
      </header>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
        <StatCard 
          icon={<Users size={28} />} 
          label="Estudantes Ativos" 
          value={stats?.totalStudents.toLocaleString() || '0'} 
          trend="+12 este mês"
          color="primary"
          loading={loading}
        />
        <StatCard 
          icon={<UserSquare2 size={28} />} 
          label="Docentes" 
          value={stats?.activeTeachers.toString() || '0'} 
          trend="Quadro completo"
          color="success"
          loading={loading}
        />
        <StatCard 
          icon={<ClipboardList size={28} />} 
          label="Planos Pendentes" 
          value={stats?.pendingPlans.toString() || '0'} 
          trend="Urgente"
          color="warning"
          loading={loading}
        />
        <StatCard 
          icon={<TrendingDown size={28} />} 
          label="Taxa de Evasão" 
          value={`${stats?.dropoutRate}%`} 
          trend="-0.2% vs 2025"
          color="error"
          loading={loading}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="flex items-center justify-between">
            <h3 className="card-title" style={{ marginBottom: 0 }}>Distribuição de Desempenho</h3>
            <button className="btn btn-secondary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.85rem' }}>
              Relatórios <ArrowRight size={16} />
            </button>
          </div>
          <div style={{ 
            flex: 1, 
            minHeight: '320px', 
            backgroundColor: 'hsl(var(--background))', 
            borderRadius: 'var(--radius-lg)', 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center',
            border: '2px solid hsl(var(--border) / 0.5)',
            gap: '1.5rem'
          }}>
            <div className="icon-box" style={{ padding: '1.5rem', backgroundColor: 'white', boxShadow: 'var(--shadow-md)' }}>
               <ArrowUpRight size={32} color="hsl(var(--primary))" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'hsl(var(--text))', fontSize: '1.1rem', fontWeight: 700 }}>Processando Métricas</p>
              <p style={{ color: 'hsl(var(--text-light))', fontSize: '0.9rem', fontWeight: 500, maxWidth: '240px' }}>Sincronizando dados acadêmicos do servidor local...</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="flex items-center justify-between">
            <h3 className="card-title" style={{ marginBottom: 0 }}>Central de Avisos</h3>
            <div className="badge" style={{ backgroundColor: 'hsl(var(--error) / 0.1)', color: 'hsl(var(--error))' }}>LIVE</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <NoticeItem 
              title="Reunião Pedagógica" 
              time="Hoje, 14:00" 
              type="primary"
              description="Discussão estratégica sobre matriz curricular."
            />
            <NoticeItem 
              title="Atualização de Notas" 
              time="12 Abr, 2026" 
              type="error"
              description="Prazo fatal para fechamento do bimestre."
            />
            <NoticeItem 
              title="Evento Educare" 
              time="20 Abr, 2026" 
              type="success"
              description="Workshop de novas tecnologias aplicadas."
            />
          </div>

          <button className="btn btn-primary" style={{ width: '100%', marginTop: 'auto' }}>
            Novo Comunicado
          </button>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value, trend, color, loading }: any) => {
  const colorMap: any = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div className="icon-box" style={{ 
          width: '56px', 
          height: '56px', 
          backgroundColor: `hsl(${colorMap[color]} / 0.1)`, 
          color: `hsl(${colorMap[color]})`,
        }}>
          {icon}
        </div>
        {!loading && (
          <div style={{ 
            fontSize: '0.8rem', 
            fontWeight: 700, 
            color: `hsl(${colorMap[color]})`,
            backgroundColor: `hsl(${colorMap[color]} / 0.05)`,
            padding: '0.4rem 0.8rem',
            borderRadius: 'var(--radius-sm)'
          }}>
            {trend}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ height: '24px', width: '70%', backgroundColor: 'hsl(var(--background))', borderRadius: '4px' }}></div>
          <div style={{ height: '40px', width: '50%', backgroundColor: 'hsl(var(--background))', borderRadius: '4px' }}></div>
        </div>
      ) : (
        <div>
          <p style={{ color: 'hsl(var(--text-light))', fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>{label}</p>
          <h3 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.05em', lineHeight: 1 }}>{value}</h3>
        </div>
      )}
    </div>
  )
}

const NoticeItem = ({ title, time, type, description }: any) => {
  const colorMap: any = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)'
  }

  return (
    <div className="flex gap-4 p-4" style={{ 
      borderRadius: 'var(--radius-md)', 
      border: '1px solid hsl(var(--border) / 0.4)',
      backgroundColor: 'hsl(var(--background) / 0.5)',
      cursor: 'pointer',
      transition: 'var(--transition-all)'
    }}
    onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateX(8px)')}
    onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateX(0)')}
    >
      <div style={{ width: '4px', borderRadius: '2px', backgroundColor: `hsl(${colorMap[type]})` }}></div>
      <div style={{ flex: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--text))' }}>{title}</h4>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: `hsl(${colorMap[type]})` }}>{time}</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-light))', fontWeight: 500 }}>{description}</p>
      </div>
    </div>
  )
}
