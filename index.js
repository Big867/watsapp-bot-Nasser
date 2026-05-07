const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const axios = require('axios');
const FormData = require('form-data');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/chromium', // ده مسار المتصفح المضمون
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

const myNumber = '201204950121@c.us'; // حط رقمك الحقيقي هنا

client.on('qr', async (qr) => {
    // الكود الأصلي بتاعك (للرسم في التيرمينال)
    qrcodeTerminal.generate(qr, {small: true});
    console.log('امسح الكود يا ناصر:');

    // الإضافة الجديدة: توليد رابط للصورة
    try {
        const qrBuffer = await QRCode.toBuffer(qr);
        const formData = new FormData();
        formData.append('image', qrBuffer.toString('base64'));
        
        const response = await axios.post('https://api.imgbb.com/1/upload?key=766223403e08f519c7f66299b8772322', formData, {
            headers: formData.getHeaders()
        });

        console.log('\n######################################');
        console.log('يا ناصر افتح الرابط ده وامسح الكود فوراً:');
        console.log(response.data.data.url);
        console.log('######################################\n');
    } catch (err) {
        console.log('فشل توليد الرابط، حاول تمسح الكود المرسوم فوق.');
    }
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
