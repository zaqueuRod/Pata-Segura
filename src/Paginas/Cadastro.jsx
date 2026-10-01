import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db , auth } from '../firebase'
import { ref, push, set, serverTimestamp } from 'firebase/database'
import { createUserWithEmailAndPassword } from 'firebase/auth'

export default function Cadastro() {
  const navegar = useNavigate()
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

  async function aoEnviar(e) {
    e.preventDefault()
    setMensagem('')

    try {
      
       // ✅ 1. CRIA NO FIREBASE AUTH (isso que habilita o e-mail!)
      const credenciais = await createUserWithEmailAndPassword(
        auth,
        formulario.email,
        formulario.senha
      )

      const id = credenciais.user.uid

      // ✅ 2. Salva dados no Realtime Database
      const usuariosRef = ref(db, `usuarios/${id}`)
      await set(usuariosRef, {
        id,
        nome: formulario.nome,
        email: formulario.email,
        telefone: formulario.telefone,
        tipo: formulario.tipo,
        online: false,
        criadoEm: serverTimestamp()
      })

      setMensagem('✅ Cadastro realizado! Verifique seu e-mail 📧')
      
      setTimeout(() => navegar('/entrar'), 2000)

    } catch (erro) {
      console.error('Erro:', erro)
      if (erro.code === 'auth/email-already-in-use') {
        setMensagem('❌ Este e-mail já está cadastrado')
      } else if (erro.code === 'auth/weak-password') {
        setMensagem('❌ A senha deve ter pelo menos 6 caracteres')
      } else {
        setMensagem(`❌ Erro: ${erro.message}`)
      }
    }
  }


  return (
    <div style={estilos.pagina}>
      <div style={estilos.container}>
        <h1 style={estilos.titulo}> Criar Conta</h1>

        {mensagem && <div style={estilos.mensagem}>{mensagem}</div>}

        <form onSubmit={aoEnviar} style={estilos.formulario}>
          <div style={estilos.grupo}>
            <label style={estilos.label}>Nome Completo</label>
            <input
              type="text"
              name="nome"
              value={formulario.nome}
              onChange={aoDigitar}
              placeholder="Seu nome"
              style={estilos.input}
              required
            />
          </div>

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
            <label style={estilos.label}>Telefone</label>
            <input
              type="tel"
              name="telefone"
              value={formulario.telefone}
              onChange={aoDigitar}
              placeholder="(47) 99999-9999"
              style={estilos.input}
              required
            />
          </div>

          <div style={estilos.grupo}>
            <label style={estilos.label}>Eu sou</label>
            <select
              name="tipo"
              value={formulario.tipo}
              onChange={aoDigitar}
              style={estilos.input}
            >
              <option value="dono"> Dono — quero contratar</option>
              <option value="cuidador"> Cuidador — quero trabalhar</option>
            </select>
          </div>

          <div style={estilos.grupo}>
            <label style={estilos.label}>Senha</label>
            <input
              type="password"
              name="senha"
              value={formulario.senha}
              onChange={aoDigitar}
              placeholder="Crie uma senha"
              style={estilos.input}
              required
            />
          </div>

          <button type="submit" style={estilos.botao}>
             Cadastrar
          </button>
        </form>

        <p style={estilos.textoLogin}>
          Já tem conta?{' '}
          <Link to="/entrar" style={estilos.link}>
            Faça Login →
          </Link>
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
  textoLogin: {
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