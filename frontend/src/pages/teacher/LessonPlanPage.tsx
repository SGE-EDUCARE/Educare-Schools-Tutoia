import React, { useState, useEffect, useCallback, useRef } from 'react'
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
  ChevronDown,
  Book
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
  const [viewingPlan, setViewingPlan] = useState<LessonPlan | null>(null)
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

  // Controle de responsividade dinâmica
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
      // Limpar o payload para enviar apenas dados crus e IDs
      const { 
        bncc_skills, 
        bncc_general_comp, 
        bncc_specific_comp, 
        ...cleanPlan 
      } = currentPlan as any

      await api('/teacher/lesson-plans', {
        method: 'POST',
        body: JSON.stringify({ 
          ...cleanPlan, 
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
    onRemove: (id: string) => void,
    variantColor: string = 'hsl(var(--primary))',
    isMobile: boolean = false
  ) => {
    const isOpen = activeDropdown === dropdownKey
    const showResults = isOpen && results.length > 0

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.35rem' : '0.5rem' }}>
        <label style={{
          fontSize: isMobile ? '0.7rem' : '0.75rem', 
          fontWeight: 800, color: 'hsl(var(--text))',
          textTransform: 'uppercase', letterSpacing: '0.05em', 
          marginLeft: isMobile ? '0.15rem' : '0.2rem',
          opacity: 0.8
        }}>{label}</label>

        <div style={{ position: 'relative' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <input 
              type="text" 
              className="input" 
              placeholder={placeholder}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setActiveDropdown(dropdownKey)}
              onClick={() => setActiveDropdown(dropdownKey)}
              onBlur={() => {
                setTimeout(() => {
                  setActiveDropdown(current => current === dropdownKey ? null : current)
                }, 300)
              }}
              style={{ 
                width: '100%', 
                backgroundColor: 'white',
                paddingRight: '3rem',
                paddingTop: isMobile ? '0.85rem' : '1rem',
                paddingBottom: isMobile ? '0.85rem' : '1rem',
                fontSize: isMobile ? '0.9rem' : '1rem',
                borderRadius: isMobile ? '16px' : '20px',
                boxShadow: isOpen ? '0 0 0 4px ' + variantColor + '22' : 'none',
                borderColor: isOpen ? variantColor : undefined
              }}
            />
            <div style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: '0.5rem' }}>
              {searching ? (
                <Loader2 size={isMobile ? 14 : 16} className="animate-spin" color={variantColor} />
              ) : (
                <Target size={isMobile ? 14 : 16} color="hsl(var(--text-light) / 0.4)" />
              )}
            </div>
          </div>
          
          {showResults && (
            <div 
              onMouseDown={(e) => e.preventDefault()}
              className="glass"
              style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                borderRadius: '16px',
                boxShadow: '0 12px 40px -8px rgba(0,0,0,0.15)',
                zIndex: 500, border: '1px solid hsl(var(--border) / 0.5)',
                overflowY: 'auto', maxHeight: '280px'
              }}
            >
              {results.map(res => (
                <div
                  key={res.id}
                  onClick={() => { onAdd(res); setSearch(''); setActiveDropdown(null) }}
                  className="dropdown-item"
                  style={{ 
                    padding: isMobile ? '0.8rem 1rem' : '1rem 1.25rem', 
                    cursor: 'pointer',
                    borderBottom: '1px solid hsl(var(--border) / 0.2)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.03)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span style={{ 
                      backgroundColor: variantColor, color: 'white', 
                      padding: '0.15rem 0.45rem', borderRadius: '6px', 
                      fontSize: isMobile ? '0.6rem' : '0.65rem', fontWeight: 900 
                    }}>
                      {res.code || res.number || 'BNCC'}
                    </span>
                    <div style={{ fontWeight: 800, color: 'hsl(var(--text))', fontSize: isMobile ? '0.8rem' : '0.85rem' }}>
                      {res.title || ''}
                    </div>
                  </div>
                  <div style={{
                    fontSize: isMobile ? '0.75rem' : '0.78rem', 
                    fontWeight: 500, color: 'hsl(var(--text-light))',
                    lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{res.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selected.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.5rem' : '0.75rem', marginTop: '0.5rem' }}>
            {selected.map(item => (
              <div key={item.id} className="animate-scale-in" style={{ 
                backgroundColor: 'white', color: 'hsl(var(--text))', 
                padding: isMobile ? '0.85rem 1rem' : '1rem 1.25rem', 
                borderRadius: isMobile ? '16px' : '20px', 
                display: 'flex', gap: isMobile ? '0.75rem' : '1rem', 
                alignItems: 'flex-start',
                border: '1px solid hsl(var(--border) / 0.6)',
                boxShadow: '0 4px 12px -4px rgba(0,0,0,0.05)',
                position: 'relative'
              }}>
                <div style={{ 
                  width: '4px', alignSelf: 'stretch', borderRadius: '4px',
                  backgroundColor: variantColor, flexShrink: 0
                }} />
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span style={{ 
                      fontSize: isMobile ? '0.65rem' : '0.7rem', 
                      fontWeight: 900, color: variantColor,
                      textTransform: 'uppercase', letterSpacing: '0.05em'
                    }}>
                      {item.code || item.number || 'Referência'}
                    </span>
                    {item.title && <span style={{ width: '3px', height: '3px', backgroundColor: 'hsl(var(--text-light) / 0.3)', borderRadius: '50%' }} />}
                    <span style={{ fontWeight: 800, fontSize: isMobile ? '0.75rem' : '0.8rem', color: 'hsl(var(--text))' }}>{item.title}</span>
                  </div>
                  <div style={{ 
                    fontSize: isMobile ? '0.75rem' : '0.8rem', 
                    fontWeight: 500, lineHeight: 1.5, color: 'hsl(var(--text))' 
                  }}>
                    {item.description}
                  </div>
                </div>

                <button 
                  onClick={() => onRemove(item.id)} 
                  className="btn-ghost"
                  style={{
                    alignSelf: 'flex-start', color: 'hsl(var(--error))',
                    opacity: 0.6, padding: '4px', minWidth: '28px', minHeight: '28px',
                    borderRadius: '8px'
                  }}
                >
                  <Trash2 size={isMobile ? 14 : 16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'hsl(var(--background))' }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: isMobile ? '0 0.75rem 6rem' : '0 2rem 10rem' 
      }}>

        {/* ══════════ HEADER ══════════ */}
        <header style={{
          padding: '2rem 0', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', gap: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button
              onClick={() => isEditing ? setIsEditing(false) : navigate(-1)}
              className="card-interactive"
              style={{
                width: '52px', height: '52px', borderRadius: '16px',
                border: '1px solid hsl(var(--border) / 0.6)',
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <ChevronLeft size={26} color="hsl(var(--text))" />
            </button>
            <div>
              <h1 style={{
                fontSize: '2.1rem', fontWeight: 950, color: 'hsl(var(--text))',
                letterSpacing: '-0.04em', lineHeight: 1.1
              }}>
                {isEditing ? (currentPlan?.id ? 'Editar Planejamento' : 'Novo Plano Mensal') : 'Planos de Aula'}
              </h1>
              {isEditing && (
                <p style={{ fontSize: '1rem', color: 'hsl(var(--text-light))', fontWeight: 500, marginTop: '0.35rem' }}>
                  Organize sua prática pedagógica seguindo as diretrizes da BNCC
                </p>
              )}
            </div>
          </div>

          {!isEditing && (
            <button onClick={handleCreateNew} className="btn btn-primary" style={{ padding: '0.9rem 2rem', borderRadius: '16px', fontSize: '1.05rem' }}>
              <Plus size={24} /> <span className="desktop-only" style={{ marginLeft: '0.3rem' }}>Novo Plano</span>
            </button>
          )}
        </header>

        {/* ══════════ FORMULÁRIO DE EDIÇÃO ══════════ */}
        {isEditing && currentPlan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1.5rem' : '2.5rem' }} className="animate-slide-up">

            {/* ─── 1. IDENTIFICAÇÃO ─── */}
            <SectionCard 
              isMobile={isMobile}
              icon={<Calendar color="hsl(var(--primary))" />} 
              title="Informações do Período"
              accent="linear-gradient(135deg, hsl(250 100% 98%) 0%, hsl(250 100% 95%) 100%)"
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: isMobile ? '0.75rem' : '1.25rem' }} className="grid-mobile-1">
                <CustomSelect isMobile={isMobile} label="Disciplina" icon={<FileText size={isMobile ? 14 : 16}/>} value={currentPlan.subject} options={subjects.map(s => ({ value: s, label: s }))} isOpen={openSubject} setIsOpen={setOpenSubject} onChange={(v: string) => setCurrentPlan({ ...currentPlan, subject: v })} />
                <CustomSelect isMobile={isMobile} label="Bimestre" value={String(currentPlan.bimester)} options={bimesterOptions} isOpen={openBimester} setIsOpen={setOpenBimester} onChange={(v: string) => setCurrentPlan({ ...currentPlan, bimester: v })} />
                <CustomSelect isMobile={isMobile} label="Mês de Referência" value={currentPlan.month} options={monthOptions} isOpen={openMonth} setIsOpen={setOpenMonth} onChange={(v: string) => setCurrentPlan({ ...currentPlan, month: v })} />
              </div>
            </SectionCard>

            {/* ─── 2. BASE PEDAGÓGICA (BNCC) ─── */}
            <SectionCard 
              isMobile={isMobile}
              icon={<Target color="hsl(260 90% 60%)" />} 
              title="Competências BNCC"
              accent="linear-gradient(135deg, hsl(260 100% 98%) 0%, hsl(260 100% 95%) 100%)"
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? '1.5rem' : '2rem' }} className="grid-mobile-1">
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.5rem' }}>
                  {renderMultiselect(
                    "gerais", "Competências Gerais", "Pesquise por tema...",
                    genCompSearch, setGenCompSearch, genCompResults, searchingGen, selectedGenObjects,
                    (it) => { if(!selectedGenIds.includes(it.id)) { setSelectedGenIds([...selectedGenIds, it.id]); setSelectedGenObjects([...selectedGenObjects, it]); setGenCompSearch(''); } },
                    (id) => { setSelectedGenIds(selectedGenIds.filter(i => i !== id)); setSelectedGenObjects(selectedGenObjects.filter(o => o.id !== id)) },
                    'hsl(260 85% 60%)',
                    isMobile
                  )}
                  <FormGroup isMobile={isMobile} label="Anotações de Competências Gerais" placeholder="Complemente as competências..." value={currentPlan.custom_general_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_general_comp: v })} height="80px" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.5rem' }}>
                  {renderMultiselect(
                    "especificas", "Competências Específicas", "Busque por área...",
                    specCompSearch, setSpecCompSearch, specCompResults, searchingSpec, selectedSpecObjects,
                    (it) => { if(!selectedSpecIds.includes(it.id)) { setSelectedSpecIds([...selectedSpecIds, it.id]); setSelectedSpecObjects([...selectedSpecObjects, it]); setSpecCompSearch(''); } },
                    (id) => { setSelectedSpecIds(selectedSpecIds.filter(i => i !== id)); setSelectedSpecObjects(selectedSpecObjects.filter(o => o.id !== id)) },
                    'hsl(230 85% 60%)',
                    isMobile
                  )}
                  <FormGroup isMobile={isMobile} label="Anotações de Competências Específicas" placeholder="Observações específicas..." value={currentPlan.custom_specific_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_specific_comp: v })} height="80px" />
                </div>
              </div>
            </SectionCard>

            {/* ─── 3. DESENVOLVIMENTO MENSAL ─── */}
            <SectionCard 
              isMobile={isMobile}
              icon={<LayoutList color="hsl(210 90% 55%)" />} 
              title="Planejamento e Desenvolvimento"
              accent="linear-gradient(135deg, hsl(210 100% 98%) 0%, hsl(210 100% 96%) 100%)"
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr', gap: isMobile ? '1.5rem' : '2rem' }} className="grid-mobile-1">
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.5rem' }}>
                  <FormGroup isMobile={isMobile} label="Objeto(s) de Conhecimento" placeholder="O que será ensinado?" value={currentPlan.knowledge_objects} onChange={(v: string) => setCurrentPlan({ ...currentPlan, knowledge_objects: v })} height="120px" />
                  {renderMultiselect(
                    "habilidades", "Habilidades (BNCC)", "Código ou descrição...",
                    bnccSearch, setBnccSearch, bnccResults, searchingBNCC, selectedBnccObjects,
                    (it) => { if(!selectedBnccIds.includes(it.id)) { setSelectedBnccIds([...selectedBnccIds, it.id]); setSelectedBnccObjects([...selectedBnccObjects, it]); setBnccSearch(''); } },
                    (id) => { setSelectedBnccIds(selectedBnccIds.filter(i => i !== id)); setSelectedBnccObjects(selectedBnccObjects.filter(o => o.id !== id)) },
                    'hsl(210 85% 55%)',
                    isMobile
                  )}
                  <FormGroup isMobile={isMobile} label="Habilidades Próprias" placeholder="Habilidades não previstas na BNCC..." value={currentPlan.skills} onChange={(v: string) => setCurrentPlan({ ...currentPlan, skills: v })} height="80px" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '1.5rem' }}>
                  <FormGroup isMobile={isMobile} label="Cronograma Detalhado" placeholder="Distribuição do conteúdo pelas semanas..." value={currentPlan.programmatic_content} onChange={(v: string) => setCurrentPlan({ ...currentPlan, programmatic_content: v })} height="180px" />
                  <FormGroup isMobile={isMobile} label="Metodologias e Estratégias" placeholder="Como o conteúdo será trabalhado?" value={currentPlan.methodology} onChange={(v: string) => setCurrentPlan({ ...currentPlan, methodology: v })} height="180px" />
                </div>
              </div>
            </SectionCard>

            {/* ─── 4. AVALIAÇÃO E RECURSOS ─── */}
            <SectionCard 
              isMobile={isMobile}
              icon={<CheckCircle2 color="hsl(160 80% 45%)" />} 
              title="Recursos e Avaliação"
              accent="linear-gradient(135deg, hsl(160 100% 98%) 0%, hsl(160 100% 96%) 100%)"
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: isMobile ? '1rem' : '1.5rem' }} className="grid-mobile-1">
                <FormGroup isMobile={isMobile} label="Critérios de Avaliação" placeholder="Como o aprendizado será verificado?"
                  value={currentPlan.evaluation} onChange={(v: string) => setCurrentPlan({ ...currentPlan, evaluation: v })} height="120px" />
                <FormGroup isMobile={isMobile} label="Ferramentas e Referências" placeholder="Recursos utilizados no bimestre..."
                  value={currentPlan.resources} onChange={(v: string) => setCurrentPlan({ ...currentPlan, resources: v })} height="120px" />
              </div>
            </SectionCard>

            {/* ─── AÇÕES ─── */}
            <div style={{
              display: 'flex', justifyContent: 'flex-end', gap: '1rem',
              paddingTop: '1.5rem', borderTop: '1px solid hsl(var(--border) / 0.4)'
            }}>
              <button
                onClick={() => setIsEditing(false)}
                disabled={saving}
                className="btn btn-secondary"
                style={{ padding: '0.75rem 2rem', fontWeight: 700, borderRadius: '14px' }}
              >
                Descartar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn btn-primary"
                style={{
                  padding: '0.75rem 3rem', borderRadius: '14px', fontWeight: 800,
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  opacity: saving ? 0.7 : 1
                }}
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <><CheckCircle2 size={20} /> Salvar Plano</>}
              </button>
            </div>
          </div>

        ) : (
          /* ══════════ LISTA DE PLANOS ══════════ */
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(360px, 1fr))', 
            gap: isMobile ? '1rem' : '2rem' 
          }} className="animate-fade-in">
            {plans.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '6rem 2rem', textAlign: 'center' }} className="card">
                <div style={{
                  width: '88px', height: '88px', borderRadius: '28px',
                  background: 'hsl(var(--primary) / 0.05)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 1.5rem', transform: 'rotate(-5deg)'
                }}>
                  <FileText size={40} color="hsl(var(--primary))" style={{ opacity: 0.4 }} />
                </div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'hsl(var(--text))' }}>Nenhum plano ativo</h2>
                <p style={{ color: 'hsl(var(--text-light))', maxWidth: '300px', margin: '0.5rem auto 1.5rem', fontSize: '0.9rem', lineHeight: 1.5 }}>
                  Seus planos mensais aparecerão aqui. Comece um novo agora!
                </p>
                <button onClick={handleCreateNew} className="btn btn-primary" style={{ padding: '0.75rem 2rem', borderRadius: '14px' }}>
                  <Plus size={20} /> Iniciar Planejamento
                </button>
              </div>
            ) : (
              plans.map(plan => {
                // Cálculo de preenchimento (versão completa e justa)
                const checkString = (s?: string) => s && s.trim().length > 0
                const checkArray = (a?: any[]) => a && a.length > 0
                
                const steps = [
                  checkArray(plan.bncc_skills) || checkString(plan.skills),
                  checkArray(plan.bncc_general_comp) || checkString(plan.custom_general_comp),
                  checkArray(plan.bncc_specific_comp) || checkString(plan.custom_specific_comp),
                  checkString(plan.knowledge_objects),
                  checkString(plan.programmatic_content),
                  checkString(plan.methodology),
                  checkString(plan.evaluation),
                  checkString(plan.resources),
                  checkString(plan.references)
                ]
                
                const filled = steps.filter(Boolean).length
                const progress = Math.round((filled / steps.length) * 100)
                const color = progress === 100 ? 'hsl(var(--success))' : progress > 50 ? 'hsl(var(--primary))' : 'hsl(var(--warning))'

                return (
                  <div key={plan.id} className="card-interactive-premium" style={{
                    borderRadius: isMobile ? '28px' : '32px', 
                    padding: isMobile ? '1.5rem' : '2.25rem',
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)',
                    backdropFilter: 'blur(24px)',
                    border: '1px solid rgba(255, 255, 255, 0.4)',
                    display: 'flex', flexDirection: 'column', gap: '1.75rem',
                    position: 'relative', overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                    boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.08), 0 2px 4px -1px rgba(0, 0, 0, 0.02)',
                    cursor: 'default'
                  }}>
                    {/* Glow Accent */}
                    <div style={{
                      position: 'absolute', top: '-20px', right: '-20px', width: '80px', height: '80px',
                      background: color, filter: 'blur(40px)', opacity: 0.15, pointerEvents: 'none'
                    }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <div style={{
                          background: 'white', color: 'hsl(var(--text))',
                          padding: '0.45rem 1rem', borderRadius: '14px',
                          fontSize: '0.72rem', fontWeight: 950, textTransform: 'uppercase', 
                          letterSpacing: '0.06em', border: '1px solid hsl(var(--border) / 0.3)',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                          display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }} />
                          {plan.month}
                        </div>
                        <div style={{
                          background: 'hsl(var(--primary) / 0.05)', color: 'hsl(var(--primary))',
                          padding: '0.45rem 1rem', borderRadius: '14px',
                          fontSize: '0.72rem', fontWeight: 950,
                          border: '1px solid hsl(var(--primary) / 0.1)'
                        }}>{plan.bimester}º Bimestre</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
                      <div style={{
                        width: '56px', height: '56px', borderRadius: '18px',
                        background: 'hsl(var(--primary) / 0.05)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'hsl(var(--primary))', flexShrink: 0,
                        boxShadow: 'inset 0 0 0 1px hsl(var(--primary) / 0.1)'
                      }}>
                        <Book size={28} style={{ opacity: 0.8 }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ 
                          fontSize: isMobile ? '1.2rem' : '1.45rem', 
                          fontWeight: 1000, color: 'hsl(var(--text))', 
                          lineHeight: 1.15, letterSpacing: '-0.04em',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                        }}>{plan.subject}</h3>
                        <div style={{ 
                          marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem',
                          fontSize: '0.85rem', color: 'hsl(var(--text-light))', fontWeight: 650 
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Calendar size={15} style={{ opacity: 0.6 }} /> {new Date(plan.date).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.6rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: 'hsl(var(--text-light))', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Status do Plano
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: 1000, color: color }}>
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', height: '8px', background: 'hsl(var(--border) / 0.2)', 
                        borderRadius: '20px', overflow: 'hidden', position: 'relative',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)'
                      }}>
                        <div style={{ 
                          width: `${progress}%`, height: '100%', backgroundColor: color, 
                          transition: 'width 1.2s cubic-bezier(0.65, 0, 0.35, 1)',
                          boxShadow: `0 0 12px ${color}44` 
                        }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.85rem', marginTop: '0.5rem' }}>
                      <button 
                        onClick={() => setViewingPlan(plan)} 
                        className="btn"
                        style={{
                          flex: 1, background: 'white', border: '1.5px solid hsl(var(--border) / 0.8)',
                          color: 'hsl(var(--text))', borderRadius: '18px',
                          fontWeight: 900, fontSize: isMobile ? '0.82rem' : '0.88rem', 
                          minHeight: isMobile ? '52px' : '56px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                          transition: 'all 0.2s'
                        }}
                      >
                        Visualizar
                      </button>
                      <button 
                        onClick={() => handleEdit(plan)} 
                        className="btn btn-primary"
                        style={{
                          flex: 1.2, borderRadius: '18px',
                          fontWeight: 900, fontSize: isMobile ? '0.82rem' : '0.88rem', 
                          minHeight: isMobile ? '52px' : '56px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.7rem',
                          background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--primary) / 0.85) 100%)',
                          boxShadow: '0 8px 24px -6px hsl(var(--primary) / 0.4)'
                        }}
                      >
                         <Edit3 size={19} /> Editar
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); if(confirm('Excluir este plano?')) api(`/teacher/lesson-plans/${plan.id}`, { method: 'DELETE' }).then(() => fetchPlans()) }} 
                        className="btn"
                        style={{
                          width: isMobile ? '44px' : '56px', 
                          height: isMobile ? '44px' : '56px', 
                          background: 'hsl(var(--error) / 0.05)', border: '1.5px solid transparent',
                          color: 'hsl(var(--error))', borderRadius: isMobile ? '14px' : '18px', 
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                          padding: 0,
                          position: isMobile ? 'absolute' : 'static',
                          top: isMobile ? '1.25rem' : 'auto',
                          right: isMobile ? '1.25rem' : 'auto',
                          zIndex: 5
                        }}
                      >
                        <Trash2 size={isMobile ? 20 : 24} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* ══════════ VISUALIZADOR DE PLANO ══════════ */}
        {viewingPlan && (
          <LessonPlanVisualizer 
            plan={viewingPlan} 
            onClose={() => setViewingPlan(null)} 
            isMobile={isMobile}
          />
        )}
      </div>
    </div>
  )
}

