import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import {unzip} from 'react-native-zip-archive';
import {Platform} from 'react-native';

export const GTA_DIR='/storage/emulated/0/GTA';
export const CACHE_URL='https://easysend.co/6qfH7';
export const CACHE_API_URL='https://easysend.co/api/v1/bundle/6qfH7';
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
  try{const info=await LegacyFileSystem.getInfoAsync(CACHE_MARKER);return !!info.exists}catch{return false}
}

async function resolveCacheDownloadUrl(){
  // EasySend share pages are HTML. Its public API exposes the raw file URL,
  // which avoids trying to download the share page as if it were a ZIP.
  const response=await fetch(CACHE_API_URL,{method:'GET',headers:{Accept:'application/json'},cache:'no-store'});
  if(!response.ok) throw new Error(`CACHE_METADATA_HTTP_${response.status}`);
  const data=await response.json();
  const file=data?.files?.find(item=>/\.zip$/i.test(item?.name||''))||data?.files?.[0];
  const downloadUrl=file?.download_url;
  if(!downloadUrl) throw new Error('CACHE_DOWNLOAD_LINK_NOT_DIRECT');
  return new URL(downloadUrl,'https://easysend.co').toString();
}

export async function installBundledOrRemoteCache(){
  if(Platform.OS!=='android') throw new Error('CACHE_ANDROID_ONLY');
  if(await cacheAlreadyInstalled()) return {installed:false,alreadyReady:true,path:GTA_DIR};

  await requestGtaStorageAccess();
  await LegacyFileSystem.makeDirectoryAsync(GTA_DIR,{intermediates:true}).catch(()=>{});

  const resolvedUrl=await resolveCacheDownloadUrl();
  const download=await LegacyFileSystem.downloadAsync(resolvedUrl,CACHE_FILE);
  if(download.status<200||download.status>=300) throw new Error(`CACHE_DOWNLOAD_HTTP_${download.status}`);

  try{
    await unzip(download.uri,GTA_DIR);
    await LegacyFileSystem.writeAsStringAsync(CACHE_MARKER,new Date().toISOString());
  }catch{
    throw new Error('CACHE_INVALID_OR_DOWNLOAD_LINK_NOT_DIRECT');
  }finally{
    await LegacyFileSystem.deleteAsync(CACHE_FILE,{idempotent:true}).catch(()=>{});
  }
  return {installed:true,alreadyReady:false,path:GTA_DIR};
}

export async function pickAndInstallGtaCache(){return installBundledOrRemoteCache()}
