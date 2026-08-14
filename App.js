import React,{useCallback,useEffect,useRef,useState} from 'react';
import {ActivityIndicator,Alert,AppState,Image,Pressable,SafeAreaView,ScrollView,StyleSheet,Text,View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {LinearGradient} from 'expo-linear-gradient';
import {installBundledOrRemoteCache} from './cacheService';
import {prepareClient,launchClient,SERVER_URI} from './clientService';

const SERVER={name:'MYTHØS ROLEPLAY',host:'51.68.107.75',port:10961,slots:500,client:'2.11'};
const APP_ICON=require('./assets/app-icon.png');

function Step({done,active,label}){return <View style={styles.step}><View style={[styles.stepDot,done&&styles.doneDot,active&&styles.activeDot]}>{done?<Text style={styles.check}>✓</Text>:active?<ActivityIndicator size="small" color="#fff"/>:null}</View><Text style={[styles.stepText,done&&styles.doneText,active&&styles.activeText]}>{label}</Text></View>}
function Stat({value,label}){return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>}

export default function App(){
 const[phase,setPhase]=useState('ready');
 const[progress,setProgress]=useState(0);
 const[busy,setBusy]=useState(false);
 const[pending,setPending]=useState(false);
 const appState=useRef(AppState.currentState);

 const play=useCallback(async()=>{
  if(busy)return;
  setBusy(true);setPending(false);setProgress(3);
  try{
   setPhase('cache');
   await installBundledOrRemoteCache();
   setProgress(45);
   setPhase('client');
   const result=await prepareClient(v=>setProgress(45+Math.round((Number(v)||0)*40)));
   if(result?.awaitingAndroidInstaller){setPending(true);setPhase('install');setProgress(88);return;}
   setProgress(92);setPhase('launch');
   const launched=await launchClient();
   if(!launched)throw new Error('CLIENT_LAUNCH_FAILED');
   setProgress(100);setPhase('playing');
  }catch(error){
   setPhase('error');
   Alert.alert('MYTHØS','Não foi possível preparar o jogo.\n\n'+String(error?.message||error));
  }finally{setBusy(false)}
 },[busy]);

 useEffect(()=>{const sub=AppState.addEventListener('change',async next=>{const returning=/inactive|background/.test(appState.current);appState.current=next;if(returning&&next==='active'&&pending){setPhase('launch');setProgress(94);const ok=await launchClient();if(ok){setPending(false);setProgress(100);setPhase('playing')}}});return()=>sub.remove()},[pending]);

 const preparing=['cache','client','install','launch'].includes(phase);
 const title=phase==='cache'?'BAIXANDO O SEU JOGO':phase==='client'?'PREPARANDO CLIENTE SA-MP 2.11':phase==='install'?'INSTALAÇÃO DO CLIENTE':phase==='launch'?'ENTRANDO NO MYTHØS RP':phase==='playing'?'JOGO PRONTO':phase==='error'?'ERRO AO PREPARAR':'MYTHØS ROLEPLAY';
 const step=(name)=>phase==='playing'||phase==='launch'?'done':phase==='install'&&name!=='launch'?'done':phase==='client'&&name==='cache'?'done':phase==='cache'&&name==='cache'?'active':phase==='client'&&name==='client'?'active':phase==='install'&&name==='install'?'active':phase==='launch'&&name==='launch'?'active':'idle';

 return <SafeAreaView style={styles.root}><StatusBar style="light" hidden/>
  <LinearGradient colors={['#030008','#13001f','#050b22']} style={StyleSheet.absoluteFill}/><View style={styles.glowPink}/><View style={styles.glowBlue}/>
  <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
   <View style={styles.header}><View><Text style={styles.mini}>MYTHØS</Text><Text style={styles.headerTitle}>ROLEPLAY</Text></View><View style={styles.online}><View style={styles.green}/><Text style={styles.onlineText}>SERVIDOR ONLINE</Text></View></View>
   <View style={styles.hero}><Image source={APP_ICON} style={styles.icon} resizeMode="contain"/><Text style={styles.heroTitle}>MYTHØS RP</Text><Text style={styles.heroSub}>SUA HISTÓRIA. SUAS REGRAS. SEU LEGADO.</Text></View>
   <View style={styles.serverCard}>
    <View style={styles.serverHeader}><View><Text style={styles.kicker}>SERVIDOR OFICIAL</Text><Text style={styles.serverName}>{SERVER.name}</Text><Text style={styles.ip}>{SERVER.host}:{SERVER.port}</Text></View><View style={styles.live}><View style={styles.green}/><Text style={styles.liveText}>ONLINE</Text></View></View>
    <View style={styles.stats}><Stat value={SERVER.port} label="PORTA"/><View style={styles.sep}/><Stat value={SERVER.slots} label="SLOTS"/><View style={styles.sep}/><Stat value={SERVER.client} label="CLIENTE"/></View>
    {preparing&&<View style={styles.prepare}>
      <View style={styles.prepareHead}><View><Text style={styles.prepareTitle}>{title}</Text><Text style={styles.prepareSub}>Aguarde enquanto o Mythøs prepara tudo automaticamente.</Text></View><Text style={styles.percent}>{progress}%</Text></View>
      <View style={styles.track}><LinearGradient colors={['#ff00a8','#a32cff','#315cff']} start={{x:0,y:0}} end={{x:1,y:0}} style={[styles.fill,{width:`${Math.max(3,progress)}%`}]}/></View>
      <Step label="Verificando arquivos" done={step('cache')==='done'} active={step('cache')==='active'}/><Step label="Baixando e extraindo cache GTA" done={step('client')==='done'} active={step('cache')==='active'}/><Step label="Instalando cliente SA-MP 2.11" done={step('install')==='done'} active={step('client')==='active'||step('install')==='active'}/><Step label={`Conectando em ${SERVER.host}:${SERVER.port}`} done={phase==='playing'} active={step('launch')==='active'}/>
      <Text style={styles.warning}>NÃO FECHE O APLICATIVO DURANTE A PREPARAÇÃO.</Text>
    </View>}
    <Pressable onPress={play} disabled={busy||preparing} style={({pressed})=>[styles.playButton,pressed&&styles.pressed,(busy||preparing)&&styles.disabled]}><LinearGradient colors={['#ff009d','#a72cff','#315cff']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.playInner}>{busy?<ActivityIndicator color="#fff"/>:<><Text style={styles.playIcon}>▶</Text><View><Text style={styles.playTitle}>ENTRAR NO SERVIDOR</Text><Text style={styles.playSub}>JOGAR AGORA</Text></View><Text style={styles.chevron}>›</Text></>}</LinearGradient></Pressable>
   </View>
   <View style={styles.tiles}><View style={styles.tile}><Text style={styles.tileIcon}>◉</Text><Text style={styles.tileText}>SITE</Text></View><View style={styles.tile}><Text style={styles.tileIcon}>◈</Text><Text style={styles.tileText}>DISCORD</Text></View><View style={styles.tile}><Text style={styles.tileIcon}>▣</Text><Text style={styles.tileText}>REGRAS</Text></View><View style={styles.tile}><Text style={styles.tileIcon}>◌</Text><Text style={styles.tileText}>SUPORTE</Text></View></View>
   <Text style={styles.footer}>MYTHØS NETWORK • SA-MP MOBILE • {SERVER_URI}</Text>
  </ScrollView>
 </SafeAreaView>
}

const styles=StyleSheet.create({root:{flex:1,backgroundColor:'#030008'},scroll:{padding:18,paddingBottom:35},glowPink:{position:'absolute',width:430,height:430,borderRadius:215,backgroundColor:'rgba(255,0,180,.14)',top:-260,left:-180},glowBlue:{position:'absolute',width:500,height:500,borderRadius:250,backgroundColor:'rgba(40,60,255,.12)',right:-280,bottom:-200},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12},mini:{color:'#fff',fontSize:10,fontWeight:'900',letterSpacing:4},headerTitle:{color:'#b45cff',fontSize:22,fontWeight:'900',letterSpacing:2},online:{flexDirection:'row',alignItems:'center',paddingHorizontal:10,paddingVertical:7,borderRadius:16,backgroundColor:'rgba(5,5,12,.8)',borderWidth:1,borderColor:'rgba(255,255,255,.1)'},green:{width:7,height:7,borderRadius:4,backgroundColor:'#28ee7c',marginRight:6},onlineText:{color:'#8affb4',fontSize:8,fontWeight:'900'},hero:{alignItems:'center',paddingVertical:6},icon:{width:155,height:155},heroTitle:{color:'#fff',fontSize:38,fontWeight:'900',letterSpacing:2,textShadowColor:'#bf00ff',textShadowRadius:16},heroSub:{color:'#d08cff',fontSize:9,fontWeight:'900',letterSpacing:2,marginTop:2},serverCard:{width:'100%',maxWidth:720,alignSelf:'center',marginTop:16,padding:16,borderRadius:24,backgroundColor:'rgba(8,7,16,.94)',borderWidth:1,borderColor:'rgba(207,73,255,.26)'},serverHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},kicker:{color:'#ad64e8',fontSize:8,fontWeight:'900',letterSpacing:2},serverName:{color:'#fff',fontSize:22,fontWeight:'900',marginTop:3},ip:{color:'#898092',fontSize:10,marginTop:2},live:{flexDirection:'row',alignItems:'center',padding:8,borderRadius:14,backgroundColor:'rgba(40,238,124,.06)'},liveText:{color:'#74ffa7',fontSize:8,fontWeight:'900'},stats:{flexDirection:'row',alignItems:'center',marginTop:14,paddingVertical:12,borderTopWidth:1,borderBottomWidth:1,borderColor:'rgba(255,255,255,.08)'},stat:{flex:1,alignItems:'center'},statValue:{color:'#fff',fontSize:17,fontWeight:'900'},statLabel:{color:'#72697b',fontSize:7,fontWeight:'900',letterSpacing:1.5,marginTop:3},sep:{height:24,width:1,backgroundColor:'rgba(255,255,255,.09)'},prepare:{marginTop:13,padding:13,borderRadius:16,backgroundColor:'rgba(255,255,255,.035)'},prepareHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},prepareTitle:{color:'#fff',fontSize:14,fontWeight:'900',letterSpacing:.5},prepareSub:{color:'#81788b',fontSize:8,marginTop:3},percent:{color:'#dd76ff',fontSize:20,fontWeight:'900'},track:{height:7,borderRadius:4,overflow:'hidden',backgroundColor:'#21182b',marginTop:12,marginBottom:10},fill:{height:7,borderRadius:4},step:{flexDirection:'row',alignItems:'center',paddingVertical:5},stepDot:{width:19,height:19,borderRadius:10,borderWidth:1,borderColor:'#3b3143',alignItems:'center',justifyContent:'center',marginRight:8},doneDot:{backgroundColor:'#ff18b3',borderColor:'#ff18b3'},activeDot:{borderColor:'#9c55ff'},check:{color:'#fff',fontSize:11,fontWeight:'900'},stepText:{color:'#70677a',fontSize:9,fontWeight:'700'},doneText:{color:'#b9b0c2'},activeText:{color:'#e58cff'},warning:{color:'#ff4dbf',fontSize:7,fontWeight:'900',letterSpacing:1,marginTop:8,textAlign:'center'},playButton:{marginTop:14,borderRadius:17,overflow:'hidden'},pressed:{transform:[{scale:.985}]},disabled:{opacity:.65},playInner:{minHeight:68,paddingHorizontal:17,flexDirection:'row',alignItems:'center'},playIcon:{color:'#fff',fontSize:18,marginRight:12},playTitle:{color:'#fff',fontSize:15,fontWeight:'900',letterSpacing:.7},playSub:{color:'rgba(255,255,255,.72)',fontSize:8,fontWeight:'800',marginTop:2},chevron:{color:'#fff',fontSize:36,marginLeft:'auto'},tiles:{width:'100%',maxWidth:720,alignSelf:'center',flexDirection:'row',gap:8,marginTop:12},tile:{flex:1,minHeight:62,alignItems:'center',justifyContent:'center',borderRadius:14,backgroundColor:'rgba(8,7,16,.76)',borderWidth:1,borderColor:'rgba(255,255,255,.06)'},tileIcon:{color:'#e23cff',fontSize:18},tileText:{color:'#a49aaa',fontSize:7,fontWeight:'900',marginTop:3,letterSpacing:1},footer:{color:'#5c5365',fontSize:7,fontWeight:'800',letterSpacing:1.2,textAlign:'center',marginTop:18}});
