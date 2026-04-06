// بيانات تسجيل الدخول - حساب واحد فقط لك أنت
const USERNAME = "admin";
const PASSWORD = "admin123";

// ⚠️ إعدادات التليجرام - استبدل هذه القيم ببياناتك الحقيقية ⚠️
const TELEGRAM_BOT_TOKEN = "8795027796:AAGfBD6KX2wI3YVNyfj1DVS_MzcLNQZHAu8"; // ضع توكن البوت هنا
const TELEGRAM_CHAT_ID = 8795027796"; // ضع معرف الدردشة هنا

// التحقق من حالة تسجيل الدخول
function checkLoginStatus() {
    const loggedIn = localStorage.getItem('loggedIn');
    if (loggedIn === 'true') {
        showMainContent();
    } else {
        showLoginScreen();
    }
}

// عرض شاشة تسجيل الدخول
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
}

// عرض المحتوى الرئيسي
function showMainContent() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    init();
}

// التحقق من بيانات الدخول
function checkLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('loginError');
    
    if (username === USERNAME && password === PASSWORD) {
        localStorage.setItem('loggedIn', 'true');
        errorDiv.textContent = '';
        showMainContent();
        sendToTelegram('🔐 **تم تسجيل الدخول إلى لوحة التحكم**\n👤 المستخدم: ' + username);
    } else {
        errorDiv.textContent = '❌ اسم المستخدم أو كلمة المرور غير صحيحة';
    }
}

// تسجيل الخروج
function logout() {
    localStorage.removeItem('loggedIn');
    showLoginScreen();
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    sendToTelegram('🚪 **تم تسجيل الخروج من لوحة التحكم**');
}

// إرسال رسالة إلى تليجرام
function sendToTelegram(message) {
    if (TELEGRAM_BOT_TOKEN === "YOUR_BOT_TOKEN_HERE" || TELEGRAM_CHAT_ID === "YOUR_CHAT_ID_HERE") {
        console.log("⚠️ لم يتم إعداد التليجرام بعد. الرجاء إضافة التوكن والمعرف");
        return;
    }
    
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'Markdown'
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            console.log('✅ تم إرسال الإشعار إلى تليجرام');
        } else {
            console.log('❌ فشل الإرسال:', data.description);
        }
    })
    .catch(error => {
        console.log('❌ خطأ في الإرسال:', error);
    });
}

// إرسال رسالة من المستخدم إلى المدير
function sendMessageToAdmin() {
    const userName = document.getElementById('userName').value;
    const userMessage = document.getElementById('userMessage').value;
    const resultDiv = document.getElementById('messageResult');
    
    if (!userName || !userMessage) {
        resultDiv.innerHTML = '<span style="color: red;">❌ الرجاء ملء جميع الحقول</span>';
        setTimeout(() => { resultDiv.innerHTML = ''; }, 3000);
        return;
    }
    
    const message = `📧 **رسالة جديدة من المستخدم**\n━━━━━━━━━━━━━━━━━\n👤 **الاسم:** ${userName}\n💬 **الرسالة:** ${userMessage}\n━━━━━━━━━━━━━━━━━\n⏰ ${new Date().toLocaleString('ar-SA')}`;
    
    sendToTelegram(message);
    
    resultDiv.innerHTML = '<span style="color: green;">✅ تم إرسال رسالتك بنجاح، سيتم الرد عليك قريباً</span>';
    document.getElementById('userName').value = '';
    document.getElementById('userMessage').value = '';
    
    setTimeout(() => { resultDiv.innerHTML = ''; }, 5000);
}

// تحميل البيانات من localStorage
let keys = JSON.parse(localStorage.getItem('loader_keys')) || [];

// حفظ البيانات إلى localStorage
function saveKeys() {
    localStorage.setItem('loader_keys', JSON.stringify(keys));
    updateStats();
    renderKeysTable();
}

// تحديث الإحصائيات
function updateStats() {
    const total = keys.length;
    const active = keys.filter(k => k.status === 'active').length;
    const blocked = keys.filter(k => k.status === 'blocked').length;
    const expired = keys.filter(k => k.status === 'expired').length;
    
    document.getElementById('totalKeys').innerText = total;
    document.getElementById('activeKeys').innerText = active;
    document.getElementById('blockedKeys').innerText = blocked;
    document.getElementById('expiredKeys').innerText = expired;
}

// إنشاء مفتاح عشوائي
function generateKey() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let key = '';
    for (let i = 0; i < 16; i++) {
        key += chars[Math.floor(Math.random() * chars.length)];
        if ((i + 1) % 4 === 0 && i !== 15) key += '-';
    }
    return key;
}

