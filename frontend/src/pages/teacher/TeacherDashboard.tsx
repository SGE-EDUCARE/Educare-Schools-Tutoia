import React, { useEffect, useState } from 'react'
import { 
  BookOpen, AlertCircle, ArrowRight, Clock, UserPlus, Users, 
  LayoutDashboard, ClipboardList, CheckSquare, FileText, 
  Home, Megaphone, Activity, Loader2, GraduationCap 
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      <header className="flex justify-between items-end">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>Painel Docente</h1>
          <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.2rem', fontWeight: 500 }}>Sua central de controle para turmas, diários e planejamento.</p>
        </div>
        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'hsl(var(--surface))', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border) / 0.5)', boxShadow: 'var(--shadow-sm)' }}>
           <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>Ambiente de Trabalho Ativo</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2.25rem' }}>
        <TeacherStatCard icon={<BookOpen size={28} />} label="Turmas Ativas" value={classes.length.toString().padStart(2, '0')} color="primary" trend="Sincronizado" />
        <TeacherStatCard icon={<GraduationCap size={28} />} label="Total Alunos" value={classes.reduce((acc, c) => acc + c._count.students, 0).toString().padStart(2, '0')} color="success" trend="Base de dados real" />
        <TeacherStatCard icon={<AlertCircle size={28} />} label="Pendências" value="00" color="warning" trend="Tudo em dia" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="flex items-center gap-4">
           <div className="icon-box" style={{ width: '40px', height: '40px', backgroundColor: 'hsl(var(--text) / 0.05)', color: 'hsl(var(--text))' }}>
              <LayoutDashboard size={20} />
           </div>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em' }}>Minhas Atribuições</h2>
        </div>

        {loading ? (
          <div style={{ padding: '6rem', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={40} color="hsl(var(--primary))" style={{ margin: '0 auto' }} />
            <p style={{ marginTop: '1rem', color: 'hsl(var(--text-light))' }}>Carregando suas turmas...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem' }}>Você ainda não possui turmas vinculadas. Entre em contato com a coordenação.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '2rem' }}>
            {classes.map(cls => (
               <div key={cls.id} className="card" style={{ 
                 display: 'flex', 
                 flexDirection: 'column', 
                 gap: '2rem', 
                 borderLeft: '6px solid hsl(var(--primary))',
                 position: 'relative',
                 overflow: 'hidden'
               }}>
                  <div className="flex justify-between items-start" style={{ position: 'relative' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'hsl(var(--primary))', backgroundColor: 'hsl(var(--primary-light))', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-sm)' }}>
                        {cls.subject || 'Polivalente'}
                      </span>
                      <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'hsl(var(--text))', marginTop: '1rem', letterSpacing: '-0.03em' }}>{cls.name}</h3>
                      <p style={{ color: 'hsl(var(--text-light))', fontSize: '1rem', fontWeight: 500, marginTop: '0.25rem' }}>
                        {cls.grade.name} • {cls.grade.level.name}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--text))' }}>{cls._count.students}</div>
                       <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-light))', textTransform: 'uppercase' }}>Alunos</div>
                    </div>
                  </div>
                  
                  {/* Grid de Ações Rápidas */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    <ActionButton icon={<ClipboardList size={18} />} label="Chamada" onClick={() => navigate(`/teacher/attendance/${cls.id}`)} />
                    <ActionButton icon={<CheckSquare size={18} />} label="Notas" onClick={() => navigate(`/teacher/grades/${cls.id}`)} />
                    <ActionButton icon={<FileText size={18} />} label="Plano" onClick={() => navigate(`/teacher/lesson-plan/${cls.id}`)} />
                    <ActionButton icon={<Home size={18} />} label="Agenda" onClick={() => navigate(`/teacher/homework/${cls.id}`)} />
                    <ActionButton icon={<Megaphone size={18} />} label="Aviso" onClick={() => navigate(`/teacher/notices/${cls.id}`)} />
                    
                    {/* Botão de Rotina apenas para Infantil */}
                    {(cls.grade.level.name.includes('Infantil') || cls.grade.name.includes('Infantil')) && (
                       <ActionButton icon={<Activity size={18} />} label="Rotina" variant="primary" onClick={() => navigate(`/teacher/routine/${cls.id}`)} />
                    )}
                  </div>
               </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ backgroundColor: 'hsl(var(--primary-light) / 0.5)', border: '2px dashed hsl(var(--primary) / 0.2)', padding: '2.5rem' }}>
        <div className="flex items-center gap-6">
          <div className="icon-box" style={{ width: '64px', height: '64px', backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--text))', marginBottom: '0.25rem' }}>Informativo Docente</h3>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1rem', fontWeight: 500 }}>Utilize os módulos acima para lançamentos diários. Os dados são sincronizados em tempo real com a secretaria.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ActionButton = ({ icon, label, onClick, variant = 'secondary' }: any) => (
  <button 
    onClick={onClick}
    className={`btn btn-${variant}`} 
    style={{ 
      flexDirection: 'column', 
      padding: '0.85rem', 
      gap: '0.5rem', 
      fontSize: '0.8rem',
      borderRadius: 'var(--radius-md)' 
    }}
  >
    {icon}
    {label}
  </button>
)

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
