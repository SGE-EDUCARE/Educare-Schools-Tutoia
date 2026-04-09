import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Send, Loader2 } from 'lucide-react'

export const NoticesPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetRole, setTargetRole] = useState('PARENT')
  const [scope, setScope] = useState('CLASS') // CLASS or GLOBAL (if permitted)
  const [saving, setSaving] = useState(false)

  const handleSend = async () => {
    if (!title || !content) return toast.error('Título e conteúdo são obrigatórios')
    setSaving(true)
    try {
      await api('/teacher/notices', {
        method: 'POST',
        body: JSON.stringify({ 
          title, 
          content, 
          targetRole, 
          classId: scope === 'CLASS' ? classId : null 
        })
      })
      toast.success('Comunicado enviado com sucesso!')
      navigate('/teacher/dashboard')
    } catch (error) {
      toast.error('Erro ao enviar comunicado')
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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Comunicado</h1>
        </div>
        <button onClick={handleSend} disabled={saving} className="btn btn-primary" style={{ padding: '0.9rem 1.5rem' }}>
          {saving ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Enviar</>}
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 320px)', gap: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <label className="label">Título</label>
            <input 
              className="input" 
              placeholder="Ex: Reunião de Pais" 
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Mensagem Detalhada</label>
            <textarea 
              className="input" 
              style={{ minHeight: '200px' }}
              placeholder="Escreva aqui as informações..."
              value={content}
              onChange={e => setContent(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label className="label">Destinatários</label>
              <select className="input" value={targetRole} onChange={e => setTargetRole(e.target.value)}>
                <option value="PARENT">Pais / Responsáveis</option>
                <option value="STUDENT">Apenas Alunos</option>
                <option value="ALL">Todos</option>
              </select>
            </div>
            <div>
              <label className="label">Abrangência</label>
              <select className="input" value={scope} onChange={e => setScope(e.target.value)}>
                <option value="CLASS">Apenas Turma</option>
                <option value="GLOBAL">Geral (Escola)</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

  )
}
