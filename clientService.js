import {Directory, File, Paths} from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

export const CLIENT_MANIFEST_URL='https://raw.githubusercontent.com/mythosnetworkbr-cell/RP/main/client-manifest.json';

export async function getClientManifest(){
  const response=await fetch(CLIENT_MANIFEST_URL,{cache:'no-store'});
  if(!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
  return response.json();
}

function absoluteUrl(base,value){try{return new URL(value,base).toString()}catch{return null}}

async function resolveArtifactUrl(url){
  const response=await fetch(url,{method:'GET',redirect:'follow',cache:'no-store',headers:{Accept:'*/*'}});
  if(!response.ok) throw new Error(`CLIENT_RESOLVE_HTTP_${response.status}`);
  const finalUrl=response.url||url;
  const type=(response.headers.get('content-type')||'').toLowerCase();
  if(type.includes('application/vnd.android.package-archive')||type.includes('application/octet-stream')||/\.apk(?:\?|$)/i.test(finalUrl)) return finalUrl;
  const html=await response.text();
  const candidates=[];
  const hrefPattern=/href\s*=\s*["']([^"']+)["']/gi;
  let match;
  while((match=hrefPattern.exec(html))!==null){const candidate=absoluteUrl(finalUrl,match[1]);if(candidate)candidates.push(candidate)}
  const direct=candidates.find(candidate=>/\.apk(?:\?|$)/i.test(candidate)||/download/i.test(candidate));
  if(!direct) throw new Error('CLIENT_DOWNLOAD_LINK_NOT_DIRECT');
  return direct;
}

export async function downloadClient(onProgress){
  const manifest=await getClientManifest();
  const url=manifest?.artifact?.url;
  if(!url) throw new Error('CLIENT_NOT_PUBLISHED');
  const directory=new Directory(Paths.document,'mythos-client');
  try{if(!directory.exists)directory.create({intermediates:true,idempotent:true})}
  catch(error){if(!directory.exists)throw error}
  const destination=new File(directory,`mythos-samp-${manifest.version}.apk`);
  const resolvedUrl=await resolveArtifactUrl(url);
  const file=await File.downloadFileAsync(resolvedUrl,destination,{idempotent:true});
  onProgress?.(1);
  return {file,manifest};
}

export async function installClient(file){
  const contentUri=await LegacyFileSystem.getContentUriAsync(file.uri);
  return IntentLauncher.startActivityAsync('android.intent.action.VIEW',{data:contentUri,type:'application/vnd.android.package-archive',flags:1|64});
}

export async function prepareClient(onProgress){const result=await downloadClient(onProgress);await installClient(result.file);return result.manifest}
