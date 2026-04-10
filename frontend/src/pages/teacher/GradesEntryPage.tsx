import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Save, Search, Loader2, Award, Calendar, BookOpen } from 'lucide-react'

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
      // Sort alphabetically
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
          classId, // Added classId which was missing
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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '120px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER SIMPLES */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border) / 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', backgroundColor: 'hsl(var(--text) / 0.05)', borderRadius: '50%', color: 'hsl(var(--text))', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={24} />
          </button>
          <div>
             <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em', margin: 0 }}>Lançar Notas</h1>
          </div>
        </div>
      </header>

      {/* CONFIGURAÇÕES DA AVALIAÇÃO */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', backgroundColor: 'hsl(var(--surface))', borderRadius: 'var(--radius-xl)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
           <div>
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-light))', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
               <Calendar size={14} /> Bimestre
             </label>
             <select 
               style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--text))', fontWeight: 600, outline: 'none' }}
               value={bimester} 
               onChange={e => setBimester(e.target.value)}
             >
               <option value="1">1º Bimestre</option>
               <option value="2">2º Bimestre</option>
               <option value="3">3º Bimestre</option>
               <option value="4">4º Bimestre</option>
             </select>
           </div>
           <div>
             <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-light))', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
               <Award size={14} /> Avaliação
             </label>
             <select 
               style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--text))', fontWeight: 600, outline: 'none' }}
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
        <div>
           <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', fontWeight: 700, color: 'hsl(var(--text-light))', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
             <BookOpen size={14} /> Disciplina
           </label>
           <input 
             style={{ width: '100%', padding: '0.65rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border))', backgroundColor: 'hsl(var(--background))', color: 'hsl(var(--text))', fontWeight: 600, outline: 'none' }}
             placeholder="Ex: Português" 
             value={subject}
             onChange={e => setSubject(e.target.value)}
           />
        </div>
      </div>

      {/* FERRAMENTA DE BUSCA */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'hsl(var(--surface))', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)', border: '1px solid hsl(var(--border) / 0.5)', boxShadow: 'var(--shadow-sm)' }}>
        <Search size={18} color="hsl(var(--text-light))" />
        <input 
          placeholder="Buscar aluno na lista..." 
          style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '1rem', color: 'hsl(var(--text))' }}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LISTAGEM DE ALUNOS (FLAT LIST COMPACTA) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredStudents.map((student, index) => (
          <div 
            key={student.id} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '0.75rem 1rem',
              backgroundColor: 'hsl(var(--surface))',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid hsl(var(--border) / 0.4)',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
               <div style={{ 
                 width: '32px', 
                 height: '32px', 
                 borderRadius: '50%', 
                 backgroundColor: 'hsl(var(--primary) / 0.05)',
                 color: 'hsl(var(--primary))',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'center',
                 fontWeight: 800,
                 fontSize: '0.8rem',
                 flexShrink: 0
               }}>
                 {index + 1}
               </div>
               <span style={{ fontWeight: 600, color: 'hsl(var(--text))', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                 {student.name}
               </span>
            </div>
            
            <div style={{ flexShrink: 0 }}>
              <input 
                style={{ 
                  width: '65px', 
                  padding: '0.5rem 0',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--background))',
                  color: 'hsl(var(--text))',
                  fontWeight: 800,
                  fontSize: '1.1rem',
                  textAlign: 'center',
                  outline: 'none'
                }}
                placeholder="0.0"
                type="text"
                inputMode="decimal"
                value={grades[student.id] || ''}
                onChange={e => {
                  const val = e.target.value.replace(',', '.')
                  setGrades(prev => ({ ...prev, [student.id]: val }))
                }}
              />
            </div>
          </div>
        ))}
        {filteredStudents.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-light))', backgroundColor: 'hsl(var(--surface))', borderRadius: 'var(--radius-md)' }}>
            Nenhum aluno encontrado.
          </div>
        )}
      </div>

      {/* FLOAT BOTTOM BAR */}
      <div style={{ 
        position: 'fixed', 
        bottom: '1.5rem', 
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 3rem)',
        maxWidth: '760px',
        zIndex: 50
      }}>
        <button 
          disabled={saving}
          onClick={handleSave} 
          className="btn btn-primary" 
          style={{ 
            width: '100%', 
            padding: '1.1rem', 
            borderRadius: 'var(--radius-full)', 
            boxShadow: '0 10px 25px -5px hsl(var(--primary) / 0.5)',
            fontSize: '1.1rem',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.75rem',
            fontWeight: 800
          }}
        >
          {saving ? <Loader2 className="animate-spin" size={24} /> : (
            <><Save size={22} /> Salvar Notas Lançadas</>
          )}
        </button>
      </div>
    </div>
  )
}