// إرسال إشعار إنشاء مفتاح إلى تليجرام
function notifyKeyCreated(keyData) {
    const statusEmoji = keyData.status === 'active' ? '✅' : '⛔';
    const statusText = keyData.status === 'active' ? 'نشط' : 'موقوف';
    const expiryText = keyData.expires_at !== 'غير محدد' ? `⏰ ينتهي في: ${keyData.expires_at}` : '♾️ لا ينتهي';
    
    const message = `🔑 **مفتاح جديد تم إنشاؤه** 🔑\n━━━━━━━━━━━━━━━━━\n📋 **المفتاح:** \`${keyData.key}\`\n📊 **الحالة:** ${statusEmoji} ${statusText}\n📅 **تاريخ الإنشاء:** ${keyData.created_at}\n${expiryText}\n━━━━━━━━━━━━━━━━━\n👤 تم الإنشاء بواسطة: المدير`;
    
    sendToTelegram(message);
}

// إنشاء مفاتيح جديدة
function generateKeys() {
    const count = parseInt(document.getElementById('keyCount').value);
    const status = document.getElementById('keyStatus').value;
    const expiryDate = document.getElementById('expiryDate').value;
    const createdKeys = [];
    
    for (let i = 0; i < count; i++) {
        const newKey = {
            id: Date.now() + i,
            key: generateKey(),
            status: status,
            created_at: new Date().toLocaleString('ar-SA'),
            expires_at: expiryDate ? new Date(expiryDate).toLocaleString('ar-SA') : 'غير محدد'
        };
        keys.unshift(newKey);
        createdKeys.push(newKey);
        
        // إرسال إشعار لكل مفتاح يتم إنشاؤه
        notifyKeyCreated(newKey);
    }
    
    saveKeys();
    document.getElementById('keyCount').value = '1';
    document.getElementById('expiryDate').value = '';
    showToast('✅ تم إنشاء ' + count + ' مفاتيح جديدة');
}

// نسخ المفتاح إلى الحافظة
function copyKey(keyText) {
    const textarea = document.createElement('textarea');
    textarea.value = keyText;
    document.body.appendChild(textarea);
    textarea.select();
    textarea.setSelectionRange(0, 99999);
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('✅ تم نسخ المفتاح: ' + keyText);
}

// عرض رسالة منبثقة
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        font-size: 14px;
        font-weight: bold;
        z-index: 9999;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        animation: fadeInOut 2s ease-in-out;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.remove();
    }, 2000);
}

// تغيير حالة المفتاح
function toggleStatus(id, newStatus) {
    const keyIndex = keys.findIndex(k => k.id === id);
    if (keyIndex !== -1) {
        const oldStatus = keys[keyIndex].status;
        const oldStatusText = oldStatus === 'active' ? 'نشط' : (oldStatus === 'blocked' ? 'موقوف' : 'منتهي');
        const newStatusText = newStatus === 'active' ? 'نشط' : 'موقوف';
        const keyValue = keys[keyIndex].key;
        
        keys[keyIndex].status = newStatus;
        saveKeys();
        
        const message = `🔄 **تغيير حالة مفتاح** 🔄\n━━━━━━━━━━━━━━━━━\n📋 **المفتاح:** \`${keyValue}\`\n📊 **الحالة السابقة:** ${oldStatusText}\n📊 **الحالة الجديدة:** ${newStatusText}\n━━━━━━━━━━━━━━━━━\n⏰ ${new Date().toLocaleString('ar-SA')}`;
        sendToTelegram(message);
        
        showToast('✅ تم تغيير حالة المفتاح');
    }
}

// حذف مفتاح
function deleteKey(id) {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا المفتاح؟')) {
        const deletedKey = keys.find(k => k.id === id);
        const keyValue = deletedKey ? deletedKey.key : '';
        
        keys = keys.filter(k => k.id !== id);
        saveKeys();
        
        const message = `🗑️ **تم حذف مفتاح** 🗑️\n━━━━━━━━━━━━━━━━━\n📋 **المفتاح المحذوف:** \`${keyValue}\`\n⏰ **وقت الحذف:** ${new Date().toLocaleString('ar-SA')}\n━━━━━━━━━━━━━━━━━`;
        sendToTelegram(message);
        
        showToast('🗑️ تم حذف المفتاح');
    }
}

