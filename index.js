const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/chromium', // ده مسار المتصفح المضمون
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

const myNumber = '201204950121@c.us'; // حط رقمك الحقيقي هنا

client.on('qr', (qr) => {
    qrcode.generate(qr, {small: true});
    console.log('امسح الكود يا ناصر:');
});

client.on('ready', () => {
    console.log('مبروك يا ناصر.. البوت شغال 100%!');
    
    // هيبعت رسالة كل 10 دقايق لرقم عشوائي
    setInterval(async () => {
        const randomNum = `201${Math.floor(Math.random() * 90000000 + 10000000)}@c.us`;
        try {
            await client.sendMessage(randomNum, "رسالة تلقائية من بوت ناصر");
            console.log("تم الإرسال لعشوائي بنجاح");
        } catch(e) {}
    }, 600000);
});

client.on('message', async (msg) => {
    if (msg.from !== myNumber) return;
    if (msg.body === 'عشوائي') {
        msg.reply('شغال يا بطل ومستعد!');
    }
});

client.initialize();
