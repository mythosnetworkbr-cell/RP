import * as DocumentPicker from 'expo-document-picker';
import * as LegacyFileSystem from 'expo-file-system/legacy';
import {unzip} from 'react-native-zip-archive';
import {Platform} from 'react-native';

export const GTA_DIR='/storage/emulated/0/GTA';

export async function pickAndInstallGtaCache(){
  if(Platform.OS!=='android') throw new Error('CACHE_ANDROID_ONLY');
  const picked=await DocumentPicker.getDocumentAsync({type:['application/zip','application/x-zip-compressed','application/octet-stream'],copyToCacheDirectory:true,multiple:false});
  if(picked.canceled) return {cancelled:true};
  const asset=picked.assets?.[0];
  if(!asset?.uri) throw new Error('CACHE_FILE_NOT_SELECTED');
  const localZip=`${LegacyFileSystem.cacheDirectory}mythos-gta-cache.zip`;
  await LegacyFileSystem.copyAsync({from:asset.uri,to:localZip});
  await LegacyFileSystem.makeDirectoryAsync(GTA_DIR,{intermediates:true}).catch(()=>{});
  await unzip(localZip,GTA_DIR);
  await LegacyFileSystem.deleteAsync(localZip,{idempotent:true});
  return {cancelled:false,path:GTA_DIR,name:asset.name||'cache.zip'};
}
