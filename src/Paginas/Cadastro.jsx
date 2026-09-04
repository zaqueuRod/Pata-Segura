import { useState } from 'react'
import { db } from './firebase'
import { ref, push, set, query, orderByChild, equalTo, get } from 'firebase/database'

export default function Cadastro(props) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [tipo, setTipo] = useState('dono')

  async function cadastrarUsuario(e) {
    e.preventDefault()

    if (!nome || !email || !senha) {
      alert('⚠️ Preencha todos os campos!')
      return
    }

    try {
      // ✅ Verifica se e-mail já existe
      const usuariosRef = ref(db, 'usuarios')
      const buscaEmail = query(usuariosRef, orderByChild('email'), equalTo(email))
      const snapshot = await get(buscaEmail)

      if (snapshot.exists()) {
        alert('⚠️ Este e-mail já está cadastrado! Faça Login.')
        return
      }

      // ✅ Salva usuário no FIREBASE na NUvem ☁️
      const novoUsuarioRef = push(ref(db, 'usuarios'))
      await set(novoUsuarioRef, {
        nome: nome,
        email: email,
        senha: senha,
        tipo: tipo,
        dataCadastro: new Date().toLocaleString('pt-BR')
      })

      alert(`✅ Cadastro realizado com sucesso!\n\nNome: ${nome}\nTipo: ${tipo === 'dono' ? '👤 Dono' : '🐾 Cuidador'}`)
      
      setNome('')
      setEmail('')
      setSenha('')
      props.aoMudarPagina('login')

    } catch (erro) {
      console.error(erro)
      alert('❌ Erro ao cadastrar: ' + erro.message)
    }
  }

  return (
    <div style={{padding: '25px', maxWidth: '420px', margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', color: '#1f2937', marginBottom: '25px'}}>✍️ Novo Cadastro</h2>

      <form onSubmit={cadastrarUsuario} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        
        <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151'}}>Seu Nome</label>
        <input
          type="text"
          placeholder="Digite seu nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px'}}
        />

        <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151', marginTop: '8px'}}>Seu E-mail</label>
        <input
          type="email"
          placeholder="exemplo@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px'}}
        />

        <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151', marginTop: '8px'}}>Sua Senha</label>
        <input
          type="password"
          placeholder="Crie uma senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px'}}
        />

        <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151', marginTop: '8px'}}>Tipo de Conta</label>
        <select
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          style={{padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', backgroundColor: '#fff'}}
        >
          <option value="dono">👤 Sou Dono de Cão</option>
          <option value="cuidador">🐾 Sou Cuidador / Passeador</option>
        </select>

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
          ✅ Cadastrar
        </button>
      </form>

      <p style={{textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#6b7280'}}>
        Já tem cadastro?{' '}
        <span
          onClick={() => props.aoMudarPagina('login')}
          style={{color: '#2563eb', fontWeight: 'bold', cursor: 'pointer'}}
        >
          Faça Login →
        </span>
      </p>
    </div>
  )
}