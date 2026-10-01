import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Inicio() {
  const [usuario, setUsuario] = useState(null)

  useEffect(() => {
    const logado = localStorage.getItem('usuarioLogado')
    if (logado) {
      setUsuario(JSON.parse(logado))
    }
  }, [])

  function sair() {
    localStorage.removeItem('usuarioLogado')
    setUsuario(null)
    window.location.href = '/Pata-Segura/'
  }

  return (
    <div style={estilos.pagina}>
      {/* Cabeçalho fixo */}
      <header style={estilos.cabecalho}>
        <div style={estilos.containerCabecalho}>
          <div style={estilos.logo}>
            <span style={estilos.icone}>🐾</span>
            <h1 style={estilos.titulo}>Pata Segura</h1>
          </div>

          {usuario ? (
            <div style={estilos.usuario}>
              <div style={estilos.avatar}>
                {usuario.nome.charAt(0).toUpperCase()}
              </div>
              <div style={estilos.dadosUsuario}>
                <span style={estilos.nomeUsuario}>{usuario.nome}</span>
                <span style={estilos.tipoUsuario}>
                  {usuario.tipo === 'dono' ? 'Dono de Pet' : 'Cuidador'}
                </span>
              </div>
              <button onClick={sair} style={estilos.botaoSair}>Sair</button>
            </div>
          ) : (
            <div style={estilos.botoesCabecalho}>
              <Link to="/entrar" style={estilos.linkEntrar}>Entrar</Link>
              <Link to="/cadastro" style={estilos.botaoCadastrar}>Cadastrar</Link>
            </div>
          )}
        </div>
      </header>

      <main style={estilos.principal}>
        {/* Seção Principal */}
        <section style={estilos.hero}>
          <div style={estilos.containerHero}>
            <div style={estilos.textoHero}>
              <span style={estilos.badge}>Cuidados com pets</span>
              <h2 style={estilos.tituloHero}>
                Cuide do seu melhor amigo com segurança e tranquilidade
              </h2>
              <p style={estilos.subtituloHero}>
                Conectamos você a cuidadores de confiança para passeios, hospedagem
                e cuidados diários com o seu cão.
              </p>

              <div style={estilos.botoesHero}>
                {!usuario ? (
                  <>
                    <Link to="/cadastro" style={estilos.botaoPrimario}>
                      Começar agora
                    </Link>
                    <Link to="/entrar" style={estilos.botaoSecundario}>
                      Já tenho conta
                    </Link>
                  </>
                ) : usuario.tipo === 'dono' ? (
                  <>
                    <Link to="/busca" style={estilos.botaoPrimario}>
                      Buscar cuidadores
                    </Link>
                    <Link to="/pedidos" style={estilos.botaoSecundario}>
                      Meus pedidos
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/status" style={estilos.botaoPrimario}>
                      Ficar disponível
                    </Link>
                    <Link to="/pedidos" style={estilos.botaoSecundario}>
                      Meus atendimentos
                    </Link>
                  </>
                )}
              </div>

              <div style={estilos.estatisticas}>
                <div style={estilos.estatistica}>
                  <span style={estilos.numero}>100%</span>
                  <span style={estilos.rotulo}>Segurança</span>
                </div>
                <div style={estilos.estatistica}>
                  <span style={estilos.numero}>500+</span>
                  <span style={estilos.rotulo}>Cuidadores</span>
                </div>
                <div style={estilos.estatistica}>
                  <span style={estilos.numero}>4.9</span>
                  <span style={estilos.rotulo}>Avaliação</span>
                </div>
              </div>
            </div>

            <div style={estilos.cartoesHero}>
              <div style={estilos.cardPrincipal}>
                <div style={estilos.iconeCard}>🐶</div>
                <h3 style={estilos.tituloCard}>Encontre o cuidador ideal</h3>
                <p style={estilos.textoCard}>
                  Perto de você, com avaliações e valores transparentes.
                </p>
              </div>

              <div style={estilos.cardSecundario}>
                <div style={estilos.iconeCard}>🛡️</div>
                <h4 style={estilos.tituloCardMenor}>Segurança garantida</h4>
                <p style={estilos.textoCardMenor}>
                  Todos passam por verificação antes de serem aceitos.
                </p>
              </div>

              <div style={estilos.cardTerceiro}>
                <div style={estilos.iconeCard}>💚</div>
                <h4 style={estilos.tituloCardMenor}>Amor aos pets</h4>
                <p style={estilos.textoCardMenor}>
                  Cuidadores tratam seu cão com carinho.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Como funciona */}
        <section style={estilos.diferenciais}>
          <div style={estilos.containerDiferenciais}>
            <span style={estilos.secaoBadge}>Como funciona</span>
            <h3 style={estilos.secaoTitulo}>Simples, rápido e confiável</h3>

            <div style={estilos.gridDiferenciais}>
              <div style={estilos.itemDiferencial}>
                <div style={estilos.numeroEtapa}>1</div>
                <h4 style={estilos.tituloEtapa}>Cadastre-se</h4>
                <p style={estilos.textoEtapa}>
                  Crie sua conta como dono ou cuidador em minutos.
                </p>
              </div>

              <div style={estilos.itemDiferencial}>
                <div style={estilos.numeroEtapa}>2</div>
                <h4 style={estilos.tituloEtapa}>Encontre</h4>
                <p style={estilos.textoEtapa}>
                  Veja cuidadores perto de você no mapa em tempo real.
                </p>
              </div>

              <div style={estilos.itemDiferencial}>
                <div style={estilos.numeroEtapa}>3</div>
                <h4 style={estilos.tituloEtapa}>Reserve</h4>
                <p style={estilos.textoEtapa}>
                  Escolha o horário, confirme e pague via PIX.
                </p>
              </div>

              <div style={estilos.itemDiferencial}>
                <div style={estilos.numeroEtapa}>4</div>
                <h4 style={estilos.tituloEtapa}>Avalie</h4>
                <p style={estilos.textoEtapa}>
                  Depois do serviço, avalie e compartilhe sua experiência.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Chamada para ação */}
        <section style={estilos.cta}>
          <div style={estilos.containerCta}>
            <h3 style={estilos.tituloCta}>
              Pronto para cuidar do seu pet com tranquilidade?
            </h3>
            <p style={estilos.textoCta}>
              Milhares de donos já confiam na Pata Segura.
            </p>
            <Link to="/cadastro" style={estilos.botaoCta}>
              Criar conta gratuitamente
            </Link>
          </div>
        </section>
      </main>

      {/* Rodapé */}
      <footer style={estilos.rodape}>
        <div style={estilos.containerRodape}>
          <div style={estilos.colunaRodape}>
            <div style={estilos.logoRodape}>
              <span style={estilos.icone}>🐾</span>
              <h4 style={estilos.tituloRodape}>Pata Segura</h4>
            </div>
            <p style={estilos.textoRodape}>
              Conectando você a cuidadores de confiança.
            </p>
          </div>

          <div style={estilos.colunaRodape}>
            <h5 style={estilos.tituloColuna}>Serviços</h5>
            
            <Link to="/cadastro" style={estilos.linkRodape}>Ser cuidador</Link>
            
          </div>

          <div style={estilos.colunaRodape}>
            <h5 style={estilos.tituloColuna}>Suporte</h5>
            <Link to="/" style={estilos.linkRodape}>Central de ajuda</Link>
            <Link to="/" style={estilos.linkRodape}>Contato</Link>
            <Link to="/" style={estilos.linkRodape}>Termos de uso</Link>
          </div>

          <div style={estilos.colunaRodape}>
            <h5 style={estilos.tituloColuna}>Contato</h5>
            <p style={estilos.contatoRodape}>E-mail: contato@patasegura.com.br</p>
            
          </div>
        </div>

        <div style={estilos.copy}>
          © 2025 Pata Segura. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  )
}

