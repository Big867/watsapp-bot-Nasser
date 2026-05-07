const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        handleSIGINT: false,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--no-zygote'
        ],
    }
});

// رقمك هنا (تأكد من تعديله)
const myNumber = '201204950121@c.us'; 

client.on('qr', (qr) => {
    console.log('امسح الكود ده يا ناصر:');
    qrcode.generate(qr, {small: true});
});

client.on('ready', () => {
    console.log('مبروك يا بطل.. البوت شغال!');
});

client.on('message', async (msg) => {
    if (msg.from !== myNumber) return;

    if (msg.body === 'عشوائي') {
        msg.reply('جاري الإرسال لرقم عشوائي...');
        // هنا ممكن تضيف دالة الرقم العشوائي اللي عملناها قبل كدة
    }
});

client.initialize();
