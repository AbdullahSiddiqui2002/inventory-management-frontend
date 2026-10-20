const localtunnel = require('localtunnel');

async function createTunnel() {
  try {
    const tunnel = await localtunnel({
      port: 3000,
      subdomain: 'stockcore-erp-pk',
    });

    console.log('==================================================');
    console.log('LIVE PUBLIC URL:', tunnel.url);
    console.log('==================================================');

    tunnel.on('close', () => {
      console.log('Tunnel connection lost. Reconnecting in 2 seconds...');
      setTimeout(createTunnel, 2000);
    });

    tunnel.on('error', (err) => {
      console.error('Tunnel error occurred:', err);
    });
  } catch (err) {
    console.error('Failed to create tunnel. Retrying in 3 seconds...', err.message);
    setTimeout(createTunnel, 3000);
  }
}

createTunnel();
