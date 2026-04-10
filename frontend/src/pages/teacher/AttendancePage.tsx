import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Search, Loader2, CheckCircle2, XCircle, Calendar, UserCheck, Check } from 'lucide-react'

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
  const progress = students.length > 0 ? (presentCount / students.length) * 100 : 0

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', paddingBottom: '10rem', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      
      {/* HEADER ULTRA PREMIUM */}
      <header style={{ padding: '2rem 1rem 1rem 1rem' }}>
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
          Chamada Diária
        </h1>
        <p style={{ fontSize: '1.2rem', fontWeight: 500, color: 'hsl(var(--text-light))', letterSpacing: '-0.02em', marginBottom: '2rem' }}>
          Gerencie a frequência da sua turma hoje.
        </p>

        {/* PROGRESS BAR COMPACTA NATIVA */}
        <div style={{ backgroundColor: 'white', padding: '1.25rem', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'center' }}>
             <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'hsl(var(--text))', opacity: 0.6 }}>STATUS DA TURMA</span>
             <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'hsl(var(--primary))' }}>{presentCount} DE {students.length} PRESENTES</span>
          </div>
          <div style={{ width: '100%', height: '8px', backgroundColor: 'hsl(var(--primary) / 0.05)', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'hsl(var(--primary))', borderRadius: '10px', transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
          </div>
        </div>
      </header>

      {/* CONTROLES IMERSIVOS */}
      <section style={{ padding: '0 1rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', padding: '1rem 1.5rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <Calendar size={20} color="hsl(var(--primary))" />
            <input 
              type="date" 
              value={date}
              onChange={e => setDate(e.target.value)}
              style={{ border: 'none', background: 'none', fontSize: '1.1rem', fontWeight: 750, color: 'hsl(var(--text))', outline: 'none', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'white', padding: '1rem 1.5rem', borderRadius: '24px', border: '1px solid rgba(0,0,0,0.03)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <Search size={20} color="hsl(var(--text-light))" />
            <input 
              placeholder="Pesquisar aluno..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'none', fontSize: '1rem', fontWeight: 600, color: 'hsl(var(--text))', outline: 'none', width: '100%' }}
            />
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS PREMIUM */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem', padding: '0 1rem' }}>
        <button onClick={() => markAll(true)} style={{ flex: 1, backgroundColor: 'hsl(var(--success) / 0.05)', border: '1px solid hsl(var(--success) / 0.2)', padding: '0.85rem', borderRadius: '16px', color: 'hsl(var(--success))', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <CheckCircle2 size={16} /> TODOS PRESENTES
        </button>
        <button onClick={() => markAll(false)} style={{ flex: 1, backgroundColor: 'hsl(var(--error) / 0.05)', border: '1px solid hsl(var(--error) / 0.2)', padding: '0.85rem', borderRadius: '16px', color: 'hsl(var(--error))', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <XCircle size={16} /> LIMPAR LISTA
        </button>
      </div>

      {/* LISTA DE ALUNOS NATIVE 2.0 */}
      <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                padding: '1.5rem',
                backgroundColor: 'white',
                borderRadius: '32px',
                boxShadow: isPresent ? '0 10px 25px -5px hsl(var(--success) / 0.1)' : isAbsent ? '0 10px 25px -5px hsl(var(--error) / 0.1)' : '0 10px 20px -5px rgba(0,0,0,0.03)',
                transform: isPresent || isAbsent ? 'scale(1.01)' : 'scale(1)',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                border: '1px solid rgba(0,0,0,0.01)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', overflow: 'hidden' }}>
                 <div style={{ 
                   width: '42px', 
                   height: '42px', 
                   borderRadius: '50%', 
                   backgroundColor: isPresent ? 'hsl(var(--success))' : isAbsent ? 'hsl(var(--error))' : 'hsl(var(--text) / 0.05)',
                   color: isPresent || isAbsent ? 'white' : 'hsl(var(--text-light))',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontWeight: 900,
                   fontSize: '1rem',
                   flexShrink: 0,
                   transition: 'all 0.3s'
                 }}>
                   {isPresent ? <Check size={20} /> : index + 1}
                 </div>
                 <span style={{ fontWeight: 800, color: 'hsl(var(--text))', fontSize: '1.2rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                   {student.name}
                 </span>
              </div>
              
              <div style={{ display: 'flex', backgroundColor: '#F1F5F9', padding: '0.4rem', borderRadius: '18px' }}>
                <button 
                  onClick={() => setStatus(student.id, true)}
                  style={{ width: '52px', height: '44px', borderRadius: '14px', backgroundColor: isPresent ? 'hsl(var(--success))' : 'transparent', color: isPresent ? 'white' : 'hsl(var(--text-light))', fontWeight: 900, fontSize: '1.1rem', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
                >
                  P
                </button>
                <button 
                  onClick={() => setStatus(student.id, false)}
                  style={{ width: '52px', height: '44px', borderRadius: '14px', backgroundColor: isAbsent ? 'hsl(var(--error))' : 'transparent', color: isAbsent ? 'white' : 'hsl(var(--text-light))', fontWeight: 900, fontSize: '1.1rem', border: 'none', transition: 'all 0.2s', cursor: 'pointer' }}
                >
                  F
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* FLOAT ACTION BUTTON PREMIUM */}
      <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', width: 'calc(100% - 2rem)', maxWidth: '500px', zIndex: 200 }}>
        <button 
          disabled={saving}
          onClick={handleSave} 
          style={{ 
            width: '100%', 
            padding: '1.4rem', 
            borderRadius: '28px', 
            background: 'linear-gradient(135deg, hsl(var(--text)), #1E293B)', 
            color: 'white', 
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.4)', 
            fontSize: '1.2rem', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            gap: '1rem', 
            fontWeight: 900, 
            border: 'none', 
            cursor: 'pointer',
            letterSpacing: '-0.02em'
          }}
        >
          {saving ? <Loader2 className="animate-spin" size={24} /> : (
            <>
              CONCLUIR CHAMADA <div style={{ width: '2px', height: '20px', backgroundColor: 'rgba(255,255,255,0.2)' }}></div> {presentCount} PRESENTES
            </>
          )}
        </button>
      </div>
    </div>
  )
}
