import React, { useEffect, useState } from 'react'
import { 
  BookOpen, AlertCircle, LayoutDashboard, ClipboardList, CheckSquare, FileText, 
  Home, Megaphone, Activity, Loader2, GraduationCap, ChevronRight 
} from 'lucide-react'
import { api } from '../../utils/api'
import { useNavigate } from 'react-router-dom'

interface TeacherClass {
  id: string;
  name: string;
  subject: string;
  grade: {
    name: string;
    level: { name: string };
  };
  _count: { students: number };
}

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      const data = await api('/teacher/classes')
      setClasses(data)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
      </div>
    )
  }

  const activeCls = classes.find(c => c.id === (selectedClassId || classes[0]?.id))

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '4rem' }}>
      
      {/* HEADER PREMIUM */}
      <header style={{ marginTop: '2rem', marginBottom: '3.5rem' }}>
        <div style={{ 
          display: 'inline-flex', 
          padding: '0.4rem 1rem', 
          backgroundColor: 'hsl(var(--primary-light))', 
          borderRadius: 'var(--radius-full)', 
          color: 'hsl(var(--primary))', 
          fontSize: '0.8rem', 
          fontWeight: 800, 
          letterSpacing: '0.05em',
          marginBottom: '1rem',
          textTransform: 'uppercase'
        }}>
          Portal do Professor
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: 850, color: 'hsl(var(--text))', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '0.75rem' }}>
          Olá, Professor
        </h1>
        <p style={{ fontSize: '1.25rem', fontWeight: 500, color: 'hsl(var(--text-light))', letterSpacing: '-0.02em' }}>
          Gerencie suas turmas e diários com eficiência.
        </p>
      </header>

      {/* SELETOR DE TURMAS (BARRA HORIZONTAL FLAT) */}
      <section style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <LayoutDashboard size={20} color="hsl(var(--text))" />
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em', margin: 0 }}>
            Suas Turmas
          </h2>
        </div>
        
        <div className="hide-scroll" style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
          {classes.map(cls => {
            const isActive = cls.id === (selectedClassId || classes[0]?.id)
            return (
              <button 
                key={cls.id}
                onClick={() => setSelectedClassId(cls.id)}
                style={{ 
                  flex: '0 0 auto',
                  minWidth: '200px',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: isActive ? 'hsl(var(--text))' : 'hsl(var(--surface))',
                  color: isActive ? 'white' : 'hsl(var(--text))',
                  border: isActive ? 'none' : '1px solid hsl(var(--border) / 0.5)',
                  boxShadow: isActive ? '0 10px 20px -5px rgba(0,0,0,0.2)' : 'var(--shadow-sm)',
                  transition: 'var(--transition-all)',
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 800, opacity: 0.6, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  {cls.subject || 'Geral'}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{cls.name}</div>
              </button>
            )
          })}
        </div>
      </section>

      {/* GRID DE MÓDULOS (DETAIL) */}
      {activeCls && (
        <section style={{ animation: 'fadeIn 0.4s ease-out' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{ width: '4px', height: '24px', backgroundColor: 'hsl(var(--primary))', borderRadius: '4px' }}></span>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em' }}>
                Módulos: {activeCls.name}
              </h3>
            </div>
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--text-light))', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={16} /> {activeCls._count.students} Alunos
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
             <ModuleCard icon={<ClipboardList size={28} />} title="Chamada" onClick={() => navigate(`/teacher/attendance/${activeCls.id}`)} />
             <ModuleCard icon={<CheckSquare size={28} />} title="Notas" onClick={() => navigate(`/teacher/grades/${activeCls.id}`)} />
             <ModuleCard icon={<FileText size={28} />} title="Plano de Aula" onClick={() => navigate(`/teacher/lesson-plan/${activeCls.id}`)} />
             <ModuleCard icon={<Home size={28} />} title="Agenda" onClick={() => navigate(`/teacher/homework/${activeCls.id}`)} />
             <ModuleCard icon={<Megaphone size={28} />} title="Avisos" onClick={() => navigate(`/teacher/notices/${activeCls.id}`)} />
             
             {(activeCls.grade.level.name.includes('Infantil') || activeCls.grade.name.includes('Infantil')) && (
                <ModuleCard 
                  icon={<Activity size={28} />} 
                  title="Rotina" 
                  color="hsl(var(--primary))"
                  onClick={() => navigate(`/teacher/routine/${activeCls.id}`)} 
                />
             )}
          </div>
        </section>
      )}

      {/* FOOTER TIPS */}
      <footer style={{ marginTop: '5rem', padding: '2.5rem', backgroundColor: 'hsl(var(--text) / 0.03)', borderRadius: 'var(--radius-xl)', border: '1px dashed hsl(var(--border))' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
           <div style={{ 
             width: '56px', 
             height: '56px', 
             borderRadius: '50%', 
             backgroundColor: 'white', 
             display: 'flex', 
             alignItems: 'center', 
             justifyContent: 'center',
             boxShadow: 'var(--shadow-sm)'
           }}>
             <AlertCircle size={28} color="hsl(var(--primary))" />
           </div>
           <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'hsl(var(--text))', marginBottom: '0.2rem' }}>Dica do Sistema</h4>
              <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'hsl(var(--text-light))', lineHeight: 1.5 }}>
                Suas alterações são salvas automaticamente na base da secretaria. Selecione uma turma acima para liberar as ferramentas de diário.
              </p>
           </div>
        </div>
      </footer>
    </div>
  )
}

const ModuleCard = ({ icon, title, onClick, color }: any) => {
  const [hover, setHover] = useState(false)
  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '2rem',
        backgroundColor: 'hsl(var(--surface))',
        borderRadius: 'var(--radius-xl)',
        border: '1px solid hsl(var(--border) / 0.5)',
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'var(--transition-all)',
        textAlign: 'left',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ 
        width: '56px', 
        height: '56px', 
        borderRadius: '16px', 
        backgroundColor: color ? `${color}10` : 'hsl(var(--text) / 0.05)', 
        color: color || 'hsl(var(--text))',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        transition: 'all 0.3s'
      }}>
        {icon}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', justifyContent: 'space-between' }}>
        <h4 style={{ fontSize: '1.3rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em' }}>{title}</h4>
        <ChevronRight size={18} style={{ color: 'hsl(var(--text-light))', opacity: hover ? 1 : 0.2, transition: 'all 0.3s' }} />
      </div>
    </button>
  )
}

const TeacherStatCard = () => null // Deprecated - clean UI strategy
