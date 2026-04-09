const net = require('net');
const dns = require('dns');

console.log('--- DIAGNÓSTICO DE REDE (PORTA 5432) ---');

const url = process.env.DATABASE_URL;

if (!url) {
  console.error('❌ ERRO: DATABASE_URL não encontrada!');
  process.exit(1);
}

try {
  const urlObj = new URL(url);
  const host = urlObj.hostname;
  const port = parseInt(urlObj.port || '5432');

  console.log(`Testando conexão com: ${host}:${port}`);

  dns.lookup(host, (err, address, family) => {
    if (err) {
      console.error('❌ ERRO DE DNS:', err.message);
      process.exit(1);
    }
    console.log(`✅ DNS: ${address} (v${family})`);

    const socket = new net.Socket();
    const timeout = 5000;

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      console.log('✅ SUCESSO: Porta 5432 está aberta e acessível!');
      socket.destroy();
      process.exit(0);
    });

    socket.on('timeout', () => {
      console.error(`❌ ERRO: Timeout após ${timeout/1000}s. Porta 5432 bloqueada?`);
      socket.destroy();
      process.exit(1);
    });

    socket.on('error', (err) => {
      console.error('❌ ERRO DE CONEXÃO:', err.message);
      socket.destroy();
      process.exit(1);
    });

    socket.connect(port, host);
  });
} catch (e) {
  console.error('❌ ERRO AO PARSEAR URL:', e.message);
  process.exit(1);
}