const SectionCard = ({ icon, title, accent, children, isMobile }: { icon: React.ReactNode; title: string; accent?: string; children: React.ReactNode; isMobile?: boolean }) => (
  <section className="card" style={{
    padding: 0, borderRadius: isMobile ? '20px' : '28px',
    border: '1px solid hsl(var(--border) / 0.5)',
    boxShadow: 'var(--shadow-md)',
    overflow: 'visible',
    backgroundColor: 'white'
  }}>
    <div style={{
      padding: isMobile ? '1rem 1.25rem' : '1.5rem 2rem',
      background: accent || 'white',
      borderBottom: '1px solid hsl(var(--border) / 0.3)',
      display: 'flex', alignItems: 'center', gap: isMobile ? '0.75rem' : '1.25rem',
      borderRadius: isMobile ? '20px 20px 0 0' : '28px 28px 0 0'
    }}>
      <div style={{
        width: isMobile ? '42px' : '50px', 
        height: isMobile ? '42px' : '50px', 
        borderRadius: isMobile ? '12px' : '16px',
        background: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', 
        flexShrink: 0, boxShadow: 'var(--shadow-sm)', border: '1px solid hsl(var(--border) / 0.4)'
      }}>
        {icon}
      </div>
      <h3 style={{ fontSize: isMobile ? '1rem' : '1.15rem', fontWeight: 900, color: 'hsl(var(--text))', letterSpacing: '0.02em' }}>{title}</h3>
    </div>
    <div style={{ padding: isMobile ? '1.25rem' : '2rem' }}>
      {children}
    </div>
  </section>
)

