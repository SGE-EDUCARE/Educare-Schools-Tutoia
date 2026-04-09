import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Save, Search, Loader2, Award, FileText } from 'lucide-react'

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
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem' }}>
            <ChevronLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'hsl(var(--text))' }}>Lançamento de Notas</h1>
            <p style={{ color: 'hsl(var(--text-light))' }}>Gerencie as avaliações e o desempenho acadêmico.</p>
          </div>
        </div>
        <button 
          disabled={saving}
          onClick={handleSave} 
          className="btn btn-primary" 
          style={{ padding: '1rem 2rem' }}
        >
          {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar Notas</>}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '2rem', alignItems: 'start' }}>
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

          <div className="card" style={{ padding: '1.5rem', backgroundColor: 'hsl(var(--primary-light) / 0.5)', border: '1px dashed hsl(var(--primary) / 0.3)' }}>
             <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text))', display: 'flex', gap: '0.5rem' }}>
               <FileText size={16} className="shrink-0" />
               Dica: Utilize ponto (.) para notas decimais (ex: 7.5). O cálculo da média bimestral é automático.
             </p>
          </div>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid hsl(var(--border) / 0.5)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--text-light))' }} />
              <input 
                className="input" 
                placeholder="Filtrar por nome..." 
                style={{ paddingLeft: '3rem' }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <table style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '1rem 2rem' }}>Nome do Aluno</th>
                <th style={{ textAlign: 'center', padding: '1rem', width: '200px' }}>Nota / Conceito</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id}>
                  <td style={{ padding: '1rem 2rem' }}>
                    <span style={{ fontWeight: 700, color: 'hsl(var(--text))' }}>{student.name}</span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '1rem' }}>
                    <div style={{ position: 'relative', maxWidth: '120px', margin: '0 auto' }}>
                      <Award size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--primary) / 0.5)' }} />
                      <input 
                        className="input text-center"
                        style={{ paddingLeft: '2.5rem', fontWeight: 800 }}
                        placeholder="0.0"
                        type="text"
                        value={grades[student.id] || ''}
                        onChange={e => setGrades(prev => ({ ...prev, [student.id]: e.target.value }))}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
