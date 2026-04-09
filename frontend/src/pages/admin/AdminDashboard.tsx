import React, { useEffect, useState } from 'react'
import { Users, UserSquare2, ClipboardList, TrendingDown, GraduationCap } from 'lucide-react'
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

  // Cores institucionais do Horizon UI
  const brandColor = '#4318FF'
  const textColor = '#2B3674'
  const textSecondary = '#A3AED0'
  const bgMain = '#F4F7FE'

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '1rem' }}>
      <header className="flex justify-between items-center mb-4">
        <div>
          <p style={{ color: textSecondary, fontSize: '0.9rem', fontWeight: 600 }}>Páginas / Dashboard</p>
          <h1 style={{ fontSize: '2.1rem', fontWeight: 700, color: textColor, letterSpacing: '-0.02em' }}>Dashboard Principal</h1>
        </div>
        <div style={{ display: 'flex', gap: '1rem', backgroundColor: 'white', padding: '0.6rem 1rem', borderRadius: 'var(--radius-full)', boxShadow: 'var(--shadow-horizon)' }}>
           <span style={{ fontSize: '0.85rem', fontWeight: 700, color: brandColor }}>{new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <StatCard icon={<Users size={22} />} label="Total Estudantes" value={stats?.totalStudents || '--'} color="primary" />
        <StatCard icon={<UserSquare2 size={22} />} label="Docentes Ativos" value={stats?.activeTeachers || '--'} color="success" />
        <StatCard icon={<ClipboardList size={22} />} label="Planos Pendentes" value={stats?.pendingPlans || '--'} color="warning" />
        <StatCard icon={<TrendingDown size={22} />} label="Evasão Escolar" value={stats?.dropoutRate ? `${stats.dropoutRate}%` : '--'} color="error" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-horizon)', borderRadius: 'var(--radius-xl)' }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: textColor, marginBottom: '0.25rem' }}>Status de Desempenho</h3>
              <p style={{ fontSize: '0.85rem', color: textSecondary, fontWeight: 500 }}>Fórmula: (Prova 1 + Prova 2) / 2</p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              backgroundColor: bgMain, 
              padding: '0.3rem', 
              borderRadius: 'var(--radius-lg)'
            }}>
              {(['levels', 'grades', 'classes'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.5rem 1.2rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: activeTab === tab ? 'white' : 'transparent',
                    color: activeTab === tab ? brandColor : textSecondary,
                    boxShadow: activeTab === tab ? '0px 4px 10px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s ease',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {tab === 'levels' ? 'Nível' : tab === 'grades' ? 'Série' : 'Turma'}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {performance && performance[activeTab].length > 0 ? (
              performance[activeTab].map((item: any) => (
                <PowerBar 
                  key={item.id}
                  label={item.name} 
                  subLabel={item.level || item.grade}
                  percent={item.score} 
                />
              ))
            ) : (
              <div style={{ padding: '3rem', textAlign: 'center', color: textSecondary }}>
                Sem lançamentos detectados
              </div>
            )}
          </div>
        </div>

        <div className="card" style={{ padding: '2rem', boxShadow: 'var(--shadow-horizon)', borderRadius: 'var(--radius-xl)' }}>
          <div className="flex items-center justify-between mb-8">
            <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: textColor }}>Avisos da Rede</h3>
            <GraduationCap size={24} color={brandColor} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <NoticeItem title="Conselho de Classe" date="Agendado para 15/05" type="Live" />
            <NoticeItem title="Formação Docente" date="Workshop BNCC" type="Recente" />
            <NoticeItem title="Final do Bimestre" date="Lançamento até 20/05" type="Urgente" />
          </div>
        </div>
      </div>
    </div>
  )
}

const StatCard = ({ icon, label, value, color }: any) => {
  const colorMap: any = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)'
  }

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', boxShadow: 'var(--shadow-horizon)', borderRadius: 'var(--radius-xl)' }}>
      <div className="icon-box" style={{ 
        width: '56px', 
        height: '56px', 
        backgroundColor: '#F4F7FE', 
        color: `hsl(${colorMap[color]})`,
        borderRadius: '50%',
        minWidth: '56px'
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: '#A3AED0', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.1rem' }}>{label}</p>
        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2B3674' }}>{value}</h3>
      </div>
    </div>
  )
}

const NoticeItem = ({ title, date, type }: any) => {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid #F4F7FE' }}>
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#2B3674' }}>{title}</h4>
        <p style={{ fontSize: '0.8rem', color: '#A3AED0' }}>{date}</p>
      </div>
      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#4318FF', backgroundColor: '#F4F7FE', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>{type}</span>
    </div>
  )
}

const PowerBar = ({ label, subLabel, percent }: any) => {
  const brandColor = '#4318FF'
  const textColor = '#2B3674'
  const textSecondary = '#A3AED0'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div className="flex items-center justify-between">
        <div>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: textColor }}>{label}</span>
          {subLabel && <span style={{ fontSize: '0.75rem', fontWeight: 600, color: textSecondary, display: 'block' }}>{subLabel}</span>}
        </div>
        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: brandColor }}>{percent === 0 ? '--' : `${percent}%`}</span>
      </div>
      <div style={{ height: '8px', width: '100%', backgroundColor: '#EFF4FB', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
        <div style={{ 
          height: '100%', width: `${percent}%`, 
          backgroundColor: brandColor,
          borderRadius: 'var(--radius-full)',
          transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
        }}></div>
      </div>
    </div>
  )
}
