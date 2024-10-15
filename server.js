const zmq = require('zeromq');

async function runServer() {
    const sock = new zmq.Reply();

    await sock.bind('tcp://127.0.0.1:3000');
    console.log('Готов к игре...');

    let min, max;

    while (true) {
        const [msg] = await sock.receive();
        const data = JSON.parse(msg.toString());

        if (data.range) {
            const [minStr, maxStr] = data.range.split('-');
            min = parseInt(minStr, 10);
            max = parseInt(maxStr, 10);
            console.log(`Диапазон: ${min}-${max}`);

            const guess = Math.floor((min + max) / 2);
            await sock.send(JSON.stringify({ answer: guess }));
        } else if (data.hint) {
            console.log(`Подсказка: ${data.hint}`);

            if (data.hint === 'more') {
                min = Math.floor((min + max) / 2) + 1;
            } else if (data.hint === 'less') {
                max = Math.floor((min + max) / 2) - 1;
            }

            const guess = Math.floor((min + max) / 2);
            await sock.send(JSON.stringify({ answer: guess }));
        }
    }
}

runServer().catch(err => console.error(err));