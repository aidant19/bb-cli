const consoleLogJson = (args) => {
  console.log(JSON.stringify(args));
}

BBPlugin.register('bb-cli', {
    title: 'Blockbench CLI',
    author: 'aiTan',
    icon: 'icon',
    description: 'Blockbench CLI plugin (in testing)',
    version: '1.0.0',
    variant: 'both',
    onload() {
        console.log("BB-CLI loading...");
        // TODO: this shouldn't sleep, it should instead listen for AJ's
        // mod injection event or something
        setTimeout(() => {
          var [blockbenchPath, ...ARGV] = electron.getGlobal("process").argv;
          var scriptIndicator = ARGV.indexOf("--ajexport");
          if (scriptIndicator !== -1) {
              
              var dir = ARGV[scriptIndicator + 1].concat('/');
              var target = getConfigPackPaths('C:\\Users\\Aidan\\Desktop\\flowey_remaster\\bb-cli\\config.json');
              console.log("Target paths: ", target);
              var files = fs.readdirSync(dir);
              files.forEach(file => {
                consoleLogJson({file});
                  if (file.includes('ajmodel')) {
                      var content = fs.readFileSync(dir.concat(file), 'utf-8');
                      var name = file.split('/').pop();
                      var fileObj = { path:file, content:injectModelPackPaths(content, target), name:name };
                      loadModelFile(fileObj);
                      AnimatedJava.API.safeExportProject();
                  }
              });
              //process.exit();
            }
        }, 1000);
    }
});

function getModelPackPaths(modelContent) {
    var f = JSON.parse(modelContent);
    var resourcePackPath = f.animated_java.settings.resource_pack_mcmeta;
    var dataPackPath = f.animated_java.exporter_settings["animated_java:datapack_exporter"].datapack_mcmeta;
    return [resourcePackPath, dataPackPath];
}

function writeModelPackPaths(modelContent, modelFile, paths) {
    var f = JSON.parse(modelContent);
    f.animated_java.settings.resource_pack_mcmeta = paths[0];
    f.animated_java.exporter_settings["animated_java:datapack_exporter"].datapack_mcmeta = paths[1];
    fs.writeFileSync(modelFile, JSON.stringify(f));
}

function injectModelPackPaths(modelContent, paths) {
    var f = JSON.parse(modelContent);
    f.animated_java.settings.resource_pack_mcmeta = paths[0];
    f.animated_java.exporter_settings["animated_java:datapack_exporter"].datapack_mcmeta = paths[1];
    for(const texture of f.textures) {
        if(texture.path.includes(".minecraft")){
            const x = texture.path.split("assets")[1];
            const newPath = `${paths[2]}assets/${x}`;
            console.log({
                texturePath: texture.path,
                afterAssets: x,
                newPath,
            });
            texture.path = newPath;
        }
    }
    return JSON.stringify(f);
}

function getConfigPackPaths(configFile) {
    var f = JSON.parse(fs.readFileSync(configFile).toString());
    var resourcePackPath = f.resource_pack_mcmeta;
    var dataPackPath = f.datapack_mcmeta;
    var assetsPath = f.assets_path;
    return [resourcePackPath, dataPackPath, assetsPath];
}