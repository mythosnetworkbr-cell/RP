import {Directory, File, Paths} from 'expo-file-system';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import {Linking} from 'react-native';

export const CLIENT_URL='https://github.com/mythosnetworkbr-cell/RP/releases/download/mythos-client-v1.0.0/mythos-samp-mobile-2.11-v1.0.0.apk';
export const CLIENT_PACKAGE='br.com.mythos.sampclient';
export const SERVER_URI='samp://51.68.107.75:10961';
let selectedServerUri=SERVER_URI;

async function downloadToLocal(onProgress){
  const directory=new Directory(Paths.document,'mythos-client');
  if(!directory.exists) directory.create({intermediates:true,idempotent:true});
  const destination=new File(directory,'mythos-samp-2.11.apk');
  const file=await File.downloadFileAsync(CLIENT_URL,destination,{idempotent:true});
  if(!file.exists||file.size<1024*1024) throw new Error('CLIENT_FILE_INVALID');
  onProgress?.(1);
  return file;
}

async function openInstalledClient(){
  try{
    await IntentLauncher.startActivityAsync('android.intent.action.MAIN',{
      category:'android.intent.category.LAUNCHER',
      packageName:CLIENT_PACKAGE
    });
    return true;
  }catch{return false}
}

export async function prepareClient(onProgress,serverUri=SERVER_URI){
  selectedServerUri=serverUri||SERVER_URI;
  const installed=await openInstalledClient();
  if(installed) return {installed:true,alreadyInstalled:true};

  const file=await downloadToLocal(onProgress);
  const contentUri=await LegacyFileSystem.getContentUriAsync(file.uri);
  await IntentLauncher.startActivityAsync('android.intent.action.VIEW',{
    data:contentUri,
    type:'application/vnd.android.package-archive',
    flags:1|64
  });
  return {installed:false,awaitingAndroidInstaller:true};
}

export async function launchClient(serverUri=selectedServerUri){
  selectedServerUri=serverUri||selectedServerUri||SERVER_URI;
  const opened=await openInstalledClient();
  if(!opened) return false;
  await new Promise(resolve=>setTimeout(resolve,900));
  try{
    await Linking.openURL(selectedServerUri);
    return true;
  }catch{return false}
}
