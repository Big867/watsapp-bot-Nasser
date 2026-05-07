const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const axios = require('axios');
const express = require('express');

// إعداد Express server صغير
const app = express();
const PORT = process.env.PORT || 3000;
let latestQRImage = null;
let latestQRTime = null;

// صفحة HTML لعرض QR Code
app.get('/', (req, res) => {
    if (!latestQRImage || (Date.now() - latestQRTime > 45000)) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>QR Code - بوت ناصر</title>
                <style>
                    body {
                        background: #075e54;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        font-family: sans-serif;
                        padding: 20px;
                    }
                    .box {
                        background: white;
                        padding: 40px;
                        border-radius: 20px;
                        text-align: center;
                        max-width: 400px;
                    }
                    h1 { color: #075e54; }
                    p { color: #666; }
                    .btn {
                        display: inline-block;
                        background: #25D366;
                        color: white;
                        padding: 12px 30px;
                        border-radius: 25px;
                        text-decoration: none;
                        margin-top: 20px;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="box">
                    <h1>⏰ لا يوجد QR Code حالياً</h1>
                    <p>تم انتهاء صلاحية الكود أو لم يتم توليده بعد</p>
                    <a href="/" class="btn">🔄 تحديث الصفحة</a>
                </div>
            </body>
            </html>
        `);
    }
    
    res.send(`
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>QR Code - بوت ناصر</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    background: linear-gradient(135deg, #075e54, #128c7e);
                    min-height: 100vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    padding: 20px;
                }
                .container {
                    background: white;
                    border-radius: 20px;
                    padding: 30px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    text-align: center;
                    max-width: 450px;
                    width: 100%;
                }
                h1 { color: #075e54; margin-bottom: 10px; font-size: 24px; }
                p { color: #667781; margin-bottom: 20px; }
                .qr-box {
                    background: white;
                    padding: 20px;
                    border-radius: 15px;
                    display: inline-block;
                    margin: 10px 0;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                }
                .qr-box img { width: 250px; height: 250px; }
                .steps {
                    text-align: right;
                    background: #f0f2f5;
                    padding: 20px;
                    border-radius: 15px;
                    margin: 20px 0;
                }
                .steps h3 { color: #075e54; margin-bottom: 10px; }
                .steps ol { padding-right: 20px; }
                .steps li { margin-bottom: 8px; color: #3b4a54; }
                .timer {
                    background: #dc3545;
                    color: white;
                    padding: 10px 25px;
                    border-radius: 25px;
                    display: inline-block;
                    font-weight: bold;
                    font-size: 18px;
                    margin: 10px 0;
                }
                .btn {
                    display: inline-block;
                    background: #25D366;
                    color: white;
                    padding: 12px 30px;
                    border-radius: 25px;
                    text-decoration: none;
                    font-weight: bold;
                    margin-top: 10px;
                    transition: 0.3s;
                }
                .btn:hover { background: #128c7e; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>💚 بوت واتساب ناصر</h1>
                <p>امسح الكود عشان تفعل البوت</p>
                
                <div class="qr-box">
                    <img src="${latestQRImage}" alt="QR Code">
                </div>
                
                <div class="steps">
                    <h3>📱 خطوات المسح:</h3>
                    <ol>
                        <li>افتح واتساب على موبايلك</li>
                        <li>ادخل على الإعدادات</li>
                        <li>اختار "الأجهزة المرتبطة"</li>
                        <li>دوس "ربط جهاز"</li>
                        <li>وجه الكاميرا على الكود</li>
                    </ol>
                </div>
                
                <div class="timer" id="timer">⏱️ جاري تحميل...</div>
                <br>
                <a href="/" class="btn">🔄 تحديث الكود</a>
            </div>
            
            <script>
                const qrTime = ${latestQRTime};
                let timeLeft = Math.max(0, Math.floor((45000 - (Date.now() - qrTime)) / 1000));
                
                function updateTimer() {
                    if (timeLeft <= 0) {
                        document.getElementById('timer').textContent = '⚠️ انتهت الصلاحية - حدث الصفحة';
                        document.getElementById('timer').style.background = '#6c757d';
                    } else {
                        const mins = Math.floor(timeLeft / 60);
                        const secs = timeLeft % 60;
                        document.getElementById('timer').textContent = \`⏱️ متبقي: \${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;
                        timeLeft--;
                        setTimeout(updateTimer, 1000);
                    }
                }
                updateTimer();
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🌐 سيرفر QR Code شغال على البورت ${PORT}`);
});

// WhatsApp Client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        executablePath: process.env.CHROMIUM_PATH || '/usr/bin/chromium',
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--disable-gpu'
        ]
    }
});

const myNumber = '201204950121@c.us';
let isRunning = true;
let qrCodeUrl = null;

client.on('qr', async (qr) => {
    qrcodeTerminal.generate(qr, { small: true });
    console.log('📱 تم توليد QR Code جديد');
    
    try {
        // تحويل QR Code لصورة Data URL
        latestQRImage = await QRCode.toDataURL(qr);
        latestQRTime = Date.now();
        
        // رفع الصورة لـ imgbb للحصول على رابط
        const base64Data = latestQRImage.split(',')[1];
        const formData = new URLSearchParams();
        formData.append('image', base64Data);
        formData.append('key', '766223403e08f519c7f66299b8772322');
        
        const response = await axios.post('https://api.imgbb.com/1/upload', formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            timeout: 15000
        });
        
        if (response.data?.data?.url) {
            qrCodeUrl = response.data.data.url;
            console.log('\n' + '='.repeat(50));
            console.log('🔗 رابط QR Code (صورة):');
            console.log(qrCodeUrl);
            console.log('='.repeat(50));
            console.log('🌐 أو افتح الرابط ده من المتصفح:');
            console.log('http://localhost:' + PORT);
            console.log('='.repeat(50) + '\n');
        }
    } catch (error) {
        console.log('⚠️ فشل رفع الصورة لـ imgbb');
        console.log('🌐 لكن تقدر تفتح الصفحة من هنا:');
        console.log('http://localhost:' + PORT);
        console.log('📱 أو امسح الكود من التيرمنال أعلاه 👆\n');
    }
});

client.on('authenticated', () => {
    console.log('✅ تم التوثيق بنجاح');
    latestQRImage = null;
    latestQRTime = null;
    qrCodeUrl = null;
});

client.on('ready', () => {
    console.log('🚀 مبروك يا ناصر.. البوت شغال وجاهز!');
    console.log('📋 الأوامر: إيقاف | تشغيل | عشوائي | مساعدة');
    
    setInterval(async () => {
        if (!isRunning) return;
        const randomNum = `201${Math.floor(Math.random() * 90000000 + 10000000)}@c.us`;
        try {
            await client.sendMessage(randomNum, "رسالة تلقائية من بوت ناصر");
            console.log("✅ تم إرسال رسالة عشوائية");
        } catch(e) {}
    }, 600000);
});

client.on('disconnected', (reason) => {
    console.log('❌ انقطع الاتصال:', reason);
    setTimeout(() => client.initialize(), 5000);
});

client.on('message', async (msg) => {
    if (msg.from !== myNumber) return;
    const command = msg.body.trim();
    
    if (command === 'إيقاف') {
        isRunning = false;
        await msg.reply('🛑 تم إيقاف الإرسال التلقائي');
    } else if (command === 'تشغيل') {
        isRunning = true;
        await msg.reply('✅ تم تشغيل الإرسال التلقائي');
    } else if (command === 'عشوائي') {
        await msg.reply(isRunning ? '✅ البوت شغال' : '⏸️ البوت متوقف');
    } else if (command === 'مساعدة') {
        await msg.reply('📋 الأوامر:\n• إيقاف\n• تشغيل\n• عشوائي\n• مساعدة');
    }
});

client.initialize().catch(err => {
    console.error('❌ فشل بدء البوت:', err);
    process.exit(1);
});
