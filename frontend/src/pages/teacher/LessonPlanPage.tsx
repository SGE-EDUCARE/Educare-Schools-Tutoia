import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'
import { 
  ChevronLeft, 
  Loader2, 
  FileText, 
  Calendar, 
  Plus, 
  Target, 
  LayoutList, 
  CheckCircle2,
  Trash2,
  Book,
  BookOpen,
  X
} from 'lucide-react'

// ══════════ TIPAGENS ══════════
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
  content?: string
  references?: string
  status?: string
  type: string
}

type BnccRef = {
  id: string
  code?: string
  number?: number
  title?: string
  description: string
}

interface ClassMetadata {
  id: string
  name: string
  grade: {
    id: string
    name: string
    level: {
      id: string
      name: string
    }
  }
}

interface MomentState {
  m1: string;
  m2: string;
  m3: string;
  m4: string;
  m5: string;
}

interface AgendaState {
  sala: string;
  casa: string;
}

// ══════════ CONSTANTES BNCC INFANTIL ══════════
const INFANTIL_CAMPOS = [
  "O eu, o outro e o nós",
  "Corpo, gestos e movimentos",
  "Traços, sons, cores e formas",
  "Escuta, fala, pensamento e imaginação",
  "Espaços, tempos, quantidades, relações e transformações"
]

const INFANTIL_DIREITOS = [
  "Conviver", "Brincar", "Participar", "Explorar", "Expressar", "Conhecer-se"
]

// ══════════ ELEMENTOS UI AUXILIARES ══════════
const SectionCard = ({ icon, title, accent, children, isMobile }: any) => (
  <section className="card" style={{ 
    padding: 0, 
    borderRadius: isMobile ? '18px' : '32px', 
    border: '1px solid rgba(0,0,0,0.02)', 
    background: 'white', 
    position: 'relative',
    boxShadow: isMobile ? '0 5px 20px rgba(0,0,0,0.02)' : '0 15px 45px rgba(0,0,0,0.04)',
    overflow: 'visible',
    width: '100%'
  }}>
    <div style={{ 
      padding: isMobile ? '1rem' : '1.5rem 2.5rem', 
      background: accent || '#fff', 
      borderBottom: '1px solid #f8f8f8', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem',
      borderTopLeftRadius: isMobile ? '18px' : '32px',
      borderTopRightRadius: isMobile ? '18px' : '32px'
    }}>
      <div style={{ 
        width: isMobile ? '36px' : '48px', 
        height: isMobile ? '36px' : '48px', 
        borderRadius: '12px', 
        background: 'white', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        color: 'hsl(var(--primary))'
      }}>
        {React.cloneElement(icon, { size: isMobile ? 18 : 24 })}
      </div>
      <h3 style={{ fontSize: isMobile ? '1rem' : '1.4rem', fontWeight: 900, letterSpacing: '-0.02em', color: '#1B2559' }}>{title}</h3>
    </div>
    <div style={{ padding: isMobile ? '1rem' : '2.5rem' }}>{children}</div>
  </section>
)

const CustomSelect = ({ label, value, options, isOpen, setIsOpen, onChange, id, isMobile }: any) => (
  <div className="input" data-select-id={id} style={{ 
    padding: isMobile ? '0.6rem 1rem' : '0.8rem 1.5rem', 
    borderRadius: isMobile ? '14px' : '18px', 
    position: 'relative', 
    cursor: 'pointer', 
    background: '#fcfcfc' 
  }} onClick={() => setIsOpen(!isOpen)}>
    <label style={{ fontSize: isMobile ? '0.65rem' : '0.75rem', fontWeight: 900, color: '#999', textTransform: 'uppercase' }}>{label}</label>
    <div style={{ fontWeight: 700, marginTop: '0.1rem', fontSize: isMobile ? '0.9rem' : '1rem' }}>{options.find((o: any) => o.value === value)?.label || 'Selecione...'}</div>
    {isOpen && (
      <div style={{ 
        position: 'absolute', top: 'calc(100% + 10px)', left: 0, right: 0, 
        backgroundColor: 'white', zIndex: 1000, borderRadius: '18px', 
        padding: '0.6rem', boxShadow: '0 20px 50px rgba(0,0,0,0.15)',
        border: '1px solid #eee', animation: 'scaleIn 0.2s ease-out'
      }}>
        {options.map((o: any) => (
          <div 
            key={o.value} 
            style={{ 
              padding: '0.85rem 1.25rem', borderRadius: '12px', cursor: 'pointer',
              backgroundColor: o.value === value ? 'hsl(var(--primary) / 0.08)' : 'transparent',
              color: o.value === value ? 'hsl(var(--primary))' : '#444',
              fontWeight: o.value === value ? 800 : 500,
              fontSize: '0.9rem', transition: 'all 0.2s'
            }} 
            onClick={(e) => { e.stopPropagation(); onChange(o.value); setIsOpen(false) }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'hsl(var(--primary) / 0.04)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = o.value === value ? 'hsl(var(--primary) / 0.08)' : 'transparent'}
          >
            {o.label}
          </div>
        ))}
      </div>
    )}
  </div>
)

const MultiCheckGroup = ({ label, options, selected, onChange }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
    <label style={{ fontSize: '0.85rem', fontWeight: 900, color: 'hsl(var(--text))', textTransform: 'uppercase', opacity: 0.8 }}>{label}</label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
      {options.map((opt: string) => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => isSelected ? onChange(selected.filter((s: string) => s !== opt)) : onChange([...selected, opt])}
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              border: '1px solid',
              borderColor: isSelected ? 'hsl(var(--primary))' : '#eee',
              backgroundColor: isSelected ? 'hsl(var(--primary))' : 'white',
              color: isSelected ? 'white' : '#666',
              boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
              textAlign: 'left'
            }}
          >
            {opt}
          </button>
        )
      })}
    </div>
  </div>
)

const FormGroup = ({ label, value, onChange, placeholder, onFocus, height, type = 'textarea' }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label style={{ fontSize: '0.85rem', fontWeight: 850, color: 'hsl(var(--text))', textTransform: 'uppercase', opacity: 0.8 }}>{label}</label>
    {type === 'textarea' ? (
      <textarea 
        className="input" 
        placeholder={placeholder}
        value={value} 
        onChange={e => onChange(e.target.value)} 
        onFocus={onFocus}
        style={{ minHeight: height || '120px', borderRadius: '18px', padding: '1.25rem', backgroundColor: '#fcfcfc', border: '1px solid #eee' }} 
      />
    ) : (
      <input 
        type="text"
        className="input" 
        placeholder={placeholder}
        value={value} 
        onChange={e => onChange(e.target.value)} 
        onFocus={onFocus}
        style={{ height: '56px', borderRadius: '18px', padding: '0 1.5rem', backgroundColor: '#fcfcfc', border: '1px solid #eee' }} 
      />
    )}
  </div>
)

