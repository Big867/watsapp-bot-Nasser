const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

function generateEgyptianNumber() {
    const prefixes = ['10', '11', '12', '15'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let body = '';
    for (let i = 0; i < 8; i++) {
        body += Math.floor(Math.random() * 10);
    }
    return `20${prefix}${body}@c.us`;
}

client.on('qr', (qr) => {
    console.log('امسح الكود ده بموبايلك:');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('البوت جاهز وشغال!');
    setInterval(async () => {
        const randomNumber = generateEgyptianNumber();
        const message = "يا هلا! رسالة تجريبية عشوائية."; 
        try {
            await client.sendMessage(randomNumber, message);
            console.log(`تم الإرسال لـ: ${randomNumber}`);
        } catch (err) {
            console.log(`فشل الإرسال لـ ${randomNumber}`);
        }
    }, 300000); 
});

client.initialize();
