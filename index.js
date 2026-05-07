const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// --- إعدادات ناصر ---
const myNumber = '201204950121@c.us'; // حط رقمك هنا
let customMessage = "رسالة تجريبية من بوت ناصر"; // دي الرسالة الافتراضية
let autoSend = false; // البوت بيبدأ وهو مش بيبعت تلقائي لحد ما تفعله

function generateEgyptianNumber() {
    const prefixes = ['10', '11', '12', '15'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    let body = '';
    for (let i = 0; i < 8; i++) { body += Math.floor(Math.random() * 10); }
    return `20${prefix}${body}@c.us`;
}

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('امسح الكود يا ناصر');
});

client.on('ready', () => {
    console.log('البوت جاهز! ابعت "تفعيل" للبدء أو "رسالة [النص]" لتغيير الكلام.');
    
    // إعداد التكرار (كل 10 دقائق = 600,000 مللي ثانية)
    setInterval(async () => {
        if (autoSend) {
            const randomNum = generateEgyptianNumber();
            try {
                await client.sendMessage(randomNum, customMessage);
                console.log(`تم إرسال [${customMessage}] للرقم: ${randomNum}`);
            } catch (e) { console.log("فشل الإرسال التلقائي"); }
        }
    }, 600000); 
});

client.on('message', async (msg) => {
    if (msg.from !== myNumber) return;

    // 1. أمر تغيير الرسالة
    if (msg.body.startsWith('رسالة ')) {
        customMessage = msg.body.replace('رسالة ', '');
        msg.reply(`تم تغيير الرسالة لـ: ${customMessage}`);
    }

    // 2. أمر تفعيل الإرسال التلقائي كل 10 دقايق
    if (msg.body === 'تفعيل') {
        autoSend = true;
        msg.reply('تم تفعيل الإرسال التلقائي كل 10 دقائق.');
    }

    // 3. أمر إيقاف الإرسال التلقائي
    if (msg.body === 'ايقاف') {
        autoSend = false;
        msg.reply('تم إيقاف الإرسال التلقائي.');
    }
});

client.initialize();