const MultiSelectField = ({ label, selected, onRemove, onOpen, variantColor }: any) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: 850, color: 'hsl(var(--text))', textTransform: 'uppercase', opacity: 0.8 }}>{label}</label>
        <button type="button" onClick={onOpen} style={{ 
          fontSize: '0.75rem', fontWeight: 800, color: variantColor, 
          display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem',
          borderRadius: '10px', background: `${variantColor}10`, border: 'none', cursor: 'pointer'
        }}>
          <Plus size={14} /> ADICIONAR
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {selected.map((item: any) => (
          <div key={item.id} style={{ 
            backgroundColor: 'white', padding: '1rem', borderRadius: '16px', 
            border: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 900, color: variantColor, fontSize: '0.7rem' }}>{item.code || item.number}</span>
              <p style={{ fontSize: '0.85rem' }}>{item.description}</p>
            </div>
            <button type="button" onClick={() => onRemove(item.id)} style={{ color: '#ff4d4d', padding: '0.5rem', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
          </div>
        ))}
        {selected.length === 0 && <EmptyText />}
      </div>
    </div>
  )
}

const SelectionModal = ({ 
  isOpen, onClose, title, search, setSearch, results, searching, 
  onAdd, selectedObjects, onRemove, variantColor, levelInfo, isMobile 
}: any) => {
  if (!isOpen) return null;
  
  return (
    <div style={{ 
      position: 'fixed', inset: 0, 
      backgroundColor: 'rgba(25, 37, 89, 0.4)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: isMobile ? 'flex-end' : 'center', justifyContent: 'center', zIndex: 2000,
      padding: isMobile ? 0 : '1rem'
    }} onClick={onClose}>
      <div className={isMobile ? "animate-slide-up" : "animate-scale-in"} style={{ 
        width: '100%', 
        maxWidth: isMobile ? '100%' : '650px', 
        backgroundColor: '#ffffff', 
        borderRadius: isMobile ? '32px 32px 0 0' : '32px', 
        height: isMobile ? '92vh' : '85vh', 
        maxHeight: isMobile ? '92vh' : '85vh',
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: '0 -10px 40px rgba(0,0,0,0.1)', 
        border: '1px solid rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '2rem 2.5rem', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontWeight: 1000, fontSize: '1.4rem', letterSpacing: '-0.02em' }}>{title}</h3>
            <p style={{ fontSize: '0.75rem', color: '#999', fontWeight: 600 }}>
              {levelInfo.isInfantil ? 'Filtro ativo: Educação Infantil (EI)' : 'Filtro ativo: Ensino Fundamental (EF)'}
            </p>
          </div>
          <button onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f5f5f5', color: '#999', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Plus style={{ transform: 'rotate(45deg)' }} /></button>
        </div>
        
        {/* Search */}
        <div style={{ padding: '0 2.5rem 1.5rem', marginTop: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <FormGroup label="PESQUISAR" type="text" placeholder="Digite código ou descrição..." value={search} onChange={setSearch} />
            {searching && <div style={{ position: 'absolute', right: '1.5rem', bottom: '1.1rem' }}><Loader2 className="animate-spin" size={20} color={variantColor} /></div>}
          </div>
        </div>

        {/* Results */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 2.5rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {results.length > 0 ? (
            results.map((item: any) => {
              const isSelected = selectedObjects.some((o: any) => o.id === item.id)
              return (
                <div 
                  key={item.id} 
                  onClick={() => isSelected ? onRemove(item.id) : onAdd(item)} 
                  style={{ 
                    padding: '1.5rem', 
                    borderRadius: '16px', 
                    border: '2px solid',
                    borderColor: isSelected ? variantColor : '#cbd5e0',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    boxShadow: isSelected ? `0 10px 20px ${variantColor}15` : '0 2px 4px rgba(0,0,0,0.02)',
                    position: 'relative'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontWeight: 900, 
                      color: isSelected ? 'white' : variantColor, 
                      fontSize: '0.75rem', 
                      background: isSelected ? variantColor : `${variantColor}12`, 
                      padding: '0.35rem 0.7rem', 
                      borderRadius: '8px',
                      textTransform: 'uppercase' 
                    }}>{item.code || `Nº ${item.number}`}</span>
                    {isSelected && <div style={{ color: variantColor }}><CheckCircle2 size={22} fill="currentColor" color="white" /></div>}
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {item.title && (
                      <h4 style={{ 
                        fontSize: '1rem', 
                        fontWeight: 950, 
                        color: '#1B2559', 
                        lineHeight: '1.4' 
                      }}>
                        {item.title}
                      </h4>
                    )}
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#2d3748', 
                      lineHeight: '1.6', 
                      fontWeight: 500 
                    }}>
                      {item.description || 'Sem descrição.'}
                    </p>
                  </div>
                </div>
              )
            })
          ) : !searching ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', color: '#bbb', fontWeight: 600 }}>Nenhum resultado encontrado.</div>
          ) : null}
        </div>

        {/* Footer */}
        <div style={{ padding: '1.5rem 2.5rem', borderTop: '1px solid #f0f0f0', textAlign: 'right', background: '#fafafa' }}>
           <button onClick={onClose} style={{ 
             backgroundColor: variantColor, color: 'white', padding: '1rem 2.5rem', 
             borderRadius: '16px', fontWeight: 900, fontSize: '0.95rem', border: 'none', 
             cursor: 'pointer', boxShadow: `0 10px 25px ${variantColor}40`
           }}>Concluir Seleção</button>
        </div>
      </div>
    </div>
  )
}

const BnccTag = ({ code, description }: { code?: string, description: string }) => (
  <div style={{ 
    display: 'flex', gap: '1rem', padding: '1.25rem', borderRadius: '20px', 
    backgroundColor: 'white', border: '1px solid rgba(0,0,0,0.04)', 
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)', position: 'relative', overflow: 'hidden'
  }}>
    <div style={{ 
      padding: '0.4rem 0.8rem', borderRadius: '10px', backgroundColor: 'hsl(var(--primary))', 
      color: 'white', fontWeight: 1000, fontSize: '0.7rem', height: 'fit-content', flexShrink: 0,
      letterSpacing: '0.02em', boxShadow: '0 4px 10px hsl(var(--primary) / 0.2)'
    }}>
      {code}
    </div>
    <div style={{ fontSize: '0.85rem', lineHeight: 1.5, fontWeight: 600, color: '#444' }}>{description}</div>
  </div>
)

const ViewSection = ({ label, icon, children }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ 
        width: '36px', height: '36px', borderRadius: '10px', backgroundColor: 'hsl(var(--primary) / 0.08)', 
        color: 'hsl(var(--primary))', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {React.cloneElement(icon, { size: 18 })}
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#1B2559', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
    <div style={{ paddingLeft: '0.2rem', fontSize: '1rem', lineHeight: 1.6, color: '#333', fontWeight: 500 }}>{children}</div>
  </div>
)

const EmptyText = () => <span style={{ color: '#bbb', fontSize: '0.9rem', fontStyle: 'italic' }}>Nenhum item selecionado</span>

// ══════════ SUBCOMPONENTE: VISUALIZADOR ══════════
const LessonPlanVisualizer = ({ plan, onClose, isMobile, levelInfo }: { plan: LessonPlan; onClose: () => void; isMobile: boolean; levelInfo: any }) => {
  const parseJsonSafe = (str: any, def: any) => {
    if (typeof str === 'object') return str
    try { return JSON.parse(str || '{}') } catch { return def }
  }

  const moments = levelInfo.isFundamental1 ? parseJsonSafe(plan.programmatic_content, { m1: '', m2: '', m3: '', m4: '', m5: '' }) : null
  const agenda = levelInfo.isFundamental1 ? parseJsonSafe(plan.content, { sala: '', casa: '' }) : null

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '0' : '2rem' }} onClick={onClose}>
      <div className="glass animate-scale-in" style={{ width: '100%', maxWidth: '900px', maxHeight: '95vh', backgroundColor: 'white', borderRadius: isMobile ? '0' : '30px', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <header style={{ padding: isMobile ? '1.5rem' : '2.5rem', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10, borderBottom: '1px solid #f0f0f0' }}>
            <div>
              <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.8rem', fontWeight: 1000, color: '#1B2559', letterSpacing: '-0.04em' }}>Documento Digital</h2>
              <p style={{ fontSize: '0.8rem', color: '#999', fontWeight: 700 }}>{plan.subject} • {plan.month}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
               <button onClick={() => window.print()} className="btn btn-secondary" style={{ padding: '0.8rem 1.5rem', borderRadius: '12px', fontWeight: 800 }}>Imprimir</button>
               <button onClick={onClose} style={{ 
                 width: '44px', height: '44px', borderRadius: '12px', border: 'none', background: 'hsl(var(--primary))', color: 'white',
                 display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 8px 16px hsl(var(--primary) / 0.2)'
               }}><X size={24} /></button>
            </div>
        </header>

        <div style={{ padding: isMobile ? '1.5rem' : '5rem', cursor: 'default', backgroundColor: 'white' }} id="printable-plan" className="print-content">
          <div style={{ 
             textAlign: 'center', padding: '3rem', marginBottom: '4rem', 
             backgroundColor: '#f8fafc', borderRadius: '32px', border: '1px solid rgba(0,0,0,0.02)'
          }}>
            <div style={{ fontSize: isMobile ? '1.2rem' : '2rem', fontWeight: 1000, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1B2559' }}>
              {levelInfo.isFundamental1 ? 'Pauta de Aula Diária' : 'Planejamento de Ensino'}
            </div>
            <div style={{ color: 'hsl(var(--primary))', marginTop: '0.75rem', fontWeight: 900, fontSize: '1rem', letterSpacing: '0.02em', textTransform: 'uppercase', opacity: 0.8 }}>
              Ciclo {plan.bimester}º Bimestre • {plan.month}
            </div>
            <div style={{ width: '40px', height: '4px', background: 'hsl(var(--primary))', margin: '2rem auto 0', borderRadius: 'var(--radius-full)', opacity: 0.3 }}></div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            {levelInfo.isInfantil && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                  <ViewSection label="Campos de Experiência" icon={<Target size={18} />}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {plan.custom_specific_comp?.split(';').filter(Boolean).map((c, i) => <div key={i} style={{ padding: '1rem', backgroundColor: '#f0f4ff', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>{c}</div>)}
                    </div>
                  </ViewSection>
                  <ViewSection label="Direitos de Aprendizagem" icon={<Book size={18} />}>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {plan.custom_general_comp?.split(';').filter(Boolean).map((c, i) => <div key={i} style={{ padding: '1rem', backgroundColor: '#fff8f0', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 600 }}>{c}</div>)}
                     </div>
                  </ViewSection>
                </div>
                <ViewSection label="Objetivos de Aprendizagem (BNCC)" icon={<FileText size={18} />}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                    {plan.bncc_skills?.map(s => <BnccTag key={s.id} code={s.code} description={s.description} />)}
                  </div>
                </ViewSection>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                  <ViewSection label="Público Alvo / Local" icon={<LayoutList size={18} />}>{plan.knowledge_objects || '---'}</ViewSection>
                  <ViewSection label="Conteúdo Programático" icon={<Book size={18} />}>{plan.programmatic_content || '---'}</ViewSection>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                  <ViewSection label="Metodologia / Procedimentos" icon={<LayoutList size={18} />}>{plan.methodology || '---'}</ViewSection>
                  <ViewSection label="Avaliação" icon={<CheckCircle2 size={18} />}>{plan.evaluation || '---'}</ViewSection>
                  <ViewSection label="Recursos" icon={<LayoutList size={18} />}>{plan.resources || '---'}</ViewSection>
                  <ViewSection label="Referências" icon={<Book size={18} />}>{plan.references || '---'}</ViewSection>
                </div>
              </>
            )}

            {levelInfo.isFundamental1 && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                  <ViewSection label="Temática / Tema" icon={<Target size={18} />}>{plan.skills || '---'}</ViewSection>
                  <ViewSection label="Objeto do Conhecimento" icon={<LayoutList size={18} />}>{plan.knowledge_objects || '---'}</ViewSection>
                </div>
                <ViewSection label="Habilidades (BNCC)" icon={<FileText size={18} />}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                    {plan.bncc_skills?.map(s => <BnccTag key={s.id} code={s.code} description={s.description} />)}
                  </div>
                </ViewSection>
                <ViewSection label="Momentos da Aula" icon={<Calendar size={18} />}>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {moments.m1 && <div style={{ padding: '1rem', background: '#f8f9ff', borderRadius: '12px' }}><strong>1º Momento:</strong> {moments.m1}</div>}
                      {moments.m2 && <div style={{ padding: '1rem', background: '#fcfcfc', borderRadius: '12px' }}><strong>2º Momento:</strong> {moments.m2}</div>}
                      {moments.m3 && <div style={{ padding: '1rem', background: '#fcfcfc', borderRadius: '12px' }}><strong>3º Momento:</strong> {moments.m3}</div>}
                      {moments.m4 && <div style={{ padding: '1rem', background: '#fcfcfc', borderRadius: '12px' }}><strong>4º Momento:</strong> {moments.m4}</div>}
                      {moments.m5 && <div style={{ padding: '1rem', background: '#fcfcfc', borderRadius: '12px' }}><strong>5º Momento:</strong> {moments.m5}</div>}
                   </div>
                </ViewSection>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2.5rem', background: '#fcfcfc', padding: '2rem', borderRadius: '24px', border: '1px solid #eee' }}>
                   <ViewSection label="Agenda Sala" icon={<Plus size={18} />}>{agenda.sala || '---'}</ViewSection>
                   <ViewSection label="Agenda Casa" icon={<Plus size={18} />}>{agenda.casa || '---'}</ViewSection>
                </div>
              </>
            )}

            {levelInfo.isFundamental2m && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                  <ViewSection label="COMPETÊNCIAS GERAIS" icon={<Target size={18} />}>
                    {plan.bncc_general_comp?.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {plan.bncc_general_comp.map(c => <BnccTag key={c.id} code={`CG${c.number}`} description={c.description} />)}
                      </div>
                    ) : <EmptyText />}
                    {plan.custom_general_comp && <blockquote style={{ margin: '1rem 0 0', paddingLeft: '1rem', borderLeft: '3px solid #eee', color: '#555' }}>{plan.custom_general_comp}</blockquote>}
                  </ViewSection>
                  <ViewSection label="COMPETÊNCIAS ESPECÍFICAS DA ÁREA" icon={<Target size={18} />}>
                    {plan.bncc_specific_comp?.length ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {plan.bncc_specific_comp.map(c => <BnccTag key={c.id} code={c.code} description={c.description} />)}
                      </div>
                    ) : <EmptyText />}
                    {plan.custom_specific_comp && <blockquote style={{ margin: '1rem 0 0', paddingLeft: '1rem', borderLeft: '3px solid #eee', color: '#555' }}>{plan.custom_specific_comp}</blockquote>}
                  </ViewSection>
                </div>

                <ViewSection label="HABILIDADE(S) (BNCC)" icon={<FileText size={18} />}>
                  {plan.bncc_skills?.length ? (
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem' }}>
                      {plan.bncc_skills.map(s => <BnccTag key={s.id} code={s.code} description={s.description} />)}
                    </div>
                  ) : <EmptyText />}
                  {plan.skills && <p style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f9f9f9', borderRadius: '12px', fontSize: '0.95rem' }}>{plan.skills}</p>}
                </ViewSection>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                  <ViewSection label="OBJETO(S) DE CONHECIMENTO (CONTEÚDO)" icon={<LayoutList size={18} />}>{plan.knowledge_objects || '---'}</ViewSection>
                  <ViewSection label="CONTEÚDOS PROGRAMÁTICOS" icon={<Book size={18} />}>{plan.content || '---'}</ViewSection>
                </div>

                <ViewSection label="CRONOGRAMA DETALHADO (SEMANAS)" icon={<Calendar size={18} />}>{plan.programmatic_content || '---'}</ViewSection>
                <ViewSection label="PROCEDIMENTOS METODOLÓGICOS" icon={<LayoutList size={18} />}>{plan.methodology || '---'}</ViewSection>

                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '2rem' }}>
                  <ViewSection label="RECURSOS" icon={<LayoutList size={18} />}>{plan.resources || '---'}</ViewSection>
                  <ViewSection label="REFERÊNCIAS" icon={<Book size={18} />}>{plan.references || '---'}</ViewSection>
                  <ViewSection label="PROCEDIMENTOS AVALIATIVOS" icon={<CheckCircle2 size={18} />}>{plan.evaluation || '---'}</ViewSection>
                </div>
              </>
            )}
          </div>
          <div style={{ 
            padding: '2.5rem', backgroundColor: '#f8fafc', borderRadius: '24px', 
            border: '1px solid rgba(0,0,0,0.02)', fontSize: '0.85rem', 
            color: '#999', textAlign: 'center', marginTop: '5rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem'
          }}>
            <strong style={{ color: '#1B2559' }}>SGE-EDUCARE • Sistema de Gestão Educacional</strong>
            <span>Documento autenticado digitalmente • Gerado em {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</span>
          </div>
        </div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-plan, #printable-plan * { visibility: visible; }
          #printable-plan { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; margin: 0 !important; }
          .print-content { padding: 0 !important; gap: 2rem !important; }
          .glass { box-shadow: none !important; border: none !important; }
          blockquote { border-left-color: #ddd !important; }
        }
      `}</style>
      </div>
    </div>
  )
}

// ══════════ COMPONENTE PRINCIPAL ══════════
export const LessonPlanPage: React.FC = () => {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  
  // ══════════ ESTADOS ══════════
  const [plans, setPlans] = useState<LessonPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPlan, setCurrentPlan] = useState<LessonPlan | null>(null)
  const [viewingPlan, setViewingPlan] = useState<LessonPlan | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [subjects, setSubjects] = useState<string[]>([])
  const [activeClass, setActiveClass] = useState<ClassMetadata | null>(null)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)

  // Estados de busca BNCC
  const [bnccSearch, setBnccSearch] = useState('')
  const [bnccResults, setBnccResults] = useState<BnccRef[]>([])
  const [searchingBNCC, setSearchingBNCC] = useState(false)
  const [selectedBnccIds, setSelectedBnccIds] = useState<string[]>([])
  const [selectedBnccObjects, setSelectedBnccObjects] = useState<BnccRef[]>([])

  const [genCompSearch, setGenCompSearch] = useState('')
  const [genCompResults, setGenCompResults] = useState<BnccRef[]>([])
  const [searchingGen, setSearchingGen] = useState(false)
  const [selectedGenIds, setSelectedGenIds] = useState<string[]>([])
  const [selectedGenObjects, setSelectedGenObjects] = useState<BnccRef[]>([])

  const [specCompSearch, setSpecCompSearch] = useState('')
  const [specCompResults, setSpecCompResults] = useState<BnccRef[]>([])
  const [searchingSpec, setSearchingSpec] = useState(false)
  const [selectedSpecIds, setSelectedSpecIds] = useState<string[]>([])
  const [selectedSpecObjects, setSelectedSpecObjects] = useState<BnccRef[]>([])

  // Estados dos seletores customizados
  const [openSubject, setOpenSubject] = useState(false)
  const [openBimester, setOpenBimester] = useState(false)
  const [openMonth, setOpenMonth] = useState(false)

  // Estados para campos específicos de Fundamental I
  const [moments, setMoments] = useState<MomentState>({ m1: '', m2: '', m3: '', m4: '', m5: '' })
  const [agenda, setAgenda] = useState<AgendaState>({ sala: '', casa: '' })

  // ══════════ LÓGICA DE NÍVEL (MEMOIZED) ══════════
  const levelInfo = useMemo(() => {
    const levelName = activeClass?.grade?.level?.name?.toLowerCase() || ''
    
    // Detecção baseada no nome
    const isInf = levelName.includes('infantil')
    const isF1 = levelName.includes('fundamental i') || levelName.includes('fundamental 1') || levelName.includes('anos iniciais')
    
    // O Fundamental II / Médio é o PADRÃO se nenhum outro for identificado 
    // ou enquanto os dados da turma (activeClass) estão sendo carregados.
    const isF2m = !isInf && !isF1

    return {
      isInfantil: isInf,
      isFundamental1: isF1,
      isFundamental2m: isF2m,
      name: levelName || 'Padrão (Mensal)'
    }
  }, [activeClass])

  const levelDisplayName = useMemo(() => {
    if (!activeClass) return ''
    return `${activeClass.grade.name} • ${activeClass.grade.level.name}`
  }, [activeClass])

  // ══════════ EFEITOS E BUSCAS ══════════
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
      if (data && data.subjects) {
        setSubjects(data.subjects)
        setActiveClass(data.class)
      } else {
        setSubjects(data)
      }
    } catch (e) { console.error(e) }
  }, [classId])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (classId) {
      fetchPlans()
      fetchAllocations()
    }
  }, [classId, fetchPlans, fetchAllocations])

  const calculateCompletion = (p: LessonPlan) => {
    const fields = [
      p.knowledge_objects, p.content, p.methodology, p.evaluation, 
      p.resources, p.references, p.programmatic_content
    ]
    const filledFields = fields.filter(f => f && f.trim().length > 0).length
    
    // Contar arrays de IDs da BNCC
    const bnccCount = (p.bncc_skills?.length || 0) > 0 ? 1 : 0
    const genCount = (p.bncc_general_comp?.length || 0) > 0 ? 1 : 0
    const specCount = (p.bncc_specific_comp?.length || 0) > 0 ? 1 : 0
    
    const totalPoints = fields.length + 3 // 7 textos + 3 tipos de BNCC
    const currentPoints = filledFields + bnccCount + genCount + specCount
    
    return Math.round((currentPoints / totalPoints) * 100)
  }

  // Efeitos para fechamento de dropdowns ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-select-id]')) {
        setOpenSubject(false);
        setOpenBimester(false);
        setOpenMonth(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const bnccRequestId = useRef(0)
  const genRequestId = useRef(0)
  const specRequestId = useRef(0)

  // Efeitos de busca assíncrona
  useEffect(() => {
    const isActive = activeDropdown === 'habilidades'
    const queryTerm = bnccSearch.trim()
    if (!isActive && queryTerm.length < 1) { setBnccResults([]); return }
    const requestId = ++bnccRequestId.current
    const timer = setTimeout(async () => {
      setSearchingBNCC(true)
      try {
        const queryParams = new URLSearchParams({ 
          q: queryTerm,
          subject: currentPlan?.subject || '',
          level: activeClass?.grade?.level?.name || ''
        })
        
        if (levelInfo.isInfantil && queryTerm.length < 2) {
          queryParams.set('q', 'EI')
        }

        const results = await api(`/teacher/bncc/search?${queryParams.toString()}`)
        const filtered = levelInfo.isInfantil 
          ? results.filter((r: any) => r.code?.startsWith('EI'))
          : results;

        if (requestId === bnccRequestId.current) setBnccResults(filtered)
      } catch (e) { if (requestId === bnccRequestId.current) console.error(e) }
      finally { if (requestId === bnccRequestId.current) setSearchingBNCC(false) }
    }, isActive && queryTerm === '' ? 0 : 200)
    return () => clearTimeout(timer)
  }, [bnccSearch, currentPlan?.subject, activeDropdown, levelInfo.isInfantil, activeClass])

  useEffect(() => {
    const isActive = activeDropdown === 'gerais'
    const queryTerm = genCompSearch.trim()
    if (!isActive && queryTerm.length < 1) { setGenCompResults([]); return }
    const requestId = ++genRequestId.current
    const timer = setTimeout(async () => {
      setSearchingGen(true)
      try {
        const queryParams = new URLSearchParams({ q: queryTerm })
        const results = await api(`/teacher/bncc/general-search?${queryParams.toString()}`)
        if (requestId === genRequestId.current) setGenCompResults(results)
      } catch (e) { if (requestId === genRequestId.current) console.error(e) }
      finally { if (requestId === genRequestId.current) setSearchingGen(false) }
    }, isActive && queryTerm === '' ? 0 : 200)
    return () => clearTimeout(timer)
  }, [genCompSearch, activeDropdown])

  useEffect(() => {
    const isActive = activeDropdown === 'especificas'
    const queryTerm = specCompSearch.trim()
    if (!isActive && queryTerm.length < 1) { setSpecCompResults([]); return }
    const requestId = ++specRequestId.current
    const timer = setTimeout(async () => {
      setSearchingSpec(true)
      try {
        const queryParams = new URLSearchParams({ q: queryTerm })
        const results = await api(`/teacher/bncc/specific-search?${queryParams.toString()}`)
        if (requestId === specRequestId.current) setSpecCompResults(results)
      } catch (e) { if (requestId === specRequestId.current) console.error(e) }
      finally { if (requestId === specRequestId.current) setSearchingSpec(false) }
    }, isActive && queryTerm === '' ? 0 : 200)
    return () => clearTimeout(timer)
  }, [specCompSearch, activeDropdown])

  // ══════════ HANDLERS ══════════
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
    content: '',
    type: levelInfo.isFundamental1 ? 'Diário' : 'Mensal',
    status: 'PENDING'
  })

  const handleCreateNew = () => {
    const fresh = emptyPlan()
    if (subjects.length === 1) fresh.subject = subjects[0]
    setCurrentPlan(fresh)
    setSelectedBnccIds([]); setSelectedBnccObjects([])
    setSelectedGenIds([]); setSelectedGenObjects([])
    setSelectedSpecIds([]); setSelectedSpecObjects([])
    
    // Reset specific states
    setMoments({ m1: '', m2: '', m3: '', m4: '', m5: '' })
    setAgenda({ sala: '', casa: '' })
    
    setIsEditing(true)
  }

  const parseJsonSafe = (str: string, def: any) => {
    try { return JSON.parse(str || '{}') } catch { return def }
  }

  const handleEdit = (plan: LessonPlan) => {
    const normalized = { ...plan } as any
    Object.keys(normalized).forEach(key => { if (normalized[key] === null) normalized[key] = '' })
    setCurrentPlan(normalized)
    setSelectedBnccIds(plan.bncc_skills?.map(s => s.id) || [])
    setSelectedBnccObjects(plan.bncc_skills || [])
    setSelectedGenIds(plan.bncc_general_comp?.map(s => s.id) || [])
    setSelectedGenObjects(plan.bncc_general_comp || [])
    setSelectedSpecIds(plan.bncc_specific_comp?.map(s => s.id) || [])
    setSelectedSpecObjects(plan.bncc_specific_comp || [])

    // Parse Fundamental I fields
    if (levelInfo.isFundamental1) {
      setMoments(parseJsonSafe(plan.programmatic_content || '', { m1: '', m2: '', m3: '', m4: '', m5: '' }))
      setAgenda(parseJsonSafe(plan.content || '', { sala: '', casa: '' }))
    }

    setIsEditing(true)
  }

  const handleSave = async () => {
    if (!currentPlan?.subject) return toast.error('Informe a disciplina')
    
    // Validations based on level
    if (levelInfo.isFundamental1) {
      if (!currentPlan.knowledge_objects && !moments.m1) {
        return toast.error('Preencha ao menos o Objeto de Conhecimento ou o 1º Momento')
      }
    } else {
      if (!currentPlan?.knowledge_objects && selectedGenIds.length === 0) {
        return toast.error('Preencha ao menos as competências ou objetos de conhecimento')
      }
    }

    setSaving(true)
    try {
      const { bncc_skills, bncc_general_comp, bncc_specific_comp, ...cleanPlan } = currentPlan as any
      
      // Preparar payload com serialização se necessário
      const payload: any = { 
        ...cleanPlan, 
        classId,
        bncc_skills_ids: selectedBnccIds,
        bncc_general_comp_ids: selectedGenIds,
        bncc_specific_comp_ids: selectedSpecIds
      }

      if (levelInfo.isFundamental1) {
        payload.programmatic_content = JSON.stringify(moments)
        payload.content = JSON.stringify(agenda)
        payload.type = 'Diário'
      }

      await api('/teacher/lesson-plans', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      
      toast.success('Plano de aula salvo!')
      setIsEditing(false); setCurrentPlan(null); fetchPlans()
    } catch (error) { toast.error('Erro ao salvar plano') }
    finally { setSaving(false) }
  }

  // Opções estáticas
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

  // ══════════ AUXILIARES DE RENDER ══════════
  // (Componente MultiSelectField agora é externo para usar refs)

  // ══════════ RENDERIZAÇÃO FINAL ══════════
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: isMobile ? '0 0.5rem 12rem' : '0 2.5rem 10rem' }}>
        
        <header style={{ padding: isMobile ? '2.5rem 0 1.5rem' : '4rem 0 2.5rem' }}>
          <button 
            onClick={() => isEditing ? setIsEditing(false) : navigate('/teacher/dashboard')} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: 'hsl(var(--primary))', 
              fontSize: '0.8rem', 
              fontWeight: 900,
              marginBottom: '1.5rem',
              border: 'none',
              background: 'hsl(var(--primary) / 0.1)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              letterSpacing: '0.05em'
            }}
          >
            <ChevronLeft size={16} /> {isEditing ? 'VOLTAR À LISTA' : 'VOLTAR AO PAINEL'}
          </button>
          
          <h1 style={{ 
            fontSize: isMobile ? '2.2rem' : '3.2rem', 
            fontWeight: 1000, 
            lineHeight: 1, 
            letterSpacing: '-0.06em', 
            color: '#1B2559' 
          }}>
            {isEditing ? 'Planejamento' : 'Meus Planos'}
          </h1>
          
          <p style={{ 
             fontSize: isMobile ? '1rem' : '1.2rem', 
             fontWeight: 500, 
             color: 'hsl(var(--text-light))', 
             letterSpacing: '-0.01em', 
             marginTop: '0.5rem' 
          }}>
            {isEditing ? `Defina os objetivos de aprendizagem para ${currentPlan?.subject || 'sua disciplina'}.` : 'Gerencie e visualize todos os seus planejamentos BNCC.'}
          </p>

          {activeClass && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center', marginTop: '1.5rem' }}>
               <div style={{ 
                 display: 'flex', alignItems: 'center', gap: '0.5rem',
                 backgroundColor: 'white', padding: '0.5rem 1rem', borderRadius: '14px',
                 boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.03)'
               }}>
                 <span style={{ 
                   width: '10px', height: '10px', borderRadius: '50%',
                   backgroundColor: levelInfo.isInfantil ? '#ff9f43' : levelInfo.isFundamental1 ? '#00d2d3' : '#5f27cd'
                 }}></span>
                 <span style={{ fontSize: '0.8rem', fontWeight: 900, color: '#1B2559' }}>
                   {levelInfo.isInfantil ? 'Educação Infantil' : levelInfo.isFundamental1 ? 'Fundamental I' : 'Fundamental II / Médio'}
                 </span>
               </div>
               <p style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(var(--text-light))', opacity: 1 }}>
                {levelDisplayName}
               </p>
            </div>
          )}

          {!isEditing && (
            <div style={{ marginTop: '2.5rem' }}>
              <button 
                onClick={handleCreateNew} 
                className="btn-primary" 
                style={{ 
                  padding: '1.2rem 2.5rem', borderRadius: '24px', fontWeight: 900, 
                  boxShadow: '0 20px 40px hsl(var(--primary) / 0.3)', 
                  width: isMobile ? '100%' : 'auto',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                }}
              >
                <Plus size={22} /> <span>NOVO PLANEJAMENTO</span>
              </button>
            </div>
          )}
        </header>

        {isEditing && currentPlan ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '1rem' : '2rem' }}>
            <SectionCard isMobile={isMobile} icon={<Calendar />} title="Identificação" accent="linear-gradient(135deg, #f8f9ff 0%, #f0f2ff 100%)">
               <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.25rem' }}>
                 <CustomSelect 
                   id="sel-subject"
                   isMobile={isMobile}
                   label="Disciplina" 
                   value={currentPlan.subject} 
                   options={subjects.map(s => ({ value: s, label: s }))} 
                   isOpen={openSubject} 
                   setIsOpen={(val: boolean) => { if(val) { setOpenBimester(false); setOpenMonth(false) }; setOpenSubject(val) }} 
                   onChange={(v: string) => setCurrentPlan({ ...currentPlan, subject: v })} 
                 />
                 <CustomSelect 
                   id="sel-bimester"
                   isMobile={isMobile}
                   label="Bimestre" 
                   value={currentPlan.bimester} 
                   options={bimesterOptions} 
                   isOpen={openBimester} 
                   setIsOpen={(val: boolean) => { if(val) { setOpenSubject(false); setOpenMonth(false) }; setOpenBimester(val) }} 
                   onChange={(v: string) => setCurrentPlan({ ...currentPlan, bimester: v })} 
                 />
                 <CustomSelect 
                   id="sel-month"
                   isMobile={isMobile}
                   label="Mês de Referência" 
                   value={currentPlan.month} 
                   options={monthOptions} 
                   isOpen={openMonth} 
                   setIsOpen={(val: boolean) => { if(val) { setOpenSubject(false); setOpenBimester(false) }; setOpenMonth(val) }} 
                   onChange={(v: string) => setCurrentPlan({ ...currentPlan, month: v })} 
                 />
               </div>
            </SectionCard>

            {/* ══════════ TEMPLATES POR NÍVEL ══════════ */}
            
            {levelInfo.isInfantil && (
              <SectionCard isMobile={isMobile} icon={<Target />} title="Campos e Direitos (Infantil)" accent="linear-gradient(135deg, #fffcf0 0%, #fff9e0 100%)">
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                   <MultiCheckGroup 
                     label="Campos de Experiência" 
                     options={INFANTIL_CAMPOS} 
                     selected={currentPlan.custom_specific_comp?.split(';').filter(Boolean) || []}
                     onChange={(vals: string[]) => setCurrentPlan({ ...currentPlan, custom_specific_comp: vals.join(';') })}
                   />
                   <MultiCheckGroup 
                     label="Direitos de Aprendizagem" 
                     options={INFANTIL_DIREITOS} 
                     selected={currentPlan.custom_general_comp?.split(';').filter(Boolean) || []}
                     onChange={(vals: string[]) => setCurrentPlan({ ...currentPlan, custom_general_comp: vals.join(';') })}
                   />
                </div>
              </SectionCard>
            )}

            {/* Fundamental I e II compartilham a estrutura de Base BNCC (Habilidades, Competências) */}
            {(levelInfo.isFundamental1 || levelInfo.isFundamental2m) && (
              <SectionCard isMobile={isMobile} icon={<Target />} title="Base BNCC" accent="linear-gradient(135deg, #fffcf0 0%, #fff9e0 100%)">
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <MultiSelectField label="Competências Gerais" selected={selectedGenObjects} onRemove={(id: string) => { setSelectedGenIds(selectedGenIds.filter(i => i !== id)); setSelectedGenObjects(selectedGenObjects.filter(o => o.id !== id)) }} onOpen={() => setActiveDropdown('gerais')} variantColor="orange" />
                      <FormGroup label="Anotações de Competências Gerais" placeholder="Complemente as competências..." value={currentPlan.custom_general_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_general_comp: v })} height="100px" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <MultiSelectField label="Competências Específicas" selected={selectedSpecObjects} onRemove={(id: string) => { setSelectedSpecIds(selectedSpecIds.filter(i => i !== id)); setSelectedSpecObjects(selectedSpecObjects.filter(o => o.id !== id)) }} onOpen={() => setActiveDropdown('especificas')} variantColor="blue" />
                      <FormGroup label="Anotações de Competências Específicas" placeholder="Observações específicas..." value={currentPlan.custom_specific_comp} onChange={(v: string) => setCurrentPlan({ ...currentPlan, custom_specific_comp: v })} height="100px" />
                    </div>
                </div>
              </SectionCard>
            )}

            <SectionCard isMobile={isMobile} icon={<LayoutList />} title="Desenvolvimento">
               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 
                 {levelInfo.isFundamental2m && (
                   <>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                        <FormGroup label="OBJETO(S) DE CONHECIMENTO (CONTEÚDO)" placeholder="O que será ensinado?" value={currentPlan.knowledge_objects} onChange={(v: string) => setCurrentPlan({ ...currentPlan, knowledge_objects: v })} height="120px" />
                        <FormGroup label="CONTEÚDOS PROGRAMÁTICOS" placeholder="Temas, capítulos e unidades..." value={currentPlan.content} onChange={(v: string) => setCurrentPlan({ ...currentPlan, content: v })} height="120px" />
                      </div>
                      <MultiSelectField label="HABILIDADE(S) (BNCC)" selected={selectedBnccObjects} onRemove={(id: string) => { setSelectedBnccIds(selectedBnccIds.filter(i => i !== id)); setSelectedBnccObjects(selectedBnccObjects.filter(o => o.id !== id)) }} onOpen={() => setActiveDropdown('habilidades')} variantColor="green" />
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                        <FormGroup label="CRONOGRAMA DETALHADO (SEMANAS)" placeholder="Distribuição do conteúdo (Ex: Semana 1, Semana 2...)" value={currentPlan.programmatic_content} onChange={(v: string) => setCurrentPlan({ ...currentPlan, programmatic_content: v })} height="120px" />
                        <FormGroup label="PROCEDIMENTOS METODOLÓGICOS" placeholder="Lúdico, laboratório, pesquisa, socioemocional..." value={currentPlan.methodology} onChange={(v: string) => setCurrentPlan({ ...currentPlan, methodology: v })} height="120px" />
                      </div>
                      <FormGroup label="HABILIDADE(S) PRÓPRIAS" placeholder="Inovação, projetos e específicas..." value={currentPlan.skills} onChange={(v: string) => setCurrentPlan({ ...currentPlan, skills: v })} height="80px" />
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <FormGroup label="RECURSOS" placeholder="Mapas, vídeos, livros..." value={currentPlan.resources} onChange={(v: string) => setCurrentPlan({ ...currentPlan, resources: v })} height="100px" />
                        <FormGroup label="REFERÊNCIAS" placeholder="Bibliografia utilizada..." value={currentPlan.references} onChange={(v: string) => setCurrentPlan({ ...currentPlan, references: v })} height="100px" />
                        <FormGroup label="PROCEDIMENTOS AVALIATIVOS" placeholder="Processos avaliativos..." value={currentPlan.evaluation} onChange={(v: string) => setCurrentPlan({ ...currentPlan, evaluation: v })} height="100px" />
                      </div>
                   </>
                 )}

                 {levelInfo.isFundamental1 && (
                   <>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem' }}>
                        <FormGroup label="OBJETO(S) DE CONHECIMENTO" placeholder="O que será ensinado?" value={currentPlan.knowledge_objects} onChange={(v: string) => setCurrentPlan({ ...currentPlan, knowledge_objects: v })} height="100px" />
                        <FormGroup label="TEMÁTICA / TEMA" placeholder="Tema principal da pauta..." value={currentPlan.skills} onChange={(v: string) => setCurrentPlan({ ...currentPlan, skills: v })} height="100px" />
                      </div>
                      
                      <MultiSelectField label="HABILIDADE(S) (BNCC)" selected={selectedBnccObjects} onRemove={(id: string) => { setSelectedBnccIds(selectedBnccIds.filter(i => i !== id)); setSelectedBnccObjects(selectedBnccObjects.filter(o => o.id !== id)) }} onOpen={() => setActiveDropdown('habilidades')} variantColor="green" />
                      
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '1.5rem' }}>
                        <FormGroup label="1º Momento" value={moments.m1} onChange={(v: string) => setMoments({...moments, m1: v})} height="100px" />
                        <FormGroup label="2º Momento" value={moments.m2} onChange={(v: string) => setMoments({...moments, m2: v})} height="100px" />
                        <FormGroup label="3º Momento" value={moments.m3} onChange={(v: string) => setMoments({...moments, m3: v})} height="100px" />
                        <FormGroup label="4º Momento" value={moments.m4} onChange={(v: string) => setMoments({...moments, m4: v})} height="100px" />
                        <FormGroup label="5º Momento" value={moments.m5} onChange={(v: string) => setMoments({...moments, m5: v})} height="100px" />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                           <FormGroup label="AGENDA (SALA)" value={agenda.sala} onChange={(v: string) => setAgenda({...agenda, sala: v})} height="70px" />
                           <FormGroup label="AGENDA (CASA)" value={agenda.casa} onChange={(v: string) => setAgenda({...agenda, casa: v})} height="70px" />
                        </div>
                      </div>
                   </>
                 )}

                 {levelInfo.isInfantil && (
                   <>
                      <FormGroup label="Público Alvo / Local" value={currentPlan.knowledge_objects} onChange={(v: string) => setCurrentPlan({ ...currentPlan, knowledge_objects: v })} />
                      <FormGroup label="Conteúdo Programático" value={currentPlan.programmatic_content} onChange={(v: string) => setCurrentPlan({ ...currentPlan, programmatic_content: v })} />
                      <MultiSelectField label="Objetivos de Aprendizagem (BNCC)" selected={selectedBnccObjects} onRemove={(id: string) => { setSelectedBnccIds(selectedBnccIds.filter(i => i !== id)); setSelectedBnccObjects(selectedBnccObjects.filter(o => o.id !== id)) }} onOpen={() => setActiveDropdown('habilidades')} variantColor="green" />
                      <FormGroup label="Metodologia / Procedimentos" value={currentPlan.methodology} onChange={(v: string) => setCurrentPlan({ ...currentPlan, methodology: v })} />
                      <FormGroup label="Avaliação" value={currentPlan.evaluation} onChange={(v: string) => setCurrentPlan({ ...currentPlan, evaluation: v })} />
                   </>
                 )}
               </div>
            </SectionCard>

            {/* FAB de Salvamento Mobile (Oculto se modal aberto) */}
            {isMobile && !activeDropdown && !viewingPlan && (
              <div style={{ 
                position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', 
                width: 'calc(100% - 2.5rem)', zIndex: 3000
              }}>
                <button 
                  onClick={handleSave} 
                  disabled={saving}
                  style={{ 
                    width: '100%', padding: '1.4rem', borderRadius: '28px', backgroundColor: 'hsl(var(--primary))', 
                    color: 'white', boxShadow: '0 20px 40px hsl(var(--primary) / 0.4)', fontSize: '1.2rem', 
                    display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', 
                    fontWeight: 1000, border: 'none', letterSpacing: '-0.02em'
                  }}
                >
                  {saving ? <Loader2 className="animate-spin" size={24} /> : 'SALVAR PLANEJAMENTO'}
                </button>
              </div>
            )}

            {!isMobile && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => setIsEditing(false)} className="btn btn-secondary" style={{ padding: '1rem 2rem', borderRadius: '16px', fontWeight: 800 }}>Cancelar</button>
                <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ padding: '1rem 2.5rem', borderRadius: '16px', fontWeight: 800 }}>
                  {saving ? <Loader2 className="animate-spin" /> : 'Salvar Planejamento'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(400px, 1fr))', gap: isMobile ? '1.25rem' : '2rem' }}>
            {plans.map(p => {
              const completion = calculateCompletion(p)
              const statusColor = completion < 40 ? '#ff9f43' : completion < 80 ? '#54a0ff' : '#00d2d3'
              
              return (
                <div key={p.id} className="card-interactive-premium" style={{ 
                  padding: isMobile ? '1.25rem' : '2.5rem', 
                  borderRadius: isMobile ? '24px' : '32px', 
                  background: 'white', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: isMobile ? '1.25rem' : '1.5rem', 
                  boxShadow: '0 10px 30px rgba(0,0,0,0.03)',
                  border: '1px solid rgba(0,0,0,0.03)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{ display: 'flex', gap: isMobile ? '1rem' : '1.25rem', alignItems: isMobile ? 'center' : 'flex-start', flexDirection: isMobile ? 'row' : 'row' }}>
                    {/* No mobile o ícone fica ao lado do texto de suporte, mas o título ganha destaque abaixo se necessário */}
                    <div style={{ 
                      width: isMobile ? '48px' : '56px', height: isMobile ? '48px' : '56px', borderRadius: '14px', 
                      background: 'hsl(var(--primary) / 0.05)', color: 'hsl(var(--primary))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <BookOpen size={isMobile ? 24 : 28} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                        <span style={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '0.6rem', color: 'hsl(var(--primary))', letterSpacing: '0.05em' }}>{p.month}</span>
                        <span style={{ fontWeight: 800, fontSize: '0.65rem', color: '#999' }}>{p.bimester}º BIMESTRE</span>
                      </div>
                      <h3 style={{ fontSize: isMobile ? '1.15rem' : '1.4rem', fontWeight: 1000, color: '#1B2559', letterSpacing: '-0.04em', lineHeight: 1.2, whiteSpace: 'normal', overflow: 'visible' }}>{p.subject}</h3>
                    </div>
                  </div>

                  <div style={{ marginTop: isMobile ? '0.25rem' : '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#999', textTransform: 'uppercase' }}>Progresso</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 1000, color: statusColor }}>{completion}%</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', backgroundColor: '#f0f2f5', borderRadius: '10px', overflow: 'hidden' }}>
                      <div style={{ width: `${completion}%`, height: '100%', backgroundColor: statusColor, borderRadius: '10px', transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}></div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.25rem' }}>
                    <button onClick={() => setViewingPlan(p)} style={{ 
                      flex: 1, height: isMobile ? '48px' : 'auto', padding: isMobile ? '0' : '0.85rem', borderRadius: '14px', border: '1px solid #eee', background: 'white', 
                      fontSize: '0.8rem', fontWeight: 800, color: '#666', cursor: 'pointer', transition: 'all 0.2s'
                    }}>Ver</button>
                    <button onClick={() => handleEdit(p)} className="btn-primary" style={{ 
                      flex: 2, height: isMobile ? '48px' : 'auto', padding: isMobile ? '0' : '0.85rem', borderRadius: '14px', fontSize: '0.85rem', fontWeight: 900, 
                      boxShadow: '0 8px 16px hsl(var(--primary) / 0.2)'
                    }}>Editar Plano</button>
                    <button onClick={() => { if(confirm('Excluir este planejamento permanentemente?')) api(`/teacher/lesson-plans/${p.id}`, { method: 'DELETE' }).then(() => fetchPlans()) }} style={{ 
                      width: isMobile ? '48px' : '48px', height: isMobile ? '48px' : '48px', borderRadius: '14px', border: 'none', background: '#fff0f0', color: '#ff4d4d',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
                    }}><Trash2 size={20} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {viewingPlan && (
          <LessonPlanVisualizer plan={viewingPlan} onClose={() => setViewingPlan(null)} isMobile={isMobile} levelInfo={levelInfo} />
        )}
      </div>

      <SelectionModal 
        isOpen={activeDropdown === 'habilidades'} 
        onClose={() => setActiveDropdown(null)} 
        isMobile={isMobile}
        title={levelInfo.isInfantil ? "Seleção: Objetivos de Aprendizagem" : "Seleção: Habilidades BNCC"}
        search={bnccSearch} 
        setSearch={setBnccSearch} 
        results={bnccResults} 
        searching={searchingBNCC} 
        variantColor="#10ac84" 
        selectedObjects={selectedBnccObjects} 
        levelInfo={levelInfo}
        onAdd={(it: any) => { if(!selectedBnccIds.includes(it.id)) { setSelectedBnccIds([...selectedBnccIds, it.id]); setSelectedBnccObjects([...selectedBnccObjects, it]) } }} 
        onRemove={(id: string) => { setSelectedBnccIds(selectedBnccIds.filter(i => i !== id)); setSelectedBnccObjects(selectedBnccObjects.filter(o => o.id !== id)) }} 
      />
      <SelectionModal 
        isOpen={activeDropdown === 'gerais'} 
        onClose={() => setActiveDropdown(null)} 
        isMobile={isMobile}
        title="Seleção: Competências Gerais" 
        search={genCompSearch} 
        setSearch={setGenCompSearch} 
        results={genCompResults} 
        searching={searchingGen} 
        variantColor="#ff9f43" 
        selectedObjects={selectedGenObjects} 
        levelInfo={levelInfo}
        onAdd={(it: any) => { if(!selectedGenIds.includes(it.id)) { setSelectedGenIds([...selectedGenIds, it.id]); setSelectedGenObjects([...selectedGenObjects, it]) } }} 
        onRemove={(id: string) => { setSelectedGenIds(selectedGenIds.filter(i => i !== id)); setSelectedGenObjects(selectedGenObjects.filter(o => o.id !== id)) }} 
      />
      <SelectionModal 
        isOpen={activeDropdown === 'especificas'} 
        onClose={() => setActiveDropdown(null)} 
        isMobile={isMobile}
        title="Seleção: Competências Específicas" 
        search={specCompSearch} 
        setSearch={setSpecCompSearch} 
        results={specCompResults} 
        searching={searchingSpec} 
        variantColor="#54a0ff" 
        selectedObjects={selectedSpecObjects} 
        levelInfo={levelInfo}
        onAdd={(it: any) => { if(!selectedSpecIds.includes(it.id)) { setSelectedSpecIds([...selectedSpecIds, it.id]); setSelectedSpecObjects([...selectedSpecObjects, it]) } }} 
        onRemove={(id: string) => { setSelectedSpecIds(selectedSpecIds.filter(i => i !== id)); setSelectedSpecObjects(selectedSpecObjects.filter(o => o.id !== id)) }} 
      />
    </div>
  )
}
