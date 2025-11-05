import { useState, useEffect, useRef } from 'react'
import './App.css'
import Registros from './components/Registros'
import Cadastrar from './components/Cadastrar'
import Sistema from './components/Sistema'

function App() {
  const [quadraSelecionada, setQuadraSelecionada] = useState('')
  const [lotesDisponiveis, setLotesDisponiveis] = useState([])
  const [dataAtual, setDataAtual] = useState('')
  const [busca, setBusca] = useState('')
  const [tela, setTela] = useState('registros')
  const [menuAberto, setMenuAberto] = useState(false)

  // Referência do container do menu flutuante
  const fabRef = useRef(null)

  useEffect(() => {
    const hoje = new Date()
    const dia = String(hoje.getDate()).padStart(2, '0')
    const mes = String(hoje.getMonth() + 1).padStart(2, '0')
    const ano = hoje.getFullYear()
    setDataAtual(`${dia}/${mes}/${ano}`)
  }, [])

  const handlePesquisa = () => {
    alert(`Buscando por: ${busca}`)
  }

  const alternarMenu = () => setMenuAberto(!menuAberto)
  const mudarTela = (novaTela) => {
    setTela(novaTela)
    setMenuAberto(false)
  }

  // Fecha menu ao clicar fora
  useEffect(() => {
    const handleClickFora = (event) => {
      if (fabRef.current && !fabRef.current.contains(event.target)) {
        setMenuAberto(false)
      }
    }
    document.addEventListener('mousedown', handleClickFora)
    return () => {
      document.removeEventListener('mousedown', handleClickFora)
    }
  }, [])

  return (
    <div className="app">
      <h1>Site cadastral</h1>
      <p>Cadastros do dia: {dataAtual}</p>

      {tela === 'registros' && (
        <Registros
          quadraSelecionada={quadraSelecionada}
          setQuadraSelecionada={setQuadraSelecionada}
          lotesDisponiveis={lotesDisponiveis}
          setLotesDisponiveis={setLotesDisponiveis}
          busca={busca}
          setBusca={setBusca}
          handlePesquisa={handlePesquisa}
        />
      )}

      {tela === 'cadastrar' && (
        <Cadastrar
          quadraSelecionada={quadraSelecionada}
          setQuadraSelecionada={setQuadraSelecionada}
          lotesDisponiveis={lotesDisponiveis}
          setLotesDisponiveis={setLotesDisponiveis}
          voltarParaRegistros={() => setTela('registros')}
        />
      )}

      {tela === 'sistema' && <Sistema />}

      {/* Botão flutuante */}
      <div className="fab-container" ref={fabRef}>
        {menuAberto && (
          <div className="fab-menu">
            <button onClick={() => mudarTela('registros')}>📄 Registros</button>
            <button onClick={() => mudarTela('cadastrar')}>➕ Cadastrar</button>
            <button onClick={() => mudarTela('sistema')}>⚙️ Sistema</button>
          </div>
        )}
        <button className="fab-button" onClick={alternarMenu}>
          {menuAberto ? '✖' : '+'}
        </button>
      </div>
    </div>
  )
}

export default App
