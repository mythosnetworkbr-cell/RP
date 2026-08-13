import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import {unzip} from 'react-native-zip-archive';
import {Platform} from 'react-native';

export const GTA_DIR='/storage/emulated/0/GTA';
export const CACHE_URL='https://easysend.co/6qfH7';
const CACHE_FILE=`${LegacyFileSystem.cacheDirectory}mythos-gta-cache.zip`;
const CACHE_MARKER=`${GTA_DIR}/.mythos-cache-ready`;

async function requestGtaStorageAccess(){
  if(Platform.OS!=='android') throw new Error('CACHE_ANDROID_ONLY');
  try{
    await IntentLauncher.startActivityAsync('android.settings.MANAGE_APP_ALL_FILES_ACCESS_PERMISSION',{data:'package:br.com.mythos.rp'});
  }catch{
    try{await IntentLauncher.startActivityAsync('android.settings.MANAGE_ALL_FILES_ACCESS_PERMISSION')}catch{}
  }
}

async function cacheAlreadyInstalled(){
  try{
    const info=await LegacyFileSystem.getInfoAsync(CACHE_MARKER);
    return !!info.exists;
  }catch{return false;}
}

export async function installBundledOrRemoteCache(){
  if(Platform.OS!=='android') throw new Error('CACHE_ANDROID_ONLY');
  if(await cacheAlreadyInstalled()) return {installed:false,alreadyReady:true,path:GTA_DIR};

  await requestGtaStorageAccess();
  await LegacyFileSystem.makeDirectoryAsync(GTA_DIR,{intermediates:true}).catch(()=>{});

  const download=await LegacyFileSystem.downloadAsync(CACHE_URL,CACHE_FILE);
  if(download.status<200||download.status>=300) throw new Error(`CACHE_DOWNLOAD_HTTP_${download.status}`);

  try{
    await unzip(download.uri,GTA_DIR);
    await LegacyFileSystem.writeAsStringAsync(CACHE_MARKER,new Date().toISOString());
  }catch(e){
    throw new Error('CACHE_INVALID_OR_DOWNLOAD_LINK_NOT_DIRECT');
  }finally{
    await LegacyFileSystem.deleteAsync(CACHE_FILE,{idempotent:true}).catch(()=>{});
  }
  return {installed:true,alreadyReady:false,path:GTA_DIR};
}

// Mantido para compatibilidade com versões antigas do launcher.
export async function pickAndInstallGtaCache(){
  return installBundledOrRemoteCache();
}
