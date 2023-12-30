const consoleLogJson = (args) => {
    console.log(JSON.stringify(args));
}

if (typeof AnimatedJava === 'undefined') {
    throw new Error("Failed to load Animated Java plugin before CLI plugin")
}
var [blockbenchPath, ...ARGV] = electron.getGlobal("process").argv;
var scriptIndicator = ARGV.indexOf("--bb-cli");
var dir = ARGV[scriptIndicator + 2].concat('/');
var target = getConfigPackPaths('C:\\Users\\Aidan\\Desktop\\flowey_remaster\\bb-cli\\config.json');
console.log("Target paths: ", target);
var files = fs.readdirSync(dir).filter((file) => file.includes('ajmodel'));
const exportNextFile = () => {
    if (Project) { Project.close(); }
    const file = files.pop();
    if (typeof file === 'undefined') {
        return;
    }
    consoleLogJson({ file });
    if (file.includes('ajmodel')) {
        var content = fs.readFileSync(dir.concat(file), 'utf-8');
        var name = file.split('/').pop();
        var fileObj = { path: file, content: injectModelPackPaths(content, target), name: name };
        loadModelFile(fileObj);
        AnimatedJava.API.safeExportProject(exportNextFile);
    }
};
exportNextFile();


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
    for (const texture of f.textures) {
        texture.path = texture.path.replaceAll('\\', '/');
        // TODO this should maybe be regex?
        if (texture.path.includes(".minecraft")) {
            const x = texture.path.split("assets")[1];
            const newPath = `${paths[2]}/assets${x}`;
            // consoleLogJson({
            //     texturePath: texture.path,
            //     afterAssets: x,
            //     newPath,
            // });
            texture.path = newPath;
        } else if (texture.path.includes("resourcepack/assets")) {
            const x = texture.path.split("resourcepack/assets")[1];
            const resourcePackBase = paths[0].split("resourcepack")[0];
            const newPath = `${resourcePackBase}resourcepack/assets${x}`;
            // consoleLogJson({
            //     texturePath: texture.path,
            //     resourcePackBase,
            //     afterAssets: x,
            //     newPath,
            // });
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