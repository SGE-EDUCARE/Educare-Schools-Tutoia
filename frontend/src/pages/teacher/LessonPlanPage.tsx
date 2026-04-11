import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { 
  ChevronLeft, 
  Loader2, 
  FileText, 
  Calendar, 
  Plus, 
  Edit3, 
  Target, 
  LayoutList, 
  CheckCircle2,
  Trash2,
  ChevronDown
} from 'lucide-react'

type LessonPlan = {
  id?: string
  date: string
  subject: string
  bimester: string
  month: string
  custom_general_comp: string
  custom_specific_comp: string
  knowledge_objects: string
  programmatic_content: string
  skills: string
  bncc_skills?: any[]
  bncc_general_comp?: any[]
  bncc_specific_comp?: any[]
  methodology: string
  evaluation: string
  resources: string
  references: string
  type: string
}

type BnccRef = {
  id: string
  code?: string
  number?: number
  title?: string
  description: string
}

export const LessonPlanPage: React.FC = () => {
  const { classId } = useParams()
  const navigate = useNavigate()
  
  // States
  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  
  // BNCC Search States (Habilidades)
  const [bnccSearch, setBnccSearch] = useState('')
  const [bnccResults, setBnccResults] = useState<BnccRef[]>([])
  const [searchingBNCC, setSearchingBNCC] = useState(false)
  const [selectedBnccIds, setSelectedBnccIds] = useState<string[]>([])
  const [selectedBnccObjects, setSelectedBnccObjects] = useState<BnccRef[]>([])

  // BNCC Search States (Gerais)
  const [genCompSearch, setGenCompSearch] = useState('')
  const [genCompResults, setGenCompResults] = useState<BnccRef[]>([])
  const [searchingGen, setSearchingGen] = useState(false)
  const [selectedGenIds, setSelectedGenIds] = useState<string[]>([])
  const [selectedGenObjects, setSelectedGenObjects] = useState<BnccRef[]>([])

  // BNCC Search States (Específicas)
  const [specCompSearch, setSpecCompSearch] = useState('')
  const [specCompResults, setSpecCompResults] = useState<BnccRef[]>([])
  const [searchingSpec, setSearchingSpec] = useState(false)
  const [selectedSpecIds, setSelectedSpecIds] = useState<string[]>([])
  const [selectedSpecObjects, setSelectedSpecObjects] = useState<BnccRef[]>([])

  // Custom Select States
  const [openSubject, setOpenSubject] = useState(false)
  const [openBimester, setOpenBimester] = useState(false)
  const [openMonth, setOpenMonth] = useState(false)

  // Controle explícito de qual dropdown BNCC está aberto
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  const emptyPlan = (): LessonPlan => ({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    bimester: '1',
    month: new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(new Date()),
    custom_general_comp: '',
    custom_specific_comp: '',
    knowledge_objects: '',
    programmatic_content: '',
    skills: '',
    methodology: '',
    evaluation: '',
    resources: '',
    references: '',
    type: 'Mensal'
  })

  const fetchPlans = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api(`/teacher/classes/${classId}/lesson-plans`)
      setPlans(data)
    } catch { toast.error('Erro ao carregar planos') }
    finally { setLoading(false) }
  }, [classId])

  const fetchAllocations = useCallback(async () => {
    try {
      const data = await api(`/teacher/classes/${classId}/allocations`)
      setSubjects(data)
    } catch (e) { console.error(e) }
  }, [classId])

  useEffect(() => {
    fetchPlans()
    fetchAllocations()
  }, [fetchPlans, fetchAllocations])

  // Refs para controle de versão de requisição (evita race conditions)
  const bnccRequestId = useRef(0)
  const genRequestId = useRef(0)
  const specRequestId = useRef(0)

  // Busca assíncrona da BNCC: Habilidades
  useEffect(() => {
    const isActive = activeDropdown === 'habilidades'
    const queryTerm = bnccSearch.trim()
    
    // Se não estiver ativo ou termo curto demais (e não for busca vazia ao abrir), limpa e sai
    if (!isActive && queryTerm.length < 2) {
      setBnccResults([])
      return
    }

    const requestId = ++bnccRequestId.current
    
    const timer = setTimeout(async () => {
      setSearchingBNCC(true)
      try {
        const queryParams = new URLSearchParams({ q: queryTerm })
        if (currentPlan?.subject) queryParams.append('subject', currentPlan.subject)
        
        const results = await api(`/teacher/bncc/search?${queryParams.toString()}`)
        
        if (requestId === bnccRequestId.current) {
          setBnccResults(results)
        }
      } catch (e) {
        if (requestId === bnccRequestId.current) console.error(e)
      } finally {
        if (requestId === bnccRequestId.current) setSearchingBNCC(false)
      }
    }, isActive && queryTerm === '' ? 0 : 400)

    return () => clearTimeout(timer)
  }, [bnccSearch, currentPlan?.subject, activeDropdown])


  // Busca assíncrona da BNCC: Gerais
  useEffect(() => {
    const isActive = activeDropdown === 'gerais'
    const queryTerm = genCompSearch.trim()

    if (!isActive && queryTerm.length < 2) {
      setGenCompResults([])
      return
    }

    const requestId = ++genRequestId.current

    const timer = setTimeout(async () => {
      setSearchingGen(true)
      try {
        const queryParams = new URLSearchParams({ q: queryTerm })
        const results = await api(`/teacher/bncc/general-search?${queryParams.toString()}`)
        
        if (requestId === genRequestId.current) {
          setGenCompResults(results)
        }
      } catch (e) {
        if (requestId === genRequestId.current) console.error(e)
      } finally {
        if (requestId === genRequestId.current) setSearchingGen(false)
      }
    }, isActive && queryTerm === '' ? 0 : 400)

    return () => clearTimeout(timer)
  }, [genCompSearch, activeDropdown])

  // Busca assíncrona da BNCC: Específicas
  useEffect(() => {
    const isActive = activeDropdown === 'especificas'
    const queryTerm = specCompSearch.trim()

    if (!isActive && queryTerm.length < 2) {
      setSpecCompResults([])
      return
    }

    const requestId = ++specRequestId.current

    const timer = setTimeout(async () => {
      setSearchingSpec(true)
      try {
        const queryParams = new URLSearchParams({ q: queryTerm })
        const results = await api(`/teacher/bncc/specific-search?${queryParams.toString()}`)
        
        if (requestId === specRequestId.current) {
          setSpecCompResults(results)
        }
      } catch (e) {
        if (requestId === specRequestId.current) console.error(e)
      } finally {
        if (requestId === specRequestId.current) setSearchingSpec(false)
      }
    }, isActive && queryTerm === '' ? 0 : 400)

    return () => clearTimeout(timer)
  }, [specCompSearch, activeDropdown])

  // (Removido o truque do espaço em branco que causava glitch no texto)

  const handleCreateNew = () => {
    const fresh = emptyPlan()
    if (subjects.length === 1) fresh.subject = subjects[0]
    setCurrentPlan(fresh)
    setSelectedBnccIds([]); setSelectedBnccObjects([])
    setSelectedGenIds([]); setSelectedGenObjects([])
    setSelectedSpecIds([]); setSelectedSpecObjects([])
    setIsEditing(true)
  }

  const handleEdit = (plan: LessonPlan) => {
    const normalized = { ...plan } as any
    Object.keys(normalized).forEach(key => { if (normalized[key] === null) normalized[key] = '' })
    setCurrentPlan(normalized)
    
    // Sincronizar IDs selecionados
    setSelectedBnccIds(plan.bncc_skills?.map(s => s.id) || [])
    setSelectedBnccObjects(plan.bncc_skills || [])
    setSelectedGenIds(plan.bncc_general_comp?.map(s => s.id) || [])
    setSelectedGenObjects(plan.bncc_general_comp || [])
    setSelectedSpecIds(plan.bncc_specific_comp?.map(s => s.id) || [])
    setSelectedSpecObjects(plan.bncc_specific_comp || [])
    
    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!currentPlan?.subject) return toast.error('Informe a disciplina')
    if (!currentPlan?.knowledge_objects && selectedGenIds.length === 0) {
      return toast.error('Preencha ao menos as competências ou objetos de conhecimento')
    }

    setSaving(true)
    try {
      await api('/teacher/lesson-plans', {
        method: 'POST',
        body: JSON.stringify({ 
          ...currentPlan, 
          classId,
          bncc_skills_ids: selectedBnccIds,
          bncc_general_comp_ids: selectedGenIds,
          bncc_specific_comp_ids: selectedSpecIds
        })
      })
      toast.success('Plano de aula salvo!')
      setIsEditing(false)
      setCurrentPlan(null)
      fetchPlans()
    } catch (error) { toast.error('Erro ao salvar plano') }
    finally { setSaving(false) }
  }

  const bimesterOptions = [
    { value: '1', label: '1º Bimestre' }, { value: '2', label: '2º Bimestre' },
    { value: '3', label: '3º Bimestre' }, { value: '4', label: '4º Bimestre' },
  ]
  const monthOptions = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ].map(m => ({ value: m, label: m }))

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 className="animate-spin" size={48} color="hsl(var(--primary))" />
    </div>
  )

  // Auxiliar para buscadores BNCC
  const renderMultiselect = (
    dropdownKey: string,
    label: string, 
    placeholder: string, 
    search: string, 
    setSearch: (v: string) => void,
    results: any[],
    searching: boolean,
    selected: any[],
    onAdd: (item: any) => void,
    onRemove: (id: string) => void
  ) => {
    const isOpen = activeDropdown === dropdownKey
    const showResults = isOpen && results.length > 0

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <label style={{
          fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-light))',
          textTransform: 'uppercase', letterSpacing: '0.04em', marginLeft: '0.15rem'
        }}>{label}</label>

        <div style={{ position: 'relative' }}>
          <input 
            type="text" 
            className="input" 
            placeholder={placeholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setActiveDropdown(dropdownKey)}
            onBlur={(e) => {
              // Pequeno delay para permitir o clique nos resultados
              setTimeout(() => {
                setActiveDropdown(current => current === dropdownKey ? null : current)
              }, 300)
            }}
            style={{ 
              width: '100%', 
              backgroundColor: 'white'
            }}
          />
          {searching && (
            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
              <Loader2 size={16} className="animate-spin" color="hsl(var(--primary))" />
            </div>
          )}
          
          {showResults && (
            <div 
              onMouseDown={(e) => e.preventDefault()} // Impede o blur de fechar a lista ao clicar nela
              style={{
                position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                backgroundColor: 'white', borderRadius: '12px',
                boxShadow: '0 8px 32px -4px rgba(0,0,0,0.18)',
                zIndex: 500, border: '1px solid hsl(var(--border) / 0.4)',
                overflowY: 'auto', maxHeight: '260px',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {results.map(res => (
                <div
                  key={res.id}
                  onClick={() => { 
                    onAdd(res)
                    setSearch('')
                    setActiveDropdown(null) 
                  }}
                  style={{ 
                    padding: '0.75rem 1rem', cursor: 'pointer',
                    borderBottom: '1px solid hsl(var(--border) / 0.15)',
                    minHeight: '44px', display: 'flex', flexDirection: 'column', justifyContent: 'center'
                  }}
                >
                  <div style={{ fontWeight: 800, color: 'hsl(var(--primary))', fontSize: '0.78rem' }}>
                    {res.number ? `${res.number}. ` : ''}
                    {res.code ? `[${res.code}] ` : ''}
                    {res.title || ''}
                  </div>
                  <div style={{
                    fontSize: '0.72rem', fontWeight: 500, color: 'hsl(var(--text))',
                    marginTop: '0.15rem', lineHeight: 1.35,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{res.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.4rem' }}>
            {selected.map(item => (
              <div key={item.id} style={{ 
                backgroundColor: 'hsl(var(--primary) / 0.04)', color: 'hsl(var(--text))', 
                padding: '0.7rem 0.85rem', borderRadius: '10px', fontSize: '0.78rem',
                display: 'flex', gap: '0.6rem', alignItems: 'flex-start',
                border: '1px solid hsl(var(--primary) / 0.1)',
                position: 'relative', minHeight: '44px'
              }}>
                <span style={{ 
                  backgroundColor: 'hsl(var(--primary))', color: 'white', 
                  padding: '0.15rem 0.4rem', borderRadius: '4px', fontSize: '0.6rem', 
                  fontWeight: 900, whiteSpace: 'nowrap', flexShrink: 0, marginTop: '0.1rem'
                }}>
                  {item.number || item.code || 'BNCC'}
                </span>
                <div style={{ fontWeight: 500, lineHeight: 1.4, flex: 1, paddingRight: '1.5rem', fontSize: '0.75rem' }}>
                  {item.title && <span style={{ fontWeight: 800, color: 'hsl(var(--primary))', display: 'block', marginBottom: '0.1rem' }}>{item.title}</span>}
                  {item.description}
                </div>
                <button 
                  onClick={() => onRemove(item.id)} 
                  style={{
                    position: 'absolute', right: '0.5rem', top: '0.5rem',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'hsl(var(--error))', opacity: 0.45, padding: '4px',
                    minWidth: '28px', minHeight: '28px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  /* ——— Section Card wrapper ——— */
  const SectionCard = ({ icon, title, accent, children }: { icon: React.ReactNode; title: string; accent?: string; children: React.ReactNode }) => (
    <section className="card" style={{
      padding: 0, borderRadius: '16px',
      border: '1px solid hsl(var(--border) / 0.35)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)',
      overflow: 'visible'
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        background: accent || 'linear-gradient(135deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--primary) / 0.02) 100%)',
        borderBottom: '1px solid hsl(var(--border) / 0.3)',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        borderRadius: '16px 16px 0 0'
      }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'hsl(var(--primary) / 0.12)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          {icon}
        </div>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'hsl(var(--text))', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{title}</h3>
      </div>
      <div style={{ padding: '1.5rem' }}>
        {children}
      </div>
    </section>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 1.25rem 8rem' }}>

        {/* ══════════ HEADER ══════════ */}
        <header style={{
          padding: '1.5rem 0', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => isEditing ? setIsEditing(false) : navigate(-1)}
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                border: '1.5px solid hsl(var(--border))',
                background: 'hsl(var(--surface))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0
              }}
            >
              <ChevronLeft size={20} color="hsl(var(--text))" />
            </button>
            <div>
              <h1 style={{
                fontSize: '1.5rem', fontWeight: 900, color: 'hsl(var(--text))',
                letterSpacing: '-0.03em', lineHeight: 1.15
              }}>
                {isEditing ? (currentPlan?.id ? 'Editar Plano' : 'Novo Plano Mensal') : 'Planos de Aula'}
              </h1>
              {isEditing && (
                <p style={{ fontSize: '0.8rem', color: 'hsl(var(--text-light))', fontWeight: 500, marginTop: '0.15rem' }}>
                  Preencha as seções abaixo seguindo a BNCC
                </p>
              )}
            </div>
          </div>

          {!isEditing && (
            <button onClick={handleCreateNew} className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', minHeight: 'auto', fontSize: '0.85rem' }}>
              <Plus size={18} /> Novo Plano
            </button>
          )}
        </header>

        {/* ══════════ FORMULÁRIO DE EDIÇÃO ══════════ */}
        {isEditing && currentPlan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* ─── 1. IDENTIFICAÇÃO ─── */}
            <SectionCard icon={<Calendar size={18} color="hsl(var(--primary))" />} title="Identificação">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }} className="grid-mobile-1">
                <CustomSelect label="Disciplina" value={currentPlan.subject} options={subjects.map(s => ({ value: s, label: s }))} isOpen={openSubject} setIsOpen={setOpenSubject} onChange={(v: string) => setCurrentPlan({ ...currentPlan, subject: v })} />
                <CustomSelect label="Bimestre" value={String(currentPlan.bimester)} options={bimesterOptions} isOpen={openBimester} setIsOpen={setOpenBimester} onChange={(v: string) => setCurrentPlan({ ...currentPlan, bimester: v })} />
                <CustomSelect label="Mês de Referência" value={currentPlan.month} options={monthOptions} isOpen={openMonth} setIsOpen={setOpenMonth} onChange={(v: string) => setCurrentPlan({ ...currentPlan, month: v })} />
              </div>
            </SectionCard>

            {/* ─── 2. BASE PEDAGÓGICA (BNCC) ─── */}
            <SectionCard icon={<Target size={18} color="hsl(var(--primary))" />} title="Base Pedagógica (BNCC)">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-mobile-1">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {renderMultiselect(
                    "gerais", "Competências Gerais", "Pesquise ou selecione da lista...",
                    genCompSearch, setGenCompSearch, genCompResults, searchingGen, selectedGenObjects,
                    (it) => { if(!selectedGenIds.includes(it.id)) { setSelectedGenIds([...selectedGenIds, it.id]); setSelectedGenObjects([...selectedGenObjects, it]); setGenCompSearch(''); } },
                    (id) => { setSelectedGenIds(selectedGenIds.filter(i => i !== id)); setSelectedGenObjects(selectedGenObjects.filter(o => o.id !== id)) }
                  )}
                  <FormGroup label="Complemento (Gerais)" placeholder="Observações customizadas..." value={currentPlan.custom_general_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_general_comp: v })} height="70px" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {renderMultiselect(
                    "especificas", "Competências Específicas", "Busque por tema ou área...",
                    specCompSearch, setSpecCompSearch, specCompResults, searchingSpec, selectedSpecObjects,
                    (it) => { if(!selectedSpecIds.includes(it.id)) { setSelectedSpecIds([...selectedSpecIds, it.id]); setSelectedSpecObjects([...selectedSpecObjects, it]); setSpecCompSearch(''); } },
                    (id) => { setSelectedSpecIds(selectedSpecIds.filter(i => i !== id)); setSelectedSpecObjects(selectedSpecObjects.filter(o => o.id !== id)) }
                  )}
                  <FormGroup label="Complemento (Específicas)" placeholder="Observações específicas..." value={currentPlan.custom_specific_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_specific_comp: v })} height="70px" />
                </div>
              </div>
            </SectionCard>

            {/* ─── 3. DESENVOLVIMENTO MENSAL ─── */}
            <SectionCard icon={<LayoutList size={18} color="hsl(var(--primary))" />} title="Desenvolvimento Mensal">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-mobile-1">
                {/* Coluna esquerda */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <FormGroup label="Objeto(s) de Conhecimento" placeholder="Conteúdos do bimestre..." value={currentPlan.knowledge_objects} onChange={(v: string) => setCurrentPlan({ ...currentPlan, knowledge_objects: v })} height="110px" />
                  {renderMultiselect(
                    "habilidades", "Habilidades (BNCC)", "Pesquise por código ou descrição...",
                    bnccSearch, setBnccSearch, bnccResults, searchingBNCC, selectedBnccObjects,
                    (it) => { if(!selectedBnccIds.includes(it.id)) { setSelectedBnccIds([...selectedBnccIds, it.id]); setSelectedBnccObjects([...selectedBnccObjects, it]); setBnccSearch(''); } },
                    (id) => { setSelectedBnccIds(selectedBnccIds.filter(i => i !== id)); setSelectedBnccObjects(selectedBnccObjects.filter(o => o.id !== id)) }
                  )}
                  <FormGroup label="Outras Habilidades" placeholder="Habilidades específicas da escola..." value={currentPlan.skills} onChange={(v: string) => setCurrentPlan({ ...currentPlan, skills: v })} height="70px" />
                </div>
                {/* Coluna direita */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <FormGroup label="Cronograma Semanal" placeholder="Semana 1: ...&#10;Semana 2: ...&#10;Semana 3: ...&#10;Semana 4: ..." value={currentPlan.programmatic_content} onChange={(v: string) => setCurrentPlan({ ...currentPlan, programmatic_content: v })} height="160px" />
                  <FormGroup label="Metodologia" placeholder="Aulas expositivas, trabalhos em grupo, projetos..." value={currentPlan.methodology} onChange={(v: string) => setCurrentPlan({ ...currentPlan, methodology: v })} height="160px" />
                </div>
              </div>
            </SectionCard>

            {/* ─── 4. AVALIAÇÃO E RECURSOS ─── */}
            <SectionCard icon={<CheckCircle2 size={18} color="hsl(var(--primary))" />} title="Avaliação e Recursos">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }} className="grid-mobile-1">
                <FormGroup label="Procedimentos Avaliativos" placeholder="Como o desempenho será avaliado..."
                  value={currentPlan.evaluation} onChange={(v: string) => setCurrentPlan({ ...currentPlan, evaluation: v })} height="110px" />
                <FormGroup label="Recursos e Referências" placeholder="Livros, quadro, internet, projetor..."
                  value={currentPlan.resources} onChange={(v: string) => setCurrentPlan({ ...currentPlan, resources: v })} height="110px" />
              </div>
            </SectionCard>

            {/* ─── AÇÕES ─── */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '0.75rem',
              paddingTop: '1rem'
            }}>
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 2rem', fontWeight: 700, fontSize: '0.85rem' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 2.5rem', fontSize: '0.85rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={18} /> Salvar Planejamento</>}
              </button>
            </div>
          </div>

        ) : (
          /* ══════════ LISTA DE PLANOS ══════════ */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
            {plans.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '5rem 2rem', textAlign: 'center' }}>
                <div style={{
                  width: '72px', height: '72px', borderRadius: '50%',
                  background: 'hsl(var(--primary) / 0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.25rem'
                }}>
                  <FileText size={32} color="hsl(var(--primary))" style={{ opacity: 0.4 }} />
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'hsl(var(--text))' }}>Nenhum plano encontrado</h2>
                <p style={{ color: 'hsl(var(--text-light))', maxWidth: '280px', margin: '0.4rem auto 1.25rem', fontSize: '0.85rem' }}>
                  Comece a planejar suas aulas seguindo o modelo mensal.
                </p>
                <button onClick={handleCreateNew} className="btn btn-primary" style={{ padding: '0.6rem 1.25rem', minHeight: 'auto', fontSize: '0.85rem' }}>
                  <Plus size={18} /> Criar Primeiro Plano
                </button>
              </div>
            ) : (
              plans.map(plan => (
                <div key={plan.id} className="card" style={{
                  borderRadius: '14px', padding: '1.25rem',
                  border: '1px solid hsl(var(--border) / 0.35)',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem',
                  transition: 'box-shadow 0.2s, transform 0.2s',
                  cursor: 'pointer'
                }}
                onClick={() => handleEdit(plan)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      background: 'hsl(var(--primary) / 0.08)', color: 'hsl(var(--primary))',
                      padding: '0.3rem 0.7rem', borderRadius: '6px',
                      fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase'
                    }}>
                      {plan.month}
                    </span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'hsl(var(--text-light) / 0.5)' }}>
                      {new Date(plan.date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'hsl(var(--text))', lineHeight: 1.25 }}>{plan.subject}</h3>
                    <p style={{ fontSize: '0.78rem', color: 'hsl(var(--text-light))', fontWeight: 500, marginTop: '0.1rem' }}>{plan.bimester}º Bimestre • {plan.type}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
                    <button onClick={(e) => { e.stopPropagation(); handleEdit(plan) }} style={{
                      flex: 1, padding: '0.55rem', background: 'hsl(var(--primary) / 0.06)',
                      color: 'hsl(var(--primary))', borderRadius: '8px', border: 'none',
                      fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem'
                    }}>
                      <Edit3 size={14} /> Editar
                    </button>
                    <button onClick={(e) => e.stopPropagation()} style={{
                      padding: '0.55rem 0.7rem', background: 'hsl(var(--error) / 0.06)',
                      color: 'hsl(var(--error))', borderRadius: '8px', border: 'none', cursor: 'pointer'
                    }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════
   SUB-COMPONENTS
   ══════════════════════════════════════ */

const CustomSelect = ({ label, icon, value, options, isOpen, setIsOpen, onChange }: any) => {
  const selectedLabel = options.find((o: any) => o.value === value)?.label || 'Selecione...'

  return (
    <div
      className={`input ${isOpen ? 'active' : ''}`}
      style={{
        padding: '0.55rem 1rem', display: 'flex', flexDirection: 'column',
        borderRadius: '12px', position: 'relative', cursor: 'pointer',
        width: '100%', justifyContent: 'center', minHeight: '56px',
        borderColor: isOpen ? 'hsl(var(--primary))' : undefined,
        boxShadow: isOpen ? '0 0 0 3px hsl(var(--primary) / 0.1)' : undefined,
        backgroundColor: isOpen ? '#fff' : 'hsl(var(--background))'
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{
        fontSize: '0.6rem', fontWeight: 800, color: 'hsl(var(--text-light))',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.15rem'
      }}>
        {icon || <Calendar size={10} />} {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'hsl(var(--text))' }}>{selectedLabel}</span>
        <ChevronDown size={15} color="hsl(var(--text-light))" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            backgroundColor: 'white', borderRadius: '12px',
            boxShadow: '0 8px 32px -6px rgba(0,0,0,0.15)',
            border: '1px solid hsl(var(--border) / 0.35)',
            zIndex: 100, overflow: 'hidden', padding: '0.35rem',
            maxHeight: '220px', overflowY: 'auto'
          }}>
            {options.map((opt: any) => (
              <div key={opt.value}
                style={{
                  padding: '0.65rem 0.9rem', fontSize: '0.85rem', fontWeight: 600,
                  borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s',
                  backgroundColor: opt.value === value ? 'hsl(var(--primary) / 0.06)' : 'transparent',
                  color: opt.value === value ? 'hsl(var(--primary))' : 'hsl(var(--text))'
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'hsl(225 60% 96%)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = opt.value === value ? 'hsl(250 100% 96%)' : 'transparent')}
                onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const FormGroup = ({ label, value, onChange, placeholder, height = '100px' }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
    <label style={{
      fontSize: '0.7rem', fontWeight: 800, color: 'hsl(var(--text-light))',
      textTransform: 'uppercase', letterSpacing: '0.04em', marginLeft: '0.15rem'
    }}>{label}</label>
    <textarea
      className="input"
      placeholder={placeholder}
      style={{
        minHeight: height, width: '100%', padding: '0.85rem 1rem',
        resize: 'vertical', lineHeight: 1.5
      }}
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  </div>
)
