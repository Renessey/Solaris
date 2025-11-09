import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { quadras, getLotes } from '../lotes'
import { FiX } from 'react-icons/fi'
import '../components/Registros.css'

export default function Registros({
  quadraSelecionada,
  setQuadraSelecionada,
  lotesDisponiveis,
  setLotesDisponiveis
}) {
  const [registros, setRegistros] = useState([])
  const [totalRegistrosHoje, setTotalRegistrosHoje] = useState([]) // total do dia
  const [busca, setBusca] = useState('')
  const [loteSelecionado, setLoteSelecionado] = useState('')
  const [prismaSelecionado, setPrismaSelecionado] = useState('')
  const [mostrarTopo, setMostrarTopo] = useState(false) // botão topo

  const cores = ['Verde', 'Amarelo', 'Marrom', 'Azul']

  const hojeBrasilia = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Sao_Paulo"
  }).format(new Date())

  const formatarHora = (dataISO) => {
    if (!dataISO) return '—'
    return new Date(dataISO).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      hour12: false
    })
  }

  const handleQuadraChange = (e) => {
    const valor = e.target.value
    setQuadraSelecionada(valor)
    setLotesDisponiveis(getLotes(valor))
    setLoteSelecionado('')
  }

  // Função genérica para buscar registros e total do dia com filtros
  const buscarDados = async ({ somenteNome = false } = {}) => {
    const inicio = `${hojeBrasilia}T00:00:00`
    const fim = `${hojeBrasilia}T23:59:59`

    let query = supabase
      .from('cadastros')
      .select('*')
      .gte('created_at', inicio)
      .lte('created_at', fim)
      .is('hora_saida', null)

    // Aplica filtros
    if (somenteNome && busca.trim() !== '') {
      query = query.ilike('nome', `%${busca.trim()}%`)
    } else {
      if (quadraSelecionada) query = query.eq('quadra', quadraSelecionada)
      if (loteSelecionado) query = query.eq('lote', loteSelecionado)
      if (prismaSelecionado) query = query.eq('prisma', prismaSelecionado)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    if (!error) setRegistros(data)
    else console.error(error)

    // Total considerando os mesmos filtros
    let totalQuery = supabase
      .from('cadastros')
      .select('*')
      .gte('created_at', inicio)
      .lte('created_at', fim)
      .is('hora_saida', null)

    if (!somenteNome) {
      if (quadraSelecionada) totalQuery = totalQuery.eq('quadra', quadraSelecionada)
      if (loteSelecionado) totalQuery = totalQuery.eq('lote', loteSelecionado)
      if (prismaSelecionado) totalQuery = totalQuery.eq('prisma', prismaSelecionado)
    } else if (busca.trim() !== '') {
      totalQuery = totalQuery.ilike('nome', `%${busca.trim()}%`)
    }

    const { data: totalData, error: totalError } = await totalQuery
    if (!totalError) setTotalRegistrosHoje(totalData)
    else console.error(totalError)
  }

  // Atualiza registros e total sempre que filtros ou busca mudarem
  useEffect(() => {
    buscarDados(busca.trim() !== '' ? { somenteNome: true } : {})
  }, [busca, quadraSelecionada, loteSelecionado, prismaSelecionado])

  // Botão scroll para topo
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) setMostrarTopo(true)
      else setMostrarTopo(false)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const irParaTopo = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const limparBusca = () => setBusca('')

  const darBaixa = async (id) => {
    const horaBR = new Date().toLocaleString("sv-SE", {
      timeZone: "America/Sao_Paulo"
    }).replace("T", " ")

    await supabase
      .from("cadastros")
      .update({ hora_saida: horaBR })
      .eq("id", id)

    buscarDados(busca.trim() !== '' ? { somenteNome: true } : {})
  }

  return (
    <>
      {/* BUSCA */}
      <div className="busca-container">
        <div className="busca-input-wrapper">
          <input
            type="text"
            placeholder="Buscar pelo nome"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="busca-input"
          />
          {busca && (
            <button className="busca-clear" onClick={limparBusca}>
              <FiX size={20} />
            </button>
          )}
        </div>
      </div>

      {/* PRISMA */}
      <div className="filtros-container">
        <div className="filtro-box">
          <select
            value={prismaSelecionado}
            onChange={(e) => setPrismaSelecionado(e.target.value)}
            className="select-box"
          >
            <option value="">PRISMA</option>
            {[...Array(100)].map((_, i) =>
              cores.map((cor) => (
                <option key={`${cor}-${i + 1}`} value={`${cor}-${i + 1}`}>
                  Prisma {i + 1} — {cor}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* QUADRA E LOTE */}
      <div className="filtros-container">
        <div className="filtro-box">
          <select
            value={quadraSelecionada}
            onChange={handleQuadraChange}
            className="select-box"
          >
            <option value="">QUADRA</option>
            {Object.keys(quadras).map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>
        <div className="filtro-box">
          <select
            value={loteSelecionado}
            onChange={(e) => setLoteSelecionado(e.target.value)}
            className="select-box"
          >
            <option value="">LOTE</option>
            {lotesDisponiveis.map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="contador-registros">
        Total: {totalRegistrosHoje.length} registro(s)
      </div>

      <div className="container-logs">
        <h2>Cadastros de Hoje</h2>
        {registros.length === 0 ? (
          <p>Nenhum registro encontrado.</p>
        ) : (
          <div className="cards-container">
            {registros.map((r) => (
              <div className="registro-card" key={r.id}>
                <div className="registro-topo">
                  <span>{r.nome || '—'}</span>
                  <span>{r.cpf || '—'}</span>
                </div>
                <div className="registro-info">
                  <div>
                    <div><strong>Quadra:</strong> {r.quadra || '—'}</div>
                    <div><strong>Lote:</strong> {r.lote || '—'}</div>
                  </div>
                  <div>
                    <div><strong>Prisma:</strong> {r.prisma || '—'}</div>
                    <div><strong>Tipo:</strong> {r.tipo || '—'}</div>
                  </div>
                </div>
                <div className="registro-info">
                  <div><strong>Placa:</strong> {r.placa || '—'}</div>
                </div>
                <div className="registro-hora">
                  <strong>Entrada:</strong> {formatarHora(r.hora_entrada || r.created_at)}
                </div>
                {r.observacoes && (
                  <div className="registro-obs">
                    <strong>Observações:</strong> {r.observacoes}
                  </div>
                )}
                <button onClick={() => darBaixa(r.id)} className="btn-baixa">
                  Dar Baixa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOTÃO SCROLL PARA TOPO */}
      {mostrarTopo && (
        <button className="btn-topo" onClick={irParaTopo}>
          ↑
        </button>
      )}
    </>
  )
}
