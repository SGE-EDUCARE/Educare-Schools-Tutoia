import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Search, Loader2, Award, Calendar, BookOpen, Check, Trash2, Rocket } from 'lucide-react'

export const GradesEntryPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [students, setStudents] = useState<any[]>([])
  const [grades, setGrades] = useState<Record<string, { p1: string, p2: string, result: string, retry: string }>>({})
  const [bimester, setBimester] = useState('1')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [classId])

  const fetchData = async () => {
    try {
      const studentsData = await api(`/teacher/classes/${classId}/students`)
      const sorted = studentsData.sort((a: any, b: any) => a.name.localeCompare(b.name))
      setStudents(sorted)
      
      const initial: Record<string, { p1: string, p2: string, result: string, retry: string }> = {}
      sorted.forEach((s: any) => {
        initial[s.id] = { p1: '', p2: '', result: '', retry: '' }
      })
      setGrades(initial)
    } finally {
      setLoading(false)
    }
  }

  const updateGrade = (studentId: string, field: 'p1' | 'p2' | 'result' | 'retry', value: string) => {
    const val = value.replace(',', '.')
    setGrades(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: val }
    }))
  }

  const handleSaveStudent = async (studentId: string) => {
    if (!subject) {
      toast.error('Informe a disciplina')
      return
    }
    setSaving(true)
    try {
      await api('/teacher/grades/bulk-student', {
        method: 'POST',
        body: JSON.stringify({
          studentId,
          classId,
          bimester,
          subject,
          grades: grades[studentId]
        })
      })
      toast.success('Notas do aluno salvas!')
    } catch (error: any) {
      toast.error('Erro ao salvar notas')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStudent = (studentId: string) => {
    setGrades(prev => ({
      ...prev,
      [studentId]: { p1: '', p2: '', result: '', retry: '' }
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

  return (
    <div style={{ margin: '0 auto', width: '100%', minHeight: '100vh', backgroundColor: '#F8FAFC', position: 'relative' }}>
      
      {/* WRAPPER PARA ALINHAMENTO FIXO */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.25rem 6rem 1.25rem' }}>
        
        {/* HEADER ULTRA PREMIUM */}
        <header style={{ padding: '2rem 0 1rem 0' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.4rem', 
              color: 'hsl(var(--primary))', 
              fontSize: '0.85rem', 
              fontWeight: 800,
              marginBottom: '1.5rem',
              border: 'none',
              background: 'hsl(var(--primary) / 0.08)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer'
            }}
          >
            <ChevronLeft size={16} /> VOLTAR AO PAINEL
          </button>
          <h1 style={{ fontSize: '2.8rem', fontWeight: 900, color: 'hsl(var(--text))', letterSpacing: '-0.05em', lineHeight: 1, marginBottom: '0.5rem' }}>
            Lançar Notas
          </h1>
          <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'hsl(var(--text-light))', letterSpacing: '-0.02em', marginBottom: '2rem' }}>
            Lançamento de múltiplas avaliações.
          </p>

          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
               <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'hsl(var(--text))', opacity: 0.6 }}>ALUNOS LANÇADOS</span>
               <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>{filledCount} DE {students.length} COMPLETOS</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'hsl(var(--primary) / 0.05)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'hsl(var(--primary))', borderRadius: '10px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
            </div>
          </div>
        </header>

        {/* CONFIGURAÇÕES GLOBAIS */}
        <section style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
             <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-light))', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={12}/> Bimestre</div>
                <select 
                  style={{ width: '100%', border: 'none', background: 'none', fontSize: '1.1rem', fontWeight: 800, color: 'hsl(var(--text))', outline: 'none' }}
                  value={bimester} 
                  onChange={e => setBimester(e.target.value)}
                >
                  <option value="1">1º Bimestre</option>
                  <option value="2">2º Bimestre</option>
                  <option value="3">3º Bimestre</option>
                  <option value="4">4º Bimestre</option>
                </select>
             </div>
             <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-light))', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><BookOpen size={12}/> Disciplina</div>
                <input 
                  placeholder="Ex: Português" 
                  style={{ width: '100%', border: 'none', background: 'none', fontSize: '1.1rem', fontWeight: 800, color: 'hsl(var(--text))', outline: 'none' }}
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                />
             </div>
           </div>

           <div style={{ backgroundColor: 'white', padding: '1rem 1.5rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <Search size={20} color="hsl(var(--text-light))" />
             <input 
               placeholder="Pesquisar aluno..." 
               style={{ border: 'none', background: 'none', fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--text))', outline: 'none', width: '100%' }}
               value={searchTerm}
               onChange={e => setSearchTerm(e.target.value)}
             />
           </div>
        </section>

        {/* LISTAGEM MASTER-DETAIL */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {filteredStudents.map((student) => {
            const sGrades = grades[student.id] || { p1: '', p2: '', result: '', retry: '' }
            
            return (
              <div key={student.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* NOME DO ALUNO BOX */}
                <div style={{ backgroundColor: '#EEF2FF', padding: '1rem 1.5rem', borderRadius: '18px', border: '1px solid hsl(var(--primary) / 0.1)' }}>
                   <span style={{ fontSize: '1.1rem', fontWeight: 850, color: 'hsl(var(--text))', letterSpacing: '-0.02em' }}>
                     {student.name}
                   </span>
                </div>

                {/* CARD DE NOTAS COMPACTO */}
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '32px', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.02)' }}>
                  
                  {/* GRID DE NOTAS 1 e 2 */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                       <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--primary))', marginLeft: '0.5rem' }}>1ª Prova</label>
                       <input 
                         style={{ width: '100%', height: '54px', borderRadius: '16px', border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900, color: 'hsl(var(--text))', outline: 'none' }}
                         value={sGrades.p1}
                         onChange={e => updateGrade(student.id, 'p1', e.target.value)}
                         placeholder="—"
                       />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                       <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--primary))', marginLeft: '0.5rem' }}>2ª Prova</label>
                       <input 
                         style={{ width: '100%', height: '54px', borderRadius: '16px', border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900, color: 'hsl(var(--text))', outline: 'none' }}
                         value={sGrades.p2}
                         onChange={e => updateGrade(student.id, 'p2', e.target.value)}
                         placeholder="—"
                       />
                    </div>
                  </div>

                  {/* GRID DE MÉDIA E SUPERAÇÃO */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                       <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--primary))', marginLeft: '0.5rem' }}>Média</label>
                       <input 
                         style={{ width: '100%', height: '54px', borderRadius: '16px', border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900, color: 'hsl(var(--text))', outline: 'none' }}
                         value={sGrades.result}
                         onChange={e => updateGrade(student.id, 'result', e.target.value)}
                         placeholder="—"
                       />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                       <label style={{ fontSize: '0.75rem', fontWeight: 800, color: 'hsl(var(--primary))', marginLeft: '0.5rem' }}>Superação</label>
                       <input 
                         style={{ width: '100%', height: '54px', borderRadius: '16px', border: '2px solid #F1F5F9', backgroundColor: '#F8FAFC', textAlign: 'center', fontSize: '1.2rem', fontWeight: 900, color: 'hsl(var(--text))', outline: 'none' }}
                         value={sGrades.retry}
                         onChange={e => updateGrade(student.id, 'retry', e.target.value)}
                         placeholder="—"
                       />
                    </div>
                  </div>

                  {/* AÇÕES DO CARD */}
                  <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #F1F5F9', paddingTop: '1.5rem' }}>
                    <button 
                      onClick={() => handleSaveStudent(student.id)}
                      style={{ flex: 1, height: '52px', backgroundColor: '#22C55E', color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                    >
                      <Rocket size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteStudent(student.id)}
                      style={{ width: '80px', height: '52px', backgroundColor: '#EF4444', color: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: 'none' }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>

                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
