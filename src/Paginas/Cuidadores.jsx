import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

function Cuidadores() {
  const [cuidadores, setCuidadores] = useState([])
  const [usuarioLogado, setUsuarioLogado] = useState(null)

  // Carregar dados ao abrir a página
  useEffect(() => {
    // 1. Verificar se alguém está logado
    const logado = localStorage.getItem('usuarioLogado')
    if (logado) {
      setUsuarioLogado(JSON.parse(logado))
    }

    // 2. Pegar todos os usuários cadastrados
    const todosUsuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')

    // 3. Filtrar apenas os que são CUIDADORES/PASSEADORES
    const listaCuidadores = todosUsuarios.filter(u => u.tipo === 'cuidador')
    setCuidadores(listaCuidadores)
  }, [])

  return (
    <div style={estilos.container}>
      <header style={estilos.cabecalho}>
        <h1>🐾 Cuidadores & Passeadores Disponíveis</h1>
        <p>Pessoas prontas para cuidar e passear com seu melhor amigo!</p>
      </header>

      {cuidadores.length === 0 ? (
        <div style={estilos.vazio}>
          <span style={{fontSize: '60px'}}>🐕</span>
          <h3>Nenhum cuidador cadastrado ainda</h3>
          <p>Ainda não temos passeadores ou cuidadores disponíveis. Se você deseja oferecer seus serviços, cadastre-se como cuidador!</p>
          <Link to="/cadastro" style={estilos.botao}>Quero ser Cuidador 🤝</Link>
        </div>
      ) : (
        <div style={estilos.lista}>
          {cuidadores.map(cuidador => (
            <div key={cuidador.id} style={estilos.cartao}>
              <div style={estilos.avatar}>🐶</div>
              <h3 style={estilos.nome}>{cuidador.nome}</h3>
              <p style={estilos.tipo}>Passeador & Cuidador</p>
              
              <div style={estilos.contato}>
                <p>📧 {cuidador.email}</p>
                <p>📱 {cuidador.telefone}</p>
              </div>

              {usuarioLogado && usuarioLogado.tipo === 'dono' ? (
                <button style={estilos.botaoContato}>Solicitar Serviço 📩</button>
              ) : (
                <p style={estilos.aviso}>Faça login como Dono para solicitar</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const estilos = {
  container: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    maxWidth: '1000px',
    margin: '0 auto',
    padding: '20px'
  },
  cabecalho: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fffbeb',
    padding: '35px 25px',
    borderRadius: '20px',
    textAlign: 'center',
    marginBottom: '30px',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
  },
  vazio: {
    background: '#fffbeb',
    padding: '50px 30px',
    borderRadius: '20px',
    border: '3px dashed #fcd34d',
    textAlign: 'center',
    color: '#78350f'
  },
  lista: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '25px'
  },
  cartao: {
    background: '#fffbeb',
    padding: '25px',
    borderRadius: '18px',
    border: '3px solid #fcd34d',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
    textAlign: 'center'
  },
  avatar: {
    fontSize: '45px',
    marginBottom: '10px'
  },
  nome: {
    color: '#78350f',
    fontSize: '20px',
    margin: '5px 0'
  },
  tipo: {
    color: '#92400e',
    fontStyle: 'italic',
    marginBottom: '15px'
  },
  contato: {
    background: '#fff',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '15px',
    fontSize: '14px',
    color: '#451a03',
    lineHeight: '1.6'
  },
  botao: {
    display: 'inline-block',
    background: '#f59e0b',
    color: '#fff',
    padding: '12px 25px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontWeight: 'bold',
    marginTop: '15px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px'
  },
  botaoContato: {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '15px'
  },
  aviso: {
    color: '#a16207',
    fontSize: '13px',
    fontStyle: 'italic'
  }
}

export default Cuidadores