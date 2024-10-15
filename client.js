const zmq = require('zeromq');

async function runClient(min, max) {
    const sock = new zmq.Request();

    await sock.connect('tcp://127.0.0.1:3000');
    console.log(`Подключено к серверу. Загадываю число в диапазоне ${min}-${max}`);

    const secretNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`Загаданное число: ${secretNumber}`);

    await sock.send(JSON.stringify({ range: `${min}-${max}` }));

    while (true) {
        const [msg] = await sock.receive();
        const data = JSON.parse(msg.toString());

        if (data.answer) {
            console.log(`Сервер ответил: ${data.answer}`);

            if (data.answer === secretNumber) {
                console.log('Сервер угадал число!');
                break;
            } else if (data.answer < secretNumber) {
                console.log('Подсказка: больше');
                await sock.send(JSON.stringify({ hint: 'more' }));
            } else {
                console.log('Подсказка: меньше');
                await sock.send(JSON.stringify({ hint: 'less' }));
            }
        }
    }
}

const [min, max] = process.argv.slice(2).map(Number);
if (!min || !max) {
    console.error('Использование: node game-client.js <min> <max>');
    process.exit(1);
}

runClient(min, max).catch(err => console.error(err));