const estilos = {
  pagina: {
    minHeight: '100vh',
    width: '100%',
    maxWidth: '100vw',
    margin: '0 auto',
    padding: 0,
    background: '#f8fafc',
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    textAlign: 'center'
  },
  cabecalho: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
    padding: '10px 0',
    zIndex: 100
  },
  containerCabecalho: {
    width: '90%',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  icone: { fontSize: '24px' },
  titulo: { margin: 0, fontSize: '18px', color: '#166534', fontWeight: 800 },
  usuario: { display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  avatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    flexShrink: 0
  },
  dadosUsuario: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  nomeUsuario: { fontSize: '14px', fontWeight: 600, color: '#1e293b' },
  tipoUsuario: { fontSize: '12px', color: '#64748b' },
  botaoSair: {
    padding: '8px 12px',
    border: 'none',
    borderRadius: '8px',
    background: '#fef2f2',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: 600
  },
  botoesCabecalho: { display: 'flex', gap: '8px', alignItems: 'center' },
  linkEntrar: {
    textDecoration: 'none',
    color: '#475569',
    fontSize: '14px',
    fontWeight: 600,
    padding: '8px 12px'
  },
  botaoCadastrar: {
    textDecoration: 'none',
    background: '#166534',
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: 600
  },
  principal: {
    marginTop: '70px',
    width: '100%',
    marginLeft: 'auto',
    marginRight: 'auto'
  },
  hero: {
    padding: '40px 16px',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #e0f2fe 100%)',
    width: '100%'
  },
  containerHero: {
    width: '90%',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: '40px',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  textoHero: {
    flex: '1 1 300px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  badge: {
    display: 'inline-block',
    fontSize: '13px',
    color: '#15803d',
    fontWeight: 600,
    background: '#ffffff',
    border: '1px solid #bbf7d0',
    borderRadius: '999px',
    padding: '6px 14px',
    marginBottom: '16px'
  },
  tituloHero: {
    fontSize: 'clamp(24px, 5vw, 36px)',
    lineHeight: '1.3',
    margin: '0 0 16px',
    color: '#1e293b',
    textAlign: 'center'
  },
  subtituloHero: {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#64748b',
    margin: '0 0 24px',
    maxWidth: '500px',
    textAlign: 'center'
  },
  botoesHero: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%'
  },
  botaoPrimario: {
    background: '#166534',
    color: '#fff',
    padding: '12px 24px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(22, 101, 52, 0.25)',
    textAlign: 'center'
  },
  botaoSecundario: {
    background: '#fff',
    color: '#1e293b',
    padding: '12px 24px',
    borderRadius: '10px',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: 600,
    border: '1px solid #cbd5e1',
    textAlign: 'center'
  },
  estatisticas: {
    display: 'flex',
    gap: '24px',
    marginTop: '32px',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: '100%'
  },
  estatistica: { textAlign: 'center' },
  numero: {
    fontSize: 'clamp(22px, 4vw, 28px)',
    fontWeight: 800,
    color: '#166534',
    display: 'block'
  },
  rotulo: { fontSize: '13px', color: '#64748b' },
  cartoesHero: {
    flex: '1 1 300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    alignItems: 'center'
  },
  cardPrincipal: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '16px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
    width: '100%',
    maxWidth: '360px',
    textAlign: 'center'
  },
  cardSecundario: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '14px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    width: '100%',
    maxWidth: '320px',
    textAlign: 'center'
  },
  cardTerceiro: {
    background: '#ffffff',
    padding: '20px',
    borderRadius: '14px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    width: '100%',
    maxWidth: '320px',
    textAlign: 'center'
  },
  iconeCard: { fontSize: '28px', marginBottom: '10px' },
  tituloCard: { margin: 0, fontSize: '20px', fontWeight: 700, color: '#1e293b' },
  textoCard: { margin: '8px 0 0', color: '#64748b', lineHeight: '1.6' },
  tituloCardMenor: { margin: 0, fontSize: '16px', fontWeight: 600, color: '#1e293b' },
  textoCardMenor: { margin: '6px 0 0', color: '#64748b', lineHeight: '1.5' },
  diferenciais: {
    padding: '48px 16px',
    background: '#f8fafc',
    width: '100%'
  },
  containerDiferenciais: {
    width: '90%',
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center'
  },
  secaoBadge: {
    display: 'inline-block',
    fontSize: '13px',
    color: '#15803d',
    fontWeight: 600,
    background: '#f0fdf4',
    borderRadius: '999px',
    padding: '6px 14px',
    marginBottom: '12px'
  },
  secaoTitulo: {
    fontSize: 'clamp(22px, 4vw, 30px)',
    margin: '0 0 32px',
    color: '#1e293b',
    fontWeight: 700,
    textAlign: 'center'
  },
  gridDiferenciais: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    width: '100%'
  },
  itemDiferencial: {
    background: '#ffffff',
    padding: '24px',
    borderRadius: '14px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.06)',
    textAlign: 'center'
  },
  numeroEtapa: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: '0 auto 12px'
  },
  tituloEtapa: { margin: '0 0 6px', fontSize: '17px', fontWeight: 600, color: '#1e293b' },
  textoEtapa: { margin: 0, color: '#64748b', lineHeight: '1.5', fontSize: '14px' },
  cta: {
    padding: '48px 16px',
    background: 'linear-gradient(135deg, #166534 0%, #15803d 100%)',
    color: '#fff',
    width: '100%'
  },
  containerCta: {
    width: '90%',
    maxWidth: '700px',
    margin: '0 auto',
    textAlign: 'center'
  },
  tituloCta: {
    fontSize: 'clamp(20px, 4vw, 28px)',
    margin: '0 0 12px',
    fontWeight: 700,
    textAlign: 'center'
  },
  textoCta: {
    fontSize: '16px',
    margin: '0 0 24px',
    opacity: 0.9,
    textAlign: 'center'
  },
  botaoCta: {
    background: '#ffffff',
    color: '#166534',
    padding: '14px 28px',
    borderRadius: '12px',
    textDecoration: 'none',
    fontSize: '16px',
    fontWeight: 600,
    display: 'inline-block',
    textAlign: 'center'
  },
  rodape: {
    background: '#1e293b',
    color: '#fff',
    padding: '40px 16px 24px',
    width: '100%'
  },
  containerRodape: {
    width: '90%',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '28px',
    marginBottom: '24px',
    textAlign: 'center'
  },
  colunaRodape: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    alignItems: 'center'
  },
  logoRodape: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  tituloRodape: { margin: 0, fontSize: '18px', fontWeight: 700 },
  textoRodape: { margin: 0, color: '#cbd5e1', lineHeight: '1.6', fontSize: '14px', textAlign: 'center' },
  tituloColuna: { margin: '0 0 12px', fontSize: '15px', fontWeight: 600 },
  linkRodape: { color: '#cbd5e1', textDecoration: 'none', marginBottom: '6px', fontSize: '14px', textAlign: 'center' },
  contatoRodape: { margin: '0 0 6px', color: '#cbd5e1', fontSize: '14px', textAlign: 'center' },
  copy: {
    width: '90%',
    maxWidth: '1200px',
    margin: '0 auto',
    paddingTop: '20px',
    borderTop: '1px solid #334155',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '13px'
  }
}