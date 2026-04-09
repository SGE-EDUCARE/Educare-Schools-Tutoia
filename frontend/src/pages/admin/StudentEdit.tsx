import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, User, Shield } from 'lucide-react'
import { api } from '../../utils/api'
import { toast } from 'react-hot-toast'

export const StudentEdit: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  
  const [submitLoading, setSubmitLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Dados Dinâmicos
  const [academicLevels, setAcademicLevels] = useState<any[]>([])
  const [academicGrades, setAcademicGrades] = useState<any[]>([])
  const [academicClasses, setAcademicClasses] = useState<any[]>([])
  
  const [ufs, setUfs] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [loadingCities, setLoadingCities] = useState(false)
  const [selectedUf, setSelectedUf] = useState('')
  const [selectedCity, setSelectedCity] = useState('')

  const [formData, setFormData] = useState<any>({
    name: '',
    registration_id: '',
    education_level_id: '',
    grade_id: '',
    class_id: '',
    address: '',
    phone: '',
    document: '',
    birth_date: '',
    cpf: '',
    nis: '',
    father_name: '',
    mother_name: '',
    scholarship: false,
    photo_url: ''
  })

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    try {
      const [studentData, levelsData, ufsRes] = await Promise.all([
        api(`/admin/students/${id}`),
        api('/admin/academic/levels'),
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome').then(r => r.json())
      ])
      
      setFormData({
        ...studentData,
        education_level_id: studentData.class?.grade?.level_id || '',
        grade_id: studentData.class?.grade_id || '',
        class_id: studentData.class_id || ''
      })
      
      setAcademicLevels(levelsData)
      setUfs(ufsRes)

      // Se tiver naturalidade, tenta decompor UF e Cidade
      if (studentData.naturalness && studentData.naturalness.includes(' - ')) {
        const [city, uf] = studentData.naturalness.split(' - ')
        setSelectedUf(uf)
        setSelectedCity(city)
        
        // Carrega cidades da UF
        const citiesRes = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`).then(r => r.json())
        setCities(citiesRes)
      }

      // Pre-carrega grades se houver level
      if (studentData.class?.grade?.level_id) {
        const allGrades = await api('/admin/academic/grades')
        setAcademicGrades(allGrades.filter((g: any) => g.level_id === studentData.class.grade.level_id))
      }

      // Pre-carrega classes se houver grade
      if (studentData.class?.grade_id) {
        const allClasses = await api('/admin/academic/classes')
        setAcademicClasses(allClasses.filter((c: any) => c.grade_id === studentData.class.grade_id))
      }

    } catch (e) {
      toast.error("Erro ao carregar dados do aluno")
      navigate('/admin/students')
    } finally {
      setLoading(false)
    }
  }

  const handleUfChange = async (ufSigla: string) => {
    setSelectedUf(ufSigla)
    setSelectedCity('')
    setCities([])
    if (!ufSigla) return

    setLoadingCities(true)
    try {
      const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${ufSigla}/municipios?orderBy=nome`)
      const data = await response.json()
      setCities(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoadingCities(false)
    }
  }

  const handleLevelChange = async (levelId: string) => {
    setFormData({ ...formData, education_level_id: levelId, grade_id: '', class_id: '' })
    setAcademicGrades([])
    setAcademicClasses([])
    if (!levelId) return
    const allGrades = await api('/admin/academic/grades')
    setAcademicGrades(allGrades.filter((g: any) => g.level_id === levelId))
  }

  const handleGradeChange = async (gradeId: string) => {
    setFormData({ ...formData, grade_id: gradeId, class_id: '' })
    setAcademicClasses([])
    if (!gradeId) return
    const allClasses = await api('/admin/academic/classes')
    setAcademicClasses(allClasses.filter((c: any) => c.grade_id === gradeId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)
    const loadId = toast.loading('Salvando alterações...')
    try {
      const naturalness = selectedCity ? `${selectedCity} - ${selectedUf}` : formData.naturalness
      const selectedLevel = academicLevels.find(l => l.id === formData.education_level_id)?.name
      const selectedGrade = academicGrades.find(g => g.id === formData.grade_id)?.name

      // Limpar campos extras do prisma para evitar erros de validação se necessário
      const payload = {
          ...formData,
          naturalness,
          education_level: selectedLevel || formData.education_level,
          grade_name: selectedGrade || formData.grade_name,
          class: undefined,
          parent: undefined
      }

      await api(`/admin/students/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      toast.success('Dados atualizados com sucesso!', { id: loadId })
      navigate('/admin/students')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar dados', { id: loadId })
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Carregando dados do aluno...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <header className="flex items-center justify-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <button onClick={() => navigate('/admin/students')} className="btn btn-secondary" style={{ padding: '0.75rem', borderRadius: '50%' }}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.04em', color: 'hsl(var(--text))' }}>Editar Aluno</h1>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '1.1rem', fontWeight: 500 }}>Corrija ou atualize as informações de <strong>{formData.name}</strong>.</p>
          </div>
        </div>
      </header>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* FOTO */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', padding: '2rem' }}>
          <div style={{ position: 'relative' }}>
            <div className="icon-box" style={{ 
              width: '140px', height: '140px', backgroundColor: 'hsl(var(--background))', 
              border: '2px dashed hsl(var(--border))', borderRadius: 'var(--radius-lg)',
              overflow: 'hidden', cursor: 'pointer'
            }} onClick={() => document.getElementById('photo-upload')?.click()}>
              {formData.photo_url ? (
                <img src={formData.photo_url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem' }}>
                  <User size={48} opacity={0.2} />
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, marginTop: '0.5rem', color: 'hsl(var(--text-light))' }}>ALTERAR FOTO</p>
                </div>
              )}
            </div>
            <input id="photo-upload" type="file" accept="image/*" style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const reader = new FileReader()
                  reader.onloadend = () => setFormData({ ...formData, photo_url: reader.result as string })
                  reader.readAsDataURL(file)
                }
              }} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Foto do Aluno</h3>
            <p style={{ color: 'hsl(var(--text-light))', fontSize: '0.9rem' }}>Clique no quadro ao lado para carregar uma nova imagem.</p>
          </div>
        </div>

        {/* DADOS PESSOAIS */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="flex items-center gap-3">
             <div className="icon-box" style={{ width: '40px', height: '40px', backgroundColor: 'hsl(var(--primary-light))', color: 'hsl(var(--primary))' }}><User size={20} /></div>
             <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>1. Informações do Estudante</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nome Completo *</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>RA / Matrícula</label>
              <input readOnly value={formData.registration_id} className="input" style={{ backgroundColor: 'hsl(var(--background))' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Data de Nascimento *</label>
              <input required type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} className="input" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>CPF</label>
              <input value={formData.cpf || ''} onChange={e => setFormData({...formData, cpf: e.target.value.replace(/\D/g, '')})} className="input" maxLength={11} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Naturalidade (UF)</label>
              <select value={selectedUf} onChange={e => handleUfChange(e.target.value)} className="input">
                <option value="">Selecione...</option>
                {ufs.map(uf => <option key={uf.id} value={uf.sigla}>{uf.nome}</option>)}
              </select>
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Cidade de Nascimento</label>
              <select disabled={!selectedUf || loadingCities} value={selectedCity} onChange={e => setSelectedCity(e.target.value)} className="input">
                <option value="">{loadingCities ? 'Carregando...' : 'Selecione...'}</option>
                {cities.map(city => <option key={city.id} value={city.nome}>{city.nome}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* ACADÊMICO */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="flex items-center gap-3">
             <div className="icon-box" style={{ width: '40px', height: '40px', backgroundColor: 'hsl(var(--warning) / 0.1)', color: 'hsl(var(--warning))' }}><Shield size={20} /></div>
             <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>2. Alocação Acadêmica</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Nível de Ensino *</label>
              <select required value={formData.education_level_id} onChange={e => handleLevelChange(e.target.value)} className="input">
                <option value="">Selecione...</option>
                {academicLevels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Série / Ano *</label>
              <select required disabled={!formData.education_level_id} value={formData.grade_id} onChange={e => handleGradeChange(e.target.value)} className="input">
                <option value="">Selecione...</option>
                {academicGrades.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.5rem' }}>Turma Destino</label>
              <select value={formData.class_id || ''} onChange={e => setFormData({...formData, class_id: e.target.value})} className="input" disabled={!formData.grade_id}>
                <option value="">A definir...</option>
                {academicClasses.map(c => <option key={c.id} value={c.id}>{c.name} ({c.turn?.name})</option>)}
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.5rem', marginBottom: '4rem' }}>
          <button type="button" onClick={() => navigate('/admin/students')} className="btn btn-secondary">Cancelar</button>
          <button type="submit" disabled={submitLoading} className="btn btn-primary" style={{ padding: '1rem 3rem' }}>
             {submitLoading ? 'Salvando...' : <><Check size={24} /> Atualizar Cadastro</>}
          </button>
        </div>
      </form>
    </div>
  )
}
