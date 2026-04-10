import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Search, Loader2, Award, Calendar, BookOpen, Check } from 'lucide-react'

export const GradesEntryPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [students, setStudents] = useState<any[]>([])
  const [grades, setGrades] = useState<Record<string, string>>({})
  const [bimester, setBimester] = useState('1')
  const [label, setLabel] = useState('1ª Prova')
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
      
      const initial: Record<string, string> = {}
      sorted.forEach((s: any) => {
        initial[s.id] = ''
      })
      setGrades(initial)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!subject) {
      toast.error('Informe a disciplina')
      return
    }
    setSaving(true)
    try {
      await api('/teacher/grades', {
        method: 'POST',
        body: JSON.stringify({
          classId,
          bimester,
          subject,
          label,
          grades
        })
      })
      toast.success('Notas lançadas com sucesso!')
      navigate('/teacher/dashboard')
    } catch (error: any) {
      toast.error('Erro ao salvar notas')
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filledCount = Object.values(grades).filter(v => v !== '').length
  const progress = students.length > 0 ? (filledCount / students.length) * 100 : 0

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )

  return (
    <div style={{ margin: '0 auto', width: '100%', minHeight: '100vh', backgroundColor: '#F8FAFC', position: 'relative' }}>
      
      {/* WRAPPER PARA ALINHAMENTO FIXO (MESMO DA CHAMADA) */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1.25rem 12rem 1.25rem' }}>
        
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
            Insira as avaliações da sua turma.
          </p>

          {/* PROGRESS BAR DINÂMICA (NOTAS PREENCHIDAS) */}
          <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
               <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'hsl(var(--text))', opacity: 0.6 }}>PREENCHIMENTO</span>
               <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>{filledCount} DE {students.length} NOTAS</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'hsl(var(--primary) / 0.05)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'hsl(var(--primary))', borderRadius: '10px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
            </div>
          </div>
        </header>

        {/* CONFIGURAÇÕES DA AVALIAÇÃO - CARDS PREMIUM */}
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
                <div style={{ fontSize: '0.7rem', fontWeight: 900, color: 'hsl(var(--text-light))', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Award size={12}/> Avaliação</div>
                <select 
                  style={{ width: '100%', border: 'none', background: 'none', fontSize: '1.1rem', fontWeight: 800, color: 'hsl(var(--text))', outline: 'none' }}
                  value={label} 
                  onChange={e => setLabel(e.target.value)}
                >
                  <option value="1ª Prova">1ª Prova</option>
                  <option value="2ª Prova">2ª Prova</option>
                  <option value="Recuperação">Recuperação</option>
                  <option value="Atividade">Atividade</option>
                </select>
             </div>
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

        {/* LISTAGEM DE ALUNOS NATIVE 2.0 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredStudents.map((student, index) => {
            const hasGrade = grades[student.id] !== ''
            
            return (
              <div 
                key={student.id} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '1.25rem',
                  backgroundColor: 'white',
                  borderRadius: '32px',
                  boxShadow: hasGrade ? '0 10px 25px -5px hsl(var(--primary) / 0.1)' : '0 10px 20px -5px rgba(0,0,0,0.03)',
                  transform: hasGrade ? 'scale(1.01)' : 'scale(1)',
                  transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  border: '1px solid rgba(0,0,0,0.01)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, minWidth: 0 }}>
                   <div style={{ 
                     width: '42px', 
                     height: '42px', 
                     borderRadius: '50%', 
                     backgroundColor: hasGrade ? 'hsl(var(--primary))' : 'hsl(var(--text) / 0.05)',
                     color: hasGrade ? 'white' : 'hsl(var(--text-light))',
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     fontWeight: 900,
                     fontSize: '1rem',
                     flexShrink: 0,
                     transition: 'all 0.3s'
                   }}>
                     {hasGrade ? <Check size={20} /> : index + 1}
                   </div>
                   <span style={{ 
                     fontWeight: 700, 
                     color: 'hsl(var(--text))', 
                     fontSize: '1rem', 
                     letterSpacing: '-0.01em', 
                     lineHeight: '1.2',
                     overflow: 'visible'
                   }}>
                     {student.name}
                   </span>
                </div>
                
                <div style={{ flexShrink: 0, marginLeft: '1rem' }}>
                  <input 
                    style={{ 
                      width: '70px', 
                      height: '50px',
                      borderRadius: '18px',
                      border: '2px solid #F1F5F9',
                      backgroundColor: '#F1F5F9',
                      color: 'hsl(var(--text))',
                      fontWeight: 900,
                      fontSize: '1.3rem',
                      textAlign: 'center',
                      outline: 'none',
                      transition: 'all 0.2s'
                    }}
                    placeholder="—"
                    type="text"
                    inputMode="decimal"
                    value={grades[student.id] || ''}
                    onFocus={(e) => {
                      e.target.style.borderColor = 'hsl(var(--primary))'
                      e.target.style.backgroundColor = 'white'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#F1F5F9'
                      e.target.style.backgroundColor = '#F1F5F9'
                    }}
                    onChange={e => {
                      const val = e.target.value.replace(',', '.')
                      setGrades(prev => ({ ...prev, [student.id]: val }))
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FLOAT ACTION BUTTON PREMIUM */}
      <div style={{ 
        position: 'fixed', 
        bottom: '2rem', 
        left: '50%', 
        transform: 'translateX(-50%)', 
        width: 'calc(100% - 2.5rem)', 
        maxWidth: '768px', 
        zIndex: 200,
        boxSizing: 'border-box'
      }}>
        <button 
          disabled={saving}
          onClick={handleSave} 
          style={{ 
            width: '100%', 
            padding: '1.4rem', 
            borderRadius: '28px', 
            backgroundColor: 'hsl(var(--primary))', 
            color: 'white', 
            boxShadow: '0 20px 40px -10px hsl(var(--primary) / 0.4)', 
            fontSize: '1.2rem', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '1rem', 
            fontWeight: 900, 
            border: 'none', 
            cursor: 'pointer',
            letterSpacing: '-0.02em',
            transition: 'all 0.3s ease'
          }}
        >
          {saving ? <Loader2 className="animate-spin" size={24} /> : (
            <>
              SALVAR LANÇAMENTO <div style={{ width: '2px', height: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div> {filledCount} NOTAS
            </>
          )}
        </button>
      </div>
    </div>
  )
}
