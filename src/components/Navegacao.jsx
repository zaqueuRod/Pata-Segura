export default function Navegacao({ paginaAtual, aoMudarPagina, ehCuidador }) {
  return (
    <div style={estilos.barra}>
      <button
        onClick={() => aoMudarPagina('inicio')}
        style={{...estilos.botao, ...(paginaAtual === 'inicio' ? estilos.ativo : {})}}
      >🏠 Início</button>

      <button
        onClick={() => aoMudarPagina('buscamapa')}
        style={{...estilos.botao, ...(paginaAtual === 'buscamapa' ? estilos.ativo : {})}}
      >🗺️ Mapa</button>

      <button
        onClick={() => aoMudarPagina('notificacoes')}
        style={{...estilos.botao, ...(paginaAtual === 'notificacoes' ? estilos.ativo : {})}}
      >🔔 Alertas</button>

      {ehCuidador && (
        <button
          onClick={() => aoMudarPagina('status')}
          style={{...estilos.botao, ...(paginaAtual === 'status' ? estilos.ativo : {})}}
        >🟢 Status</button>
      )}

      <button
        onClick={() => aoMudarPagina('cuidadores')}
        style={{...estilos.botao, ...(paginaAtual === 'cuidadores' ? estilos.ativo : {})}}
      >🐶 Cuidadores</button>

      <button
        onClick={() => aoMudarPagina('login')}
        style={{...estilos.botao, ...(paginaAtual === 'login' ? estilos.ativo : {})}}
      >🔐 Entrar</button>
    </div>
  )
}

const estilos = {
  barra: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70px',
    backgroundColor: '#ffffff',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    boxShadow: '0 -3px 10px rgba(0,0,0,0.12)',
    zIndex: 9999
  },
  botao: {
    flex: 1,
    border: 'none',
    backgroundColor: 'transparent',
    fontSize: '11px',
    cursor: 'pointer',
    color: '#666',
    padding: '4px'
  },
  ativo: {
    color: '#2563eb',
    fontWeight: 'bold',
    borderTop: '3px solid #2563eb',
    backgroundColor: '#eff6ff'
  }
}