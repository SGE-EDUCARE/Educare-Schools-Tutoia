import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Save, Loader2, Home, Calendar } from 'lucide-react'

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
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem' }}>
            <ChevronLeft size={24} />
          </button>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Atividade para Casa</h1>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
          {saving ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Agendar Atividade</>}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <label className="label">Título da Atividade</label>
            <input 
              className="input" 
              placeholder="Ex: Exercícios de Fixação - Cap 4" 
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Descrição / Instruções</label>
            <textarea 
              className="input" 
              style={{ minHeight: '250px' }}
              placeholder="Descreva o que os alunos devem fazer e quais materiais usar..."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Data de Entrega</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={18} style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'hsl(var(--primary))' }} />
                <input type="date" className="input" value={dueDate} onChange={e => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="card" style={{ backgroundColor: 'hsl(var(--primary-light) / 0.3)', border: '1px dashed hsl(var(--primary) / 0.3)' }}>
             <p style={{ fontSize: '0.9rem', color: 'hsl(var(--text))', fontWeight: 600, display: 'flex', gap: '0.5rem' }}>
               <Home size={18} /> Esta atividade ficará visível na agenda do aluno e dos pais imediatamente.
             </p>
          </div>
        </div>
      </div>
    </div>
  )
}
