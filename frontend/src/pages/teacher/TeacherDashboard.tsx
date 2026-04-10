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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3.5rem' }}>
      <header className="flex flex-mobile-col items-start justify-between gap-4">
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>Painel Docente</h1>
          <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.2rem', fontWeight: 500 }}>Sua central de controle para turmas, diários e planejamento.</p>
        </div>
        <div style={{ padding: '0.75rem 1.5rem', backgroundColor: 'hsl(var(--surface))', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border) / 0.5)', boxShadow: 'var(--shadow-sm)', width: 'auto' }}>
           <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>Ambiente de Trabalho Ativo</span>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '2.25rem' }}>
        <TeacherStatCard icon={<BookOpen size={28} />} label="Turmas Ativas" value={classes.length.toString().padStart(2, '0')} color="primary" trend="Sincronizado" />
        <TeacherStatCard icon={<GraduationCap size={28} />} label="Total Alunos" value={classes.reduce((acc, c) => acc + c._count.students, 0).toString().padStart(2, '0')} color="success" trend="Base de dados real" />
        <TeacherStatCard icon={<AlertCircle size={28} />} label="Pendências" value="00" color="warning" trend="Tudo em dia" />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div className="flex items-center gap-4">
           <div className="icon-box" style={{ width: '40px', height: '40px', backgroundColor: 'hsl(var(--text) / 0.05)', color: 'hsl(var(--text))' }}>
              <LayoutDashboard size={20} />
           </div>
           <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em' }}>Selecione a Turma</h2>
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
          <>
            {/* 1. SEÇÃO SUPERIOR: CARDS SELETORES (Master) */}
            <div 
              className="hide-scroll"
              style={{ 
                display: 'flex', 
                gap: '1rem', 
                overflowX: 'auto', 
                padding: '0.75rem 2rem 2rem 0.75rem',
                margin: '-0.75rem -2rem -2rem -0.75rem'
              }}
            >
              {classes.map(cls => {
                const isActive = cls.id === (selectedClassId || classes[0]?.id)
                return (
                  <button 
                    key={cls.id}
                    onClick={() => setSelectedClassId(cls.id)}
                    style={{ 
                      minWidth: '280px',
                      flex: '0 0 auto',
                      textAlign: 'left',
                      padding: '1.5rem',
                      borderRadius: 'var(--radius-xl)',
                      backgroundColor: isActive ? 'hsl(var(--primary))' : 'hsl(var(--surface))',
                      color: isActive ? 'white' : 'hsl(var(--text))',
                      border: isActive ? '2px solid hsl(var(--primary))' : '2px solid hsl(var(--border) / 0.3)',
                      boxShadow: isActive ? '0 10px 25px -5px hsl(var(--primary) / 0.4)' : 'var(--shadow-sm)',
                      transition: 'var(--transition-all)',
                      cursor: 'pointer'
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 800, 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.05em', 
                        color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--text-light))', 
                        backgroundColor: isActive ? 'white' : 'hsl(var(--text) / 0.05)', 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: 'var(--radius-sm)' 
                      }}>
                        {cls.subject || 'Polivalente'}
                      </span>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        color: isActive ? 'white' : 'hsl(var(--text-light))', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '0.25rem',
                        opacity: isActive ? 0.9 : 1
                      }}>
                        <GraduationCap size={14} /> {cls._count.students} Alunos
                      </span>
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>{cls.name}</h3>
                    <p style={{ fontSize: '0.9rem', fontWeight: 600, opacity: isActive ? 0.8 : 0.6 }}>
                      {cls.grade.name} • {cls.grade.level.name}
                    </p>
                  </button>
                )
              })}
            </div>

            {/* 2. SEÇÃO INFERIOR: FERRAMENTAS DA TURMA (Detail) */}
            {(() => {
              const activeCls = classes.find(c => c.id === (selectedClassId || classes[0]?.id))
              if (!activeCls) return null
              
              const isInfantil = activeCls.grade.level.name.includes('Infantil') || activeCls.grade.name.includes('Infantil')

              return (
                <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
                  <div className="flex items-center gap-3 mb-6">
                     <span style={{ width: '8px', height: '24px', backgroundColor: 'hsl(var(--primary))', borderRadius: '4px' }}></span>
                     <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em' }}>
                       Módulos: {activeCls.name}
                     </h3>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <ActionCard 
                      icon={<ClipboardList size={28} />} 
                      title="Chamada Diária" 
                      subtitle="Realocar presenças" 
                      onClick={() => navigate(`/teacher/attendance/${activeCls.id}`)} 
                    />
                    <ActionCard 
                      icon={<CheckSquare size={28} />} 
                      title="Notas e Avaliações" 
                      subtitle="Lançar resultados" 
                      onClick={() => navigate(`/teacher/grades/${activeCls.id}`)} 
                    />
                    <ActionCard 
                      icon={<FileText size={28} />} 
                      title="Plano de Aula" 
                      subtitle="Planejamento BNCC" 
                      onClick={() => navigate(`/teacher/lesson-plan/${activeCls.id}`)} 
                    />
                    <ActionCard 
                      icon={<Home size={28} />} 
                      title="Agenda de Casa" 
                      subtitle="Tarefas e lembretes" 
                      onClick={() => navigate(`/teacher/homework/${activeCls.id}`)} 
                    />
                    <ActionCard 
                      icon={<Megaphone size={28} />} 
                      title="Mural de Avisos" 
                      subtitle="Comunicar responsáveis" 
                      onClick={() => navigate(`/teacher/notices/${activeCls.id}`)} 
                    />
                    {isInfantil && (
                      <ActionCard 
                        icon={<Activity size={28} />} 
                        title="Rotina Infantil" 
                        subtitle="Atividades e relatório" 
                        variant="primary"
                        onClick={() => navigate(`/teacher/routine/${activeCls.id}`)} 
                      />
                    )}
                  </div>
                </div>
              )
            })()}
          </>
        )}
      </div>

      <div className="card" style={{ backgroundColor: 'hsl(var(--primary-light) / 0.5)', border: '2px dashed hsl(var(--primary) / 0.2)', padding: '2.5rem' }}>
        <div className="flex items-center gap-6">
          <div className="icon-box" style={{ width: '64px', height: '64px', backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))' }}>
            <AlertCircle size={32} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--text))', marginBottom: '0.25rem' }}>Informativo Docente</h3>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1rem', fontWeight: 500 }}>Primeiro selecione a turma no topo e depois acesse o módulo desejado na tela abaixo. Isso permite foco total no momento do lançamento.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

