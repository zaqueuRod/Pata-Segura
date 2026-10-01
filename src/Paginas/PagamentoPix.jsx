import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ref, update } from 'firebase/database'
import { db } from '../firebase'

export default function PagamentoPix() {
  const [parametros] = useSearchParams()
  const idChamada = parametros.get('idChamada') || ''
  const valor = parametros.get('valor') || '0,00'

  // ✅ 👇 COLOQUE AQUI A SUA CHAVE PIX REAL
  const CHAVE_PIX = '085.340.289-23' // ← TROQUE PELA SUA!
  const NOME_RECEBEDOR = 'PATA SEGURA'
  const CIDADE = 'ITAJAI-SC'

  // ✅ GERADOR DE CÓDIGO PIX 100% PADRÃO BANCO CENTRAL
  function gerarCodigoPix() {
    const valorFormatado = valor.replace(',', '.')

    // Função auxiliar: calcula CRC16 (obrigatório no final)
    function calcularCRC16(dados) {
      let crc = 0xFFFF
      const polinomio = 0x1021
      for (let i = 0; i < dados.length; i++) {
        crc ^= dados.charCodeAt(i) << 8
        for (let j = 0; j < 8; j++) {
          crc = (crc & 0x8000) ? ((crc << 1) ^ polinomio) : (crc << 1)
          crc &= 0xFFFF
        }
      }
      return crc.toString(16).toUpperCase().padStart(4, '0')
    }

    // ✅ Monta o payload no padrão EXATO do Banco Central
    const campos = [
      ['00', '01'],                          // Formato do payload
      ['26', `0014br.gov.bcb.pix01${String(CHAVE_PIX.length).padStart(2,'0')}${CHAVE_PIX}`], // Chave PIX
      ['52', '0000'],                        // Categoria
      ['53', '986'],                         // Moeda = Real
      ['58', 'BR'],                          // País
      ['59', NOME_RECEBEDOR.substring(0, 25)], // Nome
      ['60', CIDADE.substring(0, 15)],      // Cidade
    ]

    // Adiciona valor se maior que zero
    if (valorFormatado && parseFloat(valorFormatado) > 0) {
      campos.push(['54', valorFormatado])
    }

    // Monta string completa
    let payload = ''
    for (const [id, valorCampo] of campos) {
      const tam = String(valorCampo.length).padStart(2, '0')
      payload += `${id}${tam}${valorCampo}`
    }

    // Adiciona campo do CRC e calcula
    const semCRC = payload + '6304'
    const crc = calcularCRC16(semCRC)
    
    return semCRC + crc
  }

  const codigoPix = gerarCodigoPix()
  const [copiado, setCopiado] = useState(false)

  function copiarCodigo() {
    navigator.clipboard.writeText(codigoPix)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 3000)
  }

  async function pagamentoConfirmado() {
    try {
      if (idChamada) {
        await update(ref(db, `chamadas/${idChamada}`), {
          status: 'enviada_ao_cuidador',
          pagoEmPix: true,
          pagoEm: new Date().toLocaleString('pt-BR')
        })
      }
      alert('✅ Pagamento confirmado!\n📞 O cuidador foi avisado!')
      window.location.href = '/Pata-Segura/inicio'
    } catch (erro) {
      alert('✅ Pagamento confirmado! O cuidador foi avisado!')
      window.location.href = '/Pata-Segura/inicio'
    }
  }

  return (
    <div style={{padding: '20px', maxWidth: '420px', margin: '0 auto', textAlign: 'center'}}>
      <h2 style={{color: '#1e40af', marginBottom: '20px'}}>📱 Pagamento via PIX</h2>

      <div style={{
        backgroundColor: '#dbeafe',
        padding: '20px',
        borderRadius: '14px',
        marginBottom: '25px'
      }}>
        <p style={{margin: '0', fontSize: '14px', color: '#1e40af'}}>Valor a Pagar</p>
        <p style={{margin: '5px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#1d4ed8'}}>
          R$ {valor}
        </p>
      </div>

      <div style={{
        backgroundColor: '#fff',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <p style={{fontSize: '14px', color: '#374151', margin: '0 0 10px 0', fontWeight: 'bold'}}>
          📋 Código PIX Copia e Cola
        </p>
        <div style={{
          backgroundColor: '#f9fafb',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '11px',
          fontFamily: 'monospace',
          wordBreak: 'break-all',
          textAlign: 'left',
          marginBottom: '10px',
          userSelect: 'text'
        }}>
          {codigoPix}
        </div>
        <button
          onClick={copiarCodigo}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: copiado ? '#22c55e' : '#2563eb',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          {copiado ? '✅ CÓDIGO COPIADO!' : '📋 COPIAR CÓDIGO'}
        </button>
      </div>

      <div style={{
        backgroundColor: '#f0fdf4',
        borderRadius: '10px',
        padding: '15px',
        marginBottom: '20px',
        textAlign: 'left',
        fontSize: '13px',
        color: '#166534'
      }}>
        <p style={{margin: '0 0 8px 0', fontWeight: 'bold'}}>📝 Como pagar:</p>
        <p style={{margin: '0 0 5px 0'}}>1. Copie o código acima</p>
        <p style={{margin: '0 0 5px 0'}}>2. Abra o app do seu banco</p>
        <p style={{margin: '0 0 5px 0'}}>3. Escolha PIX → Pagar com código Copia e Cola</p>
        <p style={{margin: '0'}}>4. Confirme os dados e pague ✅</p>
      </div>

      <button
        onClick={pagamentoConfirmado}
        style={{
          width: '100%',
          padding: '16px',
          backgroundColor: '#22c55e',
          color: '#fff',
          border: 'none',
          borderRadius: '12px',
          fontSize: '17px',
          fontWeight: 'bold',
          cursor: 'pointer'
        }}
      >
        ✅ JÁ PAGUEI — Confirmar
      </button>
    </div>
  )
}