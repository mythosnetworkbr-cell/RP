import React, {useCallback, useEffect, useRef, useState} from 'react';
import {ActivityIndicator, Alert, AppState, Image, Linking, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {LinearGradient} from 'expo-linear-gradient';
import {prepareClient} from './clientService';

const SERVER={name:'MYTHØS RP',host:'51.68.107.75',port:10961,slots:500,client:'2.11'};
const SERVER_URI=`samp://${SERVER.host}:${SERVER.port}`;
const APP_ICON=require('./assets/app-icon.png');

function Stat({value,label}){return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>}
function NeonIcon({children}){return <LinearGradient colors={['#ff00b8','#8c2cff','#315cff']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.neonIcon}><Text style={styles.neonIconText}>{children}</Text></LinearGradient>}

export default function App(){
 const[busy,setBusy]=useState(false),[phase,setPhase]=useState('idle'),[progress,setProgress]=useState(0),[pending,setPending]=useState(false);
 const state=useRef(AppState.currentState);
 const openServer=useCallback(async()=>{try{if(await Linking.canOpenURL(SERVER_URI)){await Linking.openURL(SERVER_URI);return true}}catch{}return false},[]);
 const play=useCallback(async()=>{
  if(busy)return;
  setBusy(true);setPending(true);setProgress(5);
  try{
   setPhase('checking');
   if(await openServer()){setProgress(100);setPhase('playing');setPending(false);return;}
   setPhase('client');
   await prepareClient(v=>setProgress(10+Math.round(Math.max(0,Math.min(1,Number(v)||0))*78)));
   setProgress(90);setPhase('install');
  }catch(error){
   setPhase('error');setPending(false);
   const message=String(error?.message||error||'Erro desconhecido');
   Alert.alert('MYTHØS Launcher','Não foi possível preparar o cliente.\n\n'+message+'\n\nO Android pode exigir a confirmação da instalação por segurança.');
  }finally{setBusy(false)}
 },[busy,openServer]);
 useEffect(()=>{const sub=AppState.addEventListener('change',async next=>{const returning=/inactive|background/.test(state.current);state.current=next;if(returning&&next==='active'&&pending){setPhase('connecting');setProgress(94);const ok=await openServer();if(ok){setPending(false);setPhase('playing');setProgress(100)}}});return()=>sub.remove()},[openServer,pending]);
 const status=phase==='checking'?'VERIFICANDO CLIENTE':phase==='client'?'BAIXANDO CLIENTE SA-MP 2.11':phase==='install'?'INSTALAÇÃO DO ANDROID':phase==='connecting'?'CONECTANDO AO MYTHØS RP':phase==='playing'?'JOGO ABERTO':phase==='error'?'ERRO AO PREPARAR':'PRONTO PARA JOGAR';
 return <SafeAreaView style={styles.root}><StatusBar style="light" hidden/><LinearGradient colors={['#030007','#0a0018','#02040d']} style={StyleSheet.absoluteFill}/><View style={styles.pink}/><View style={styles.blue}/>
  <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
   <View style={styles.top}><View><Text style={styles.brand}>MYTHØS</Text><Text style={styles.subBrand}>NETWORK • MOBILE RP</Text></View><View style={styles.online}><View style={styles.dot}/><Text style={styles.onlineText}>ONLINE</Text></View></View>
   <View style={styles.hero}><Image source={APP_ICON} style={styles.logo} resizeMode="contain"/><Text style={styles.kicker}>BEM-VINDO AO</Text><Text style={styles.title}>MYTHØS RP</Text><Text style={styles.tag}>ENTRE NO MUNDO. VIVA O RP.</Text><Text style={styles.desc}>Servidor oficial já configurado. Toque em jogar e o launcher verifica o cliente, instala quando necessário e tenta entrar automaticamente.</Text></View>
   <View style={styles.card}><View style={styles.serverTop}><View><Text style={styles.cardKicker}>SERVIDOR OFICIAL</Text><Text style={styles.serverName}>{SERVER.name}</Text><Text style={styles.address}>{SERVER.host}:{SERVER.port}</Text></View><View style={styles.onlineBadge}><View style={styles.dot}/><Text style={styles.onlineBadgeText}>ONLINE</Text></View></View>
    <View style={styles.stats}><Stat value={SERVER.port} label="PORTA"/><View style={styles.divider}/><Stat value={SERVER.slots} label="SLOTS"/><View style={styles.divider}/><Stat value={SERVER.client} label="CLIENTE"/></View>
    <View style={styles.auto}><NeonIcon>↓</NeonIcon><View style={styles.autoText}><Text style={styles.autoTitle}>ACESSO DIRETO</Text><Text style={styles.autoDesc}>Nenhuma tela de IP e nenhum seletor de arquivo. O servidor já está configurado.</Text></View></View>
    <Pressable onPress={play} disabled={busy} style={({pressed})=>[styles.button,pressed&&styles.pressed,busy&&styles.disabled]}><LinearGradient colors={['#ff00a8','#9b2cff','#315cff']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.buttonInner}>{busy?<ActivityIndicator color="#fff"/>:<><Text style={styles.play}>▶</Text><View><Text style={styles.buttonTitle}>JOGAR AGORA</Text><Text style={styles.buttonSub}>ENTRAR DIRETO NO MYTHØS RP</Text></View><Text style={styles.arrow}>›</Text></>}</LinearGradient></Pressable>
    {busy&&<View style={styles.progress}><View style={styles.track}><View style={[styles.fill,{width:`${progress}%`}]}/></View><View style={styles.progressRow}><Text style={styles.status}>{status}</Text><Text style={styles.percent}>{progress}%</Text></View></View>}
   </View>
   <View style={styles.feature}><NeonIcon>♛</NeonIcon><View style={styles.featureText}><Text style={styles.featureTitle}>MYTHØS NETWORK</Text><Text style={styles.featureDesc}>Mais que um servidor. Uma cidade.</Text></View></View>
   <Text style={styles.footer}>MYTHØS NETWORK • LAUNCHER • SA-MP MOBILE</Text>
  </ScrollView>
 </SafeAreaView>
}
const styles=StyleSheet.create({root:{flex:1,backgroundColor:'#030007'},scroll:{padding:20,paddingBottom:35},pink:{position:'absolute',width:320,height:320,borderRadius:160,backgroundColor:'rgba(255,0,180,.12)',top:-150,left:-120},blue:{position:'absolute',width:400,height:400,borderRadius:200,backgroundColor:'rgba(35,70,255,.11)',right:-220,bottom:-80},top:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:16},brand:{color:'#fff',fontSize:27,fontWeight:'900',letterSpacing:4},subBrand:{color:'#a65cff',fontSize:8,fontWeight:'900',letterSpacing:2},online:{flexDirection:'row',alignItems:'center',paddingHorizontal:12,paddingVertical:8,borderRadius:18,backgroundColor:'rgba(10,5,20,.8)',borderWidth:1,borderColor:'rgba(255,255,255,.12)'},dot:{width:7,height:7,borderRadius:4,backgroundColor:'#27e87a',marginRight:6},onlineText:{color:'#85ffb2',fontSize:9,fontWeight:'900'},hero:{alignItems:'center',marginBottom:18},logo:{width:170,height:130,marginBottom:6},kicker:{color:'#d27cff',fontSize:9,fontWeight:'900',letterSpacing:3},title:{color:'#fff',fontSize:42,fontWeight:'900',letterSpacing:2,textShadowColor:'#b000ff',textShadowRadius:14},tag:{color:'#fff',fontSize:11,fontWeight:'800',letterSpacing:2,marginTop:2},desc:{color:'#a69cab',fontSize:11,lineHeight:17,textAlign:'center',maxWidth:560,marginTop:8},card:{width:'100%',maxWidth:650,alignSelf:'center',padding:18,borderRadius:23,backgroundColor:'rgba(10,7,19,.92)',borderWidth:1,borderColor:'rgba(210,90,255,.24)'},serverTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},cardKicker:{color:'#a967e0',fontSize:8,fontWeight:'900',letterSpacing:2},serverName:{color:'#fff',fontSize:24,fontWeight:'900',marginTop:3},address:{color:'#8f869a',fontSize:10,marginTop:2},onlineBadge:{flexDirection:'row',alignItems:'center',padding:8,borderRadius:14,backgroundColor:'rgba(39,232,122,.07)'},onlineBadgeText:{color:'#63f39b',fontSize:8,fontWeight:'900'},stats:{flexDirection:'row',alignItems:'center',marginTop:16,paddingVertical:14,borderTopWidth:1,borderBottomWidth:1,borderColor:'rgba(255,255,255,.08)'},stat:{flex:1,alignItems:'center'},statValue:{color:'#fff',fontSize:18,fontWeight:'900'},statLabel:{color:'#756b7e',fontSize:7,fontWeight:'900',letterSpacing:1.4,marginTop:3},divider:{height:24,width:1,backgroundColor:'rgba(255,255,255,.09)'},auto:{flexDirection:'row',alignItems:'center',marginTop:14,padding:11,borderRadius:14,backgroundColor:'rgba(255,255,255,.035)'},neonIcon:{width:42,height:42,borderRadius:13,alignItems:'center',justifyContent:'center'},neonIconText:{color:'#fff',fontSize:21,fontWeight:'900'},autoText:{flex:1,marginLeft:10},autoTitle:{color:'#d896ff',fontSize:9,fontWeight:'900',letterSpacing:1.3},autoDesc:{color:'#8b8294',fontSize:9,lineHeight:14,marginTop:3},button:{marginTop:14,borderRadius:16,overflow:'hidden'},pressed:{transform:[{scale:.985}]},disabled:{opacity:.7},buttonInner:{minHeight:66,paddingHorizontal:16,flexDirection:'row',alignItems:'center'},play:{color:'#fff',fontSize:18,marginRight:12},buttonTitle:{color:'#fff',fontSize:15,fontWeight:'900',letterSpacing:.7},buttonSub:{color:'rgba(255,255,255,.72)',fontSize:8,fontWeight:'800',marginTop:2},arrow:{color:'#fff',fontSize:35,marginLeft:'auto'},progress:{marginTop:13},track:{height:6,borderRadius:3,overflow:'hidden',backgroundColor:'#211a2a'},fill:{height:6,backgroundColor:'#d000ff'},progressRow:{flexDirection:'row',justifyContent:'space-between',marginTop:6},status:{color:'#a79caf',fontSize:8,fontWeight:'800'},percent:{color:'#c985ff',fontSize:8,fontWeight:'900'},feature:{width:'100%',maxWidth:650,alignSelf:'center',flexDirection:'row',alignItems:'center',marginTop:14,padding:12,borderRadius:15,backgroundColor:'rgba(10,7,19,.72)',borderWidth:1,borderColor:'rgba(255,255,255,.06)'},featureText:{marginLeft:10},featureTitle:{color:'#fff',fontSize:10,fontWeight:'900',letterSpacing:1},featureDesc:{color:'#746b7b',fontSize:8,marginTop:2},footer:{color:'#5f5668',fontSize:7,fontWeight:'800',letterSpacing:1.4,textAlign:'center',marginTop:22}});