const ActionCard = ({ icon, title, subtitle, onClick, variant = 'secondary' }: any) => {
  const [hover, setHover] = useState(false)
  const isPrimary = variant === 'primary'
  
  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        textAlign: 'left',
        width: '100%',
        padding: '1.75rem',
        borderRadius: 'var(--radius-xl)',
        backgroundColor: isPrimary ? 'hsl(var(--primary-light))' : 'hsl(var(--surface))',
        border: `2px solid ${isPrimary ? 'hsl(var(--primary) / 0.3)' : 'hsl(var(--border) / 0.5)'}`,
        boxShadow: hover ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'var(--transition-all)',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: '56px', 
          height: '56px', 
          borderRadius: 'var(--radius-sm)',
          backgroundColor: isPrimary ? 'hsl(var(--primary))' : 'hsl(var(--text) / 0.05)',
          color: isPrimary ? 'white' : 'hsl(var(--text))',
          marginBottom: '1.5rem',
          transition: 'var(--transition-all)',
          transform: hover ? 'scale(1.05)' : 'scale(1)'
        }}
      >
        {icon}
      </div>
      <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: isPrimary ? 'hsl(var(--primary))' : 'hsl(var(--text))', letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--text-light))' }}>
        {subtitle}
      </p>
      
      <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: hover ? 1 : 0.2, transform: hover ? 'translateX(0)' : 'translateX(-4px)', transition: 'all 0.2s', color: isPrimary ? 'hsl(var(--primary))' : 'hsl(var(--text-light))' }}>
        <ChevronRight size={20} />
      </div>
    </button>
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
