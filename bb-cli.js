BBPlugin.register('bb-cli', {
    title: 'Blockbench CLI',
    author: 'aiTan',
    icon: 'icon',
    description: 'Blockbench CLI plugin (in testing)',
    version: '1.0.0',
    variant: 'both',
    onload() {
        console.log("CLI loaded...")
        var [blockbenchPath, ...ARGV] = electron.getGlobal("process").argv;
        var scriptIndicator = ARGV.indexOf("--ajexport");
        if (scriptIndicator !== -1) {
            var dir = ARGV[scriptIndicator + 1].concat('/')
            var files = fs.readdirSync(dir);
            files.forEach(file => {
                console.log(file)
                if (file.includes('ajmodel')) {
                    var content = fs.readFileSync(dir.concat(file), 'utf-8')
                    var name = file.split('/').pop()
                    var fileObj = { path:file, content:content, name:name }
                    loadModelFile(fileObj)
                    AnimatedJava.API.safeExportProject()
                }
            });
            //process.exit();
        }
    }
});

