import { useState } from 'react'
import { db } from "../firebase.js";
import { ref, push, set, query, orderByChild, equalTo, get } from 'firebase/database'

export default function Cadastro(props) {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [tipo, setTipo] = useState('dono')
  
  // ✅ Campos NOVOS do Cuidador
  const [valorHora, setValorHora] = useState('')
  const [passeio, setPasseio] = useState(false)
  const [casa, setCasa] = useState(false)
  const [tratamento, setTratamento] = useState(false)
  const [observacoes, setObservacoes] = useState('')

  async function cadastrarUsuario(e) {
    e.preventDefault()

    if (!nome || !email || !senha) {
      alert('⚠️ Preencha Nome, E-mail e Senha!')
      return
    }

    // ✅ Se for Cuidador → Valor da Hora é OBRIGATÓRIO
    if (tipo === 'cuidador' && !valorHora) {
      alert('⚠️ Cuidador precisa informar o valor cobrado por hora!')
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

      // ✅ Monta os dados do usuário
      const dadosUsuario = {
        nome: nome,
        email: email,
        senha: senha,
        tipo: tipo,
        dataCadastro: new Date().toLocaleString('pt-BR')
      }

      // ✅ Se for CUIDADOR → adiciona os dados extras
      if (tipo === 'cuidador') {
        dadosUsuario.valorHora = parseFloat(valorHora.replace(',', '.'))
        dadosUsuario.servicos = {
          passear: passeio,
          cuidarEmCasa: casa,
          medicacaoTratamento: tratamento
        }
        dadosUsuario.observacoes = observacoes
      }

      // ✅ Salva TUDO no Firebase ☁️
      const novoUsuarioRef = push(ref(db, 'usuarios'))
      await set(novoUsuarioRef, dadosUsuario)

      alert(`✅ Cadastro realizado com sucesso!\n\nNome: ${nome}\nTipo: ${tipo === 'dono' ? '👤 Dono' : '🐾 Cuidador'}`)
      
      // ✅ Limpa o formulário
      setNome('')
      setEmail('')
      setSenha('')
      setTipo('dono')
      setValorHora('')
      setPasseio(false)
      setCasa(false)
      setTratamento(false)
      setObservacoes('')

      props.aoMudarPagina('login')

    } catch (erro) {
      console.error(erro)
      alert('❌ Erro ao cadastrar: ' + erro.message)
    }
  }

  return (
    <div style={{padding: '20px', maxWidth: '440px', margin: '0 auto'}}>
      <h2 style={{textAlign: 'center', color: '#1f2937', marginBottom: '25px'}}>✍️ Novo Cadastro</h2>

      <form onSubmit={cadastrarUsuario} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
        
        <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151'}}>Seu Nome Completo</label>
        <input
          type="text"
          placeholder="Digite seu nome"
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

        <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151', marginTop: '8px'}}>Crie uma Senha</label>
        <input
          type="password"
          placeholder="Mínimo 6 caracteres"
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

        {/* ============================================== */}
        {/* ✅ CAMPOS EXTRAS — SÓ APARECEM SE FOR CUIDADOR */}
        {/* ============================================== */}
        {tipo === 'cuidador' && (
          <div style={{marginTop: '10px', padding: '15px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0'}}>
            
            <h4 style={{margin: '0 0 15px 0', color: '#166534'}}>🐾 Dados do Cuidador</h4>

            <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151'}}>Valor cobrado por Hora (R$)</label>
            <input
              type="text"
              placeholder="Ex: 25,00"
              value={valorHora}
              onChange={(e) => setValorHora(e.target.value)}
              style={{padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '15px', marginBottom: '15px'}}
            />

            <p style={{fontWeight: 'bold', fontSize: '14px', color: '#374151', margin: '0 0 10px 0'}}>Serviços que você oferece:</p>

            <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px'}}>
              <input type="checkbox" checked={passeio} onChange={(e) => setPasseio(e.target.checked)} />
              🚶 Passear com o cão
            </label>

            <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px'}}>
              <input type="checkbox" checked={casa} onChange={(e) => setCasa(e.target.checked)} />
              🏠 Cuidar em casa do dono
            </label>

            <label style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '14px'}}>
              <input type="checkbox" checked={tratamento} onChange={(e) => setTratamento(e.target.checked)} />
              💊 Administrar medicamentos / Tratamento
            </label>

            <label style={{fontWeight: 'bold', fontSize: '14px', color: '#374151'}}>Observações adicionais (opcional)</label>
            <textarea
              placeholder="Ex: Tenho experiência com cães grandes, disponível aos finais de semana..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              style={{padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', height: '80px', resize: 'none'}}
            />

          </div>
        )}
        {/* ============================================== */}

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