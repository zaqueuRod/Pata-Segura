import { useState, useEffect } from 'react'
import Inicio from './Paginas/Inicio'
import BuscaMapa from './Paginas/BuscaMapa'
import Notificacoes from './Paginas/Notificacoes'
import Cuidadores from './Paginas/Cuidadores'
import Login from './Paginas/Login'
import Cadastro from './Paginas/Cadastro'
import PaginaStatus from './Paginas/PaginaStatus'

export default function App() {
  const [paginaAtual, setPaginaAtual] = useState('inicio')
  const [usuarioLogado, setUsuarioLogado] = useState(null)

  // ✅ Carrega o usuário quando abre ou muda de página
  useEffect(() => {
    carregarUsuarioSalvo()
  }, [paginaAtual])

  // ✅ Função que lê o usuário salvo
  function carregarUsuarioSalvo() {
    const logado = localStorage.getItem('usuarioLogado')
    if (logado) {
      setUsuarioLogado(JSON.parse(logado))
    } else {
      setUsuarioLogado(null)
    }
  }

  // ✅ Verificações
  const ehDono = usuarioLogado?.tipo === 'dono'
  const ehCuidador = usuarioLogado?.tipo === 'cuidador' || usuarioLogado?.tipo === 'passeador'
  const estaLogado = !!usuarioLogado

  // ✅ Disponibiliza a função de atualizar para as páginas
  useEffect(() => {
    window.atualizarUsuarioLogado = carregarUsuarioSalvo
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      margin: 0,
      padding: 0,
      paddingBottom: '75px',
      backgroundColor: '#f0f4f8'
    }}>
      <main>
        {paginaAtual === 'inicio' && <Inicio aoMudarPagina={setPaginaAtual} />}
        {paginaAtual === 'buscamapa' && <BuscaMapa />}
        {paginaAtual === 'notificacoes' && <Notificacoes />}
        {paginaAtual === 'cuidadores' && <Cuidadores />}
        {paginaAtual === 'login' && <Login aoMudarPagina={setPaginaAtual} />}
        {paginaAtual === 'cadastro' && <Cadastro aoMudarPagina={setPaginaAtual} />}
        {paginaAtual === 'status' && ehCuidador && <PaginaStatus />}
      </main>

      {/* 🧭 BARRA DE NAVEGAÇÃO */}
      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderTop: '2px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '10px 0',
        zIndex: 100
      }}>
        
        <button onClick={() => setPaginaAtual('inicio')} style={{background:'none',border:'none',fontSize:'13px',color:'#4b5563',cursor:'pointer',padding:'5px 10px'}}>
          🏠 Início
        </button>

        {/* ✅ 🔍 BUSCAR — SÓ DONO LOGADO */}
        {estaLogado && ehDono && (
          <button onClick={() => setPaginaAtual('buscamapa')} style={{background:'none',border:'none',fontSize:'13px',color:'#4b5563',cursor:'pointer',padding:'5px 10px'}}>
            🔍 Buscar
          </button>
        )}

        {/* ✅ 🔔 CHAMADAS — SÓ CUIDADOR LOGADO */}
        {estaLogado && ehCuidador && (
          <button onClick={() => setPaginaAtual('notificacoes')} style={{background:'none',border:'none',fontSize:'13px',color:'#2563eb',cursor:'pointer',padding:'5px 10px',fontWeight:'bold'}}>
            🔔 CHAMADAS
          </button>
        )}

        <button onClick={() => setPaginaAtual('login')} style={{background:'none',border:'none',fontSize:'13px',color:'#4b5563',cursor:'pointer',padding:'5px 10px'}}>
          👤 Entrar
        </button>
        <button onClick={() => setPaginaAtual('cadastro')} style={{background:'none',border:'none',fontSize:'13px',color:'#4b5563',cursor:'pointer',padding:'5px 10px'}}>
          ✍️ Cadastrar
        </button>
      </nav>
    </div>
  )
}