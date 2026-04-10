import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { ChevronLeft, Send, Loader2, Megaphone, Users, Globe } from 'lucide-react'

export const NoticesPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [targetRole, setTargetRole] = useState('PARENT')
  const [scope, setScope] = useState('CLASS')
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
      toast.success('Comunicado enviado!')
      navigate('/teacher/dashboard')
    } catch (error) {
      toast.error('Erro ao enviar comunicado')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button onClick={() => navigate(-1)} className="btn-ghost" style={{ padding: '0.5rem' }}>
          <ChevronLeft size={22} />
        </button>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.03em', color: 'hsl(var(--text))' }}>
            Comunicado
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'hsl(var(--text-light))', fontWeight: 500 }}>
            Envie avisos para pais e alunos.
          </p>
        </div>
      </div>

      {/* CONFIG ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 0 }}>
            <Users size={14} /> Destinatários
          </label>
          <select 
            className="input" 
            value={targetRole} 
            onChange={e => setTargetRole(e.target.value)}
            style={{ border: 'none', padding: '0.5rem 0', fontWeight: 700, fontSize: '0.85rem', appearance: 'none' }}
          >
            <option value="PARENT">Pais</option>
            <option value="STUDENT">Alunos</option>
            <option value="ALL">Todos</option>
          </select>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: 0 }}>
            <Globe size={14} /> Alcance
          </label>
          <select 
            className="input" 
            value={scope} 
            onChange={e => setScope(e.target.value)}
            style={{ border: 'none', padding: '0.5rem 0', fontWeight: 700, fontSize: '0.85rem', appearance: 'none' }}
          >
            <option value="CLASS">Minha Turma</option>
            <option value="GLOBAL">Escola Toda</option>
          </select>
        </div>
      </div>

      {/* CONTENT */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Megaphone size={18} color="hsl(var(--primary))" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text))' }}>Comunicado</span>
        </div>
        
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
          <label className="label">Mensagem</label>
          <textarea 
            className="input" 
            style={{ minHeight: '160px', resize: 'vertical' }}
            placeholder="Escreva aqui as informações..."
            value={content}
            onChange={e => setContent(e.target.value)}
          />
        </div>
      </div>

      {/* SEND */}
      <button 
        onClick={handleSend} 
        disabled={saving} 
        className="btn btn-primary" 
        style={{ width: '100%', height: '52px', fontSize: '1rem' }}
      >
        {saving ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Enviar Comunicado</>}
      </button>
    </div>
  )
}
