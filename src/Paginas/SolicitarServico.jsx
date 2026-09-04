import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function SolicitarServico() {
  const [form, setForm] = useState({
    tipoServico: 'passeio',
    data: '',
    horario: '',
    duracao: '',
    observacoes: ''
  })
  const [usuario, setUsuario] = useState(null)
  const [mensagem, setMensagem] = useState('')
  const navegar = useNavigate()

  useEffect(() => {
    const logado = localStorage.getItem('usuarioLogado')
    if (!logado) {
      setMensagem('⚠️ Faça login para solicitar um serviço!')
      return
    }
    const dados = JSON.parse(logado)
    if (dados.tipo !== 'dono') {
      setMensagem('⚠️ Apenas Donos de pets podem solicitar serviços!')
      return
    }
    setUsuario(dados)
  }, [])

  function aoDigitar(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  function aoEnviar(e) {
    e.preventDefault()
    if (!usuario) return

    const pedido = {
      id: Date.now(),
      solicitante: usuario.nome,
      contato: usuario.telefone,
      email: usuario.email,
      ...form,
      status: 'pendente',
      dataPedido: new Date().toLocaleString('pt-BR')
    }

    // Salvar pedido para que todos os cuidadores vejam
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]')
    pedidos.unshift(pedido) // Coloca o mais recente primeiro
    localStorage.setItem('pedidos', JSON.stringify(pedidos))

    setMensagem('✅ Pedido enviado! Os cuidadores foram notificados em instantes! 🔔')
    
    setTimeout(() => navegar('/'), 3000)
  }

  if (mensagem && !usuario) {
    return (
      <div style={estilos.container}>
        <div style={estilos.caixa}><p style={{textAlign:'center', fontSize:'18px'}}>{mensagem}</p></div>
      </div>
    )
  }

  return (
    <div style={estilos.container}>
      <div style={estilos.caixa}>
        <h1 style={estilos.titulo}>🐾 Solicitar Serviço</h1>
        <p style={estilos.subtitulo}>Preencha os dados e encontraremos um cuidador perto de você!</p>

        {mensagem && <div style={estilos.mensagem}>{mensagem}</div>}

        <form onSubmit={aoEnviar} style={estilos.form}>
          <div style={estilos.grupo}>
            <label style={estilos.rotulo}>Tipo de Serviço</label>
            <select name="tipoServico" value={form.tipoServico} onChange={aoDigitar} style={estilos.campo}>
              <option value="passeio">🚶 Passeio com o cão</option>
              <option value="visita">🏠 Visita em casa</option>
              <option value="hospedagem">🛏️ Hospedagem (pernoite)</option>
            </select>
          </div>

          <div style={estilos.linhaDupla}>
            <div style={estilos.grupo}>
              <label style={estilos.rotulo}>📅 Data</label>
              <input type="date" name="data" value={form.data} onChange={aoDigitar} style={estilos.campo} required />
            </div>
            <div style={estilos.grupo}>
              <label style={estilos.rotulo}>⏰ Horário</label>
              <input type="time" name="horario" value={form.horario} onChange={aoDigitar} style={estilos.campo} required />
            </div>
          </div>

          <div style={estilos.grupo}>
            <label style={estilos.rotulo}>Duração / Período</label>
            <input type="text" name="duracao" value={form.duracao} onChange={aoDigitar} placeholder="Ex: 1 hora, 3 dias..." style={estilos.campo} required />
          </div>

          <div style={estilos.grupo}>
            <label style={estilos.rotulo}>📝 Observações (raça, necessidades especiais...)</label>
            <textarea name="observacoes" value={form.observacoes} onChange={aoDigitar} placeholder="Conte um pouco sobre seu pet..." style={estilos.textarea} />
          </div>

          <button type="submit" style={estilos.botao}>🔔 Enviar para Cuidadores Disponíveis</button>
        </form>
      </div>
    </div>
  )
}

const estilos = {
  container: {
    fontFamily: "'Segoe UI', Arial, sans-serif",
    maxWidth: '550px',
    margin: '30px auto',
    padding: '20px'
  },
  caixa: {
    background: '#fffbeb',
    padding: '30px',
    borderRadius: '20px',
    border: '3px solid #fcd34d',
    boxShadow: '0 5px 20px rgba(245,158,11,0.2)'
  },
  titulo: { textAlign: 'center', color: '#78350f', marginBottom: '8px' },
  subtitulo: { textAlign: 'center', color: '#92400e', marginBottom: '25px', fontSize: '15px' },
  mensagem: {
    background: '#fef3c7',
    color: '#78350f',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '20px',
    textAlign: 'center'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  linhaDupla: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' },
  grupo: { display: 'flex', flexDirection: 'column', gap: '6px' },
  rotulo: { fontWeight: '600', color: '#78350f', fontSize: '14px' },
  campo: { padding: '11px', borderRadius: '10px', border: '2px solid #fcd34d', fontSize: '15px', background: '#fffef5' },
  textarea: { padding: '11px', borderRadius: '10px', border: '2px solid #fcd34d', fontSize: '15px', minHeight: '90px', background: '#fffef5' },
  botao: {
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    padding: '14px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '17px',
    fontWeight: 'bold',
    marginTop: '10px',
    cursor: 'pointer',
    boxShadow: '0 3px 10px rgba(34,197,94,0.3)'
  }
}

export default SolicitarServico