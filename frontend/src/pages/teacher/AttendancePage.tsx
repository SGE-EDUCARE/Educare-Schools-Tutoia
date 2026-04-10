import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Search, Loader2, CheckCircle2, XCircle, Save } from 'lucide-react'

export const AttendancePage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [students, setStudents] = useState<any[]>([])
  const [attendances, setAttendances] = useState<Record<string, boolean>>({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [classId])

  const fetchData = async () => {
    try {
      const studentsData = await api(`/teacher/classes/${classId}/students`)
      setStudents(studentsData)
      
      // As user requested, default to all present
      const initial: Record<string, boolean> = {}
      studentsData.forEach((s: any) => {
        initial[s.id] = true
      })
      setAttendances(initial)
    } finally {
      setLoading(false)
    }
  }

  const setStatus = (id: string, status: boolean) => {
    setAttendances(prev => ({ ...prev, [id]: status }))
  }

  const markAll = (status: boolean) => {
    const updated: Record<string, boolean> = {}
    students.forEach((s) => {
      updated[s.id] = status
    })
    setAttendances(updated)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api('/teacher/attendance', {
        method: 'POST',
        body: JSON.stringify({
          classId,
          date,
          attendances
        })
      })
      toast.success('Frequência salva com sucesso!')
      navigate('/teacher/dashboard')
    } catch (error: any) {
      toast.error('Erro ao salvar frequência')
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const presentCount = Object.values(attendances).filter(v => v).length
  const absentCount = students.length - presentCount

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '6rem' }}>
      <header className="flex flex-mobile-col items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem', backgroundColor: 'hsl(var(--surface))', borderRadius: '50%' }}>
            <ChevronLeft size={24} color="hsl(var(--text))" />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em' }}>Chamada Diária</h1>
            <p style={{ color: 'hsl(var(--text-light))', fontWeight: 500 }}>Selecione a data e gerencie a presença.</p>
          </div>
        </div>
      </header>

      {/* Toolbar / Painel de Controle Superior */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', backgroundColor: 'hsl(var(--surface))' }}>
        
        <div className="flex flex-mobile-col gap-4">
          <div className="flex items-center gap-3 w-full" style={{ backgroundColor: 'hsl(var(--background))', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border) / 0.5)' }}>
            <Search size={20} color="hsl(var(--text-light))" />
            <input 
              className="input" 
              placeholder="Pesquisar aluno..." 
              style={{ border: 'none', boxShadow: 'none', padding: '0.5rem 0', width: '100%', backgroundColor: 'transparent' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 w-full" style={{ backgroundColor: 'hsl(var(--background))', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid hsl(var(--border) / 0.5)' }}>
             <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--text-light))', whiteSpace: 'nowrap' }}>Data:</span>
             <input 
               type="date" 
               className="input" 
               style={{ border: 'none', padding: '0.5rem 0', width: '100%', backgroundColor: 'transparent', boxShadow: 'none', outline: 'none' }}
               value={date}
               onChange={e => setDate(e.target.value)}
             />
          </div>
        </div>

        <div className="flex flex-mobile-col justify-between items-center gap-4 pt-4" style={{ borderTop: '1px dashed hsl(var(--border))' }}>
           <div className="flex gap-4 w-full">
             <button 
                onClick={() => markAll(true)}
                className="btn btn-secondary flex-1" 
                style={{ display: 'flex', gap: '0.5rem', color: 'hsl(var(--success))', borderColor: 'hsl(var(--success) / 0.3)', backgroundColor: 'hsl(var(--success) / 0.05)' }}
             >
               <CheckCircle2 size={18} /> Marcar Todos
             </button>
             <button 
                onClick={() => markAll(false)}
                className="btn btn-secondary flex-1" 
                style={{ display: 'flex', gap: '0.5rem', color: 'hsl(var(--error))', borderColor: 'hsl(var(--error) / 0.3)', backgroundColor: 'hsl(var(--error) / 0.05)' }}
             >
               <XCircle size={18} /> Limpar Todos
             </button>
           </div>
           
           <div className="flex items-center gap-6 desktop-only">
             <div className="text-center">
               <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--success))' }}>{presentCount}</span>
               <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-light))', display: 'block', textTransform: 'uppercase' }}>Presentes</span>
             </div>
             <div className="text-center">
               <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--error))' }}>{absentCount}</span>
               <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'hsl(var(--text-light))', display: 'block', textTransform: 'uppercase' }}>Faltas</span>
             </div>
           </div>
        </div>
      </div>

      {/* Grid de Alunos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {filteredStudents.map(student => {
          const isPresent = attendances[student.id] === true
          const isAbsent = attendances[student.id] === false

          return (
            <div 
              key={student.id} 
              className="card" 
              style={{ 
                padding: '1.25rem 1.5rem',
                borderLeft: isPresent ? '4px solid hsl(var(--success))' : isAbsent ? '4px solid hsl(var(--error))' : '4px solid transparent',
                backgroundColor: 'hsl(var(--surface))',
                transition: 'var(--transition-all)'
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <span style={{ fontWeight: 700, color: 'hsl(var(--text))', fontSize: '1rem', lineHeight: '1.4' }}>
                  {student.name}
                </span>
                
                <div className="flex gap-2" style={{ flexShrink: 0 }}>
                  <button 
                    onClick={() => setStatus(student.id, true)}
                    style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '10px',
                      backgroundColor: isPresent ? 'hsl(var(--success))' : 'hsl(var(--text) / 0.05)',
                      color: isPresent ? 'white' : 'hsl(var(--text-light))',
                      fontWeight: 800,
                      border: 'none',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    P
                  </button>
                  <button 
                    onClick={() => setStatus(student.id, false)}
                    style={{ 
                      width: '44px', 
                      height: '44px', 
                      borderRadius: '10px',
                      backgroundColor: isAbsent ? 'hsl(var(--error))' : 'hsl(var(--text) / 0.05)',
                      color: isAbsent ? 'white' : 'hsl(var(--text-light))',
                      fontWeight: 800,
                      border: 'none',
                      transition: 'all 0.2s',
                      cursor: 'pointer'
                    }}
                  >
                    F
                  </button>
                </div>
              </div>
            </div>
          )
        })}
        {filteredStudents.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '4rem', textAlign: 'center', color: 'hsl(var(--text-light))' }}>
            Nenhum aluno encontrado.
          </div>
        )}
      </div>

      {/* Sticky Bottom Bar Flutuante Unificada */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        backgroundColor: 'hsl(var(--surface))',
        padding: '1rem 2rem',
        borderTop: '1px solid hsl(var(--border) / 0.5)',
        boxShadow: '0 -10px 40px -10px rgba(0,0,0,0.1)',
        zIndex: 50,
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          <div className="flex items-center gap-6">
             <div className="text-center mobile-only">
               <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--success))' }}>{presentCount}</span>
               <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-light))', display: 'block', textTransform: 'uppercase' }}>Pres.</span>
             </div>
             <div className="text-center mobile-only">
               <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'hsl(var(--error))' }}>{absentCount}</span>
               <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'hsl(var(--text-light))', display: 'block', textTransform: 'uppercase' }}>Faltas</span>
             </div>
             <div className="desktop-only text-left">
                <p style={{ fontWeight: 800, color: 'hsl(var(--text))', fontSize: '1.2rem' }}>Resumo da Turma</p>
                <p style={{ fontWeight: 500, color: 'hsl(var(--text-light))', fontSize: '0.9rem' }}>
                  {presentCount} Presentes • {absentCount} Faltas
                </p>
             </div>
          </div>

          <button 
            disabled={saving}
            onClick={handleSave} 
            className="btn btn-primary" 
            style={{ padding: '1rem 2rem', fontSize: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', minWidth: '200px', justifyContent: 'center' }}
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Finalizar e Salvar</>}
          </button>
        </div>
      </div>
    </div>
  )
}
