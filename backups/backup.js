const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// إعدادات المسارات
const DB_FILE = path.join(__ normal, 'prisma', 'app.db'); // عدل المسار حسب موقع قاعدة بياناتك
const BACKUP_DIR = path.join(__dirname, 'backups');

// إنشاء مجلد النسخ الاحتياطية إذا لم يكن موجوداً
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR);
}

// توليد اسم الملف بناءً على التاريخ
const date = new Date();
const timestamp = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}_${date.getHours()}-${date.getMinutes()}`;
const backupFileName = `db_backup_${timestamp}.db`;
const backupFilePath = path.join(BACKUP_DIR, backupFileName);

// نسخ الملف
fs.copyFile(DB_FILE, backupFilePath, (err) => {
    if (err) {
        console.error('❌ حدث خطأ أثناء أخذ النسخة الاحتياطية:', err);
    } else {
        console.log(`✅ تمت عملية النسخ الاحتياطي بنجاح: ${backupFileName}`);
        
        // اختياري: ضغط الملف لتقليل المساحة
        exec(`gzip ${backupFilePath}`, (error, stdout, stderr) => {
            if (error) {
                console.warn('⚠️ تم النسخ ولكن فشل الضغط:', error);
                return;
            }
            console.log(`📦 تم ضغط النسخة الاحتياطية: ${backupFileName}.gz`);
        });
    }
});