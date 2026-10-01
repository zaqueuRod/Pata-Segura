import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db, auth } from '../firebase'
import { ref, get, child } from 'firebase/database'
// ✅ Importa a função de redefinição
import { sendPasswordResetEmail } from 'firebase/auth'

export default function Login() {
  const navegar = useNavigate()
  const [formulario, setFormulario] = useState({
    email: '',
    senha: ''
  })
  const [mensagem, setMensagem] = useState('')

  function aoDigitar(e) {
    const { name, value } = e.target
    setFormulario({ ...formulario, [name]: value })
  }

  // ✅ FUNÇÃO RECUPERAR SENHA
  async function recuperarSenha() {
  setMensagem('')

  // 🔑 Verifica se o campo está preenchido
  if (!formulario.email || formulario.email.trim() === '') {
    setMensagem('⚠️ Digite seu e-mail primeiro!')
    return
  }

  try {
    // ✅ PRIMEIRO: Verifica se o e-mail existe no nosso banco
    const usuariosRef = ref(db, 'usuarios')
    const snapshot = await get(child(usuariosRef, '/'))

    if (!snapshot.exists()) {
      setMensagem('❌ Nenhum usuário cadastrado no sistema')
      return
    }

    const todosUsuarios = snapshot.val()
    let existe = false

    for (const id in todosUsuarios) {
      if (todosUsuarios[id].email === formulario.email) {
        existe = true
        break
      }
    }

    if (!existe) {
      setMensagem('❌ Este e-mail não está cadastrado')
      return
    }

    // ✅ SÓ AGORA: Envia o link de redefinição
    await sendPasswordResetEmail(auth, formulario.email)
    setMensagem('✅ Link enviado! Verifique sua caixa de entrada 📧')

  } catch (erro) {
    console.error('Erro:', erro)
    if (erro.code === 'auth/invalid-email') {
      setMensagem('❌ Digite um e-mail válido')
    } else {
      setMensagem(`❌ Erro: ${erro.message}`)
    }
  }
}

  async function aoEntrar(e) {
    e.preventDefault()
    setMensagem('')

    try {
      const usuariosRef = ref(db, 'usuarios')
      const snapshot = await get(child(usuariosRef, '/'))

      if (!snapshot.exists()) {
        setMensagem('❌ Nenhum usuário cadastrado')
        return
      }

      const todosUsuarios = snapshot.val()
      let usuarioEncontrado = null

      for (const id in todosUsuarios) {
        const usuario = todosUsuarios[id]
        if (usuario.email === formulario.email) {
          usuarioEncontrado = { ...usuario, id }
          break
        }
      }

      if (!usuarioEncontrado) {
        setMensagem('❌ E-mail não encontrado')
        return
      }

      if (usuarioEncontrado.senha !== formulario.senha) {
        setMensagem('❌ Senha incorreta')
        return
      }

      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado))
      setMensagem('✅ Entrando...')

      setTimeout(() => {
        navegar('/')
        if (window.atualizarUsuarioLogado) {
          window.atualizarUsuarioLogado()
        }
      }, 500)

    } catch (erro) {
      console.error('ERRO:', erro)
      setMensagem(`❌ Erro: ${erro.message}`)
    }
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.container}>
        <h1 style={estilos.titulo}> Entrar</h1>

        {mensagem && <div style={estilos.mensagem}>{mensagem}</div>}

        <form onSubmit={aoEntrar} style={estilos.formulario}>
          <div style={estilos.grupo}>
            <label style={estilos.label}>E-mail</label>
            <input
              type="email"
              name="email"
              value={formulario.email}
              onChange={aoDigitar}
              placeholder="seu@email.com"
              style={estilos.input}
              required
            />
          </div>

          <div style={estilos.grupo}>
            <label style={estilos.label}>Senha</label>
            <input
              type="password"
              name="senha"
              value={formulario.senha}
              onChange={aoDigitar}
              placeholder="Sua senha"
              style={estilos.input}
              required
            />
          </div>

          {/*  BOTÃO FUNCIONAL DE RECUPERAR SENHA */}
          <button
            type="button"
            onClick={recuperarSenha}
            style={estilos.esqueceuSenha}
          >
            Esqueceu sua senha?
          </button>

          <button type="submit" style={estilos.botao}>
             Entrar
          </button>
        </form>

        <p style={estilos.textoCadastro}>
          Não tem conta? <Link to="/cadastro" style={estilos.link}>Cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}

const estilos = {
  pagina: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px'
  },
  container: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
  },
  titulo: {
    textAlign: 'center',
    marginBottom: '24px',
    color: '#1e293b'
  },
  mensagem: {
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    textAlign: 'center',
    background: '#fef2f2',
    color: '#dc2626'
  },
  formulario: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  grupo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#374151'
  },
  input: {
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '16px',
    outline: 'none'
  },
  esqueceuSenha: {
    alignSelf: 'flex-end',
    background: 'transparent',
    border: 'none',
    color: '#2563eb',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '4px 0',
    marginBottom: '8px'
  },
  botao: {
    marginTop: '8px',
    padding: '16px',
    background: 'linear-gradient(135deg, #166534, #15803d)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  textoCadastro: {
    marginTop: '24px',
    textAlign: 'center',
    fontSize: '14px',
    color: '#64748b'
  },
  link: {
    color: '#166534',
    fontWeight: 'bold',
    textDecoration: 'none'
  }
}