const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const core = require('C:/Users/leoba/AppData/Roaming/npm/node_modules/@bubblewrap/cli/node_modules/@bubblewrap/core');
const configLib = require('C:/Users/leoba/AppData/Roaming/npm/node_modules/@bubblewrap/cli/dist/lib/config');
const shared = require('C:/Users/leoba/AppData/Roaming/npm/node_modules/@bubblewrap/cli/dist/lib/cmds/shared');
const { build } = require('C:/Users/leoba/AppData/Roaming/npm/node_modules/@bubblewrap/cli/dist/lib/cmds/build');

// Mock fetchUtils to provide local icons when requested
const originalFetch = core.fetchUtils.fetch.bind(core.fetchUtils);
core.fetchUtils.fetch = async (url, options) => {
  const urlStr = String(url);
  if (urlStr.includes('manifest.json')) {
    const manifestPath = path.resolve('public/manifest.json');
    const buffer = fs.readFileSync(manifestPath);
    return {
      status: 200,
      ok: true,
      headers: {
        get: (name) => name.toLowerCase() === 'content-type' ? 'application/json' : null
      },
      arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
      text: async () => buffer.toString('utf8')
    };
  }
  if (urlStr.includes('icon-512.png') || urlStr.includes('icon-192.png') || urlStr.endsWith('.png')) {
    const fileName = urlStr.includes('192') ? 'icon-192.png' : 'icon-512.png';
    const iconPath = path.resolve('public', fileName);
    if (fs.existsSync(iconPath)) {
      const buffer = fs.readFileSync(iconPath);
      return {
        status: 200,
        ok: true,
        headers: {
          get: (name) => name.toLowerCase() === 'content-type' ? 'image/png' : null
        },
        arrayBuffer: async () => buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength),
        text: async () => buffer.toString('utf8')
      };
    }
  }
  return originalFetch(url, options);
};

// Custom Mock Prompt that answers CLI questions automatically
class AutoPrompt {
  printMessage(msg) {
    console.log('[Bubblewrap]', msg);
  }
  async promptInput(msg, defaultValue) {
    console.log('[Prompt Input]', msg, '->', defaultValue);
    return defaultValue;
  }
  async promptChoice(msg, choices, defaultChoice) {
    console.log('[Prompt Choice]', msg, '->', defaultChoice || choices[0]);
    return defaultChoice !== undefined ? defaultChoice : choices[0];
  }
  async promptConfirm(msg, defaultValue) {
    console.log('[Prompt Confirm]', msg, '-> true');
    return true;
  }
  async promptPassword(msg) {
    console.log('[Prompt Password]', msg, '-> [HIDDEN]');
    return 'zelo123456';
  }
  async downloadFile(url, destination, totalBytes) {
    console.log(`[Downloading] ${url} -> ${destination}`);
    const file = fs.createWriteStream(destination);
    return new Promise((resolve, reject) => {
      const get = (targetUrl) => {
        const client = targetUrl.startsWith('https') ? https : http;
        client.get(targetUrl, (response) => {
          if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
            get(response.headers.location);
            return;
          }
          if (response.statusCode !== 200) {
            reject(new Error(`Failed to download ${url}: status code ${response.statusCode}`));
            return;
          }
          response.pipe(file);
          file.on('finish', () => {
            file.close(resolve);
          });
        }).on('error', (err) => {
          fs.unlink(destination, () => {});
          reject(err);
        });
      };
      get(url);
    });
  }
}

async function run() {
  console.log('=== 1. Loading Bubblewrap configuration ===');
  const prompt = new AutoPrompt();
  const log = new core.ConsoleLog('zelo-build');
  const config = await configLib.loadOrCreateConfig(log, prompt);
  console.log('Loaded Config:', JSON.stringify(config, null, 2));

  const javaBin = path.join(config.jdkPath, 'bin');
  const sdkBin = path.join(config.androidSdkPath, 'tools', 'bin');
  process.env.JAVA_HOME = config.jdkPath;
  process.env.ANDROID_HOME = config.androidSdkPath;
  process.env.ANDROID_SDK_ROOT = config.androidSdkPath;
  process.env.PATH = `${javaBin};${sdkBin};${process.env.PATH || ''}`;
  process.env.Path = `${javaBin};${sdkBin};${process.env.Path || ''}`;

  console.log('=== 2. Setting up TWA Manifest & Project ===');
  const manifestJsonPath = path.resolve('public/manifest.json');
  const webManifest = JSON.parse(fs.readFileSync(manifestJsonPath, 'utf8'));

  const twaManifest = core.TwaManifest.fromWebManifestJson(
    new URL('https://zelo-combustiveis-eight.vercel.app/manifest.json'),
    webManifest
  );

  twaManifest.packageId = 'com.zelo.app';
  twaManifest.name = 'Zelo Combustíveis';
  twaManifest.launcherName = 'Zelo';
  twaManifest.startUrl = '/';
  twaManifest.host = 'zelo-combustiveis-eight.vercel.app';
  twaManifest.signingKey = {
    path: './android.keystore',
    alias: 'zelo-key'
  };

  // Write twa-manifest.json
  const twaManifestFile = path.resolve('twa-manifest.json');
  fs.writeFileSync(twaManifestFile, JSON.stringify(twaManifest.toJson(), null, 2));
  await shared.generateManifestChecksumFile(twaManifestFile, process.cwd());
  console.log('Created twa-manifest.json and checksum');

  // Generate TWA Project files
  const twaGenerator = new core.TwaGenerator();
  await twaGenerator.createTwaProject(process.cwd(), twaManifest, log);
  console.log('TWA Android project files generated!');

  // Generate Keystore if not exists
  const keystorePath = path.resolve('android.keystore');
  const jdkHelper = new core.JdkHelper(process, config);
  const keyTool = new core.KeyTool(jdkHelper, log);

  if (!fs.existsSync(keystorePath)) {
    console.log('Generating android.keystore...');
    await keyTool.createSigningKey({
      path: keystorePath,
      alias: 'zelo-key',
      password: 'zelo123456',
      keypassword: 'zelo123456',
      fullName: 'Zelo Developer',
      organization: 'Zelo',
      organizationalUnit: 'Development',
      country: 'BR'
    });
    console.log('Generated keystore at:', keystorePath);
  }

  console.log('=== 3. Building APK ===');
  process.env['BUBBLEWRAP_KEYSTORE_PASSWORD'] = 'zelo123456';
  process.env['BUBBLEWRAP_KEY_PASSWORD'] = 'zelo123456';

  const args = {
    manifest: twaManifestFile,
    skipPwaValidation: true
  };

  const result = await build(config, args, log, prompt);
  console.log('Build completed result:', result);

  const signedApk = path.resolve('app-release-signed.apk');
  const unsignedApk = path.resolve('app/build/outputs/apk/release/app-release-unsigned.apk');
  
  if (fs.existsSync(signedApk)) {
    console.log('SUCCESS: Signed APK created at:', signedApk);
  } else if (fs.existsSync(unsignedApk)) {
    console.log('SUCCESS: APK created at:', unsignedApk);
  } else {
    console.log('Checking all generated APKs...');
    const files = fs.readdirSync(process.cwd()).filter(f => f.endsWith('.apk'));
    console.log('APK files in root:', files);
  }
}

run().catch((err) => {
  console.error('Error during setup & build:', err);
  process.exit(1);
});