const CustomSelect = ({ label, icon, value, options, isOpen, setIsOpen, onChange, isMobile }: any) => {
  const selectedLabel = options.find((o: any) => o.value === value)?.label || 'Selecione...'

  return (
    <div
      className={`input ${isOpen ? 'active' : ''}`}
      style={{
        padding: isMobile ? '0.6rem 1.25rem' : '0.8rem 1.5rem', 
        display: 'flex', flexDirection: 'column',
        borderRadius: isMobile ? '16px' : '20px', 
        position: 'relative', cursor: 'pointer',
        width: '100%', justifyContent: 'center', 
        minHeight: isMobile ? '64px' : '74px',
        borderColor: isOpen ? 'hsl(var(--primary))' : undefined,
        boxShadow: isOpen ? '0 0 0 5px hsl(var(--primary) / 0.1)' : undefined,
        backgroundColor: isOpen ? '#fff' : 'hsl(var(--background))'
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div style={{
        fontSize: isMobile ? '0.7rem' : '0.75rem', 
        fontWeight: 900, color: 'hsl(var(--text-light))',
        textTransform: 'uppercase', letterSpacing: '0.06em',
        display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem'
      }}>
        {icon || <Calendar size={isMobile ? 12 : 14} />} {label}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: isMobile ? '1rem' : '1.1rem', fontWeight: 700, color: 'hsl(var(--text))' }}>{selectedLabel}</span>
        <ChevronDown size={isMobile ? 18 : 22} color="hsl(var(--text-light))" style={{ transition: 'transform 0.3s', transform: isOpen ? 'rotate(180deg)' : 'none' }} />
      </div>

      {isOpen && (
        <>
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }} onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} />
          <div className="glass animate-scale-in" style={{
            position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
            backgroundColor: 'white', borderRadius: '18px',
            boxShadow: '0 12px 40px -8px rgba(0,0,0,0.2)',
            border: '1px solid hsl(var(--border) / 0.5)',
            zIndex: 100, overflow: 'hidden', padding: '0.5rem',
            maxHeight: '260px', overflowY: 'auto'
          }}>
            {options.map((opt: any) => (
              <div key={opt.value}
                style={{
                  padding: '0.85rem 1rem', fontSize: '0.9rem', fontWeight: 700,
                  borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                  backgroundColor: opt.value === value ? 'hsl(var(--primary) / 0.08)' : 'transparent',
                  color: opt.value === value ? 'hsl(var(--primary))' : 'hsl(var(--text))',
                  marginBottom: '2px'
                }}
                onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.04)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = opt.value === value ? 'hsl(var(--primary) / 0.08)' : 'transparent')}
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

const FormGroup = ({ label, value, onChange, placeholder, height = '120px', isMobile }: any) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '0.45rem' : '0.65rem' }}>
      <label style={{
        fontSize: isMobile ? '0.8rem' : '0.9rem', 
        fontWeight: 850, color: 'hsl(var(--text))',
        textTransform: 'uppercase', letterSpacing: '0.05em', 
        marginLeft: isMobile ? '0.2rem' : '0.3rem',
        opacity: 0.8
      }}>{label}</label>
      <textarea
        ref={textareaRef}
        className="input"
        placeholder={placeholder}
        style={{
          minHeight: isMobile ? '80px' : height, 
          width: '100%', 
          padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.5rem',
          resize: 'none', 
          lineHeight: 1.6, 
          backgroundColor: 'white',
          fontSize: isMobile ? '0.95rem' : '1.1rem', 
          borderRadius: isMobile ? '16px' : '20px',
          overflow: 'hidden'
        }}
        value={value}
        onChange={e => onChange(e.target.value)}
      />
    </div>
  )
}

