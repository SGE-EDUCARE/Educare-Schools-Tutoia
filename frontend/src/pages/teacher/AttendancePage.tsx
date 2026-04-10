import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Search, Loader2, CheckCircle2, XCircle, Calendar, UserCheck } from 'lucide-react'

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
      const sorted = studentsData.sort((a: any, b: any) => a.name.localeCompare(b.name))
      setStudents(sorted)
      
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
      toast.success('Chamada salva com sucesso!')
      navigate('/teacher/dashboard')
    } catch (error: any) {
      toast.error('Erro ao salvar chamada')
    } finally {
      setSaving(false)
    }
  }

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const presentCount = Object.values(attendances).filter(v => v).length

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '8rem' }}>
      
      <header style={{ marginTop: '2rem', marginBottom: '2.5rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            color: 'hsl(var(--text-light))', 
            fontSize: '0.9rem', 
            fontWeight: 700,
            marginBottom: '1.5rem',
            border: 'none',
            background: 'none',
            cursor: 'pointer'
          }}
        >
          <ChevronLeft size={18} /> Voltar ao Painel
        </button>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 850, color: 'hsl(var(--text))', letterSpacing: '-0.04em', lineHeight: 1.1, marginBottom: '0.5rem' }}>
          Chamada Diária
        </h1>
        <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'hsl(var(--text-light))' }}>
          Gerencie a frequência da sua turma hoje.
        </p>
      </header>

      <section style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-sm)', marginBottom: '2rem', border: '1px solid hsl(var(--border) / 0.5)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid hsl(var(--border) / 0.3)', paddingBottom: '1.25rem' }}>
            <Calendar size={20} color="hsl(var(--primary))" />
            <div style={{ flex: 1 }}>
               <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-light))', textTransform: 'uppercase', marginBottom: '0.2rem' }}>DATA DO DIÁRIO</div>
               <input 
                 type="date" 
                 value={date}
                 onChange={e => setDate(e.target.value)}
                 style={{ border: 'none', background: 'none', fontSize: '1.1rem', fontWeight: 700, color: 'hsl(var(--text))', outline: 'none', width: '100%' }}
               />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Search size={20} color="hsl(var(--text-light))" />
            <input 
              placeholder="Pesquisar aluno na lista..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'none', fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--text))', outline: 'none', width: '100%' }}
            />
          </div>
        </div>
      </section>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'hsl(var(--text-light))', fontSize: '0.85rem', fontWeight: 700 }}>
          <UserCheck size={16} /> {filteredStudents.length} ALUNOS
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={() => markAll(true)} style={{ color: 'hsl(var(--success))', fontSize: '0.85rem', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={16} /> Marcar Todos
          </button>
          <button onClick={() => markAll(false)} style={{ color: 'hsl(var(--error))', fontSize: '0.85rem', fontWeight: 800, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <XCircle size={16} /> Limpar
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
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
                padding: '1.25rem',
                backgroundColor: 'white',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid hsl(var(--border) / 0.4)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', overflow: 'hidden' }}>
                 <div style={{ 
                   width: '36px', 
                   height: '36px', 
                   borderRadius: '12px', 
                   backgroundColor: isPresent ? 'hsl(var(--success) / 0.1)' : isAbsent ? 'hsl(var(--error) / 0.1)' : 'hsl(var(--text) / 0.05)',
                   color: isPresent ? 'hsl(var(--success))' : isAbsent ? 'hsl(var(--error))' : 'hsl(var(--text-light))',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontWeight: 850,
                   fontSize: '0.9rem',
                   flexShrink: 0
                 }}>
                   {index + 1}
                 </div>
                 <span style={{ fontWeight: 700, color: 'hsl(var(--text))', fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                   {student.name}
                 </span>
              </div>
              
              <div style={{ display: 'flex', backgroundColor: 'hsl(var(--background))', padding: '0.3rem', borderRadius: '14px', border: '1px solid hsl(var(--border) / 0.5)' }}>
                <button 
                  onClick={() => setStatus(student.id, true)}
                  style={{ width: '44px', height: '40px', borderRadius: '11px', backgroundColor: isPresent ? 'hsl(var(--success))' : 'transparent', color: isPresent ? 'white' : 'hsl(var(--text-light))', fontWeight: 850, fontSize: '1rem', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
                >
                  P
                </button>
                <button 
                  onClick={() => setStatus(student.id, false)}
                  style={{ width: '44px', height: '40px', borderRadius: '11px', backgroundColor: isAbsent ? 'hsl(var(--error))' : 'transparent', color: isAbsent ? 'white' : 'hsl(var(--text-light))', fontWeight: 850, fontSize: '1rem', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
                >
                  F
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 2.5rem)', maxWidth: '760px', zIndex: 100 }}>
        <button 
          disabled={saving}
          onClick={handleSave} 
          style={{ width: '100%', padding: '1.25rem', borderRadius: '20px', backgroundColor: 'hsl(var(--text))', color: 'white', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.75rem', fontWeight: 800, border: 'none', cursor: 'pointer' }}
        >
          {saving ? <Loader2 className="animate-spin" size={24} /> : <>Finalizar Chamada • {presentCount} Presentes</>}
        </button>
      </div>
    </div>
  )
}
