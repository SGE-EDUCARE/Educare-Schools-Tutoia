import React, { useEffect, useState, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, ChevronDown, Search, Loader2, Calendar, BookOpen, Trash2, Rocket, CheckCircle2, RefreshCw, Save } from 'lucide-react'

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

  // Controle de Dropdown Customizado (Desktop)
  const [openBimester, setOpenBimester] = useState(false)
  const [openSubject, setOpenSubject] = useState(false)

  const lastRequestId = useRef(0)

  const loadGradesExplicit = useCallback(async (currentSubject: string) => {
    const currentStudents = studentsRef.current
    if (!currentSubject || currentStudents.length === 0) return
    
    const requestId = ++lastRequestId.current
    setLoadingGrades(true)
    
    try {
      const normalizedSubject = String(currentSubject).trim()
      const existingGrades = await api(`/teacher/classes/${classId}/grades?bimester=${bimester}&subject=${encodeURIComponent(normalizedSubject)}`)
      
      if (requestId !== lastRequestId.current) return

      const newGradesState: Record<string, GradeFields> = {}
      currentStudents.forEach(s => { newGradesState[s.id] = emptyGrade() })
      
      const labelsMap: any = { 
        '1ª Prova': 'p1', 
        '2ª Prova': 'p2', 
        'Média': 'result', 
        'Superação': 'retry', 
        'Resultado Final': 'final' 
      }
      
      existingGrades.forEach((g: any) => {
        if (newGradesState[g.student_id]) {
          const field = labelsMap[g.label]
          if (field) {
            const val = g.value !== null && g.value !== undefined ? String(g.value) : ''
            newGradesState[g.student_id][field as keyof GradeFields] = val
          }
        }
      })
      
      Object.keys(newGradesState).forEach(id => {
        const s = newGradesState[id]
        if (s.p1 || s.p2) { s.result = calculateMedia(s.p1, s.p2) }
        s.final = computeFinal(s.result, s.retry)
      })
      
      setGrades(newGradesState)
    } catch (error) {
      if (requestId === lastRequestId.current) {
        console.error('Erro ao carregar notas salvas:', error)
        toast.error('Erro ao carregar notas')
      }
    } finally { 
      if (requestId === lastRequestId.current) {
        setLoadingGrades(false) 
      }
    }
  }, [classId, bimester])

  const fetchData = useCallback(async () => {
    try {
      const [studentsData, subjectsData] = await Promise.all([
        api(`/teacher/classes/${classId}/students`),
        api(`/teacher/classes/${classId}/allocations`)
      ])
      const sorted = studentsData.sort((a: any, b: any) => a.name.localeCompare(b.name))
      setStudents(sorted)
      studentsRef.current = sorted
      setSubjects(subjectsData)
      
      const initial: Record<string, GradeFields> = {}
      sorted.forEach((s: any) => { initial[s.id] = emptyGrade() })
      setGrades(initial)

      if (subjectsData.length > 0) {
        const firstSubject = subjectsData[0]
        setSubject(prev => prev || firstSubject)
        loadGradesExplicit(firstSubject)
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error)
      toast.error('Erro ao carregar alunos/disciplinas')
    } finally { 
      setLoading(false) 
    }
  }, [classId, loadGradesExplicit])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    if (studentsRef.current.length > 0 && subject) {
      loadGradesExplicit(subject)
    }
  }, [bimester, subject, loadGradesExplicit])

  const handleSaveStudent = async (studentId: string) => {
    if (!subject) return toast.error('Informe a disciplina')
    setSavingId(studentId)
    try {
      await api('/teacher/grades', {
        method: 'POST',
        body: JSON.stringify({ studentId, classId, bimester, subject: String(subject).trim(), grades: grades[studentId] })
      })
      toast.success('Notas salvas!')
    } catch { toast.error('Erro ao salvar notas') }
    finally { setSavingId(null) }
  }

  const handleSaveAll = async () => {
    if (!subject) return toast.error('Informe a disciplina')
    setSavingId('all')
    try {
      await api('/teacher/grades/bulk', {
        method: 'POST',
        body: JSON.stringify({ classId, bimester, subject: String(subject).trim(), grades })
      })
      setSavedSuccess(true)
      toast.success('Todas as notas salvas!')
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch { toast.error('Erro ao salvar') }
    finally { setSavingId(null) }
  }

  const calculateMedia = (p1: string, p2: string) => {
    if (p1 === '' && p2 === '') return ''
    return (((parseFloat(p1) || 0) + (parseFloat(p2) || 0)) / 2).toFixed(1)
  }

  const computeFinal = (media: string, retry: string): string => {
    if (!media && !retry) return ''
    const retryVal = parseFloat(retry)
    if (!isNaN(retryVal) && retry !== '') return retry
    return media
  }

  const handleGradeChange = (studentId: string, field: 'p1' | 'p2' | 'retry', value: string) => {
    const val = value.replace(',', '.')
    setGrades(prev => {
      const current = prev[studentId] || emptyGrade()
      const n = { ...current, [field]: val }
      if (field === 'p1' || field === 'p2') n.result = calculateMedia(n.p1, n.p2)
      n.final = computeFinal(n.result, n.retry)
      return { ...prev, [studentId]: n }
    })
  }

  const handleClear = (studentId: string) => {
    setGrades(prev => ({ ...prev, [studentId]: emptyGrade() }))
    toast.success('Campos limpos')
  }

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))
  const filledCount = Object.values(grades).filter(v => v.p1 !== '' || v.p2 !== '').length
  const progress = students.length > 0 ? (filledCount / students.length) * 100 : 0
  const getColor = (val: string) => {
    if (!val) return 'hsl(var(--text-light))'
    const n = parseFloat(val)
    return isNaN(n) ? 'hsl(var(--text-light))' : n >= 7 ? '#10B981' : '#EF4444'
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )

  const gradient = 'linear-gradient(135deg, #4318FF 0%, #7000FF 100%)'
  const successGrad = 'linear-gradient(135deg, #10B981 0%, #059669 100%)'

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.25rem 10rem' }}>

        {/* ============ HEADER ============ */}
        <header style={{ padding: '1.5rem 0 1rem' }}>
          <button onClick={() => navigate(-1)} style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            color: 'hsl(var(--primary))', fontSize: '0.8rem', fontWeight: 700,
            marginBottom: '1rem', background: 'hsl(var(--primary) / 0.06)',
            padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-full)', cursor: 'pointer'
          }}>
            <ChevronLeft size={16} /> VOLTAR
          </button>

          <div className="grades-header-row">
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: 'hsl(var(--text))', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '0.3rem' }}>
                Lançar Notas
              </h1>
              <p style={{ fontSize: '0.9rem', fontWeight: 500, color: 'hsl(var(--text-light))' }}>
                Lançamento de avaliações bimestrais
              </p>
            </div>

            {/* Progress pill — desktop inline */}
            <div className="grades-progress-pill card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', minWidth: '280px', borderRadius: '8px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase' }}>Progresso</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--primary))' }}>{filledCount}/{students.length}</span>
                </div>
                <div style={{ width: '100%', height: '5px', backgroundColor: 'hsl(var(--primary) / 0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: gradient, borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ============ CONTROLS ============ */}
        <section className="grades-controls" style={{ marginBottom: '1.5rem' }}>
          
          {/* Bimestre Dropdown */}
          <div className="grades-ctrl-bimestre">
            <div className="desktop-only" style={{ height: '100%', width: '100%' }}>
              <CustomSelect 
                label="Bimestre" 
                icon={<Calendar size={10}/>}
                value={bimester} 
                options={[
                  { label: '1º Bimestre', value: '1' },
                  { label: '2º Bimestre', value: '2' },
                  { label: '3º Bimestre', value: '3' },
                  { label: '4º Bimestre', value: '4' },
                ]}
                isOpen={openBimester}
                setIsOpen={setOpenBimester}
                onChange={setBimester}
              />
            </div>
            <div className="mobile-only card" style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Calendar size={10}/> Bimestre</div>
              <select style={{ border: 'none', background: 'none', fontSize: '0.95rem', fontWeight: 800, color: 'hsl(var(--text))', outline: 'none', width: '100%' }}
                value={bimester} onChange={e => setBimester(e.target.value)}>
                <option value="1">1º Bimestre</option>
                <option value="2">2º Bimestre</option>
                <option value="3">3º Bimestre</option>
                <option value="4">4º Bimestre</option>
              </select>
            </div>
          </div>

          {/* Disciplina Dropdown */}
          <div className="grades-ctrl-disciplina">
            <div className="desktop-only" style={{ height: '100%', width: '100%' }}>
              <CustomSelect 
                label="Disciplina" 
                icon={<BookOpen size={10}/>}
                value={subject} 
                options={subjects.map(s => ({ label: s, value: s }))}
                isOpen={openSubject}
                setIsOpen={setOpenSubject}
                onChange={setSubject}
              />
            </div>
            <div className="mobile-only card" style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><BookOpen size={10}/> Disciplina</div>
              <select style={{ border: 'none', background: 'none', fontSize: '0.95rem', fontWeight: 800, color: 'hsl(var(--text))', outline: 'none', width: '100%' }}
                value={subject} onChange={e => setSubject(e.target.value)}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="card grades-ctrl-search" style={{ padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '8px', width: '100%' }}>
            <Search size={16} color="hsl(var(--text-light))" />
            <input placeholder="Pesquisar..." style={{ border: 'none', background: 'none', fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text))', outline: 'none', width: '100%' }}
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </section>

        {/* Loading indicator */}
        {loadingGrades && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', padding: '1rem', marginBottom: '1rem', backgroundColor: 'hsl(var(--primary) / 0.04)', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--primary) / 0.08)' }}>
            <RefreshCw size={16} color="hsl(var(--primary))" className="animate-spin" />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'hsl(var(--primary))' }}>Carregando notas salvas...</span>
          </div>
        )}

        {/* ============ DESKTOP TABLE VIEW ============ */}
        <div className="grades-desktop-table" style={{ opacity: loadingGrades ? 0.4 : 1, pointerEvents: loadingGrades ? 'none' : 'auto', transition: 'opacity 0.3s' }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem 1.25rem', fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'hsl(var(--background))', borderBottom: '1px solid hsl(var(--border) / 0.5)' }}>Aluno</th>
                  <th style={{ width: '90px', textAlign: 'center', padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'hsl(var(--background))', borderBottom: '1px solid hsl(var(--border) / 0.5)' }}>1ª Prova</th>
                  <th style={{ width: '90px', textAlign: 'center', padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--primary))', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'hsl(var(--background))', borderBottom: '1px solid hsl(var(--border) / 0.5)' }}>2ª Prova</th>
                  <th style={{ width: '80px', textAlign: 'center', padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'hsl(var(--background))', borderBottom: '1px solid hsl(var(--border) / 0.5)' }}>Média</th>
                  <th style={{ width: '90px', textAlign: 'center', padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--warning))', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'hsl(var(--background))', borderBottom: '1px solid hsl(var(--border) / 0.5)' }}>Superação</th>
                  <th style={{ width: '90px', textAlign: 'center', padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text))', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'hsl(var(--background))', borderBottom: '1px solid hsl(var(--border) / 0.5)' }}>Final</th>
                  <th style={{ width: '100px', textAlign: 'center', padding: '1rem 0.5rem', fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'hsl(var(--background))', borderBottom: '1px solid hsl(var(--border) / 0.5)' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const sg = grades[student.id] || emptyGrade()
                  const mediaNum = parseFloat(sg.result)
                  const needsRetry = !isNaN(mediaNum) && mediaNum < 7

                  return (
                    <tr key={student.id} style={{ borderBottom: '1px solid hsl(var(--border) / 0.3)', transition: 'background 0.15s' }}>
                      <td style={{ padding: '0.85rem 1.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'hsl(var(--text))' }}>{student.name}</span>
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <TableInput value={sg.p1} onChange={v => handleGradeChange(student.id, 'p1', v)} />
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <TableInput value={sg.p2} onChange={v => handleGradeChange(student.id, 'p2', v)} />
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 900, color: getColor(sg.result) }}>
                          {sg.result || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        <TableInput
                          value={sg.retry}
                          onChange={v => handleGradeChange(student.id, 'retry', v)}
                          disabled={!needsRetry && !sg.retry}
                          accent={needsRetry}
                        />
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          minWidth: '52px', padding: '0.35rem 0.75rem',
                          borderRadius: 'var(--radius-xs)',
                          backgroundColor: sg.final ? (parseFloat(sg.final) >= 7 ? 'hsl(160 84% 39% / 0.08)' : 'hsl(0 84% 60% / 0.08)') : 'transparent',
                          fontSize: '1.05rem', fontWeight: 900,
                          color: getColor(sg.final)
                        }}>
                          {sg.final || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '0.5rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                          <button
                            disabled={savingId === student.id}
                            onClick={() => handleSaveStudent(student.id)}
                            title="Salvar"
                            style={{
                              width: '36px', height: '36px', borderRadius: 'var(--radius-xs)',
                              background: gradient, color: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', opacity: savingId === student.id ? 0.6 : 1,
                              boxShadow: '0 4px 10px -3px hsl(var(--primary) / 0.3)', transition: 'all 0.2s'
                            }}>
                            {savingId === student.id ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                          </button>
                          <button onClick={() => handleClear(student.id)} title="Limpar"
                            style={{
                              width: '36px', height: '36px', borderRadius: 'var(--radius-xs)',
                              backgroundColor: 'hsl(var(--error) / 0.06)', color: 'hsl(var(--error))',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.2s'
                            }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ============ MOBILE CARD VIEW ============ */}
        <div className="grades-mobile-cards" style={{
          flexDirection: 'column', gap: '1.5rem',
          opacity: loadingGrades ? 0.4 : 1, pointerEvents: loadingGrades ? 'none' : 'auto', transition: 'opacity 0.3s'
        }}>
          {filteredStudents.map((student) => {
            const sg = grades[student.id] || emptyGrade()
            const mediaNum = parseFloat(student.id ? grades[student.id]?.result : '0') || parseFloat(sg.result)
            const needsRetry = !isNaN(mediaNum) && mediaNum < 7
            const finalVal = parseFloat(sg.final)

            return (
              <div key={student.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', border: '1px solid hsl(var(--border) / 0.5)' }}>
                {/* Cabeçalho do Nome */}
                <div style={{
                  padding: '1rem 1.25rem', 
                  backgroundColor: 'hsl(var(--primary) / 0.05)',
                  borderBottom: '1px solid hsl(var(--border) / 0.4)'
                }}>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'hsl(var(--text))' }}>{student.name}</span>
                </div>

                {/* Conteúdo da Nota */}
                <div style={{ padding: '1.25rem' }}>
                  {/* Provas */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <MobileInput label="1ª Prova" value={sg.p1} onChange={v => handleGradeChange(student.id, 'p1', v)} />
                    <MobileInput label="2ª Prova" value={sg.p2} onChange={v => handleGradeChange(student.id, 'p2', v)} />
                  </div>

                  {/* Média + Superação */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--text-light))', marginLeft: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Média</label>
                      <input readOnly style={{
                        width: '100%', height: '48px', borderRadius: 'var(--radius-sm)',
                        border: '2px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))',
                        textAlign: 'center', fontSize: '1.1rem', fontWeight: 900,
                        color: getColor(sg.result), outline: 'none'
                      }} value={sg.result} placeholder="—" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', opacity: needsRetry || sg.retry ? 1 : 0.4, transition: 'opacity 0.3s' }}>
                      <label style={{ fontSize: '0.65rem', fontWeight: 800, color: needsRetry ? 'hsl(var(--warning))' : 'hsl(var(--text-light))', marginLeft: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Superação</label>
                      <input disabled={!needsRetry && !sg.retry}
                        style={{
                          width: '100%', height: '48px', borderRadius: 'var(--radius-sm)',
                          border: `2px solid ${sg.retry ? 'hsl(var(--warning) / 0.4)' : 'hsl(var(--border))'}`,
                          backgroundColor: sg.retry ? 'hsl(var(--warning) / 0.04)' : 'hsl(var(--background))',
                          textAlign: 'center', fontSize: '1.1rem', fontWeight: 900,
                          color: 'hsl(var(--text))', outline: 'none', transition: 'all 0.2s',
                          cursor: needsRetry ? 'text' : 'not-allowed'
                        }}
                        value={sg.retry} onChange={e => handleGradeChange(student.id, 'retry', e.target.value)}
                        placeholder="—" inputMode="decimal" />
                    </div>
                  </div>

                  {/* Resultado Final */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)',
                    backgroundColor: sg.final ? (finalVal >= 7 ? 'hsl(160 84% 39% / 0.06)' : 'hsl(0 84% 60% / 0.06)') : 'hsl(var(--background))',
                    border: `2px solid ${sg.final ? (finalVal >= 7 ? 'hsl(160 84% 39% / 0.15)' : 'hsl(0 84% 60% / 0.15)') : 'hsl(var(--border))'}`,
                    marginBottom: '1rem', transition: 'all 0.3s'
                  }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--text))', textTransform: 'uppercase', letterSpacing: '0.03em' }}>Resultado Final</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: getColor(sg.final) }}>{sg.final || '—'}</span>
                  </div>

                  {/* Ações */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button disabled={savingId === student.id || loadingGrades} onClick={() => handleSaveStudent(student.id)}
                      style={{
                        flex: 1, height: '48px', background: gradient, color: 'white',
                        borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', opacity: savingId === student.id ? 0.7 : 1,
                        boxShadow: '0 6px 16px -4px hsl(var(--primary) / 0.3)', transition: 'all 0.2s',
                        fontSize: '0.8rem', fontWeight: 700, gap: '0.5rem'
                      }}>
                      {savingId === student.id ? <Loader2 className="animate-spin" size={18} /> : <><Rocket size={16} /> Salvar</>}
                    </button>
                    <button onClick={() => handleClear(student.id)}
                      style={{
                        width: '48px', height: '48px', backgroundColor: 'hsl(var(--error) / 0.08)',
                        color: 'hsl(var(--error))', borderRadius: 'var(--radius-sm)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                      }}>
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ============ FAB SALVAR TUDO ============ */}
      <div style={{
        position: 'fixed', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        width: 'calc(100% - 2rem)', maxWidth: '500px', zIndex: 200,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}>
        <button disabled={savingId === 'all' || loadingGrades} onClick={handleSaveAll}
          style={{
            width: '100%', padding: '1rem', borderRadius: 'var(--radius-xl)',
            background: savedSuccess ? successGrad : gradient, color: 'white',
            boxShadow: savedSuccess ? '0 12px 28px -6px rgba(16, 185, 129, 0.4)' : '0 12px 28px -6px hsl(var(--primary) / 0.4)',
            fontSize: '0.95rem', display: 'flex', justifyContent: 'center', alignItems: 'center',
            gap: '0.75rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.4s'
          }}>
          {savingId === 'all' ? <Loader2 className="animate-spin" size={20} /> : savedSuccess ? (
            <><CheckCircle2 size={20} /> Salvo com Sucesso!</>
          ) : (
            <>Concluir Lançamento <span style={{ width: '1.5px', height: '16px', backgroundColor: 'rgba(255,255,255,0.25)' }}></span> {filledCount} Alunos</>
          )}
        </button>
      </div>

      {/* ============ RESPONSIVE STYLES ============ */}
      <style>{`
        .grades-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
        }
        .grades-controls {
          display: flex;
          gap: 0.75rem;
          align-items: stretch;
        }
        .grades-ctrl-bimestre { flex: 1 1 200px; display: flex; }
        .grades-ctrl-disciplina { flex: 3 1 400px; display: flex; }
        .grades-ctrl-search { flex: 1.5 1 250px; display: flex; }

        /* Modern select dropdown styling */
        .grades-select-popover {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          width: 100%;
          background: white;
          border-radius: 8px;
          border: 1px solid hsl(var(--border) / 0.5);
          box-shadow: 0 10px 25px -10px rgba(0,0,0,0.15);
          z-index: 1000;
          overflow: hidden;
          animation: slideIn 0.2s ease;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .grades-select-option {
          padding: 0.75rem 1rem;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 0.85rem;
          color: #1B2559;
          cursor: pointer;
          transition: all 0.1s;
        }
        .grades-select-option:hover {
          background-color: hsl(var(--primary) / 0.04);
          color: hsl(var(--primary));
        }
        .grades-select-option.active {
          background-color: hsl(var(--primary) / 0.08);
          color: hsl(var(--primary));
        }

        /* Desktop: show table, hide cards */
        .grades-desktop-table { display: block; }
        .grades-mobile-cards { display: none !important; }

        .grades-desktop-table table tr:hover td {
          background-color: hsl(var(--primary) / 0.02);
        }

        @media (max-width: 1024px) {
          .grades-header-row {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }
          .grades-progress-pill {
            min-width: unset !important;
            border-radius: var(--radius-lg) !important;
          }
          .grades-controls {
            flex-direction: column;
          }
          .grades-ctrl-bimestre,
          .grades-ctrl-disciplina,
          .grades-ctrl-search {
            flex: unset;
            min-width: unset;
            border-radius: var(--radius-lg) !important;
          }

          /* Mobile: hide table, show cards */
          .grades-desktop-table { display: none !important; }
          .grades-mobile-cards { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

/* =================== Sub-Components =================== */

const CustomSelect = ({ label, icon, value, options, isOpen, setIsOpen, onChange }: any) => {
  const selectedLabel = options.find((o: any) => o.value === value)?.label || 'Selecione...'
  
  return (
    <div className="card" style={{ 
      padding: '0.85rem 1rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '0.3rem', 
      borderRadius: '8px',
      position: 'relative',
      cursor: 'pointer',
      height: '100%',
      width: '100%',
      justifyContent: 'center'
    }} onClick={() => setIsOpen(!isOpen)}>
      <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {icon} {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'hsl(var(--text))', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedLabel}
        </span>
        <ChevronDown size={14} color="hsl(var(--text-light))" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
      </div>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 999 }} onClick={(e) => { e.stopPropagation(); setIsOpen(false) }} />
          <div className="grades-select-popover">
            {options.map((opt: any) => (
              <div 
                key={opt.value} 
                className={`grades-select-option ${value === opt.value ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  onChange(opt.value)
                  setIsOpen(false)
                }}
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

const TableInput = ({ value, onChange, disabled, accent }: {
  value: string; onChange: (v: string) => void; disabled?: boolean; accent?: boolean
}) => (
  <input
    disabled={disabled}
    inputMode="decimal"
    value={value}
    onChange={e => onChange(e.target.value.replace(',', '.'))}
    placeholder="—"
    style={{
      width: '100%', height: '38px', borderRadius: 'var(--radius-xs)',
      border: `1.5px solid ${value ? (accent ? 'hsl(var(--warning) / 0.4)' : 'hsl(var(--primary) / 0.2)') : 'hsl(var(--border))'}`,
      backgroundColor: value ? (accent ? 'hsl(var(--warning) / 0.04)' : 'hsl(var(--primary) / 0.02)') : 'transparent',
      textAlign: 'center', fontSize: '0.95rem', fontWeight: 800,
      color: 'hsl(var(--text))', outline: 'none', transition: 'all 0.15s',
      opacity: disabled ? 0.35 : 1,
      cursor: disabled ? 'not-allowed' : 'text'
    }}
  />
)

const MobileInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
    <label style={{ fontSize: '0.65rem', fontWeight: 800, color: 'hsl(var(--primary))', marginLeft: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{label}</label>
    <input
      inputMode="decimal"
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
    />
  </div>
)
