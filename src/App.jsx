import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Inicio from './Paginas/Inicio'
import BuscaMapa from './Paginas/BuscaMapa'
import Notificacoes from './Paginas/Notificacoes'
import Login from './Paginas/Login'
import Cadastro from './Paginas/Cadastro'
import PaginaStatus from './Paginas/PaginaStatus'

export default function App() {
  const [usuarioLogado, setUsuarioLogado] = useState(null)

  function atualizarUsuario() {
    const salvo = localStorage.getItem('usuarioLogado')
    setUsuarioLogado(salvo ? JSON.parse(salvo) : null)
  }

  useEffect(() => {
    atualizarUsuario()
    window.atualizarUsuarioLogado = atualizarUsuario
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '70px' }}>
      
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/busca" element={<BuscaMapa />} />
        <Route path="/chamadas" element={<Notificacoes />} />
        <Route path="/status" element={<PaginaStatus />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
      </Routes>

      <nav style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '12px 0',
        zIndex: 999
      }}>
        <button 
          onClick={() => useNavigate.navigate('/inicio')}
          style={{ border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', color: '#374151' }}
        >
          Início
        </button>

        {usuarioLogado?.tipo === 'dono' && (
          <button 
            onClick={() => useNavigate.navigate('/busca')}
            style={{ border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', color: '#22c55e', fontWeight: 'bold' }}
          >
            Buscar
          </button>
        )}

        {usuarioLogado?.tipo === 'cuidador' && (
          <button 
            onClick={() => useNavigate.navigate('/chamadas')}
            style={{ border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', color: '#2563eb', fontWeight: 'bold' }}
          >
            Chamadas
          </button>
        )}

        {usuarioLogado?.tipo === 'cuidador' && (
          <button 
            onClick={() => useNavigate.navigate('/status')}
            style={{ border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', color: '#f97316', fontWeight: 'bold' }}
          >
            Status
          </button>
        )}

        {!usuarioLogado && (
          <>
            <button 
              onClick={() => useNavigate.navigate('/entrar')}
              style={{ border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', color: '#374151' }}
            >
              Entrar
            </button>
            <button 
              onClick={() => useNavigate.navigate('/cadastro')}
              style={{ border: 'none', background: 'transparent', fontSize: '14px', cursor: 'pointer', color: '#374151' }}
            >
              Cadastrar
            </button>
          </>
        )}
      </nav>
    </div>
  )
}