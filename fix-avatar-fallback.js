const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function fixAvatarPng() {
    const srcDir = path.join(__dirname, 'client', 'src');
    const fallbackUrl = 'https://api.dicebear.com/9.x/initials/svg?seed=U&backgroundColor=8B5CF6';
    
    walkDir(srcDir, (filePath) => {
        if (!filePath.endsWith('.jsx')) return;
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        if (content.includes('"/avatar.png"')) {
            // replace all instances of "/avatar.png" with the reliable dicebear generic url
            content = content.replace(/"\/avatar\.png"/g, `"${fallbackUrl}"`);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated broken local fallback to Dicebear in ${filePath}`);
        }
    });
}

fixAvatarPng();
