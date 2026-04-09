import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { 
  ChevronLeft, Save, Loader2, Utensils, Moon, 
  Baby, MessageCircle, Calendar, Check, Circle
} from 'lucide-react'

export const InfantRoutinePage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [students, setStudents] = useState<any[]>([])
  const [routines, setRoutines] = useState<Record<string, any>>({})
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [classId])

  const fetchData = async () => {
    try {
      const studentsData = await api(`/teacher/classes/${classId}/students`)
      setStudents(studentsData)
      
      const initial: Record<string, any> = {}
      studentsData.forEach((s: any) => {
        initial[s.id] = { food: 'Tudo', sleep: true, hygiene: 'Troca de Fralda', obs: '' }
      })
      setRoutines(initial)
    } finally {
      setLoading(false)
    }
  }

  const updateStudentRoutine = (id: string, field: string, value: any) => {
    setRoutines(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api('/teacher/routine', {
        method: 'POST',
        body: JSON.stringify({
          date,
          routines
        })
      })
      toast.success('Rotina diária salva com sucesso!')
      navigate('/teacher/dashboard')
    } catch (error: any) {
      toast.error('Erro ao salvar rotina')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem' }}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(var(--text))' }}>Rotina Infantil</h1>
            <p style={{ color: 'hsl(var(--text-light))' }}>Relatório diário de alimentação, sono e cuidados.</p>
          </div>
        </div>
        
        <div className="flex gap-4">
          <div className="card" style={{ padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
             <Calendar size={18} color="hsl(var(--primary))" />
             <input 
              type="date" 
              value={date} 
              onChange={e => setDate(e.target.value)}
              style={{ border: 'none', background: 'none', fontWeight: 700, color: 'hsl(var(--text))', outline: 'none' }}
             />
          </div>
          <button 
            disabled={saving}
            onClick={handleSave} 
            className="btn btn-primary" 
            style={{ padding: '1rem 2rem' }}
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar Diário</>}
          </button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem' }}>
        {students.map(student => (
          <div key={student.id} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="icon-box" style={{ width: '48px', height: '48px', backgroundColor: 'hsl(var(--primary-light))', color: 'hsl(var(--primary))', borderRadius: '12px' }}>
                  {student.name.charAt(0)}
                </div>
                <h3 style={{ fontWeight: 800, color: 'hsl(var(--text))' }}>{student.name}</h3>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="flex flex-col gap-2">
                <label className="label flex items-center gap-2"><Utensils size={14} /> Alimentação</label>
                <select 
                  className="input" 
                  value={routines[student.id]?.food}
                  onChange={e => updateStudentRoutine(student.id, 'food', e.target.value)}
                >
                  <option value="Tudo">Tudo</option>
                  <option value="Parcial">Parcial</option>
                  <option value="Nada">Nada</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="label flex items-center gap-2"><Moon size={14} /> Sono</label>
                <div 
                  onClick={() => updateStudentRoutine(student.id, 'sleep', !routines[student.id]?.sleep)}
                  style={{ 
                    height: '45px',
                    borderRadius: '12px',
                    border: '2px solid hsl(var(--border) / 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: routines[student.id]?.sleep ? 'hsl(var(--success) / 0.1)' : 'transparent',
                    color: routines[student.id]?.sleep ? 'hsl(var(--success))' : 'hsl(var(--text-light))',
                    fontWeight: 700,
                    transition: 'all 0.2s ease'
                  }}
                >
                  {routines[student.id]?.sleep ? <><Check size={18} /> Dormiu</> : <><Circle size={18} /> Não dormiu</>}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="label flex items-center gap-2"><Baby size={14} /> Higiene</label>
                <select 
                  className="input" 
                  value={routines[student.id]?.hygiene}
                  onChange={e => updateStudentRoutine(student.id, 'hygiene', e.target.value)}
                >
                  <option value="Troca de Fralda">Troca de Fralda</option>
                  <option value="Banho">Banho</option>
                  <option value="Tudo em dia">Tudo em dia</option>
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="label flex items-center gap-2"><MessageCircle size={14} /> Obs</label>
                <input 
                  className="input" 
                  placeholder="Ex: Teve febre"
                  value={routines[student.id]?.obs}
                  onChange={e => updateStudentRoutine(student.id, 'obs', e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
