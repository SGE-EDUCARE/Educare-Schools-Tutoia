import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { 
  ChevronLeft, 
  Loader2, 
  FileText, 
  Calendar, 
  Plus, 
  Edit3, 
  Target, 
  LayoutList, 
  CheckCircle2,
  Trash2,
  ChevronDown
} from 'lucide-react'

type LessonPlan = {
  id?: string
  date: string
  subject: string
  bimester: string
  month: string
  general_competencies: string
  specific_competencies: string
  knowledge_objects: string
  programmatic_content: string // Veremos se expandimos para semanas individuais
  skills: string
  methodology: string
  evaluation: string
  resources: string
  references: string
  type: string
}

export const LessonPlanPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  
  // States
  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  
  // Custom Select States
  const [openSubject, setOpenSubject] = useState(false)
  const [openBimester, setOpenBimester] = useState(false)
  const [openMonth, setOpenMonth] = useState(false)

  const emptyPlan = (): LessonPlan => ({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    bimester: '1',
    month: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date()),
    general_competencies: '',
    specific_competencies: '',
    knowledge_objects: '',
    programmatic_content: '',
    skills: '',
    methodology: '',
    evaluation: '',
    resources: '',
    references: '',
    type: 'Mensal'
  })

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api(`/teacher/classes/${classId}/lesson-plans`)
      setPlans(data)
    } catch { toast.error('Erro ao carregar planos') }
    finally { setLoading(false) }
  }, [classId])

  const fetchAllocations = useCallback(async () => {
    try {
      const data = await api(`/teacher/classes/${classId}/allocations`)
      setSubjects(data)
      // Se tiver só uma disciplina, já seleciona no novo plano se estiver criando
    } catch (e) { console.error(e) }
  }, [classId])

  useEffect(() => {
    fetchPlans()
    fetchAllocations()
  }, [fetchPlans, fetchAllocations])

  const handleCreateNew = () => {
    const fresh = emptyPlan()
    if (subjects.length === 1) fresh.subject = subjects[0]
    setCurrentPlan(fresh)
    setIsEditing(true)
  }

  const handleEdit = (plan: LessonPlan) => {
    // Normalizar nulos para strings vazias para o input
    const normalized = { ...plan } as any
    Object.keys(normalized).forEach(key => {
      if (normalized[key] === null) normalized[key] = ''
    })
    setCurrentPlan(normalized)
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!currentPlan?.subject) return toast.error('Informe a disciplina')
    if (!currentPlan?.knowledge_objects && !currentPlan?.general_competencies) {
      return toast.error('Preencha ao menos as competências ou objetos de conhecimento')
    }

    setSaving(true)
    try {
      await api('/teacher/lesson-plans', {
        method: 'POST',
        body: JSON.stringify({ ...currentPlan, classId })
      })
      toast.success('Plano de aula salvo!')
      setIsEditing(false)
      setCurrentPlan(null)
      fetchPlans()
    } catch (error) {
      toast.error('Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  const bimesterOptions = [
    { value: '1', label: '1º Bimestre' },
    { value: '2', label: '2º Bimestre' },
    { value: '3', label: '3º Bimestre' },
    { value: '4', label: '4º Bimestre' },
  ]

  const monthOptions = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ].map(m => ({ value: m, label: m }))

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )

  const gradient = 'linear-gradient(135deg, #4318FF 0%, #7000FF 100%)'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem 10rem' }}>
        
        {/* HEADER */}
        <header style={{ padding: '1.5rem 0 2rem' }}>
          <button onClick={() => isEditing ? setIsEditing(false) : navigate(-1)} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            color: 'hsl(var(--primary))', fontSize: '0.8rem', fontWeight: 700,
            marginBottom: '1rem', background: 'hsl(var(--primary) / 0.06)',
            padding: '0.5rem 0.9rem', borderRadius: '8px', cursor: 'pointer', border: 'none'
          }}>
            <ChevronLeft size={16} /> VOLTAR
          </button>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'hsl(var(--text))', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                {isEditing ? (currentPlan?.id ? 'Editar Plano' : 'Novo Plano Mensal') : 'Meus Planos de Aula'}
              </h1>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'hsl(var(--text-light))', marginTop: '0.3rem' }}>
                {isEditing ? 'Preencha os campos conforme o modelo da BNCC.' : 'Gerencie seus planejamentos pedagógicos.'}
              </p>
            </div>
            
            {!isEditing && (
              <button onClick={handleCreateNew} style={{
                background: gradient, color: 'white', padding: '0.75rem 1.5rem',
                borderRadius: '8px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem',
                boxShadow: '0 8px 20px -6px hsl(var(--primary) / 0.4)', cursor: 'pointer', border: 'none'
              }}>
                <Plus size={20} /> CRIAR NOVO PLANO
              </button>
            )}
          </div>
        </header>

        {isEditing && currentPlan ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
            
            {/* 1. IDENTIFICAÇÃO */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid hsl(var(--border) / 0.3)', paddingBottom: '0.75rem' }}>
                <Calendar size={18} color="hsl(var(--primary))" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--text))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Identificação</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <CustomSelect 
                  label="Disciplina"
                  value={currentPlan.subject}
                  options={subjects.map(s => ({ value: s, label: s }))}
                  isOpen={openSubject}
                  setIsOpen={setOpenSubject}
                  onChange={(v: string) => setCurrentPlan({ ...currentPlan, subject: v })}
                />
                <CustomSelect 
                  label="Bimestre"
                  value={String(currentPlan.bimester)}
                  options={bimesterOptions}
                  isOpen={openBimester}
                  setIsOpen={setOpenBimester}
                  onChange={(v: string) => setCurrentPlan({ ...currentPlan, bimester: v })}
                />
                <CustomSelect 
                  label="Mês de Referência"
                  value={currentPlan.month}
                  options={monthOptions}
                  isOpen={openMonth}
                  setIsOpen={setOpenMonth}
                  onChange={(v: string) => setCurrentPlan({ ...currentPlan, month: v })}
                />
              </div>
            </div>

            {/* 2. PEDAGÓGICO (BNCC) */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid hsl(var(--border) / 0.3)', paddingBottom: '0.75rem' }}>
                <Target size={18} color="hsl(var(--primary))" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--text))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Base Pedagógica</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Competências Gerais</label>
                  <textarea 
                    className="input" 
                    placeholder="Ex: Conhecimento, Pensamento científico, crítico e criativo..."
                    style={{ minHeight: '120px', width: '100%', borderRadius: '8px', padding: '1rem', background: 'hsl(var(--background))' }}
                    value={currentPlan.general_competencies}
                    onChange={e => setCurrentPlan({ ...currentPlan, general_competencies: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Competências Específicas da Área</label>
                  <textarea 
                    className="input" 
                    placeholder="Conforme definido pela Base Nacional Comum Curricular (BNCC)..."
                    style={{ minHeight: '120px', width: '100%', borderRadius: '8px', padding: '1rem', background: 'hsl(var(--background))' }}
                    value={currentPlan.specific_competencies}
                    onChange={e => setCurrentPlan({ ...currentPlan, specific_competencies: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* 3. DESENVOLVIMENTO MENSAL */}
            <div className="card" style={{ padding: '1.5rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', borderBottom: '1px solid hsl(var(--border) / 0.3)', paddingBottom: '0.75rem' }}>
                <LayoutList size={18} color="hsl(var(--primary))" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--text))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Desenvolvimento Mensal</h3>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <FormGroup label="Objeto(s) de Conhecimento" placeholder="Principais conteúdos do bimestre..." 
                    value={currentPlan.knowledge_objects} onChange={(v: string) => setCurrentPlan({ ...currentPlan, knowledge_objects: v })} />
                  
                  <FormGroup label="Habilidades (BNCC)" placeholder="Defina as habilidades (Ex: EF09LP04)..." 
                    value={currentPlan.skills} onChange={(v: string) => setCurrentPlan({ ...currentPlan, skills: v })} />
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <FormGroup label="Cronograma (Conteúdos por Semana)" placeholder="Semana 1: ... | Semana 2: ..." 
                    value={currentPlan.programmatic_content} onChange={(v: string) => setCurrentPlan({ ...currentPlan, programmatic_content: v })} height="140px" />
                  
                  <FormGroup label="Metodologia (Procedimentos)" placeholder="Aulas expositivas, trabalhos em grupo..." 
                    value={currentPlan.methodology} onChange={(v: string) => setCurrentPlan({ ...currentPlan, methodology: v })} />
                </div>
              </div>
            </div>

            {/* 4. AVALIAÇÃO E RECURSOS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
              <div className="card" style={{ padding: '1.5rem', borderRadius: '8px' }}>
                <FormGroup label="Procedimentos Avaliativos" placeholder="Como o desempenho será avaliado..." 
                  value={currentPlan.evaluation} onChange={(v: string) => setCurrentPlan({ ...currentPlan, evaluation: v })} />
              </div>
              <div className="card" style={{ padding: '1.5rem', borderRadius: '8px' }}>
                <FormGroup label="Recursos e Referências" placeholder="Livros, quadro, internet, projetor..." 
                  value={currentPlan.resources} onChange={(v: string) => setCurrentPlan({ ...currentPlan, resources: v })} />
              </div>
            </div>

            {/* BOTÕES DE AÇÃO */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button 
                onClick={handleSave} 
                disabled={saving} 
                style={{
                  flex: 2, height: '56px', background: gradient, color: 'white',
                  borderRadius: '8px', fontSize: '1rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
                  boxShadow: '0 12px 24px -8px hsl(var(--primary) / 0.4)', cursor: 'pointer', border: 'none',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? <Loader2 className="animate-spin" size={24} /> : <><CheckCircle2 size={24} /> SALVAR PLANEJAMENTO</>}
              </button>
              <button 
                onClick={() => setIsEditing(false)} 
                disabled={saving}
                style={{
                  flex: 1, padding: '0 1.5rem', border: '2px solid hsl(var(--border))',
                  background: 'transparent', color: 'hsl(var(--text-light))',
                  borderRadius: '8px', fontWeight: 700, cursor: 'pointer'
                }}
              >
                CANCELAR
              </button>
            </div>

          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {plans.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '6rem 2rem', textAlign: 'center' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: 'hsl(var(--primary) / 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                  <FileText size={40} color="hsl(var(--primary))" opacity={0.3} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--text))' }}>Nenhum plano encontrado</h2>
                <p style={{ color: 'hsl(var(--text-light))', maxWidth: '300px', margin: '0.5rem auto 1.5rem' }}>Comece a planejar suas aulas seguindo o novo modelo mensal.</p>
                <button onClick={handleCreateNew} style={{ 
                  backgroundColor: 'hsl(var(--primary) / 0.1)', color: 'hsl(var(--primary))', 
                  padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer'
                }}>
                  Criar Primeiro Plano
                </button>
              </div>
            ) : (
              plans.map(plan => (
                <div key={plan.id} className="card" style={{ 
                  borderRadius: '12px', padding: '1.25rem', border: '1px solid hsl(var(--border) / 0.4)',
                  display: 'flex', flexDirection: 'column', gap: '1rem', transition: 'all 0.2s'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ backgroundColor: 'hsl(var(--primary) / 0.05)', padding: '0.4rem 0.75rem', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>
                      {plan.month}
                    </div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-light) / 0.6)' }}>
                       {new Date(plan.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'hsl(var(--text))', lineHeight: 1.2 }}>{plan.subject}</h3>
                    <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-light))', fontWeight: 500 }}>{plan.bimester}º Bimestre • {plan.type}</p>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <button onClick={() => handleEdit(plan)} style={{
                      flex: 1, padding: '0.6rem', backgroundColor: 'hsl(var(--primary) / 0.06)', 
                      color: 'hsl(var(--primary))', borderRadius: '8px', border: 'none', 
                      fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
                    }}>
                      <Edit3 size={16} /> EDITAR
                    </button>
                    <button style={{
                      padding: '0.6rem', backgroundColor: 'hsl(var(--error) / 0.06)', 
                      color: 'hsl(var(--error))', borderRadius: '8px', border: 'none', 
                      cursor: 'pointer'
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>
    </div>
  )
}

/* =================== SUB-COMPONENTS =================== */

const CustomSelect = ({ label, icon, value, options, isOpen, setIsOpen, onChange }: any) => {
  const selectedLabel = options.find((o: any) => o.value === value)?.label || 'Selecione...'
  
  return (
    <div className="card" style={{ 
      padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', 
      borderRadius: '8px', position: 'relative', cursor: 'pointer', height: '100%', width: '100%', justifyContent: 'center'
    }} onClick={() => setIsOpen(!isOpen)}>
      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {icon || <Calendar size={10} />} {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text))' }}>{selectedLabel}</span>
        <ChevronDown size={14} color="hsl(var(--text-light))" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="grades-select-popover" style={{
            position: 'absolute', top: '110%', left: 0, right: 0, backgroundColor: 'white',
            borderRadius: '12px', boxShadow: '0 10px 40px -10px rgba(0,0,0,0.15)',
            border: '1px solid hsl(var(--border) / 0.4)', zIndex: 100, overflow: 'hidden', padding: '0.4rem'
          }}>
            {options.map((opt: any) => (
              <div key={opt.value} 
                className="grades-select-option"
                style={{ padding: '0.75rem 1rem', fontSize: '0.85rem', fontWeight: 600, borderRadius: '8px', cursor: 'pointer' }}
                onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const FormGroup = ({ label, value, onChange, placeholder, height = "100px" }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
    <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', marginLeft: '0.2rem' }}>{label}</label>
    <textarea 
      className="input" 
      placeholder={placeholder}
      style={{ minHeight: height, width: '100%', borderRadius: '8px', padding: '1rem', background: 'hsl(var(--background))', border: '1px solid hsl(var(--border) / 0.3)' }}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
)
