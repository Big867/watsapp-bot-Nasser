const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const axios = require('axios');

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
let currentQR = null;

client.on('qr', async (qr) => {
    currentQR = qr;
    qrcodeTerminal.generate(qr, { small: true });
    console.log('📱 امسح الكود يا ناصر:');
    
    try {
        // تحويل QR Code لصورة Base64
        const qrImage = await QRCode.toDataURL(qr);
        
        // إنشاء صفحة HTML كاملة
        const htmlPage = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>WhatsApp QR Code</title>
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
            padding: 40px 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 450px;
            width: 100%;
            animation: fadeIn 0.5s ease;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.9); }
            to { opacity: 1; transform: scale(1); }
        }
        .icon { font-size: 50px; margin-bottom: 15px; }
        h1 { color: #075e54; font-size: 24px; margin-bottom: 10px; }
        p { color: #667781; margin-bottom: 25px; font-size: 15px; }
        .qr-box {
            background: white;
            padding: 20px;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.1);
            display: inline-block;
            margin: 20px 0;
        }
        .qr-box img { width: 250px; height: 250px; }
        .steps {
            text-align: right;
            background: #f0f2f5;
            padding: 20px;
            border-radius: 15px;
            margin: 20px 0;
        }
        .steps h3 { color: #075e54; margin-bottom: 15px; }
        .steps ol { padding-right: 20px; }
        .steps li { margin-bottom: 10px; color: #3b4a54; line-height: 1.6; }
        .timer {
            background: #dc3545;
            color: white;
            padding: 10px 20px;
            border-radius: 25px;
            display: inline-block;
            font-weight: bold;
            font-size: 18px;
            margin: 15px 0;
        }
        .btn {
            display: inline-block;
            background: #25D366;
            color: white;
            padding: 12px 30px;
            border-radius: 25px;
            text-decoration: none;
            font-size: 16px;
            font-weight: bold;
            margin-top: 15px;
            transition: 0.3s;
        }
        .btn:hover { background: #128c7e; transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">💚</div>
        <h1>بوت واتساب ناصر</h1>
        <p>امسح الكود عشان تفعل البوت</p>
        
        <div class="qr-box">
            <img src="${qrImage}" alt="QR Code">
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
        
        <div class="timer">⏱️ الكود صالح لمدة 45 ثانية</div>
        <br>
        <a href="javascript:location.reload()" class="btn">🔄 تحديث الكود</a>
        <p style="margin-top:15px; font-size:12px; color:#999;">© 2024 بوت ناصر</p>
    </div>
    
    <script>
        let timeLeft = 45;
        const timerEl = document.querySelector('.timer');
        setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
                timerEl.textContent = '⚠️ انتهت الصلاحية - حدث الصفحة';
                timerEl.style.background = '#6c757d';
                clearInterval(arguments.callee);
            } else {
                timerEl.textContent = \`⏱️ الكود صالح لمدة \${timeLeft} ثانية\`;
            }
        }, 1000);
    </script>
</body>
</html>`;

        // رفع الصفحة HTML مباشرة
        const htmlBase64 = Buffer.from(htmlPage).toString('base64');
        const response = await axios.post('https://api.imgbb.com/1/upload', 
            `image=${encodeURIComponent(htmlBase64)}&key=766223403e08f519c7f66299b8772322&name=qrcode.html`,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout: 15000
            }
        );
        
        if (response.data?.data?.url) {
            console.log('\n' + '='.repeat(50));
            console.log('🔗 يا ناصر افتح الرابط ده بسرعة:');
            console.log(response.data.data.url);
            console.log('='.repeat(50) + '\n');
        }
    } catch (error) {
        console.log('⚠️ فشل الرفع، جاري المحاولة كصورة عادية...');
        
        // خطة بديلة: رفع صورة QR Code فقط
        try {
            const qrBuffer = await QRCode.toBuffer(qr);
            const base64Image = qrBuffer.toString('base64');
            const fallbackResponse = await axios.post('https://api.imgbb.com/1/upload',
                `image=${encodeURIComponent(base64Image)}&key=766223403e08f519c7f66299b8772322`,
                {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    timeout: 10000
                }
            );
            
            if (fallbackResponse.data?.data?.url) {
                console.log('\n' + '='.repeat(50));
                console.log('🔗 رابط الصورة (بديل):');
                console.log(fallbackResponse.data.data.url);
                console.log('='.repeat(50) + '\n');
            }
        } catch (backupError) {
            console.log('❌ فشل الطريقتين. امسح الكود من التيرمنال لو سمحت.');
            console.log('📱 الكود موجود فوق في الكونسول 👆');
        }
    }
});

client.on('authenticated', () => {
    console.log('✅ تم التوثيق بنجاح');
    currentQR = null;
});

client.on('ready', () => {
    console.log('🚀 مبروك يا ناصر.. البوت شغال ومستعد للأوامر!');
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
    console.log('🔄 جاري إعادة التشغيل بعد 5 ثوان...');
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
        await msg.reply('📋 الأوامر:\nإيقاف - تشغيل - عشوائي - مساعدة');
    }
});

client.initialize().catch(err => {
    console.error('فشل بدء البوت:', err);
    process.exit(1);
});
