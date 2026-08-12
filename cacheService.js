import * as DocumentPicker from 'expo-document-picker';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import * as IntentLauncher from 'expo-intent-launcher';
import {unzip} from 'react-native-zip-archive';
import {Platform} from 'react-native';

export const GTA_DIR='/storage/emulated/0/GTA';

async function requestGtaStorageAccess(){
  if(Platform.OS!=='android') throw new Error('CACHE_ANDROID_ONLY');
  try{
    await IntentLauncher.startActivityAsync('android.settings.MANAGE_APP_ALL_FILES_ACCESS_PERMISSION',{data:'package:br.com.mythos.rp'});
  }catch{
    try{await IntentLauncher.startActivityAsync('android.settings.MANAGE_ALL_FILES_ACCESS_PERMISSION')}catch{}
  }
}

export async function pickAndInstallGtaCache(){
  if(Platform.OS!=='android') throw new Error('CACHE_ANDROID_ONLY');
  const picked=await DocumentPicker.getDocumentAsync({type:['application/zip','application/x-zip-compressed','application/octet-stream'],copyToCacheDirectory:true,multiple:false});
  if(picked.canceled) return {cancelled:true};
  const asset=picked.assets?.[0];
  if(!asset?.uri) throw new Error('CACHE_FILE_NOT_SELECTED');
  const localZip=`${LegacyFileSystem.cacheDirectory}mythos-gta-cache.zip`;
  await LegacyFileSystem.copyAsync({from:asset.uri,to:localZip});
  await requestGtaStorageAccess();
  await LegacyFileSystem.makeDirectoryAsync(GTA_DIR,{intermediates:true}).catch(()=>{});
  try{
    await unzip(localZip,GTA_DIR);
  }finally{
    await LegacyFileSystem.deleteAsync(localZip,{idempotent:true}).catch(()=>{});
  }
  return {cancelled:false,path:GTA_DIR,name:asset.name||'cache.zip'};
}
