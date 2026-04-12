const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function fixEmptySrcErrors() {
    const srcDir = path.join(__dirname, 'client', 'src');
    
    walkDir(srcDir, (filePath) => {
        if (!filePath.endsWith('.jsx')) return;
        
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Regex to find src={variable.profilePic} or src={msg.image} without || and ensure it has fallback
        // It looks for src={SOME_VAR} where SOME_VAR does not contain ||
        // We'll specifically target .profilePic and .image
        let modified = false;
        
        const replacePattern = /src=\{([^|}]*(?:profilePic|image))}/g;
        
        if (replacePattern.test(content)) {
            content = content.replace(replacePattern, 'src={$1 || "/avatar.png"}');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated images in ${filePath}`);
        }
    });
}

fixEmptySrcErrors();
