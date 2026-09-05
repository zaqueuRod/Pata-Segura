import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { db } from '../firebase'
import { ref, query, orderByChild, equalTo, get, update } from 'firebase/database'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [mensagem, setMensagem] = useState('')
  const navegar = useNavigate()

  async function entrar(e) {
    e.preventDefault()
    setMensagem('')

    if (!email || !senha) {
      setMensagem('⚠️ Preencha e-mail e senha!')
      return
    }

    try {
      const usuariosRef = ref(db, 'usuarios')
      const busca = query(usuariosRef, orderByChild('email'), equalTo(email))
      const resultado = await get(busca)

      if (!resultado.exists()) {
        setMensagem('⚠️ E-mail não encontrado!')
        return
      }

      let idUsuario = null
      let dadosUsuario = null

      resultado.forEach((item) => {
        const dados = item.val()
        if (dados.senha === senha) {
          idUsuario = item.key
          dadosUsuario = dados
        }
      })

      if (!dadosUsuario) {
        setMensagem('⚠️ Senha incorreta!')
        return
      }

      // ✅ Login OK — Salva dados
      localStorage.setItem('usuarioLogado', JSON.stringify({ ...dadosUsuario, id: idUsuario }))

      // ✅ Se for Cuidador → salva localização
      if (dadosUsuario.tipo === 'cuidador') {
        const refCuidador = ref(db, `usuarios/${idUsuario}`)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            update(refCuidador, {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              online: true,
              ultimoOnline: new Date().toLocaleString('pt-BR')
            })
          },
          (erroLocal) => {
            alert('⚠️ Ative a localização para ser encontrado!')
          },
          { enableHighAccuracy: true }
        )
      }

      // ✅ Atualiza barra de navegação
      if (window.atualizarUsuarioLogado) {
        window.atualizarUsuarioLogado()
      }

      alert(`✅ Bem-vindo(a), ${dadosUsuario.nome}!`)

      // ✅ Cuidador vai para Chamadas, Dono vai para Início
      if (dadosUsuario.tipo === 'cuidador') {
        navegar('/chamadas')
      } else {
        navegar('/inicio')
      }

    } catch (erro) {
      // ✅ FALTAVA ESTA PARTE! ↓
      console.error(erro)
      setMensagem('❌ Erro: ' + erro.message)
    }
  }

  return (
    <div style={{padding: '20px', maxWidth: '420px', margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', color: '#1f2937', marginBottom: '25px'}}>🔐 Entrar</h2>

      <form onSubmit={entrar} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151'}}>Seu E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="exemplo@email.com"
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px'}}
        />

        <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151', marginTop: '8px'}}>Sua Senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="Digite sua senha"
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px'}}
        />

        {mensagem && (
          <p style={{color: '#dc2626', textAlign: 'center', margin: '10px 0'}}>{mensagem}</p>
        )}

        <button
          type="submit"
          style={{
            marginTop: '10px',
            padding: '14px',
            backgroundColor: '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ✅ Entrar
        </button>
      </form>

      <p style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280'}}>
        Não tem cadastro?{' '}
        <Link to="/cadastro" style={{color: '#2563eb', fontWeight: 'bold', textDecoration: 'none'}}>
          Criar conta →
        </Link>
      </p>
    </div>
  )
}