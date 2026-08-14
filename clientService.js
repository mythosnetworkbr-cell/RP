import {Directory, File, Paths} from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import {Linking} from 'react-native';

export const CLIENT_URL='https://www.mediafire.com/file/bi0t2se2eiigtnj/MythosNetworkSAMP-debug.apk/file';

function absoluteUrl(base,value){
  try{return new URL(value,base).toString()}catch{return null}
}

async function resolveArtifactUrl(url){
  const response=await fetch(url,{method:'GET',redirect:'follow',cache:'no-store',headers:{Accept:'text/html,application/xhtml+xml,*/*'}});
  if(!response.ok)throw new Error(`CLIENT_PAGE_HTTP_${response.status}`);
  const finalUrl=response.url||url;
  const contentType=(response.headers.get('content-type')||'').toLowerCase();
  if(contentType.includes('application/vnd.android.package-archive')||contentType.includes('application/octet-stream')||/\.apk(?:\?|$)/i.test(finalUrl))return finalUrl;
  const html=await response.text();
  const links=[];
  const patterns=[
    /href\s*=\s*["']([^"']+\.apk(?:\?[^"']*)?)["']/gi,
    /href\s*=\s*["']([^"']+)["'][^>]*(?:id|class)\s*=\s*["'][^"']*download[^"']*["']/gi,
    /(?:download|url)\s*[:=]\s*["'](https?:\/\/[^"']+)["']/gi
  ];
  for(const pattern of patterns){let match;while((match=pattern.exec(html))!==null){const candidate=absoluteUrl(finalUrl,match[1]);if(candidate)links.push(candidate)}}
  const direct=links.find(value=>/\.apk(?:\?|$)/i.test(value))||links.find(value=>/download/i.test(value));
  if(!direct)throw new Error('CLIENT_DOWNLOAD_LINK_NOT_DIRECT');
  return direct;
}

async function downloadToLocal(url,manifestVersion,onProgress){
  const directory=new Directory(Paths.document,'mythos-client');
  if(!directory.exists)directory.create({intermediates:true,idempotent:true});
  const destination=new File(directory,`mythos-samp-${manifestVersion}.apk`);
  const direct=await resolveArtifactUrl(url);
  const file=await File.downloadFileAsync(direct,destination,{idempotent:true});
  if(!file.exists||file.size<1024*1024)throw new Error('CLIENT_FILE_INVALID');
  onProgress?.(1);
  return file;
}

export async function prepareClient(onProgress){
  try{
    const file=await downloadToLocal(CLIENT_URL,'2.11',onProgress);
    const contentUri=await LegacyFileSystem.getContentUriAsync(file.uri);
    await IntentLauncher.startActivityAsync('android.intent.action.VIEW',{data:contentUri,type:'application/vnd.android.package-archive',flags:1|64});
    return {installed:false,awaitingAndroidInstaller:true};
  }catch(error){
    try{await Linking.openURL(CLIENT_URL)}catch{}
    throw new Error(`${String(error?.message||error)}; CLIENT_URL_OPENED`);
  }
}
