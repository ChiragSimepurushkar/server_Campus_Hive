// test-conn.mjs (works in ES module mode)
import net from 'net';

async function testPort(host, port) {
  return new Promise((resolve) => {
    const socket = net.connect(port, host, () => {
      console.log(`✅ Connected to ${host}:${port}`);
      socket.end();
      resolve();
    });

    socket.on('error', (err) => {
      console.error(`❌ Connection failed to ${host}:${port}`, err.message);
      resolve();
    });

    socket.setTimeout(5000, () => {
      console.error(`⏰ Connection timed out to ${host}:${port}`);
      socket.destroy();
      resolve();
    });
  });
}

(async () => {
  console.log('Testing SMTP ports...\n');
  await testPort('smtp.gmail.com', 465);
  await testPort('smtp.gmail.com', 587);
})();