/* ══════════════════════════════════════
   VISUALIZADOR PREMIUM (MODAL DOCUMENTO)
   ══════════════════════════════════════ */

const LessonPlanVisualizer = ({ plan, onClose, isMobile }: { plan: LessonPlan; onClose: () => void; isMobile: boolean }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: isMobile ? '0' : '2rem'
    }} onClick={onClose}>
      
      <div 
        className="glass animate-scale-in"
        style={{
          width: '100%', maxWidth: '900px', maxHeight: isMobile ? '100%' : '90vh',
          backgroundColor: 'white', borderRadius: isMobile ? '0' : '32px',
          overflowY: 'auto', display: 'flex', flexDirection: 'column',
          boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)',
          position: 'relative'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header Visualizer */}
        <div style={{
          padding: isMobile ? '1.5rem' : '2rem 4rem', 
          borderBottom: '1px solid hsl(var(--border) / 0.4)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          position: 'sticky', top: 0, backgroundColor: 'white',
          zIndex: 10, boxShadow: '0 4px 20px -5px rgba(0,0,0,0.05)'
        }}>
          <div>
            <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.75rem', fontWeight: 950, color: 'hsl(var(--text))', letterSpacing: '-0.03em' }}>Plano de Aula</h2>
            <div style={{ fontSize: '0.9rem', color: 'hsl(var(--text-light))', fontWeight: 600, marginTop: '0.2rem' }}>
              {plan.subject} • {plan.month}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button 
              onClick={() => window.print()} 
              className="btn"
              style={{ padding: '0.75rem 1.25rem', borderRadius: '14px', background: 'hsl(var(--background))', fontWeight: 700, display: isMobile ? 'none' : 'flex' }}
            >
              Imprimir
            </button>
            <button 
              onClick={onClose} 
              className="btn btn-primary"
              style={{ width: '44px', height: '44px', padding: 0, borderRadius: '14px', boxShadow: '0 8px 20px -4px hsl(var(--primary) / 0.4)' }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Visualizer */}
        <div style={{ padding: isMobile ? '1.5rem' : '4rem', flex: 1, backgroundColor: '#fff', color: '#1a1a1a' }} className="print-content">
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            
            {/* 1. Cabeçalho do Documento (Visualização de Papel) */}
            <div style={{ textAlign: 'center', borderBottom: '1px solid #eee', paddingBottom: '2.5rem', marginBottom: '1rem' }}>
              <div style={{ 
                fontSize: '1.5rem', fontWeight: 950, textTransform: 'uppercase', 
                letterSpacing: '0.1em', color: 'hsl(var(--text))' 
              }}>Planejamento de Ensino</div>
              <div style={{ 
                color: 'hsl(var(--text-light))', marginTop: '0.5rem', 
                fontWeight: 700, fontSize: '0.9rem', letterSpacing: '0.02em' 
              }}>Unidade de Gestão Educacional • Ciclo {plan.bimester}º Bimestre</div>
            </div>

            {/* 2. Grades de Referência */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2rem' }}>
              <ViewSection label="Competências Gerais (BNCC)" icon={<Target size={18}/>}>
                {plan.bncc_general_comp?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {plan.bncc_general_comp.map(c => <BnccTag key={c.id} code={`CG${c.number}`} description={c.description} />)}
                  </div>
                ) : <EmptyText />}
                {plan.custom_general_comp && <blockquote style={{ margin: '1rem 0 0', paddingLeft: '1rem', borderLeft: '3px solid #eee', color: '#555' }}>{plan.custom_general_comp}</blockquote>}
              </ViewSection>

              <ViewSection label="Competências Específicas" icon={<Target size={18}/>}>
                {plan.bncc_specific_comp?.length ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {plan.bncc_specific_comp.map(c => <BnccTag key={c.id} code={c.code} description={c.description} />)}
                  </div>
                ) : <EmptyText />}
                {plan.custom_specific_comp && <blockquote style={{ margin: '1rem 0 0', paddingLeft: '1rem', borderLeft: '3px solid #eee', color: '#555' }}>{plan.custom_specific_comp}</blockquote>}
              </ViewSection>
            </div>

            <ViewSection label="Habilidades (BNCC)" icon={<FileText size={18}/>}>
              {plan.bncc_skills?.length ? (
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                  {plan.bncc_skills.map(s => <BnccTag key={s.id} code={s.code} description={s.description} />)}
                </div>
              ) : <EmptyText />}
              {plan.skills && <p style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '12px', fontSize: '0.95rem' }}>{plan.skills}</p>}
            </ViewSection>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1.5fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <ViewSection label="Objeto(s) de Conhecimento" icon={<LayoutList size={18}/>}>
                  <p style={{ lineHeight: 1.6 }}>{plan.knowledge_objects || '---'}</p>
                </ViewSection>
                <ViewSection label="Metodologias e Estratégias" icon={<LayoutList size={18}/>}>
                  <p style={{ lineHeight: 1.6 }}>{plan.methodology || '---'}</p>
                </ViewSection>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <ViewSection label="Conteúdo Programático Detalhado" icon={<Edit3 size={18}/>}>
                  <p style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{plan.programmatic_content || '---'}</p>
                </ViewSection>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '1.5rem' : '2rem' }}>
              <ViewSection label="Recursos Didáticos" icon={<CheckCircle2 size={18}/>}>
                <p>{plan.resources || '---'}</p>
              </ViewSection>
              <ViewSection label="Critérios de Avaliação" icon={<CheckCircle2 size={18}/>}>
                <p>{plan.evaluation || '---'}</p>
              </ViewSection>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div style={{ padding: '2rem', backgroundColor: '#fcfcfc', borderTop: '1px solid #eee', fontSize: '0.85rem', color: '#999', textAlign: 'center' }}>
          Documento gerado digitalmente via Sistema de Gestão Educacional • {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  )
}

