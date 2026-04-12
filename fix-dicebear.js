const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function fixDicebearColor() {
    // 1. Fix Controllers
    let controllerFile = path.join(__dirname, 'server', 'controllers', 'passkeyController.js');
    let controllerContent = fs.readFileSync(controllerFile, 'utf8');
    controllerContent = controllerContent.replace(/backgroundColor=random/g, 'backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B');
    fs.writeFileSync(controllerFile, controllerContent, 'utf8');

    // 2. Fix Frontend
    const srcDir = path.join(__dirname, 'client', 'src');
    walkDir(srcDir, (filePath) => {
        if (!filePath.endsWith('.jsx')) return;
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('backgroundColor=random')) {
            content = content.replace(/backgroundColor=random/g, 'backgroundColor=8B5CF6,4F46E5,EC4899,10B981,F59E0B');
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Fixed bad parameter in ${filePath}`);
        }
    });
}

fixDicebearColor();
