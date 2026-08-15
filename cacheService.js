import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import {unzip} from 'react-native-zip-archive';
import {Platform} from 'react-native';

export const GTA_DIR='/storage/emulated/0/GTA';
// Primary cache endpoint. The share-page URL is never downloaded as if it were a ZIP.
export const CACHE_URL='https://easysend.co/zip/6qfH7';
export const CACHE_API_URL='https://easysend.co/api/v1/bundle/6qfH7';
export const CACHE_FALLBACK_URL='https://drive.usercontent.google.com/download?id=1KmC1dNHkwTZ_mWT9PC8JuGSi1IXb2CZa&export=download&confirm=t';
const CACHE_FILE=`${LegacyFileSystem.cacheDirectory}mythos-gta-cache.zip`;
const CACHE_MARKER=`${GTA_DIR}/.mythos-cache-ready`;

export async function requestGtaStorageAccess(){
  if(Platform.OS!=='android') throw new Error('CACHE_ANDROID_ONLY');
  try{await IntentLauncher.startActivityAsync('android.settings.MANAGE_APP_ALL_FILES_ACCESS_PERMISSION',{data:'package:br.com.mythos.rp'});}catch{try{await IntentLauncher.startActivityAsync('android.settings.MANAGE_ALL_FILES_ACCESS_PERMISSION')}catch{}}
}
async function cacheAlreadyInstalled(){try{return !!(await LegacyFileSystem.getInfoAsync(CACHE_MARKER)).exists}catch{return false}}
async function resolveCacheDownloadUrls(){
  const urls=[];
  try{
    const response=await fetch(CACHE_API_URL,{method:'GET',headers:{Accept:'application/json'},cache:'no-store'});
    if(response.ok){
      const data=await response.json();
      const file=data?.files?.find(item=>/\.zip$/i.test(item?.name||''))||data?.files?.[0];
      if(file?.download_url) urls.push(new URL(file.download_url,'https://easysend.co').toString());
    }
  }catch{}
  urls.push(CACHE_URL,CACHE_FALLBACK_URL);
  return [...new Set(urls)];
}
async function downloadCache(url,onProgress){
  await LegacyFileSystem.deleteAsync(CACHE_FILE,{idempotent:true}).catch(()=>{});
  const resumable=LegacyFileSystem.createDownloadResumable(url,CACHE_FILE,{},p=>{
    const total=Number(p.totalBytesExpectedToWrite)||0;
    const written=Number(p.totalBytesWritten)||0;
    onProgress?.(total>0?Math.min(90,Math.round((written/total)*90)):3,{written,total,backgroundSafe:true});
  });
  const result=await resumable.downloadAsync();
  if(!result||result.status<200||result.status>=300) throw new Error(`CACHE_DOWNLOAD_HTTP_${result?.status||0}`);
  const info=await LegacyFileSystem.getInfoAsync(result.uri,{size:true}).catch(()=>null);
  if(!info?.exists||Number(info.size||0)<1024*1024) throw new Error('CACHE_DOWNLOAD_NOT_A_VALID_FILE');
  return result.uri;
}
export async function installBundledOrRemoteCache(onProgress){
  if(Platform.OS!=='android') throw new Error('CACHE_ANDROID_ONLY');
  if(await cacheAlreadyInstalled()) return {installed:false,alreadyReady:true,path:GTA_DIR};
  await requestGtaStorageAccess();
  await LegacyFileSystem.makeDirectoryAsync(GTA_DIR,{intermediates:true}).catch(()=>{});
  const urls=await resolveCacheDownloadUrls();
  let lastError=null,uri=null;
  for(const url of urls){try{uri=await downloadCache(url,onProgress);break}catch(e){lastError=e}}
  if(!uri) throw new Error(`CACHE_DOWNLOAD_FAILED_${String(lastError?.message||lastError||'UNKNOWN')}`);
  onProgress?.(92,{backgroundSafe:true});
  try{
    await unzip(uri,GTA_DIR);
    await LegacyFileSystem.writeAsStringAsync(CACHE_MARKER,new Date().toISOString());
    onProgress?.(100,{installed:true});
  }catch(e){throw new Error(`CACHE_UNZIP_FAILED_${String(e?.message||e)}`)}finally{await LegacyFileSystem.deleteAsync(CACHE_FILE,{idempotent:true}).catch(()=>{})}
  return {installed:true,alreadyReady:false,path:GTA_DIR};
}
export async function pickAndInstallGtaCache(onProgress){return installBundledOrRemoteCache(onProgress)}