const ViewSection = ({ label, icon, children }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'hsl(var(--primary))' }}>
      <div style={{ 
        width: '32px', height: '32px', borderRadius: '8px', 
        background: 'hsl(var(--primary) / 0.1)', display: 'flex', 
        alignItems: 'center', justifyContent: 'center' 
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
    </div>
    <div style={{ 
      fontSize: '1rem', color: '#333', lineHeight: 1.6, 
      wordBreak: 'break-word', overflowWrap: 'anywhere' 
    }}>
      {children}
    </div>
  </div>
)

const BnccTag = ({ code, description }: any) => (
  <div style={{ 
    padding: '1.25rem', backgroundColor: '#fcfcfd', borderRadius: '18px', 
    border: '1px solid #f0eff5', display: 'flex', gap: '1rem', alignItems: 'flex-start',
    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
  }}>
    <span style={{ 
      backgroundColor: 'hsl(var(--primary))', color: 'white', 
      padding: '0.25rem 0.6rem', borderRadius: '8px', 
      fontSize: '0.7rem', fontWeight: 950, flexShrink: 0,
      letterSpacing: '0.02em'
    }}>{code}</span>
    <span style={{ 
      fontSize: '0.85rem', lineHeight: 1.6, fontWeight: 550, 
      color: '#2d3748', wordBreak: 'break-word' 
    }}>{description}</span>
  </div>
)

const EmptyText = () => <span style={{ color: '#bbb', fontSize: '0.9rem', fontStyle: 'italic' }}>Nenhum item selecionado</span>
