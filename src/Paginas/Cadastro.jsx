import { useState } from 'react'

function Cadastro({ aoMudarPagina }) {
  const [formulario, setFormulario] = useState({
    nome: '',
    email: '',
    telefone: '',
    tipo: 'dono',
    senha: ''
  })
  const [mensagem, setMensagem] = useState('')

  function aoDigitar(e) {
    const { name, value } = e.target
    setFormulario({ ...formulario, [name]: value })
  }

  function aoEnviar(e) {
    e.preventDefault()

    // ✅ 1. Verificar se o e-mail JÁ está cadastrado
    const usuariosSalvos = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const emailJaExiste = usuariosSalvos.find(u => u.email === formulario.email)
    if (emailJaExiste) {
      setMensagem('⚠️ Este e-mail já está cadastrado! Tente fazer login.')
      return
    }

    // ✅ 2. Montar objeto do novo usuário
    const novoUsuario = {
      id: Date.now(),
      nome: formulario.nome,
      email: formulario.email,
      telefone: formulario.telefone,
      tipo: formulario.tipo,
      senha: formulario.senha
    }

    // ✅ 3. Salvar
    usuariosSalvos.push(novoUsuario)
    localStorage.setItem('usuarios', JSON.stringify(usuariosSalvos))

    // ✅ 4. Mensagem e redirecionamento
    const tipoTexto = formulario.tipo === 'dono' ? 'Dono de Pet' : 'Passeador/Cuidador'
    setMensagem(`✅ Cadastro realizado com sucesso! Bem-vindo, ${formulario.nome}! 🐾 Perfil: ${tipoTexto}`)

    // Limpar formulário
    setFormulario({ nome: '', email: '', telefone: '', tipo: 'dono', senha: '' })

    // ✅ Ir para Login após 2.5 segundos (sem usar o react-router-dom!)
    setTimeout(() => {
      aoMudarPagina('login')
    }, 2500)
  }

  return (
    <div style={estilos.container}>
      <div style={estilos.caixa}>
        <span style={estilos.icone}>🐶</span>
        <h1 style={estilos.titulo}>Criar sua Conta</h1>
        <p style={estilos.subtitulo}>Junte-se à nossa comunidade de amantes de cães!</p>

        {mensagem && <div style={estilos.sucesso}>{mensagem}</div>}

        <form onSubmit={aoEnviar} style={estilos.formulario}>
          <div style={estilos.grupo}>
            <label style={estilos.rotulo}>👤 Seu Nome Completo</label>
            <input
              type="text"
              name="nome"
              value={formulario.nome}
              onChange={aoDigitar}
              placeholder="Digite seu nome"
              style={estilos.campo}
              required
            />
          </div>
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
            <label style={estilos.rotulo}>📱 Telefone / WhatsApp</label>
            <input
              type="tel"
              name="telefone"
              value={formulario.telefone}
              onChange={aoDigitar}
              placeholder="(00) 00000-0000"
              style={estilos.campo}
              required
            />
          </div>
          <div style={estilos.grupo}>
            <label style={estilos.rotulo}>🐾 Como deseja participar?</label>
            <select
              name="tipo"
              value={formulario.tipo}
              onChange={aoDigitar}
              style={estilos.campo}
            >
              <option value="dono">Sou Dono — preciso de passeios/cuidados</option>
              <option value="cuidador">Sou Passeador/Cuidador</option>
            </select>
          </div>
          <div style={estilos.grupo}>
            <label style={estilos.rotulo}>🔒 Senha</label>
            <input
              type="password"
              name="senha"
              value={formulario.senha}
              onChange={aoDigitar}
              placeholder="Mínimo 6 caracteres"
              style={estilos.campo}
              required
              minLength={6}
            />
          </div>
          <button type="submit" style={estilos.botao}>
            Finalizar Cadastro 🎉
          </button>
        </form>

        <p style={estilos.link}>
          Já tem conta?{' '}
          <button onClick={() => aoMudarPagina('login')} style={estilos.botaoLink}>
            Entre aqui 🔐
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
  sucesso: {
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
    marginTop: '28px',
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

export default Cadastro