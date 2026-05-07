const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// --- حط رقمك هنا عشان البوت يسمع كلامك أنت بس ---
const myNumber = '201204950121@c.us'; // استبدل الرقم ده برقمك أنت

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
    console.log('امسح الكود ده فوراً:');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('البوت شغال وجاهز لأوامر ناصر فقط!');
});

client.on('message', async (msg) => {
    
    // التأكد إن اللي بيبعت هو أنت
    if (msg.from !== myNumber) return;

    // 1. أمر الإرسال العشوائي
    if (msg.body === 'عشوائي') {
        const randomNum = generateEgyptianNumber();
        const text = "رسالة تجريبية عشوائية من بوت ناصر.";
        try {
            await client.sendMessage(randomNum, text);
            msg.reply(`تم الإرسال للرقم العشوائي: ${randomNum}`);
        } catch (err) {
            msg.reply('فشل الإرسال للعشوائي.');
        }
    }

    // 2. أمر الإرسال لرقم معين
    // الصيغة: ارسل 201xxxxxxxxx النص
    if (msg.body.startsWith('ارسل ')) {
        const parts = msg.body.split(' ');
        const targetNum = parts[1] + '@c.us';
        const messageText = parts.slice(2).join(' ');

        try {
            await client.sendMessage(targetNum, messageText);
            msg.reply(`تم الإرسال لـ ${targetNum}`);
        } catch (err) {
            msg.reply('خطأ في الرقم أو الرسالة.');
        }
    }
});

client.initialize();
