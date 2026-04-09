import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Save, Loader2 } from 'lucide-react'

export const HomeworkPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (!title || !description) return toast.error('Título e descrição são obrigatórios')
    setSaving(true)
    try {
      await api('/teacher/homework', {
        method: 'POST',
        body: JSON.stringify({ title, description, dueDate, classId })
      })
      toast.success('Atividade de casa agendada!')
      navigate('/teacher/dashboard')
    } catch (error) {
      toast.error('Erro ao salvar atividade')
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Agenda Casa</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '0.9rem 1.5rem' }}>
          {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Agendar</>}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 320px)', gap: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <label className="label">Título</label>
            <input 
              className="input" 
              placeholder="Ex: Exercícios Cap 4" 
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Instruções</label>
            <textarea 
              className="input" 
              style={{ minHeight: '200px' }}
              placeholder="Descreva a atividade..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Entrega</label>
              <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}
