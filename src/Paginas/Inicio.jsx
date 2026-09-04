import { useState, useEffect } from 'react'

function Inicio({ aoMudarPagina }) {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const logado = localStorage.getItem('usuarioLogado')
    if (logado) {
      setUsuario(JSON.parse(logado))
    }
  }, [])

  function sair() {
    localStorage.removeItem('usuarioLogado')
    setUsuario(null)
  }

  return (
    <div style={estilos.container}>
      <header style={estilos.cabecalho}>
        <span style={estilos.icone}>🐾</span>
        <h1>Pata Segura</h1>
        
        {usuario ? (
          <div>
            <p style={{fontSize: '18px', margin: '10px 0'}}>
              Olá, <strong>{usuario.nome}</strong>! 👋 
              {usuario.tipo === 'cuidador' ? ' Você está pronto para ajudar!' : ' Encontre cuidadores para seu pet!'}
            </p>
            <button 
           onClick={() => {
            localStorage.removeItem('usuarioLogado')
            if (window.atualizarUsuarioLogado) {
            window.atualizarUsuarioLogado() // ✅ Atualiza na hora sem recarregar!
           }
           window.location.reload() // ✅ RECARREGA A PÁGINA SOZINHA!
           props.aoMudarPagina('inicio')
           
            }}
            
             style={estilos.botaoSair}> 🚪 Sair 
             </button>  
             
          </div>

  

          
        ) : (
          <p>Seu melhor amigo em boas mãos enquanto você viaja!</p>
        )}
      </header>

      <section style={estilos.conteudo}>
        <h2 style={estilos.tituloSecao}>Por que confiar em nós?</h2>
        
        <div style={estilos.cards}>
          <div style={estilos.card}>
            <span style={estilos.iconeCard}>🛡️</span>
            <h3>Cuidado com Confiança</h3>
            <p>Todos os passeadores e cuidadores são verificados e avaliados para total tranquilidade.</p>
          </div>
          <div style={estilos.card}>
            <span style={estilos.iconeCard}>🚶</span>
            <h3>Passeios Alegres</h3>
            <p>Seu cão ganha rotina, exercício e muita diversão com pessoas que amam animais.</p>
          </div>
          <div style={estilos.card}>
            <span style={estilos.iconeCard}>❤️</span>
            <h3>Carinho e Dedicação</h3>
            <p>Tratamos seu pet com o mesmo amor e cuidado que você trata em casa.</p>
          </div>
          <div style={estilos.card}>
            <span style={estilos.iconeCard}>📍</span>
            <h3>Perto de Você</h3>
            <p>Encontre profissionais de confiança na sua região, disponíveis quando precisar.</p>
          </div>
        </div>

        {!usuario && (
          <div style={estilos.botaoArea}>
            <button onClick={() => aoMudarPagina('cadastro')} style={estilos.botao}>
              Quero me Cadastrar 🐕
            </button>
            <p style={{marginTop: '15px', color: '#78350f'}}>
              Já tem conta?{' '}
              <button onClick={() => aoMudarPagina('login')} style={estilos.linkTexto}>
                Entre aqui →
              </button>
            </p>
          </div>
        )}
      </section>

      <footer style={estilos.rodape}>
        <p>🐶 Feito com amor e carinho pelos nossos amigos de quatro patas.</p>
      </footer>
    </div>
  )
}

const estilos = {
  container: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px'
  },
  cabecalho: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#fffbeb',
    padding: '45px 25px',
    borderRadius: '20px',
    textAlign: 'center',
    marginBottom: '35px',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)'
  },
  icone: {
    fontSize: '48px',
    display: 'block',
    marginBottom: '10px'
  },
  tituloSecao: {
    textAlign: 'center',
    fontSize: '28px',
    color: '#78350f',
    marginBottom: '10px'
  },
  conteudo: {
    fontSize: '17px',
    lineHeight: '1.7',
    color: '#451a03'
  },
  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '22px',
    marginTop: '30px'
  },
  card: {
    background: '#fffbeb',
    padding: '25px',
    borderRadius: '16px',
    border: '2px solid #fcd34d',
    boxShadow: '0 3px 10px rgba(245, 158, 11, 0.15)',
    textAlign: 'center'
  },
  iconeCard: {
    fontSize: '36px',
    display: 'block',
    marginBottom: '12px'
  },
  botaoArea: {
    textAlign: 'center',
    marginTop: '45px'
  },
  botao: {
    display: 'inline-block',
    background: '#f59e0b',
    color: '#ffffff',
    padding: '15px 35px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '19px',
    fontWeight: 'bold',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)',
    border: 'none',
    cursor: 'pointer'
  },
  linkTexto: {
    background: 'transparent',
    border: 'none',
    color: '#d97706',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer'
  },
  botaoSair: {
    background: 'rgba(255,255,255,0.25)',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '15px',
    cursor: 'pointer'
  },
  rodape: {
    textAlign: 'center',
    marginTop: '50px',
    paddingTop: '20px',
    borderTop: '2px dashed #fcd34d',
    color: '#92400e',
    fontSize: '15px'
  }
}

export default Inicio