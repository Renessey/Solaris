import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { quadras, getLotes } from '../lotes'
import { FiX } from 'react-icons/fi'
import '../components/Registros.css'

export default function Registros({ quadraSelecionada, setQuadraSelecionada, lotesDisponiveis, setLotesDisponiveis }) {
  const [registros, setRegistros] = useState([])
  const [busca, setBusca] = useState('')
  const [loteSelecionado, setLoteSelecionado] = useState('')

  const hoje = new Date().toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" }).split(" ")[0]

  const handleQuadraChange = (e) => {
    const valor = e.target.value
    setQuadraSelecionada(valor)
    setLotesDisponiveis(getLotes(valor))
    setLoteSelecionado('')
  }

  const buscarRegistros = async () => {
    const inicioDia = `${hoje} 00:00:00`
    const fimDia = `${hoje} 23:59:59`

    let query = supabase
      .from('cadastros')
      .select('*')
      .gte('created_at', inicioDia)
      .lte('created_at', fimDia)
      .is('hora_saida', null)

    if (busca) query = query.ilike('nome', `%${busca}%`)
    if (quadraSelecionada) query = query.eq('quadra', quadraSelecionada)
    if (loteSelecionado) query = query.eq('lote', loteSelecionado)

    const { data, error } = await query.order('created_at', { ascending: false })

    if (!error) setRegistros(data)
  }

  // ✅ Auto atualização ao digitar ou selecionar filtros
  useEffect(() => {
    buscarRegistros()
  }, [busca, quadraSelecionada, loteSelecionado])

  // ✅ Carrega ao abrir
  useEffect(() => {
    buscarRegistros()
  }, [])

  const limparBusca = () => {
    setBusca('')
  }

  const darBaixa = async (id) => {
    const agora = new Date();
    const horaBrasil = agora
      .toLocaleString("sv-SE", { timeZone: "America/Sao_Paulo" })
      .replace("T", " ");

    await supabase
      .from("cadastros")
      .update({ hora_saida: horaBrasil })
      .eq("id", id);

    buscarRegistros();
  };

  const formatarHoraBrasilia = (dataISO) => {
    if (!dataISO) return '—'
    const data = new Date(dataISO)
    return data.toLocaleString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour12: false,
    })
  }

  return (
    <>

      {/* Barra de Busca */}
      <div className="busca-container">

        <div className="busca-input-wrapper">
          <input
            type="text"
            placeholder="Nome completo"
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

      {/* Filtro Quadra + Lote */}
      <div className="filtros-container">

        <div className="filtro-box">
          <label>Quadra:</label>
          <select value={quadraSelecionada} onChange={handleQuadraChange} className="select-box">
            <option value="">Selecione</option>
            {Object.keys(quadras).map((q) => (
              <option key={q} value={q}>{q}</option>
            ))}
          </select>
        </div>

        <div className="filtro-box">
          <label>Lote:</label>
          <select value={loteSelecionado} onChange={(e) => setLoteSelecionado(e.target.value)} className="select-box">
            <option value="">Selecione o lote</option>
            {lotesDisponiveis.map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Registros */}
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

                <div className="registro-hora">
                  <strong>Entrada:</strong> {formatarHoraBrasilia(r.hora_entrada || r.created_at)}
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

    </>
  )
}
