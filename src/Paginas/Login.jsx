import { useState } from 'react'

function Login({ aoMudarPagina }) {
  const [formulario, setFormulario] = useState({
    email: '',
    senha: ''
  })
  const [mensagem, setMensagem] = useState('')

  function aoDigitar(e) {
    const { name, value } = e.target
    setFormulario({ ...formulario, [name]: value })
  }

  function aoEntrar(e) {
    e.preventDefault()

    const usuariosSalvos = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const usuarioEncontrado = usuariosSalvos.find(u => u.email === formulario.email)

    if (!usuarioEncontrado) {
      setMensagem('⚠️ E-mail não encontrado! Verifique ou cadastre-se.')
      return
    }
    if (usuarioEncontrado.senha !== formulario.senha) {
      setMensagem('⚠️ Senha incorreta! Tente novamente.')
      return
    }

    localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado))
    setMensagem(`✅ Bem-vindo de volta, ${usuarioEncontrado.nome}! 🐾 Entrando...`)
    if (window.atualizarUsuarioLogado) {
  window.atualizarUsuarioLogado()
}
    // ✅ Redireciona para a página inicial (sem usar o react-router-dom!)
    setTimeout(() => {
      aoMudarPagina('inicio')
    }, 2000)
  }

  return (
    <div style={estilos.container}>
      <div style={estilos.caixa}>
        <span style={estilos.icone}>🔐</span>
        <h1 style={estilos.titulo}>Entrar na Conta</h1>
        <p style={estilos.subtitulo}>Bem-vindo de volta! Faça login para continuar.</p>

        {mensagem && <div style={estilos.mensagem}>{mensagem}</div>}

        <form onSubmit={aoEntrar} style={estilos.formulario}>
          <div style={estilos.grupo}>
            <label style={estilos.rotulo}>📧 Seu E-mail</label>
            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={aoDigitar}
              placeholder="exemplo@email.com"
              style={estilos.campo}
              required
            />
          </div>
          <div style={estilos.grupo}>
            <label style={estilos.rotulo}>🔒 Senha</label>
            <input
              type="password"
              name="senha"
              value={formulario.senha}
              onChange={aoDigitar}
              placeholder="Sua senha de acesso"
              style={estilos.campo}
              required
              minLength={6}
            />
          </div>
          <button type="submit" style={estilos.botao}>
            Entrar 🚪
          </button>
        </form>

        <p style={estilos.link}>
          Não tem conta?{' '}
          <button onClick={() => aoMudarPagina('cadastro')} style={estilos.botaoLink}>
            Cadastre-se agora 📝
          </button>
        </p>
        <p style={estilos.link}>
          <button onClick={() => aoMudarPagina('inicio')} style={estilos.botaoLink}>
            ← Voltar para a Página Inicial
          </button>
        </p>
      </div>
    </div>
  )
}

const estilos = {
  container: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    maxWidth: '500px',
    margin: '40px auto',
    padding: '20px'
  },
  caixa: {
    background: '#fffbeb',
    padding: '35px',
    borderRadius: '20px',
    border: '3px solid #fcd34d',
    boxShadow: '0 5px 20px rgba(245, 158, 11, 0.2)'
  },
  icone: {
    fontSize: '48px',
    textAlign: 'center',
    display: 'block',
    marginBottom: '5px'
  },
  titulo: {
    textAlign: 'center',
    color: '#78350f',
    marginBottom: '8px',
    fontSize: '26px'
  },
  subtitulo: {
    textAlign: 'center',
    color: '#92400e',
    marginBottom: '30px',
    fontSize: '15px'
  },
  mensagem: {
    background: '#fef3c7',
    color: '#78350f',
    padding: '14px',
    borderRadius: '10px',
    marginBottom: '22px',
    textAlign: 'center',
    fontWeight: '500',
    border: '1px solid #f59e0b'
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  grupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '7px'
  },
  rotulo: {
    fontWeight: '600',
    color: '#78350f',
    fontSize: '15px'
  },
  campo: {
    padding: '13px',
    borderRadius: '10px',
    border: '2px solid #fcd34d',
    fontSize: '16px',
    backgroundColor: '#fffef5'
  },
  botao: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#ffffff',
    padding: '14px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '10px',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(245, 158, 11, 0.35)'
  },
  link: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#92400e',
    fontSize: '15px'
  },
  botaoLink: {
    background: 'transparent',
    border: 'none',
    color: '#d97706',
    fontSize: '15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    padding: 0,
    textDecoration: 'underline'
  }
}

export default Login