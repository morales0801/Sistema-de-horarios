const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('===================================================================');
console.log('  GENERANDO TÚNEL SEGURO PARA COLABORADORES REMOTOS (CLOUDFLARE)  ');
console.log('===================================================================\n');
console.log('Conectando con la red global de Cloudflare...');
console.log('Por favor espera unos segundos mientras se crea tu enlace público...\n');

const isWin = process.platform === 'win32';
const npxCmd = isWin ? 'npx.cmd' : 'npx';

const cloudflared = spawn(npxCmd, ['--yes', 'cloudflared', 'tunnel', '--url', 'http://localhost:5000'], {
  shell: true
});

let tunnelUrl = null;

function handleOutput(data) {
  const str = data.toString();
  // Match https://[a-zA-Z0-9-]+\.trycloudflare\.com
  const match = str.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
  if (match && !tunnelUrl) {
    tunnelUrl = match[0];
    const kioskUrl = `${tunnelUrl}/?mode=kiosk`;
    
    console.log('\n===================================================================');
    console.log('        ¡TU SISTEMA YA ESTÁ ACCESIBLE DESDE CUALQUIER LUGAR!        ');
    console.log('===================================================================\n');
    console.log('📲 ENLACE PARA TU COLABORADOR REMOTO (Envíale esto por WhatsApp/Email):');
    console.log(`   👉 ${kioskUrl}\n`);
    console.log('🔑 TU ENLACE DE ADMINISTRADOR (Desde cualquier PC o celular):');
    console.log(`   👉 ${tunnelUrl}\n`);
    console.log('===================================================================');
    console.log('NOTA: Mientras esta ventana esté abierta, cualquier colaborador');
    console.log('      en cualquier parte del mundo podrá marcar en tu sistema.');
    console.log('===================================================================\n');

    // Save to a text file for easy copy-pasting
    const txtPath = path.join(__dirname, '..', 'ENLACE-PARA-COLABORADORES.txt');
    const content = `ENLACE PARA MARCAR (COLABORADORES REMOTOS):
${kioskUrl}

ENLACE ADMINISTRADOR (CONTROL Y HORARIOS):
${tunnelUrl}

Generado el: ${new Date().toLocaleString()}
`;
    fs.writeFileSync(txtPath, content, 'utf-8');
    console.log(`(También guardamos estos enlaces en el archivo: ENLACE-PARA-COLABORADORES.txt)\n`);
  }
}

cloudflared.stdout.on('data', handleOutput);
cloudflared.stderr.on('data', handleOutput);

cloudflared.on('error', (err) => {
  console.error('Error iniciando Cloudflare Tunnel:', err.message);
});

cloudflared.on('close', (code) => {
  console.log(`Túnel cerrado (código ${code})`);
});
