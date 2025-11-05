import { useState } from 'react'
import { quadras, getLotes } from '../lotes'
import { supabase } from '../services/supabase'
import '../components/Cadastrar.css'

export default function Cadastrar({
  quadraSelecionada,
  setQuadraSelecionada,
  lotesDisponiveis,
  setLotesDisponiveis,
  voltarParaRegistros
}) {
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [prisma, setPrisma] = useState('')
  const [placa, setPlaca] = useState('')
  const [tipo, setTipo] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [loteSelecionado, setLoteSelecionado] = useState('')

  const handleFocus = (e) => {
    setTimeout(() => {
      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 300)
  }

  const handleQuadraChange = (e) => {
    const valor = e.target.value
    setQuadraSelecionada(valor)
    setLotesDisponiveis(getLotes(valor))
  }

  const handleCadastrar = async () => {
  if (!nome || !cpf) {
    alert('Preencha pelo menos o Nome e o CPF!')
    return
  }

  const horaEntrada = new Date().toISOString() // salva UTC

  const { error } = await supabase.from('cadastros').insert([
    {
      quadra: quadraSelecionada || null,
      lote: loteSelecionado || null,
      nome,
      cpf,
      prisma: prisma || null,
      placa: placa || null,
      tipo: tipo || null,
      observacoes: observacoes || null,
      hora_entrada: horaEntrada,
    }
  ])

  if (error) {
    alert('Erro ao cadastrar: ' + error.message)
  } else {
    alert('Registro cadastrado com sucesso!')
    setNome('')
    setCpf('')
    setPrisma('')
    setPlaca('')
    setTipo('')
    setObservacoes('')
    setQuadraSelecionada('')
    setLoteSelecionado('')
    setLotesDisponiveis([])
    voltarParaRegistros()
  }
}


  return (
    <div className="tela-conteudo">
      <h2>Cadastrar Novo Usuário</h2>

      {/* Quadra e Lote */}
      <div className="select-container">
        <label htmlFor="quadra">Quadra:</label>
        <select
          id="quadra"
          className="input-quadra"
          value={quadraSelecionada}
          onChange={handleQuadraChange}
          onFocus={handleFocus}
        >
          <option value="">Selecione</option>
          {Object.keys(quadras).map((q) => (
            <option key={q} value={q}>{q}</option>
          ))}
        </select>
      </div>

      <div className="select-container">
        <label htmlFor="lote">Lote:</label>
        <select
          id="lote"
          className="input-lote"
          value={loteSelecionado}
          onChange={(e) => setLoteSelecionado(e.target.value)}
          onFocus={handleFocus}
        >
          <option value="">Selecione o lote</option>
          {lotesDisponiveis.map((num) => (
            <option key={num} value={num}>{num}</option>
          ))}
        </select>
      </div>

      {/* Nome completo */}
      <div className="form-group">
        <label>Nome completo: <span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          className="input-cadastro"
          placeholder="Digite o nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          onFocus={handleFocus}
        />
      </div>

      {/* CPF */}
      <div className="form-group">
        <label>CPF ou RG: <span style={{ color: 'red' }}>*</span></label>
        <input
          type="text"
          className="input-cadastro"
          placeholder="000.000.000-00"
          maxLength="14"
          value={cpf}
          onChange={(e) => {
            let v = e.target.value.replace(/\D/g, '')
            if (v.length <= 11) {
              v = v.replace(/(\d{3})(\d)/, '$1.$2')
              v = v.replace(/(\d{3})(\d)/, '$1.$2')
              v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
            } else {
              v = v.slice(0, 11)
            }
            setCpf(v)
          }}
          onFocus={handleFocus}
        />
      </div>

      {/* Prisma */}
      <div className="form-group">
        <label>Prisma:</label>
        <select
          className="input-cadastro"
          value={prisma}
          onChange={(e) => setPrisma(e.target.value)}
          onFocus={handleFocus}
        >
          <option value="">Selecione</option>
          {[...Array(100)].map((_, i) => {
            const numero = i + 1
            const cores = ['Verde', 'Amarelo', 'Marrom', 'Azul']
            return cores.map((cor) => (
              <option key={`${cor}-${numero}`} value={`${cor}-${numero}`}>
                {`Prisma ${numero} - ${cor}`}
              </option>
            ))
          })}
        </select>
      </div>

      {/* Placa */}
      <div className="form-group">
        <label>Placa do carro:</label>
        <input
          type="text"
          className="input-cadastro"
          placeholder="ABC-1234"
          maxLength="8"
          value={placa}
          onChange={(e) => {
            let val = e.target.value.toUpperCase()
              .replace(/[^A-Z0-9]/g, '')
              .replace(/([A-Z]{3})(\d)/, '$1-$2')
              .slice(0, 8)
            setPlaca(val)
          }}
          onFocus={handleFocus}
        />
      </div>

      {/* Tipo */}
      <div className="form-group">
        <label>Tipo:</label>
        <select
          className="input-cadastro"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          onFocus={handleFocus}
        >
          <option value="">Selecione</option>
          <option value="visitante">Visitante</option>
          <option value="prestador">Prestador de serviço</option>
          <option value="entregador">Entregador</option>
        </select>
      </div>

      {/* Observações */}
      <div className="form-group">
        <label>Observações:</label>
        <textarea
          placeholder="Digite observações adicionais..."
          rows="3"
          className="input-cadastro"
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          onFocus={handleFocus}
        />
      </div>

      <div className="form-group" style={{ textAlign: 'center', marginTop: '1rem' }}>
        <button
          className="btn-pesquisar"
          onClick={handleCadastrar}
          style={{ padding: '0.8rem 1.5rem', fontSize: '1rem', borderRadius: '8px' }}
        >
          Cadastrar
        </button>
      </div>
    </div>
  )
}
