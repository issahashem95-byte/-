// بيانات تسجيل الدخول - حساب واحد فقط لك أنت
const USERNAME = "admin";
const PASSWORD = "admin123";

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

// إنشاء مفاتيح جديدة
function generateKeys() {
    const count = parseInt(document.getElementById('keyCount').value);
    const status = document.getElementById('keyStatus').value;
    const expiryDate = document.getElementById('expiryDate').value;
    
    for (let i = 0; i < count; i++) {
        const newKey = {
            id: Date.now() + i,
            key: generateKey(),
            status: status,
            created_at: new Date().toLocaleString('ar-SA'),
            expires_at: expiryDate ? new Date(expiryDate).toLocaleString('ar-SA') : 'غير محدد'
        };
        keys.unshift(newKey);
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
        keys[keyIndex].status = newStatus;
        saveKeys();
        showToast('✅ تم تغيير حالة المفتاح');
    }
}

// حذف مفتاح
function deleteKey(id) {
    if (confirm('⚠️ هل أنت متأكد من حذف هذا المفتاح؟')) {
        keys = keys.filter(k => k.id !== id);
        saveKeys();
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
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">لا توجد مفاتيح. قم بإضافة مفاتيح جديدة</td></tr>';
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
    
    for (const key of keys) {
        if (key.expires_at !== 'غير محدد' && key.status === 'active') {
            const expiryDate = new Date(key.expires_at);
            if (expiryDate < now) {
                key.status = 'expired';
                updated = true;
            }
        }
    }
    
    if (updated) {
        saveKeys();
        showToast('⚠️ تم تحديث المفاتيح المنتهية');
    }
}

// تهيئة الصفحة
function init() {
    updateStats();
    renderKeysTable();
    checkExpiredKeys();
    setInterval(checkExpiredKeys, 60000);
}

// بدء التطبيق - التحقق من حالة تسجيل الدخول أولاً
checkLoginStatus();