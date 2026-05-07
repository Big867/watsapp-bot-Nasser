const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const axios = require('axios');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: '/usr/bin/chromium', 
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
});

const myNumber = '201204950121@c.us'; 
let isRunning = true; // ده مفتاح التشغيل والإيقاف

client.on('qr', async (qr) => {
    qrcodeTerminal.generate(qr, {small: true});
    console.log('امسح الكود يا ناصر:');

    try {
        const qrBuffer = await QRCode.toBuffer(qr);
        const base64Image = qrBuffer.toString('base64');
        const params = new URLSearchParams();
        params.append('image', base64Image);
        
        // تم إضافة الهيدرز لضمان قبول الطلب من سيرفرات Railway
        const response = await axios.post('https://api.imgbb.com/1/upload?key=766223403e08f519c7f66299b8772322', params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        if (response.data && response.data.data) {
            console.log('\n######################################');
            console.log('يا ناصر اللينك أهو افتحه بسرعة:');
            console.log(response.data.data.url);
            console.log('######################################\n');
        }
    } catch (err) {
        console.log('فشل توليد الرابط. سبب المشكلة الأساسي من السيرفر هو:');
        // السطر ده هيظهر لك المشكلة الحقيقية في شاشة Railway لو حصلت
        console.log(err.response ? err.response.data : err.message);
    }
});

client.on('ready', () => {
    console.log('مبروك يا ناصر.. البوت شغال ومستعد للأوامر!');
    
    // نظام الإرسال التلقائي (بيفحص الأول لو إنت مشغله ولا قفله)
    setInterval(async () => {
        if (!isRunning) return; // لو قفلته مش هيبعت حاجة

        const randomNum = `201${Math.floor(Math.random() * 90000000 + 10000000)}@c.us`;
        try {
            await client.sendMessage(randomNum, "رسالة تلقائية من بوت ناصر");
            console.log("تم إرسال رسالة عشوائية");
        } catch(e) {}
    }, 600000);
});

client.on('message', async (msg) => {
    if (msg.from !== myNumber) return;

    // أوامر التحكم اللي ضفتهالك
    if (msg.body === 'إيقاف') {
        isRunning = false;
        msg.reply('تم إيقاف الإرسال التلقائي بنجاح 🛑');
    } 
    else if (msg.body === 'تشغيل') {
        isRunning = true;
        msg.reply('تم إعادة تشغيل الإرسال التلقائي يا بطل ✅');
    }
    else if (msg.body === 'عشوائي') {
        msg.reply(isRunning ? 'البوت شغال حالياً' : 'البوت في وضع الإيقاف');
    }
});

client.initialize();