// تعديل المفتاح
function editKey(id, oldKey) {
    const newKey = prompt('تعديل المفتاح', oldKey);
    if (newKey && newKey !== oldKey) {
        const keyIndex = keys.findIndex(k => k.id === id);
        if (keyIndex !== -1) {
            keys[keyIndex].key = newKey;
            saveKeys();
            
            const message = `✏️ **تم تعديل مفتاح** ✏️\n━━━━━━━━━━━━━━━━━\n📋 **المفتاح القديم:** \`${oldKey}\`\n📋 **المفتاح الجديد:** \`${newKey}\`\n━━━━━━━━━━━━━━━━━\n⏰ ${new Date().toLocaleString('ar-SA')}`;
            sendToTelegram(message);
            
            showToast('✏️ تم تعديل المفتاح');
        }
    }
}

// البحث في المفاتيح
function searchKeys() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filteredKeys = keys.filter(k => k.key.toLowerCase().includes(searchTerm));
    renderKeysTable(filteredKeys);
}

// عرض جدول المفاتيح
function renderKeysTable(filteredKeys = null) {
    const tbody = document.getElementById('keysTableBody');
    const dataToRender = filteredKeys !== null ? filteredKeys : keys;
    
    if (dataToRender.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد مفاتيح. قم بإضافة مفاتيح جديدة</td>' + '</tr>';
        return;
    }
    
    let html = '';
    for (const key of dataToRender) {
        let statusClass = '';
        let statusText = '';
        
        switch (key.status) {
            case 'active':
                statusClass = 'status-active';
                statusText = 'نشط';
                break;
            case 'blocked':
                statusClass = 'status-blocked';
                statusText = 'موقوف';
                break;
            case 'expired':
                statusClass = 'status-expired';
                statusText = 'منتهي';
                break;
        }
        
        html += `
            <tr>
                <td>
                    <div class="key-container">
                        <code style="direction: ltr;">${key.key}</code>
                        <button class="copy-btn" onclick="copyKey('${key.key}')" title="نسخ المفتاح">📋</button>
                    </div>
                </td>
                <td><span class="${statusClass}">${statusText}</span></td>
                <td>${key.created_at}</td>
                <td>${key.expires_at}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editKey(${key.id}, '${key.key}')" title="تعديل">✏️</button>
                    ${key.status === 'active' ? 
                        `<button class="action-btn block-btn" onclick="toggleStatus(${key.id}, 'blocked')" title="إيقاف">⛔</button>` :
                        `<button class="action-btn edit-btn" onclick="toggleStatus(${key.id}, 'active')" title="تفعيل">✅</button>`
                    }
                    <button class="action-btn delete-btn" onclick="deleteKey(${key.id})" title="حذف">🗑️</button>
                </td>
            </tr>
        `;
    }
    
    tbody.innerHTML = html;
}

// تحديث المفاتيح المنتهية تلقائياً
function checkExpiredKeys() {
    const now = new Date();
    let updated = false;
    let expiredKeysList = [];
    
    for (const key of keys) {
        if (key.expires_at !== 'غير محدد' && key.status === 'active') {
            const expiryDate = new Date(key.expires_at);
            if (expiryDate < now) {
                key.status = 'expired';
                updated = true;
                expiredKeysList.push(key.key);
            }
        }
    }
    
    if (updated) {
        saveKeys();
        if (expiredKeysList.length > 0) {
            const message = `⚠️ **مفاتيح انتهت صلاحيتها تلقائياً** ⚠️\n━━━━━━━━━━━━━━━━━\n📋 **المفاتيح المنتهية:**\n${expiredKeysList.map(k => `\`${k}\``).join('\n')}\n━━━━━━━━━━━━━━━━━\n⏰ ${new Date().toLocaleString('ar-SA')}`;
            sendToTelegram(message);
        }
        showToast('⚠️ تم تحديث المفاتيح المنتهية');
    }
}

// إرسال تقرير يومي
function sendDailyReport() {
    const total = keys.length;
    const active = keys.filter(k => k.status === 'active').length;
    const blocked = keys.filter(k => k.status === 'blocked').length;
    const expired = keys.filter(k => k.status === 'expired').length;
    
    const message = `📊 **تقرير يومي - نظام إدارة المفاتيح** 📊\n━━━━━━━━━━━━━━━━━\n📝 إجمالي المفاتيح: ${total}\n🟢 المفاتيح النشطة: ${active}\n🔴 المفاتيح المتوقفة: ${blocked}\n🟠 المفاتيح المنتهية: ${expired}\n━━━━━━━━━━━━━━━━━\n⏰ ${new Date().toLocaleString('ar-SA')}`;
    
    sendToTelegram(message);
}

// تهيئة الصفحة
function init() {
    updateStats();
    renderKeysTable();
    checkExpiredKeys();
    setInterval(checkExpiredKeys, 60000);
    
    // إرسال تقرير يومي كل 24 ساعة
    setInterval(sendDailyReport, 86400000);
}

// بدء التطبيق - التحقق من حالة تسجيل الدخول أولاً
checkLoginStatus();