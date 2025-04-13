const mineflayer = require('mineflayer');

// Простая функция логирования
function log(message) {
    console.log(`[${new Date().toISOString()}] ${message}`);
}

// Конфигурация бота
const config = {
    host: 'agerapvp.club',       // IP-адрес сервера (измените на ваш сервер)
    port: 25565,            // Порт сервера (по умолчанию: 25565)
    username: 'rrbw_bot',   // Имя пользователя бота
    version: '1.8.9',       // Версия Minecraft
    logErrors: true,        // Логирование ошибок
    hideErrors: false       // Не скрывать ошибки
};

// Создание бота
const bot = mineflayer.createBot(config);

// Переменная для отслеживания состояния прыжков
let isJumping = false;

// Функция для начала прыжков
function startJumping() {
    if (isJumping) return;
    isJumping = true;

    log('Начато бесконечное прыганье');

    // Настройка цикла прыжков
    function jump() {
        if (!isJumping) return;

        // Проверяем, находится ли бот на земле перед следующим прыжком
        if (bot.entity && bot.entity.onGround) {
            bot.setControlState('jump', true);
            bot.setControlState('jump', false);
        }

        // Планируем следующий прыжок
        setTimeout(jump, 100);
    }

    // Запускаем цикл прыжков
    jump();
}

// Функция для остановки прыжков
function stopJumping() {
    isJumping = false;
    log('Прыжки остановлены');
}

// Прослушивание обычных сообщений чата
bot.on('chat', (username, message) => {
    // Игнорируем сообщения от самого бота
    if (username === bot.username) return;

    log(`Чат: ${username}: ${message}`);

    // Обрабатываем команду
    if (message.toLowerCase() === 'start') {
        // Отправляем личное сообщение отправителю команды
        bot.chat(`/msg ${username} Привет!`);
        log(`Отправлено личное сообщение игроку ${username}`);
    } else if (message.toLowerCase() === 'stop') {
        stopJumping();
    } else if (message.toLowerCase() === 'resume') {
        startJumping();
    }
});

// Прослушивание всех сообщений для обнаружения личных сообщений
bot.on('message', (jsonMsg) => {
    const message = jsonMsg.toString();
    log(`Получено сообщение: ${message}`);

    // Различные форматы личных сообщений
    const pmPatterns = [
        /(.+) -> вы: (.+)/,
        /от (.+) для вас: (.+)/,
        /\[от (.+) для (.+)\] (.+)/,    // Формат [от sender для receiver] message
        /\[от (.+) для Me\] (.+)/,      // Ваш формат [от sender для Me] message
        /\[(.+) -> вы\] (.+)/,
        /от\[(.+)\]: (.+)/,
        /\[MSG\] (.+) -> Вы: (.+)/,
        /приватно от (.+): (.+)/
    ];

    // Проверяем все форматы
    for (const pattern of pmPatterns) {
        const match = message.match(pattern);
        if (match) {
            let sender, msgContent;

            // Проверяем формат [от X для Me]
            if (pattern.toString().includes('для Me')) {
                sender = match[1].trim();
                msgContent = match[2].trim();
            }
            // Проверяем формат [от X для Y] Z
            else if (pattern.toString().includes('для (.+)')) {
                sender = match[1].trim();
                msgContent = match[3] ? match[3].trim() : '';
            }
            // Другие форматы
            else if (match.length >= 3) {
                sender = match[1].trim();
                msgContent = match[2].trim();
            }

            if (sender && msgContent) {
                log(`Обнаружено личное сообщение от ${sender}: ${msgContent}`);

                // Если это не сообщение от самого бота
                if (sender !== bot.username && sender.toLowerCase() !== bot.username.toLowerCase()) {
                    // Проверяем команды
                    if (msgContent.toLowerCase() === 'start') {
                        bot.chat(`/msg ${sender} Привет!`);
                        log(`Отправлено личное сообщение игроку ${sender}`);
                    } else if (msgContent.toLowerCase() === 'stop') {
                        stopJumping();
                        bot.chat(`/msg ${sender} Прыжки остановлены`);
                    } else if (msgContent.toLowerCase() === 'resume') {
                        startJumping();
                        bot.chat(`/msg ${sender} Прыжки возобновлены`);
                    }
                }

                // Нашли и обработали сообщение, прерываем цикл
                break;
            }
        }
    }
});

// Логирование событий
bot.on('spawn', () => {
    log('Бот появился в мире');
    startJumping();
});

bot.on('kicked', (reason) => {
    log(`Бот был выкинут с сервера: ${reason}`);
});

bot.on('error', (err) => {
    log(`Произошла ошибка: ${err}`);
});

// Логирование при успешном подключении
bot.on('login', () => {
    log(`Вход выполнен на ${config.host}:${config.port}`);
});

// Обработчик для whisper (шепота)
bot.on('whisper', (username, message) => {
    log(`Получен whisper от ${username}: ${message}`);

    // Обрабатываем команды в личных сообщениях
    if (message.toLowerCase() === 'start') {
        bot.chat(`/msg ${username} Привет!`);
        log(`Отправлено личное сообщение игроку ${username}`);
    } else if (message.toLowerCase() === 'stop') {
        stopJumping();
        bot.chat(`/msg ${username} Прыжки остановлены`);
    } else if (message.toLowerCase() === 'resume') {
        startJumping();
        bot.chat(`/msg ${username} Прыжки возобновлены`);
    }
});

log('Запуск бота...');