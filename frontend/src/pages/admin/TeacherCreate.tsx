import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, UserPlus, BookOpen, Layers, Plus, Trash2, ShieldAlert } from 'lucide-react'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'

interface Allocation {
  class_id: string;
  subject: string;
  tempId: number; // Para controle no frontend
}

export const TeacherCreate: React.FC = () => {
  const navigate = useNavigate()
  const [submitLoading, setSubmitLoading] = useState(false)
  const [step, setStep] = useState(1)

  // Dados para os selects
  const [levels, setLevels] = useState<any[]>([])
  const [grades, setGrades] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [turns, setTurns] = useState<any[]>([])

  // Estado do Formulário
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    level_id: ''
  })

  const [allocations, setAllocations] = useState<Allocation[]>([
    { class_id: '', subject: '', tempId: Date.now() }
  ])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [levelsData, gradesData, classesData, turnsData] = await Promise.all([
        api('/admin/academic/levels'),
        api('/admin/academic/grades'),
        api('/admin/academic/classes'),
        api('/admin/academic/turns')
      ])
      setLevels(levelsData)
      setGrades(gradesData)
      setClasses(classesData)
      setTurns(turnsData)
    } catch (e) {
      toast.error('Erro ao carregar dados acadêmicos')
    }
  }

  const selectedLevel = levels.find(l => l.id === formData.level_id)
  const levelName = selectedLevel?.name.toLowerCase() || ''
  
  // Lógica de detecção mais flexível para tipos de ensino especialista
  const isElementaryIIOrHigh = 
    levelName.includes('fundamental ii') || 
    levelName.includes('fundamental 2') || 
    levelName.includes('médio') || 
    levelName.includes('medio') ||
    levelName.includes('técnico') ||
    levelName.includes('tecnico') 

  const addAllocation = () => {
    setAllocations([...allocations, { class_id: '', subject: '', tempId: Date.now() }])
  }

  const removeAllocation = (tempId: number) => {
    setAllocations(allocations.filter(a => a.tempId !== tempId))
  }

  const updateAllocation = (tempId: number, field: string, value: string) => {
    setAllocations(allocations.map(a => a.tempId === tempId ? { ...a, [field]: value } : a))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validações
    if (allocations.some(a => !a.class_id)) {
      toast.error('Selecione a turma para todas as alocações')
      return
    }

    if (isElementaryIIOrHigh && allocations.some(a => !a.subject)) {
      toast.error('Informe a disciplina para todas as alocações')
      return
    }

    setSubmitLoading(true)
    const loadId = toast.loading('Admitindo professor...')
    
    try {
      await api('/admin/teachers', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          allocations: allocations.map(a => ({
            class_id: a.class_id,
            subject: isElementaryIIOrHigh ? a.subject : 'Polivalente'
          }))
        })
      })

      toast.success('Professor admitido com sucesso!', { id: loadId })
      navigate('/admin/teachers')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao admitir professor', { id: loadId })
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header className="flex items-center justify-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button 
            onClick={() => navigate('/admin/teachers')}
            className="btn btn-secondary" 
            style={{ padding: '0.75rem', borderRadius: '50%' }}
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>Admissão Profissional</h1>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem', fontWeight: 500 }}>Cadastre novos docentes e defina suas atribuições acadêmicas.</p>
          </div>
        </div>
      </header>

      {/* Progress Tracker Simple */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ 
            flex: 1, 
            height: '6px', 
            backgroundColor: step >= i ? 'hsl(var(--primary))' : 'hsl(var(--secondary))',
            borderRadius: '3px',
            transition: 'all 0.4s ease'
          }} />
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {step === 1 ? (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="flex items-center gap-3">
               <div className="icon-box" style={{ width: '40px', height: '40px', backgroundColor: 'hsl(var(--primary-light))', color: 'hsl(var(--primary))' }}>
                  <UserPlus size={20} />
               </div>
               <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>1. Identificação e Acesso</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="label">Nome Completo do Professor *</label>
                <input required className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Ex: Prof. Dr. Carlos Alberto" />
              </div>
              <div>
                <label className="label">E-mail Corporativo *</label>
                <input required type="email" className="input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="carlos.alberto@educare.com" />
              </div>
              <div>
                <label className="label">Senha Temporária *</label>
                <input required className="input" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Crie uma senha inicial" />
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-light))', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShieldAlert size={14} /> O professor deverá trocar esta senha no primeiro acesso.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button 
                type="button" 
                onClick={() => {
                  if (!formData.name || !formData.email || !formData.password) {
                    toast.error('Preencha os dados de identificação')
                    return
                  }
                  setStep(2)
                }} 
                className="btn btn-primary" 
                style={{ padding: '0.8rem 2.5rem' }}
              >
                Próximo Passo: Alocações
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div className="flex items-center gap-3">
               <div className="icon-box" style={{ width: '40px', height: '40px', backgroundColor: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))' }}>
                  <Layers size={20} />
               </div>
               <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>2. Atribuições Acadêmicas</h3>
            </div>

            <div style={{ backgroundColor: 'hsl(var(--background))', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border) / 0.5)' }}>
               <label className="label">Nível de Ensino para Alocação *</label>
               <select required className="input" value={formData.level_id} onChange={e => setFormData({...formData, level_id: e.target.value})}>
                 <option value="">Selecione o nível...</option>
                 {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
               </select>
               <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-light))', marginTop: '0.5rem' }}>
                 A interface de atribuição mudará automaticamente baseada na regra do nível escolhido.
               </p>
            </div>

            {formData.level_id && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <BookOpen size={18} /> Turmas e Disciplinas vinculadas
                  </h4>
                  {isElementaryIIOrHigh && (
                    <button type="button" onClick={addAllocation} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                      <Plus size={16} /> Adicionar Disciplina/Turma
                    </button>
                  )}
                </div>

                {allocations.map((alloc) => {
                  const filteredGrades = grades.filter(g => g.level_id === formData.level_id);
                  const filteredClasses = classes.filter(c => filteredGrades.some(g => g.id === c.grade_id));

                  return (
                    <div key={alloc.tempId} style={{ 
                      display: 'grid', 
                      gridTemplateColumns: isElementaryIIOrHigh ? '1fr 1.5fr auto' : '1fr auto', 
                      gap: '1rem', 
                      alignItems: 'end',
                      padding: '1rem',
                      backgroundColor: 'hsl(var(--background) / 0.5)',
                      borderRadius: '12px',
                      border: '1px solid hsl(var(--border) / 0.3)'
                    }}>
                      {isElementaryIIOrHigh && (
                        <div>
                          <label className="label" style={{ fontSize: '0.8rem' }}>Disciplina</label>
                          <input 
                            required 
                            className="input" 
                            placeholder="Ex: Matemática" 
                            value={alloc.subject} 
                            onChange={e => updateAllocation(alloc.tempId, 'subject', e.target.value)} 
                          />
                        </div>
                      )}
                      <div>
                        <label className="label" style={{ fontSize: '0.8rem' }}>Turma Destino</label>
                        <select 
                          required 
                          className="input" 
                          value={alloc.class_id} 
                          onChange={e => updateAllocation(alloc.tempId, 'class_id', e.target.value)}
                        >
                          <option value="">Selecione a turma...</option>
                          {filteredClasses.map(c => {
                             const grade = grades.find(g => g.id === c.grade_id);
                             const turn = turns.find(t => t.id === c.turn_id);
                             return (
                               <option key={c.id} value={c.id}>
                                 {grade?.name} - {c.name} ({turn?.name})
                               </option>
                             )
                          })}
                        </select>
                      </div>
                      {allocations.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeAllocation(alloc.tempId)} 
                          className="btn-ghost" 
                          style={{ color: 'hsl(var(--error))', padding: '0.8rem' }}
                        >
                          <Trash2 size={20} />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <button type="button" onClick={() => setStep(1)} className="btn btn-secondary" style={{ padding: '0.8rem 2rem' }}>Voltar</button>
              <button 
                type="submit" 
                disabled={submitLoading || !formData.level_id} 
                className="btn btn-primary" 
                style={{ padding: '0.8rem 3rem' }}
              >
                {submitLoading ? 'Processando Admission...' : <><Check size={20} /> Finalizar Admissão</>}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
