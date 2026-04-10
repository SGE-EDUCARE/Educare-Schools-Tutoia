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
      }
    }
    fetchData()
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* HEADER */}
      <header>
        <p style={{ color: 'hsl(var(--text-light))', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.25rem' }}>
          Páginas / Dashboard
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.03em' }}>
            Dashboard Principal
          </h1>
          <div style={{ 
            backgroundColor: 'hsl(var(--surface))', 
            padding: '0.5rem 1rem', 
            borderRadius: 'var(--radius-full)', 
            boxShadow: 'var(--shadow-sm)',
            border: '1px solid hsl(var(--border) / 0.4)',
            fontSize: '0.8rem', 
            fontWeight: 700, 
            color: 'hsl(var(--primary))' 
          }}>
            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* STAT CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <StatCard icon={<Users size={22} />} label="Total Estudantes" value={stats?.totalStudents || '--'} color="primary" />
        <StatCard icon={<UserSquare2 size={22} />} label="Docentes Ativos" value={stats?.activeTeachers || '--'} color="success" />
        <StatCard icon={<ClipboardList size={22} />} label="Planos Pendentes" value={stats?.pendingPlans || '--'} color="warning" />
        <StatCard icon={<TrendingDown size={22} />} label="Evasão Escolar" value={stats?.dropoutRate ? `${stats.dropoutRate}%` : '--'} color="error" />
      </div>

      {/* PERFORMANCE + NOTICES */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.5rem', alignItems: 'start' }} className="grid-mobile-1">
        {/* PERFORMANCE */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'hsl(var(--text))', marginBottom: '0.15rem' }}>
                Desempenho
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-light))', fontWeight: 500 }}>
                (Prova 1 + Prova 2) / 2
              </p>
            </div>
            
            <div style={{ display: 'flex', backgroundColor: 'hsl(var(--background))', padding: '0.25rem', borderRadius: 'var(--radius-sm)' }}>
              {(['levels', 'grades', 'classes'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '0.4rem 0.9rem',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: activeTab === tab ? 'hsl(var(--surface))' : 'transparent',
                    color: activeTab === tab ? 'hsl(var(--primary))' : 'hsl(var(--text-light))',
                    boxShadow: activeTab === tab ? 'var(--shadow-xs)' : 'none',
                    transition: 'var(--transition-fast)'
                  }}
                >
                  {tab === 'levels' ? 'Nível' : tab === 'grades' ? 'Série' : 'Turma'}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {performance && performance[activeTab].length > 0 ? (
              performance[activeTab].map((item: any) => (
                <PowerBar key={item.id} label={item.name} subLabel={item.level || item.grade} percent={item.score} />
              ))
            ) : (
              <div style={{ padding: '2.5rem', textAlign: 'center', color: 'hsl(var(--text-light))', fontSize: '0.9rem' }}>
                Sem lançamentos detectados
              </div>
            )}
          </div>
        </div>

        {/* NOTICES */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'hsl(var(--text))' }}>Avisos</h3>
            <GraduationCap size={22} color="hsl(var(--primary))" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <NoticeItem title="Conselho de Classe" date="Agendado para 15/05" type="Live" />
            <NoticeItem title="Formação Docente" date="Workshop BNCC" type="Recente" />
            <NoticeItem title="Final do Bimestre" date="Lançamento até 20/05" type="Urgente" />
          </div>
        </div>
      </div>
    </div>
  )
}

/* =================== SUB-COMPONENTS =================== */

const StatCard = ({ icon, label, value, color }: any) => {
  const colorMap: any = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    warning: 'var(--warning)',
    error: 'var(--error)'
  }

  return (
    <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
      <div className="icon-box" style={{ 
        width: '48px', height: '48px', 
        backgroundColor: `hsl(${colorMap[color]} / 0.08)`, 
        color: `hsl(${colorMap[color]})`,
        borderRadius: 'var(--radius-sm)',
        minWidth: '48px'
      }}>
        {icon}
      </div>
      <div>
        <p style={{ color: 'hsl(var(--text-light))', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.1rem' }}>{label}</p>
        <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.03em' }}>{value}</h3>
      </div>
    </div>
  )
}

const NoticeItem = ({ title, date, type }: any) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border) / 0.3)' }}>
    <div>
      <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text))' }}>{title}</h4>
      <p style={{ fontSize: '0.75rem', color: 'hsl(var(--text-light))', fontWeight: 500 }}>{date}</p>
    </div>
    <span className="badge" style={{ 
      backgroundColor: type === 'Urgente' ? 'hsl(var(--error) / 0.08)' : 'hsl(var(--primary) / 0.06)', 
      color: type === 'Urgente' ? 'hsl(var(--error))' : 'hsl(var(--primary))' 
    }}>
      {type}
    </span>
  </div>
)

const PowerBar = ({ label, subLabel, percent }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text))' }}>{label}</span>
        {subLabel && <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-light))', display: 'block' }}>{subLabel}</span>}
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>{percent === 0 ? '--' : `${percent}%`}</span>
    </div>
    <div style={{ height: '6px', width: '100%', backgroundColor: 'hsl(var(--background))', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
      <div style={{ 
        height: '100%', width: `${percent}%`, 
        background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(260 85% 60%))',
        borderRadius: 'var(--radius-full)',
        transition: 'width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)'
      }}></div>
    </div>
  </div>
)
