import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Search, Loader2 } from 'lucide-react'

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
      
      // Inicializar tudo como presente por padrão
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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="flex flex-mobile-col items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem' }}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--text))' }}>Chamada Diária</h1>
            <p className="desktop-only" style={{ color: 'hsl(var(--text-light))' }}>Selecione a data e marque a presença.</p>
          </div>
        </div>
        
        <div className="card mobile-only w-full" style={{ padding: '0.75rem 1rem' }}>
           <input 
              type="date" 
              className="input" 
              style={{ border: 'none', padding: 0, boxShadow: 'none' }}
              value={date}
              onChange={e => setDate(e.target.value)}
            />
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem', alignItems: 'start' }}>
        <div className="flex flex-col gap-4">
          <div className="card" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Search size={18} color="hsl(var(--text-light))" />
            <input 
              className="input" 
              placeholder="Pesquisar aluno..." 
              style={{ border: 'none', boxShadow: 'none', padding: '0.5rem 0' }}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-3">
            {filteredStudents.map(student => (
              <div key={student.id} className="card" style={{ padding: '1rem 1.5rem' }}>
                <div className="flex items-center justify-between w-full">
                  <span style={{ fontWeight: 700, color: 'hsl(var(--text))', fontSize: '1rem' }}>{student.name}</span>
                  
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setStatus(student.id, true)}
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px',
                        backgroundColor: attendances[student.id] === true ? 'hsl(var(--success))' : 'hsl(var(--success) / 0.1)',
                        color: attendances[student.id] === true ? 'white' : 'hsl(var(--success))',
                        fontWeight: 800,
                        border: '2px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      P
                    </button>
                    <button 
                      onClick={() => setStatus(student.id, false)}
                      style={{ 
                        width: '48px', 
                        height: '48px', 
                        borderRadius: '12px',
                        backgroundColor: attendances[student.id] === false ? 'hsl(var(--error))' : 'hsl(var(--error) / 0.1)',
                        color: attendances[student.id] === false ? 'white' : 'hsl(var(--error))',
                        fontWeight: 800,
                        border: '2px solid transparent',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      F
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6 desktop-only">
          <div className="card" style={{ padding: '1.5rem' }}>
            <label className="label" style={{ marginBottom: '1rem', display: 'block' }}>Data da Chamada</label>
            <input 
              type="date" 
              className="input" 
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          <div className="card text-center" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
               <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'hsl(var(--success))' }}>
                 {Object.values(attendances).filter(v => v).length}
               </div>
               <div style={{ color: 'hsl(var(--text-light))', fontWeight: 600 }}>Presentes</div>
            </div>
            <button 
              disabled={saving}
              onClick={handleSave} 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '1.25rem' }}
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : 'Finalizar Chamada'}
            </button>
          </div>
        </div>
      </div>

      {/* Botão flutuante para salvar no mobile */}
      <div className="mobile-only" style={{ position: 'sticky', bottom: '2rem', zIndex: 50 }}>
        <button 
          disabled={saving}
          onClick={handleSave} 
          className="btn btn-primary" 
          style={{ width: '100%', padding: '1.25rem', boxShadow: '0 10px 25px -5px hsl(var(--primary) / 0.5)' }}
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : `Salvar Chamada (${Object.values(attendances).filter(v => v).length} P)`}
        </button>
      </div>
    </div>

  )
}
