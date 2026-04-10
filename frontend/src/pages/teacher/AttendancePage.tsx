import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Search, Loader2, Check, X } from 'lucide-react'

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
      // Sort students alphabetically
      const sorted = studentsData.sort((a: any, b: any) => a.name.localeCompare(b.name))
      setStudents(sorted)
      
      // Default to all present
      const initial: Record<string, boolean> = {}
      sorted.forEach((s: any) => {
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
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '120px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* HEADER SIMPLES */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--border) / 0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate(-1)} style={{ padding: '0.5rem', backgroundColor: 'hsl(var(--text) / 0.05)', borderRadius: '50%', color: 'hsl(var(--text))', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={24} />
          </button>
          <div>
             <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'hsl(var(--text))', letterSpacing: '-0.02em', margin: 0 }}>Chamada Diária</h1>
          </div>
        </div>
        
        <div>
           <input 
             type="date" 
             style={{ 
               padding: '0.5rem 0.75rem', 
               borderRadius: 'var(--radius-md)', 
               border: '1px solid hsl(var(--border))',
               backgroundColor: 'hsl(var(--surface))',
               color: 'hsl(var(--text))',
               fontWeight: 600,
               outline: 'none',
               fontSize: '0.9rem'
             }}
             value={date}
             onChange={e => setDate(e.target.value)}
           />
        </div>
      </header>

      {/* TOOLBAR CONTROLES */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', backgroundColor: 'hsl(var(--surface))', padding: '0.75rem 1.25rem', borderRadius: 'var(--radius-full)', border: '1px solid hsl(var(--border) / 0.5)', boxShadow: '0 2px 10px -5px rgba(0,0,0,0.05)' }}>
          <Search size={18} color="hsl(var(--text-light))" />
          <input 
            placeholder="Buscar aluno na lista..." 
            style={{ border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '1rem', color: 'hsl(var(--text))' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'hsl(var(--text-light))', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {filteredStudents.length} ALUNOS
          </span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => markAll(true)} style={{ color: 'hsl(var(--success))', fontSize: '0.85rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Check size={16} /> Todos Presentes
            </button>
            <button onClick={() => markAll(false)} style={{ color: 'hsl(var(--error))', fontSize: '0.85rem', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <X size={16} /> Limpar
            </button>
          </div>
        </div>
      </div>

      {/* LISTAGEM DE ALUNOS (FLAT LIST COMPACTA) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredStudents.map((student, index) => {
          const isPresent = attendances[student.id] === true
          const isAbsent = attendances[student.id] === false

          return (
            <div 
              key={student.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '0.85rem 1rem',
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
                   backgroundColor: isPresent ? 'hsl(var(--success) / 0.1)' : isAbsent ? 'hsl(var(--error) / 0.1)' : 'hsl(var(--text) / 0.05)',
                   color: isPresent ? 'hsl(var(--success))' : isAbsent ? 'hsl(var(--error))' : 'hsl(var(--text-light))',
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
              
              {/* Segmented Control iOS Style */}
              <div style={{ 
                display: 'flex', 
                backgroundColor: 'hsl(var(--background))', 
                padding: '0.25rem', 
                borderRadius: 'var(--radius-md)',
                border: '1px solid hsl(var(--border) / 0.5)',
                flexShrink: 0
              }}>
                <button 
                  onClick={() => setStatus(student.id, true)}
                  style={{ 
                    width: '40px', 
                    padding: '0.4rem 0',
                    borderRadius: 'calc(var(--radius-md) - 2px)',
                    backgroundColor: isPresent ? 'hsl(var(--success))' : 'transparent',
                    color: isPresent ? 'white' : 'hsl(var(--text-light))',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    border: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    boxShadow: isPresent ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  P
                </button>
                <button 
                  onClick={() => setStatus(student.id, false)}
                  style={{ 
                    width: '40px', 
                    padding: '0.4rem 0',
                    borderRadius: 'calc(var(--radius-md) - 2px)',
                    backgroundColor: isAbsent ? 'hsl(var(--error))' : 'transparent',
                    color: isAbsent ? 'white' : 'hsl(var(--text-light))',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                    border: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                    boxShadow: isAbsent ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  F
                </button>
              </div>
            </div>
          )
        })}
        {filteredStudents.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'hsl(var(--text-light))', backgroundColor: 'hsl(var(--surface))', borderRadius: 'var(--radius-md)' }}>
            Nenhum aluno encontrado.
          </div>
        )}
      </div>

      {/* FLOAT BOTTOM BAR MINIMALISTA */}
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
            <>
              Finalizar: {presentCount} Presentes • {absentCount} Faltas
            </>
          )}
        </button>
      </div>
    </div>
  )
}
