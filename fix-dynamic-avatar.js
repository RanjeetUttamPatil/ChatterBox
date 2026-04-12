const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function makeDynamicInitials() {
    const srcDir = path.join(__dirname, 'client', 'src');
    const staticString = '"https://api.dicebear.com/9.x/initials/svg?seed=U&backgroundColor=8B5CF6"';
    
    walkDir(srcDir, (filePath) => {
        if (!filePath.endsWith('.jsx')) return;
        
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Matches: src={someObj?.profilePic || "https...U..."}
        // or src={someObj.profilePic || "https...U..."}
        const regex = /src=\{([a-zA-Z0-9_?.]+?)(?:\.profilePic|\?\.profilePic)\s*\|\|\s*"https:\/\/api\.dicebear\.com\/9\.x\/initials\/svg\?seed=U&backgroundColor=8B5CF6"\}/g;

        if (regex.test(content)) {
            content = content.replace(regex, (match, objName) => {
                // objName could be `authUser`, `user`, `selectedUser`, `caller`, `otherUser`, `sender`
                // we clean it up if it has `?.`
                const cleanObj = objName.replace('?.', '');
                return `src={${objName}?.profilePic || \`https://api.dicebear.com/9.x/initials/svg?seed=\${encodeURIComponent(${cleanObj}?.fullName || ${cleanObj}?.username || "U")}&backgroundColor=random\`}`;
            });
            modified = true;
        }

        // Also check for `src={msg.image || ...}` just in case
        const regexImage = /src=\{([a-zA-Z0-9_?.]+?)\.image\s*\|\|\s*"https:\/\/api\.dicebear\.com\/9\.x\/initials\/svg\?seed=U&backgroundColor=8B5CF6"\}/g;
        if (regexImage.test(content)) {
            content = content.replace(regexImage, (match, objName) => {
                return `src={${objName}.image || \`https://api.dicebear.com/9.x/initials/svg?seed=Image&backgroundColor=random\`}`;
            });
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Updated dynamic initials in ${filePath}`);
        }
    });
}

makeDynamicInitials();
