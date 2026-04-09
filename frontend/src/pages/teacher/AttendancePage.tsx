import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Check, X, Calendar, Search, Loader2 } from 'lucide-react'

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

  const toggleAttendance = (id: string) => {
    setAttendances(prev => ({ ...prev, [id]: !prev[id] }))
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
      <header className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem' }}>
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(var(--text))' }}>Chamada Diária</h1>
          <p style={{ color: 'hsl(var(--text-light))' }}>Selecione a data e marque a presença dos alunos.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem', alignItems: 'start' }}>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid hsl(var(--border) / 0.5)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-light))' }} />
              <input 
                className="input" 
                placeholder="Pesquisar aluno..." 
                style={{ paddingLeft: '3rem' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <table style={{ width: '100%' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'hsl(var(--surface))', zIndex: 10 }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '1rem 2rem' }}>Estudante</th>
                  <th style={{ textAlign: 'center', padding: '1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id} onClick={() => toggleAttendance(student.id)} style={{ cursor: 'pointer' }}>
                    <td style={{ padding: '1rem 2rem' }}>
                      <span style={{ fontWeight: 700, color: 'hsl(var(--text))' }}>{student.name}</span>
                    </td>
                    <td style={{ textAlign: 'center', padding: '1rem' }}>
                      <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '12px',
                        backgroundColor: attendances[student.id] ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--error) / 0.1)',
                        color: attendances[student.id] ? 'hsl(var(--success))' : 'hsl(var(--error))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto',
                        transition: 'all 0.2s ease'
                      }}>
                        {attendances[student.id] ? <Check size={20} /> : <X size={20} />}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card" style={{ padding: '1.5rem' }}>
            <label className="label" style={{ marginBottom: '1rem', display: 'block' }}>Data da Chamada</label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'hsl(var(--primary))' }} />
              <input 
                type="date" 
                className="input" 
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="card text-center" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1.5rem' }}>
               <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'hsl(var(--success))' }}>
                 {Object.values(attendances).filter(v => v).length}
               </div>
               <div style={{ color: 'hsl(var(--text-light))', fontWeight: 600 }}>Alunos Presentes</div>
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
    </div>
  )
}
