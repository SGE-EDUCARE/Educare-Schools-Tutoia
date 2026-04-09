import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Save, Loader2, FileText } from 'lucide-react'

export const LessonPlanPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [content, setContent] = useState('')
  const [type, setType] = useState('Diário')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!content) return toast.error('O conteúdo do plano é obrigatório')
    setSaving(true)
    try {
      await api('/teacher/lesson-plans', {
        method: 'POST',
        body: JSON.stringify({ date, content, type, classId })
      })
      toast.success('Plano de aula salvo!')
      navigate('/teacher/dashboard')
    } catch (error) {
      toast.error('Erro ao salvar plano')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="flex flex-mobile-col items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem' }}>
            <ChevronLeft size={24} />
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Plano de Aula</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '0.9rem 1.5rem' }}>
          {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Salvar</>}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 300px)', gap: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="flex items-center gap-3">
             <FileText size={20} color="hsl(var(--primary))" />
             <h3 style={{ fontWeight: 800 }}>Conteúdo</h3>
          </div>
          <textarea 
            className="input" 
            style={{ minHeight: '300px', resize: 'vertical' }}
            placeholder="Objetivos e atividades..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Data</label>
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div>
              <label className="label">Tipo</label>
              <select className="input" value={type} onChange={e => setType(e.target.value)}>
                <option value="Diário">Diário</option>
                <option value="Semanal">Semanal</option>
                <option value="Projetos">Projetos</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}
