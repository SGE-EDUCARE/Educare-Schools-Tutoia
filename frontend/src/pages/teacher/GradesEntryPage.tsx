import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Save, Search, Loader2, Award } from 'lucide-react'

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
      setStudents(studentsData)
      
      const initial: Record<string, string> = {}
      studentsData.forEach((s: any) => {
        initial[s.id] = ''
      })
      setGrades(initial)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await api('/teacher/grades', {
        method: 'POST',
        body: JSON.stringify({
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="flex flex-mobile-col items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem' }}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'hsl(var(--text))' }}>Notas</h1>
            <p className="desktop-only" style={{ color: 'hsl(var(--text-light))' }}>Gerencie o desempenho acadêmico.</p>
          </div>
        </div>
        <button 
          disabled={saving}
          onClick={handleSave} 
          className="btn btn-primary" 
          style={{ width: 'auto', padding: '0.9rem 2rem' }}
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar Notas</>}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 320px) minmax(0, 1fr)', gap: '2rem', alignItems: 'start' }}>
        <div className="flex flex-col gap-6">
          <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label className="label">Bimestre</label>
              <select className="input" value={bimester} onChange={e => setBimester(e.target.value)}>
                <option value="1">1º Bimestre</option>
                <option value="2">2º Bimestre</option>
                <option value="3">3º Bimestre</option>
                <option value="4">4º Bimestre</option>
              </select>
            </div>
            <div>
              <label className="label">Avaliação</label>
              <select className="input" value={label} onChange={e => setLabel(e.target.value)}>
                <option value="1ª Prova">1ª Prova</option>
                <option value="2ª Prova">2ª Prova</option>
                <option value="Recuperação">Recuperação</option>
                <option value="Atividade">Atividade</option>
              </select>
            </div>
            <div>
              <label className="label">Disciplina</label>
              <input 
                className="input" 
                placeholder="Ex: Português" 
                value={subject}
                onChange={e => setSubject(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="card" style={{ padding: '0.75rem 1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Search size={18} color="hsl(var(--text-light))" />
            <input 
              className="input" 
              placeholder="Filtrar aluno..." 
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
                  
                  <div style={{ position: 'relative', maxWidth: '100px' }}>
                    <Award size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary) / 0.5)' }} className="desktop-only" />
                    <input 
                      className="input text-center"
                      style={{ padding: '0.5rem', fontWeight: 800, textAlign: 'center' }}
                      placeholder="0.0"
                      type="text"
                      inputMode="decimal"
                      value={grades[student.id] || ''}
                      onChange={e => setGrades(prev => ({ ...prev, [student.id]: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

  )
}
