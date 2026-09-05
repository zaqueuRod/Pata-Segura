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

      localStorage.setItem('usuarioLogado', JSON.stringify({ ...dadosUsuario, id: idUsuario }))

      if (dadosUsuario.tipo === 'cuidador') {
        const refCuidador = ref(db, `usuarios/${idUsuario}`)
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            update(refCuidador, {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              online: true
            })
          },
          () => {
            setMensagem('⚠️ Ative a localização para ser encontrado!')
          },
          { enableHighAccuracy: true }
        )
      }

      if (window.atualizarUsuarioLogado) {
        window.atualizarUsuarioLogado()
      }

      // ✅ REMOVI O ALERTA! Agora navega direto sem avisos! 🎉
      if (dadosUsuario.tipo === 'cuidador') {
        navegar('/chamadas')
      } else {
        navegar('/inicio')
      }

    } catch (erro) {
      console.log(erro)
      setMensagem('❌ Erro ao entrar!')
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

        {mensagem && <p style={{color: '#dc2626', textAlign: 'center', margin: '10px 0'}}>{mensagem}</p>}

        <button type="submit" style={{marginTop: '10px', padding: '14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer'}}>
          ✅ Entrar
        </button>
      </form>

      <p style={{textAlign: 'center', marginTop: '20px', fontSize: '14px'}}>
        Não tem cadastro? <Link to="/cadastro" style={{color: '#2563eb', fontWeight: 'bold'}}>Criar conta →</Link>
      </p>
    </div>
  )
}