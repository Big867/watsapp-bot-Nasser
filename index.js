const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

// حط رقمك هنا يا ناصر
const myNumber = '201204950121@c.us'; 

client.on('qr', (qr) => {
    console.log('امسح الكود فوراً:');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('البوت شغال يا ناصر.. مبروك!');
});

client.on('message', async (msg) => {
    if (msg.from !== myNumber) return;
    if (msg.body === 'عشوائي') {
        msg.reply('شغال يا بطل، جاري التجهيز..');
    }
});

client.initialize();
