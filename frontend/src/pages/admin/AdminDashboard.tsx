import React, { useEffect, useState } from 'react'
import { Users, UserSquare2, ClipboardList, TrendingDown, ArrowRight, GraduationCap } from 'lucide-react'
import { api } from '../../utils/api'

interface Stats {
  totalStudents: number;
  activeTeachers: number;
  pendingPlans: number;
  dropoutRate: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null)
  const [performance, setPerformance] = useState<{ levels: any[], grades: any[], classes: any[] } | null>(null)
  const [activeTab, setActiveTab] = useState<'levels' | 'grades' | 'classes'>('levels')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, performanceData] = await Promise.all([
          api('/admin/stats'),
          api('/admin/performance')
        ])
        setStats(statsData)
        setPerformance(performanceData)
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
    fetchData()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative' }}>
      <div className="bg-gradient-top"></div>
      
      <header className="animate-fade-in" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        backgroundColor: 'hsl(var(--primary-light) / 0.3)',
        padding: '2.5rem',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid hsl(var(--primary) / 0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <div style={{ zIndex: 2 }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.05em', color: 'hsl(var(--text))', marginBottom: '0.5rem' }}>
            Olá, <span style={{ color: 'hsl(var(--primary))' }}>Ezequiel</span> 👋
          </h1>
          <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.15rem', fontWeight: 500, maxWidth: '500px' }}>
            Seu portal administrativo está pronto. Veja o que mudou na rede Educare hoje.
          </p>
        </div>
        <div style={{ 
          position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1, pointerEvents: 'none'
        }}>
          <GraduationCap size={240} />
        </div>
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
        <div className="card glass animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="card-title" style={{ marginBottom: '0.25rem' }}>Status de Desempenho</h3>
              <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-light))', fontWeight: 500 }}>Baseado no critério institucional: (P1 + P2) / 2</p>
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            backgroundColor: 'hsl(var(--background))', 
            padding: '0.4rem', 
            borderRadius: 'var(--radius-md)',
            border: '1px solid hsl(var(--border) / 0.5)' 
          }}>
            {(['levels', 'grades', 'classes'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '0.6rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: activeTab === tab ? 'hsl(var(--surface))' : 'transparent',
                  color: activeTab === tab ? 'hsl(var(--primary))' : 'hsl(var(--text-light))',
                  boxShadow: activeTab === tab ? 'var(--shadow-sm)' : 'none',
                  transition: 'all 0.2s ease',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}
              >
                {tab === 'levels' ? 'Nível' : tab === 'grades' ? 'Série' : 'Turma'}
              </button>
            ))}
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.75rem',
            maxHeight: '380px',
            overflowY: 'auto',
            paddingRight: '0.5rem'
          }} className="no-scrollbar">
            {performance && performance[activeTab].length > 0 ? (
              performance[activeTab].map((item: any) => (
                <PowerBar 
                  key={item.id}
                  label={item.name} 
                  subLabel={item.level || item.grade}
                  percent={item.score} 
                  color={item.score >= 70 ? 'success' : item.score >= 50 ? 'warning' : 'error'} 
                />
              ))
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'hsl(var(--text-light))' }}>
                Aguardando lançamentos de notas...
              </div>
            )}
          </div>
        </div>

        <div className="card glass animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between">
            <h3 className="card-title" style={{ marginBottom: 0 }}>Central de Avisos</h3>
            <div className="badge animate-float" style={{ backgroundColor: 'hsl(var(--error) / 0.1)', color: 'hsl(var(--error))', border: '1px solid hsl(var(--error) / 0.2)' }}>LIVE</div>
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

          <button className="btn btn-primary glow-primary" style={{ width: '100%', marginTop: 'auto' }}>
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
    <div className={`card glass glow-${color} animate-scale-in`} style={{ 
      borderLeft: `5px solid hsl(${colorMap[color]})`,
      transition: 'var(--transition-all)'
    }}>
      <div className="flex items-center justify-between" style={{ marginBottom: '2.5rem' }}>
        <div className="icon-box" style={{ 
          width: '56px', 
          height: '56px', 
          backgroundColor: `hsl(${colorMap[color]} / 0.1)`, 
          color: `hsl(${colorMap[color]})`,
          borderRadius: '16px',
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
    <div className="flex gap-4 p-4 glass animate-scale-in" style={{ 
      borderRadius: 'var(--radius-md)', 
      border: '1px solid hsl(var(--border) / 0.4)',
      cursor: 'pointer',
      transition: 'var(--transition-all)'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateX(8px)'
      e.currentTarget.style.backgroundColor = `hsl(${colorMap[type]} / 0.05)`
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateX(0)'
      e.currentTarget.style.backgroundColor = 'transparent'
    }}
    >
      <div style={{ width: '4px', borderRadius: '2px', backgroundColor: `hsl(${colorMap[type]})` }}></div>
      <div style={{ flex: 1 }}>
        <div className="flex items-center justify-between mb-1">
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em' }}>{title}</h4>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: `hsl(${colorMap[type]})`, textTransform: 'uppercase' }}>{time}</span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-light))', fontWeight: 500, lineHeight: 1.4 }}>{description}</p>
      </div>
    </div>
  )
}

const PowerBar = ({ label, subLabel, percent, color }: any) => {
  const colorMap: any = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      <div className="flex items-center justify-between">
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'hsl(var(--text))' }}>{label}</span>
          {subLabel && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--text-light))' }}>{subLabel}</span>}
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: `hsl(${colorMap[color]})` }}>{percent === 0 ? '--' : `${percent}%`}</span>
      </div>
      <div style={{ 
        height: '10px', width: '100%', backgroundColor: 'hsl(var(--background))', 
        borderRadius: 'var(--radius-full)', overflow: 'hidden', border: '1px solid hsl(var(--border) / 0.5)'
      }}>
        <div style={{ 
          height: '100%', width: `${percent}%`, 
          background: `linear-gradient(90deg, hsl(${colorMap[color]}), hsl(${colorMap[color]} / 0.6))`,
          borderRadius: 'var(--radius-full)',
          boxShadow: `0 0 10px hsl(${colorMap[color]} / 0.3)`,
          transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}></div>
      </div>
    </div>
  )
}
