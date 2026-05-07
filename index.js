const { Client, LocalAuth } = require('whatsapp-web.js');
const QRCode = require('qrcode');
const axios = require('axios');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

let latestQRImage = null;
let latestQRTime = null;
let qrImageUrl = null;

app.get('/', (req, res) => {
    if (!latestQRImage || (Date.now() - latestQRTime > 50000)) {
        return res.send(`
            <!DOCTYPE html>
            <html lang="ar" dir="rtl">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>انتظار QR Code</title>
                <style>
                    body {
                        background: #075e54;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        min-height: 100vh;
                        font-family: sans-serif;
                    }
                    .box {
                        background: white;
                        padding: 40px;
                        border-radius: 20px;
                        text-align: center;
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0% { transform: scale(1); }
                        50% { transform: scale(1.02); }
                        100% { transform: scale(1); }
                    }
                    h1 { color: #075e54; }
                    .loader {
                        border: 4px solid #f3f3f3;
                        border-top: 4px solid #25D366;
                        border-radius: 50%;
                        width: 50px;
                        height: 50px;
                        animation: spin 1s linear infinite;
                        margin: 20px auto;
                    }
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                </style>
            </head>
            <body>
                <div class="box">
                    <div class="loader"></div>
                    <h1>⏳ جاري انتظار QR Code...</h1>
                    <p style="color:#666;">لم يتم توليد الكود بعد</p>
                    <p style="color:#999; font-size:14px;">جرب تحديث الصفحة بعد 5 ثوان</p>
                </div>
            </body>
            </html>
        `);
    }

    const timeLeft = Math.max(0, Math.floor((50000 - (Date.now() - latestQRTime)) / 1000));
    
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
                    font-family: Arial, sans-serif;
                    padding: 20px;
                }
                .container {
                    background: white;
                    border-radius: 20px;
                    padding: 25px;
                    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                    text-align: center;
                    max-width: 450px;
                    width: 100%;
                }
                h1 { color: #075e54; margin: 10px 0; font-size: 24px; }
                .subtitle { color: #667781; margin-bottom: 15px; font-size: 14px; }
                .qr-box {
                    background: white;
                    padding: 15px;
                    border-radius: 15px;
                    display: inline-block;
                    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
                }
                .qr-box img { width: 250px; height: 250px; display: block; }
                .steps {
                    text-align: right;
                    background: #f0f2f5;
                    padding: 15px 20px;
                    border-radius: 15px;
                    margin: 20px 0;
                    font-size: 14px;
                }
                .steps h3 { color: #075e54; margin-bottom: 10px; }
                .steps ol { padding-right: 20px; }
                .steps li { margin-bottom: 8px; color: #3b4a54; line-height: 1.6; }
                .timer {
                    background: #dc3545;
                    color: white;
                    padding: 8px 20px;
                    border-radius: 20px;
                    display: inline-block;
                    font-weight: bold;
                    font-size: 16px;
                    margin: 10px 0;
                }
                .btn {
                    display: inline-block;
                    background: #25D366;
                    color: white;
                    padding: 10px 25px;
                    border-radius: 25px;
                    text-decoration: none;
                    font-weight: bold;
                    font-size: 14px;
                    transition: 0.3s;
                    border: none;
                    cursor: pointer;
                }
                .btn:hover { background: #128c7e; }
                .expired { background: #6c757d; }
                .footer { margin-top: 15px; color: #999; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>💚 بوت واتساب ناصر</h1>
                <p class="subtitle">امسح الكود لتفعيل البوت</p>
                
                <div class="qr-box">
                    <img src="${latestQRImage}" alt="QR Code" id="qrImage">
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
                
                <div class="timer" id="timer">⏱️ متبقي: ${String(Math.floor(timeLeft / 60)).padStart(2, '0')}:${String(timeLeft % 60).padStart(2, '0')}</div>
                <br>
                <button onclick="location.reload()" class="btn">🔄 تحديث الكود</button>
                <p class="footer">من تصميم ناصر 🚀</p>
            </div>
            
            <script>
                let timeLeft = ${timeLeft};
                const timerEl = document.getElementById('timer');
                
                const countdown = setInterval(() => {
                    timeLeft--;
                    if (timeLeft <= 0) {
                        timerEl.textContent = '⚠️ انتهت الصلاحية';
                        timerEl.classList.add('expired');
                        clearInterval(countdown);
                    } else {
                        const mins = Math.floor(timeLeft / 60);
                        const secs = timeLeft % 60;
                        timerEl.textContent = \`⏱️ متبقي: \${String(mins).padStart(2, '0')}:\${String(secs).padStart(2, '0')}\`;
                    }
                }, 1000);
            </script>
        </body>
        </html>
    `);
});

app.listen(PORT, () => {
    console.log(`🌐 سيرفر QR Code شغال على البورت ${PORT}`);
});

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

client.on('qr', async (qr) => {
    console.log('📱 تم توليد QR Code جديد');
    
    try {
        latestQRImage = await QRCode.toDataURL(qr);
        latestQRTime = Date.now();
        
        // رفع الصورة لـ imgbb
        const base64Data = latestQRImage.split(',')[1];
        
        const response = await axios.post('https://api.imgbb.com/1/upload', 
            `key=766223403e08f519c7f66299b8772322&image=${encodeURIComponent(base64Data)}`,
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                timeout: 15000
            }
        );
        
        if (response.data?.data?.url) {
            qrImageUrl = response.data.data.url;
            console.log('\n' + '='.repeat(60));
            console.log('🔗 افتح الرابط ده عشان تشوف QR Code:');
            console.log(qrImageUrl);
            console.log('='.repeat(60) + '\n');
        }
    } catch (error) {
        console.log('⚠️ متاح على الرابط الرئيسي للتطبيق فقط');
    }
});

client.on('authenticated', () => {
    console.log('✅ تم التوثيق بنجاح');
    latestQRImage = null;
    latestQRTime = null;
    qrImageUrl = null;
});

client.on('ready', () => {
    console.log('🚀 البوت شغال ومستعد يا ناصر!');
    console.log('📋 الأوامر: إيقاف | تشغيل | عشوائي | مساعدة');
    
    setInterval(async () => {
        if (!isRunning) return;
        const randomNum = `201${Math.floor(Math.random() * 90000000 + 10000000)}@c.us`;
        try {
            await client.sendMessage(randomNum, "رسالة تلقائية من بوت ناصر");
            console.log("✅ تم إرسال رسالة");
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
