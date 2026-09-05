import { useState } from 'react'
import { db } from "../firebase.js";
import { ref, query, orderByChild, equalTo, get, update } from 'firebase/database'

export default function Login(props) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')

  async function fazerLogin(e) {
    e.preventDefault()

    if (!email || !senha) {
      alert('⚠️ Preencha e-mail e senha!')
      return
    }

    try {
      // ✅ Busca usuário direto no FIREBASE ☁️
      const usuariosRef = ref(db, 'usuarios')
      const busca = query(
        usuariosRef,
        orderByChild('email'),
        equalTo(email)
      )

      const snapshot = await get(busca)

      if (!snapshot.exists()) {
        alert('⚠️ E-mail não encontrado! Verifique ou cadastre-se.')
        return
      }

      // ✅ Encontra e verifica a senha
      let usuarioEncontrado = null
      snapshot.forEach((filho) => {
        const dados = filho.val()
        if (dados.senha === senha) {
          usuarioEncontrado = { id: filho.key, ...dados }
        }
      })

      if (!usuarioEncontrado) {
        alert('⚠️ Senha incorreta!')
        return
      }

      // ✅ Login BEM-SUCEDIDO! Salva dados locais
            // ✅ Se for CUIDADOR → Salva localização no Firebase! 📍
      if (usuarioEncontrado.tipo === 'cuidador') {
        navigator.geolocation.watchPosition(
          (posicao) => {
            const lat = posicao.coords.latitude
            const lng = posicao.coords.longitude
            const cuidadorRef = ref(db, `usuarios/${usuarioEncontrado.id}`)
            update(cuidadorRef, {
              lat: lat,
              lng: lng,
              ultimoOnline: new Date().toLocaleString('pt-BR')
            })
            console.log('📍 Localização atualizada:', lat, lng)
          },
          (erro) => {
            console.log('⚠️ Não foi possível obter localização')
          },
          { enableHighAccuracy: true, maximumAge: 10000 }
        )
      }
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioEncontrado))
            // ✅ SE FOR CUIDADOR → Começa a enviar localização! 📍
      if (usuarioEncontrado.tipo === 'cuidador') {
        const cuidadorRef = ref(db, `usuarios/${filho.key}`)
        
        // ✅ Pega e salva a localização AGORA
        navigator.geolocation.getCurrentPosition(
          (posicao) => {
            update(cuidadorRef, {
              lat: posicao.coords.latitude,
              lng: posicao.coords.longitude,
              ultimoOnline: new Date().toLocaleString('pt-BR'),
              online: true
            })
            console.log('✅ Localização salva!')
          },
          (erro) => {
            alert('⚠️ Ative a localização para ser encontrado!')
          },
          { enableHighAccuracy: true }
        )
      }
      alert(`✅ Bem-vindo, ${usuarioEncontrado.nome}!\n\nTipo: ${usuarioEncontrado.tipo === 'dono' ? '👤 Dono' : '🐾 Cuidador'}`)

      // ✅ Recarrega para atualizar a barra de navegação
      window.location.reload()

    } catch (erro) {
      console.error(erro)
      alert('❌ Erro: ' + erro.message)
    }
  }

  return (
    <div style={{padding: '25px', maxWidth: '420px', margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', color: '#1f2937', marginBottom: '25px'}}>🔐 Acessar Conta</h2>

      <form onSubmit={fazerLogin} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        
        <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151'}}>Seu E-mail</label>
        <input
          type="email"
          placeholder="Digite seu e-mail cadastrado"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px'}}
        />

        <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151', marginTop: '8px'}}>Sua Senha</label>
        <input
          type="password"
          placeholder="Digite sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px'}}
        />

        <button
          type="submit"
          style={{
            marginTop: '20px',
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
          🔑 Entrar
        </button>
      </form>

      <p style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280'}}>
        Não tem conta?{' '}
        <span
          onClick={() => props.aoMudarPagina('cadastro')}
          style={{color: '#2563eb', fontWeight: 'bold', cursor: 'pointer'}}
        >
          Cadastre-se →
        </span>
      </p>
    </div>
  )
}