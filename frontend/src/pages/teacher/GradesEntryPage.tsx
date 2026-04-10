import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Search, Loader2, Calendar, BookOpen, Trash2, Rocket, CheckCircle2, RefreshCw } from 'lucide-react'

type GradeFields = { p1: string; p2: string; result: string; retry: string; final: string }

export const GradesEntryPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [students, setStudents] = useState<any[]>([])
  const [grades, setGrades] = useState<Record<string, GradeFields>>({})
  const [bimester, setBimester] = useState('1')
  const [subjects, setSubjects] = useState<string[]>([])
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingGrades, setLoadingGrades] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)
  const studentsRef = useRef<any[]>([])

  const emptyGrade = (): GradeFields => ({ p1: '', p2: '', result: '', retry: '', final: '' })

  useEffect(() => {
    fetchData()
  }, [classId])

  // Quando bimestre ou disciplina mudam, recarregar notas
  useEffect(() => {
    if (studentsRef.current.length > 0 && subject) {
      loadGradesExplicit(subject)
    }
  }, [bimester, subject])

  const loadGradesExplicit = useCallback(async (currentSubject: string) => {
    const currentStudents = studentsRef.current
    if (!currentSubject || currentStudents.length === 0) return

    setLoadingGrades(true)
    try {
      const normalizedSubject = String(currentSubject).trim()
      const existingGrades = await api(`/teacher/classes/${classId}/grades?bimester=${bimester}&subject=${encodeURIComponent(normalizedSubject)}`)
      
      const newGradesState: Record<string, GradeFields> = {}
      
      // Inicializar todos os alunos com campos vazios
      currentStudents.forEach(s => {
        newGradesState[s.id] = emptyGrade()
      })

      // Mapear labels do banco para campos do formulário
      const labelsMap: any = { '1ª Prova': 'p1', '2ª Prova': 'p2', 'Média': 'result', 'Superação': 'retry', 'Resultado Final': 'final' }

      existingGrades.forEach((g: any) => {
        if (newGradesState[g.student_id]) {
          const field = labelsMap[g.label]
          if (field) {
            const val = g.value !== null && g.value !== undefined ? String(g.value) : ''
            newGradesState[g.student_id][field as keyof GradeFields] = val
          }
        }
      })

      // Recalcular média e resultado final com os valores carregados
      Object.keys(newGradesState).forEach(id => {
        const s = newGradesState[id]
        if (s.p1 || s.p2) {
           s.result = calculateMedia(s.p1, s.p2)
        }
        // Calcular resultado final
        s.final = computeFinal(s.result, s.retry)
      })

      setGrades(newGradesState)
    } catch (error) {
      console.error('Erro ao carregar notas salvas:', error)
      toast.error('Erro ao carregar notas')
    } finally {
      setLoadingGrades(false)
    }
  }, [classId, bimester])

  const fetchData = async () => {
    try {
      const [studentsData, subjectsData] = await Promise.all([
        api(`/teacher/classes/${classId}/students`),
        api(`/teacher/classes/${classId}/allocations`)
      ])
      
      const sorted = studentsData.sort((a: any, b: any) => a.name.localeCompare(b.name))
      setStudents(sorted)
      studentsRef.current = sorted
      setSubjects(subjectsData)
      
      // Inicializar grades vazias
      const initial: Record<string, GradeFields> = {}
      sorted.forEach((s: any) => {
        initial[s.id] = emptyGrade()
      })
      setGrades(initial)

      if (subjectsData.length > 0) {
        const firstSubject = subjectsData[0]
        setSubject(firstSubject)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSaveStudent = async (studentId: string) => {
    if (!subject) {
      toast.error('Informe a disciplina')
      return
    }
    setSavingId(studentId)
    try {
      const normalizedSubject = String(subject).trim()
      await api('/teacher/grades', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          classId,
          bimester,
          subject: normalizedSubject,
          grades: grades[studentId]
        })
      })
      toast.success('Notas salvas!')
    } catch (error: any) {
      toast.error('Erro ao salvar notas')
    } finally {
      setSavingId(null)
    }
  }

  const handleSaveAll = async () => {
    if (!subject) {
      toast.error('Informe a disciplina')
      return
    }
    setSavingId('all')
    try {
      const normalizedSubject = String(subject).trim()
      await api('/teacher/grades/bulk', {
        method: 'POST',
        body: JSON.stringify({
          classId,
          bimester,
          subject: normalizedSubject,
          grades
        })
      })
      // Mostrar feedback de sucesso na própria tela (sem navegar)
      setSavedSuccess(true)
      toast.success('Todas as notas salvas com sucesso!')
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (error: any) {
      toast.error('Erro ao salvar todas as notas')
    } finally {
      setSavingId(null)
    }
  }

  const calculateMedia = (p1: string, p2: string) => {
    const v1 = parseFloat(p1) || 0
    const v2 = parseFloat(p2) || 0
    if (p1 === '' && p2 === '') return ''
    const media = (v1 + v2) / 2
    return media.toFixed(1)
  }

  // Resultado Final: se superação tem valor → usa superação, senão → média
  const computeFinal = (media: string, retry: string): string => {
    if (!media && !retry) return ''
    const retryVal = parseFloat(retry)
    // Se superação tem valor, resultado final = superação
    if (!isNaN(retryVal) && retry !== '') return retry
    // Caso contrário, resultado final = média
    return media
  }

  const handleGradeChange = (studentId: string, field: 'p1' | 'p2' | 'retry', value: string) => {
    const val = value.replace(',', '.')
    setGrades(prev => {
      const current = prev[studentId] || emptyGrade()
      const newGrades = { ...current, [field]: val }
      
      // Auto calculo da média se for p1 ou p2
      if (field === 'p1' || field === 'p2') {
        newGrades.result = calculateMedia(newGrades.p1, newGrades.p2)
      }

      // Sempre recalcular resultado final
      newGrades.final = computeFinal(newGrades.result, newGrades.retry)
      
      return { ...prev, [studentId]: newGrades }
    })
  }

  const handleDeleteStudent = (studentId: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: emptyGrade()
    }))
    toast.success('Campos limpos')
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filledCount = Object.values(grades).filter(v => v.p1 !== '' || v.p2 !== '').length
  const progress = students.length > 0 ? (filledCount / students.length) * 100 : 0

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )

  const systemGradient = 'linear-gradient(135deg, #4318FF 0%, #7000FF 100%)'
  const successGradient = 'linear-gradient(135deg, #10B981 0%, #059669 100%)'

  // Helper: cor baseada no valor da nota (>=7 verde, <7 vermelho)
  const getGradeColor = (val: string) => {
    if (!val) return 'hsl(var(--text-light))'
    const num = parseFloat(val)
    if (isNaN(num)) return 'hsl(var(--text-light))'
    return num >= 7 ? '#10B981' : '#EF4444'
  }

  return (
    <div style={{ margin: '0 auto', width: '100%', minHeight: '100vh', backgroundColor: 'hsl(var(--background))', position: 'relative' }}>
      
      {/* WRAPPER */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.25rem 12rem 1.25rem' }}>
        
        {/* HEADER */}
        <header style={{ padding: '1.5rem 0 1rem 0' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.4rem', 
              color: 'hsl(var(--primary))', fontSize: '0.8rem', fontWeight: 700,
              marginBottom: '1.25rem', background: 'hsl(var(--primary) / 0.06)',
              padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-full)',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} /> VOLTAR
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'hsl(var(--text))', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '0.4rem' }}>
            Lançar Notas
          </h1>
          <p style={{ fontSize: '0.95rem', fontWeight: 500, color: 'hsl(var(--text-light))', marginBottom: '1.5rem' }}>
            Lançamento de múltiplas avaliações.
          </p>

          {/* PROGRESS BAR */}
          <div className="card" style={{ padding: '1rem 1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
               <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase' }}>Alunos Lançados</span>
               <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>{filledCount} de {students.length}</span>
            </div>
            <div style={{ width: '100%', height: '6px', backgroundColor: 'hsl(var(--primary) / 0.06)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: systemGradient, borderRadius: '10px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
            </div>
          </div>
        </header>

        {/* CONFIGURAÇÕES */}
        <section style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
             <div className="card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={11}/> Bimestre</div>
                <select 
                  style={{ width: '100%', border: 'none', background: 'none', fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--text))', outline: 'none', appearance: 'none' }}
                  value={bimester} 
                  onChange={e => setBimester(e.target.value)}
                >
                  <option value="1">1º Bimestre</option>
                  <option value="2">2º Bimestre</option>
                  <option value="3">3º Bimestre</option>
                  <option value="4">4º Bimestre</option>
                </select>
             </div>
             <div className="card" style={{ padding: '1rem' }}>
                <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><BookOpen size={11}/> Disciplina</div>
                <select 
                  style={{ width: '100%', border: 'none', background: 'none', fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--text))', outline: 'none', appearance: 'none', textOverflow: 'ellipsis', overflow: 'hidden' }}
                  value={subject} 
                  onChange={e => setSubject(e.target.value)}
                >
                  {subjects.length > 0 ? subjects.map(s => (
                    <option key={s} value={s}>{s.length > 18 ? `${s.substring(0, 18)}...` : s}</option>
                  )) : (
                    <option value="">Nenhuma</option>
                  )}
                </select>
             </div>
           </div>

           <div className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <Search size={18} color="hsl(var(--text-light))" />
             <input 
               placeholder="Pesquisar aluno..." 
               style={{ border: 'none', background: 'none', fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--text))', outline: 'none', width: '100%' }}
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
        </section>

        {/* INDICADOR DE CARREGAMENTO */}
        {loadingGrades && (
          <div style={{ 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
            padding: '1.25rem', marginBottom: '1.5rem',
            backgroundColor: 'hsl(var(--primary) / 0.04)', borderRadius: 'var(--radius-lg)',
            border: '1px solid hsl(var(--primary) / 0.08)'
          }}>
            <RefreshCw size={16} color="hsl(var(--primary))" className="animate-spin" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>
              Carregando notas salvas...
            </span>
          </div>
        )}

        {/* === LISTAGEM DE ALUNOS === */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', gap: '1.5rem',
          opacity: loadingGrades ? 0.4 : 1,
          pointerEvents: loadingGrades ? 'none' : 'auto',
          transition: 'opacity 0.3s ease'
        }}>
          {filteredStudents.map((student) => {
            const sGrades = grades[student.id] || emptyGrade()
            const mediaVal = parseFloat(sGrades.result)
            const needsRetry = !isNaN(mediaVal) && mediaVal <= 6
            const finalVal = parseFloat(sGrades.final)
            
            return (
              <div key={student.id} style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {/* NOME DO ALUNO */}
                <div style={{ 
                  backgroundColor: 'hsl(var(--primary) / 0.06)', 
                  padding: '0.85rem 1.25rem', 
                  borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                  borderBottom: 'none'
                }}>
                   <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.01em' }}>
                     {student.name}
                   </span>
                </div>

                {/* CARD DE NOTAS */}
                <div className="card" style={{ 
                  borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
                  borderTop: 'none',
                  padding: '1.25rem'
                }}>
                  
                  {/* ROW 1: Provas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <GradeInput label="1ª Prova" value={sGrades.p1} onChange={v => handleGradeChange(student.id, 'p1', v)} />
                    <GradeInput label="2ª Prova" value={sGrades.p2} onChange={v => handleGradeChange(student.id, 'p2', v)} />
                  </div>

                  {/* ROW 2: Média + Superação */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    {/* MÉDIA (readonly) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-light))', marginLeft: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Média</label>
                      <input 
                        readOnly
                        style={{ 
                          width: '100%', height: '48px', borderRadius: 'var(--radius-sm)', 
                          border: '2px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', 
                          textAlign: 'center', fontSize: '1.1rem', fontWeight: 900, 
                          color: getGradeColor(sGrades.result),
                          outline: 'none'
                        }}
                        value={sGrades.result}
                        placeholder="—"
                      />
                    </div>

                    {/* SUPERAÇÃO (habilitado só quando média <= 6) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', opacity: needsRetry || sGrades.retry ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 800, color: needsRetry ? 'hsl(var(--warning))' : 'hsl(var(--text-light))', marginLeft: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Superação</label>
                      <input 
                        disabled={!needsRetry && !sGrades.retry}
                        style={{ 
                          width: '100%', height: '48px', borderRadius: 'var(--radius-sm)', 
                          border: `2px solid ${sGrades.retry ? 'hsl(var(--warning) / 0.4)' : 'hsl(var(--border))'}`, 
                          backgroundColor: sGrades.retry ? 'hsl(var(--warning) / 0.04)' : 'hsl(var(--background))', 
                          textAlign: 'center', fontSize: '1.1rem', fontWeight: 900, 
                          color: 'hsl(var(--text))', outline: 'none', transition: 'all 0.2s',
                          cursor: needsRetry ? 'text' : 'not-allowed'
                        }}
                        value={sGrades.retry}
                        onChange={e => handleGradeChange(student.id, 'retry', e.target.value)}
                        placeholder="—"
                        inputMode="decimal"
                      />
                    </div>
                  </div>

                  {/* ROW 3: RESULTADO FINAL */}
                  <div style={{ 
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.85rem 1rem', 
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: sGrades.final ? (finalVal >= 7 ? 'hsl(160 84% 39% / 0.06)' : 'hsl(0 84% 60% / 0.06)') : 'hsl(var(--background))',
                    border: `2px solid ${sGrades.final ? (finalVal >= 7 ? 'hsl(160 84% 39% / 0.15)' : 'hsl(0 84% 60% / 0.15)') : 'hsl(var(--border))'}`,
                    marginBottom: '1rem',
                    transition: 'all 0.3s ease'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text))', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      Resultado Final
                    </span>
                    <span style={{ 
                      fontSize: '1.3rem', fontWeight: 900, 
                      color: getGradeColor(sGrades.final),
                      letterSpacing: '-0.02em'
                    }}>
                      {sGrades.final || '—'}
                    </span>
                  </div>

                  {/* AÇÕES */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button 
                      disabled={savingId === student.id || loadingGrades}
                      onClick={() => handleSaveStudent(student.id)}
                      style={{ 
                        flex: 1, height: '48px', background: systemGradient, color: 'white', 
                        borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', cursor: 'pointer', 
                        opacity: (savingId === student.id || loadingGrades) ? 0.7 : 1, 
                        boxShadow: '0 6px 16px -4px hsl(var(--primary) / 0.3)', 
                        transition: 'all 0.2s',
                        fontSize: '0.8rem', fontWeight: 700, gap: '0.5rem'
                      }}
                    >
                      {savingId === student.id ? <Loader2 className="animate-spin" size={18} /> : <><Rocket size={16} /> Salvar</>}
                    </button>
                    <button 
                      onClick={() => handleDeleteStudent(student.id)}
                      style={{ 
                        width: '48px', height: '48px', 
                        backgroundColor: 'hsl(var(--error) / 0.08)', 
                        color: 'hsl(var(--error))', 
                        borderRadius: 'var(--radius-sm)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center', 
                        cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FLOAT BUTTON — SALVAR TUDO */}
      <div style={{ 
        position: 'fixed', bottom: '1.5rem', left: '50%', 
        transform: 'translateX(-50%)', 
        width: 'calc(100% - 2rem)', maxWidth: '768px', 
        zIndex: 200,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>
        <button 
          disabled={savingId === 'all' || loadingGrades}
          onClick={handleSaveAll} 
          style={{ 
            width: '100%', padding: '1.1rem', 
            borderRadius: 'var(--radius-xl)', 
            background: savedSuccess ? successGradient : systemGradient, 
            color: 'white', 
            boxShadow: savedSuccess ? '0 12px 32px -8px rgba(16, 185, 129, 0.4)' : '0 12px 32px -8px hsl(var(--primary) / 0.4)', 
            fontSize: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', 
            gap: '0.75rem', fontWeight: 800, cursor: 'pointer',
            letterSpacing: '-0.01em', transition: 'all 0.4s ease'
          }}
        >
          {savingId === 'all' ? <Loader2 className="animate-spin" size={22} /> : savedSuccess ? (
            <><CheckCircle2 size={22} /> Salvo com Sucesso!</>
          ) : (
            <>Concluir Lançamento <div style={{ width: '1.5px', height: '18px', backgroundColor: 'rgba(255,255,255,0.25)' }}></div> {filledCount} Alunos</>
          )}
        </button>
      </div>
    </div>
  )
}

/* =================== Sub-Component =================== */
const GradeInput = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--primary))', marginLeft: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</label>
    <input 
      style={{ 
        width: '100%', height: '48px', borderRadius: 'var(--radius-sm)', 
        border: `2px solid ${value ? 'hsl(var(--primary) / 0.25)' : 'hsl(var(--border))'}`, 
        backgroundColor: value ? 'hsl(var(--primary) / 0.03)' : 'hsl(var(--background))', 
        textAlign: 'center', fontSize: '1.1rem', fontWeight: 900, 
        color: 'hsl(var(--text))', outline: 'none', transition: 'all 0.2s'
      }}
      value={value}
      onChange={e => onChange(e.target.value.replace(',', '.'))}
      placeholder="—"
      inputMode="decimal"
    />
  </div>
)
