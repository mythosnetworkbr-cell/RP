import {Directory, File, Paths} from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';

export const CLIENT_MANIFEST_URL='https://raw.githubusercontent.com/mythosnetworkbr-cell/RP/main/client-manifest.json';

export async function getClientManifest(){
  const response=await fetch(CLIENT_MANIFEST_URL,{cache:'no-store'});
  if(!response.ok) throw new Error(`Manifest HTTP ${response.status}`);
  return response.json();
}

export async function downloadClient(onProgress){
  const manifest=await getClientManifest();
  const url=manifest?.artifact?.url;
  if(!url) throw new Error('CLIENT_NOT_PUBLISHED');
  const directory=new Directory(Paths.document,'mythos-client');
  directory.create({intermediates:true,overwrite:false});
  const destination=new File(directory,`mythos-samp-${manifest.version}.apk`);
  const file=await File.downloadFileAsync(url,destination,{idempotent:true});
  onProgress?.(1);
  return {file,manifest};
}

export async function installClient(file){
  const contentUri=await LegacyFileSystem.getContentUriAsync(file.uri);
  return IntentLauncher.startActivityAsync('android.intent.action.VIEW',{
    data:contentUri,
    type:'application/vnd.android.package-archive',
    flags:1|64,
  });
}

export async function prepareClient(onProgress){
  const result=await downloadClient(onProgress);
  await installClient(result.file);
  return result.manifest;
}
