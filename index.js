const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/google-chrome-stable', // بنقوله يستخدم الكروم اللي هنثبته
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

const myNumber = '201204950121@c.us'; // حط رقمك هنا يا ناصر
let customMessage = "رسالة تجريبية من بوت ناصر";
let autoSend = false;

function generateEgyptianNumber() {
    const prefixes = ['10', '11', '12', '15'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let body = '';
    for (let i = 0; i < 8; i++) { body += Math.floor(Math.random() * 10); }
    return `20${prefix}${body}@c.us`;
}

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('امسح الكود دلوقتي يا ناصر:');
});

client.on('ready', () => {
    console.log('البوت شغال! ابعت "تفعيل" عشان يبدأ يبعت كل 10 دقايق.');
    setInterval(async () => {
        if (autoSend) {
            const randomNum = generateEgyptianNumber();
            try {
                await client.sendMessage(randomNum, customMessage);
                console.log(`تم الإرسال لـ: ${randomNum}`);
            } catch (e) { console.log("فشل إرسال تلقائي"); }
        }
    }, 600000); 
});

client.on('message', async (msg) => {
    if (msg.from !== myNumber) return;
    if (msg.body.startsWith('رسالة ')) {
        customMessage = msg.body.replace('رسالة ', '');
        msg.reply(`الرسالة الجديدة: ${customMessage}`);
    }
    if (msg.body === 'تفعيل') { autoSend = true; msg.reply('بدأنا الإرسال التلقائي!'); }
    if (msg.body === 'ايقاف') { autoSend = false; msg.reply('توقف الإرسال.'); }
});

client.initialize();
