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
  try{await IntentLauncher.startActivityAsync('android.settings.MANAGE_APP_ALL_FILES_ACCESS_PERMISSION',{data:'package:br.com.mythos.rp'})}
  catch{try{await IntentLauncher.startActivityAsync('android.settings.MANAGE_ALL_FILES_ACCESS_PERMISSION')}catch{}}
}
async function cacheAlreadyInstalled(){try{const info=await LegacyFileSystem.getInfoAsync(CACHE_MARKER);return !!info.exists}catch{return false}}
function absoluteUrl(base,value){try{return new URL(value,base).toString()}catch{return null}}
async function resolveCacheDownloadUrl(){
  const response=await fetch(CACHE_URL,{method:'GET',redirect:'follow',cache:'no-store',headers:{Accept:'*/*'}});
  if(!response.ok) throw new Error(`CACHE_RESOLVE_HTTP_${response.status}`);
  const finalUrl=response.url||CACHE_URL;
  const contentType=(response.headers.get('content-type')||'').toLowerCase();
  if(contentType.includes('application/zip')||contentType.includes('application/octet-stream')||/\.zip(?:\?|$)/i.test(finalUrl)) return finalUrl;
  const html=await response.text(); const candidates=[]; const hrefPattern=/href\s*=\s*["']([^"']+)["']/gi; let match;
  while((match=hrefPattern.exec(html))!==null){const candidate=absoluteUrl(finalUrl,match[1]);if(candidate)candidates.push(candidate)}
  const meta=html.match(/url\s*=\s*["']?([^"'\s>]+)/i); if(meta?.[1]){const candidate=absoluteUrl(finalUrl,meta[1]);if(candidate)candidates.push(candidate)}
  const direct=candidates.find(candidate=>/\.zip(?:\?|$)/i.test(candidate)||/download|attachment|file/i.test(candidate));
  if(!direct) throw new Error('CACHE_DOWNLOAD_LINK_NOT_DIRECT');
  return direct;
}
export async function installBundledOrRemoteCache(){
  if(Platform.OS!=='android') throw new Error('CACHE_ANDROID_ONLY');
  if(await cacheAlreadyInstalled()) return {installed:false,alreadyReady:true,path:GTA_DIR};
  await requestGtaStorageAccess();
  await LegacyFileSystem.makeDirectoryAsync(GTA_DIR,{intermediates:true}).catch(()=>{});
  const resolvedUrl=await resolveCacheDownloadUrl();
  const download=await LegacyFileSystem.downloadAsync(resolvedUrl,CACHE_FILE);
  if(download.status<200||download.status>=300) throw new Error(`CACHE_DOWNLOAD_HTTP_${download.status}`);
  try{await unzip(download.uri,GTA_DIR);await LegacyFileSystem.writeAsStringAsync(CACHE_MARKER,new Date().toISOString())}
  catch{throw new Error('CACHE_INVALID_OR_DOWNLOAD_LINK_NOT_DIRECT')}
  finally{await LegacyFileSystem.deleteAsync(CACHE_FILE,{idempotent:true}).catch(()=>{})}
  return {installed:true,alreadyReady:false,path:GTA_DIR};
}
export async function pickAndInstallGtaCache(){return installBundledOrRemoteCache()}
