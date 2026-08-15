const fs=require('fs');
const path=require('path');

const appPath=path.join(process.cwd(),'App.js');
let app=fs.readFileSync(appPath,'utf8');

app=app.replace(
  "const SERVER={name:'MYTHØS ROLEPLAY',host:'51.68.107.75',port:10961,players:0,slots:500,mode:'Android',client:'2.11'};",
  "const SERVER={name:'MYTHØS ROLEPLAY',host:'51.68.107.75',port:10961,players:0,slots:500,mode:'Android',client:'2.11'};\nconst LEX_SERVER={name:'LEX CITY RP',host:'151.242.227.34',port:7777};\nconst NYX_URI='samp://51.68.107.75:10961';\nconst LEX_URI='samp://151.242.227.34:7777';"
);

app=app.replace(
  /function BottomNav\([\s\S]*?\nfunction ServerStats/,
  "function BottomNav({setScreen}){return <View style={s.bottom}><Pressable onPress={()=>setScreen('home')} style={s.nav}><Text style={s.navIcon}>⌂</Text><Text style={s.navLabel}>INÍCIO</Text></Pressable><View style={s.navSpacer}/><Pressable onPress={()=>setScreen('settings')} style={s.nav}><Text style={s.navIcon}>⚙</Text><Text style={s.navLabel}>CONFIGURAÇÕES</Text></Pressable></View>}\nfunction ServerStats"
);

app=app.replace(
  /function ServerStats\([\s\S]*?\nfunction PlayButton/,
  "function ServerStats(){return <View style={s.stats}><View><Text style={[s.statValue,{color:RED}]}>{SERVER.port}</Text><Text style={s.statLabel}>PORTA</Text></View><View><Text style={[s.statValue,{color:WHITE}]}>{SERVER.client}</Text><Text style={s.statLabel}>CLIENTE</Text></View></View>}\nfunction ServerButton({title,subtitle,onPress,accent=GREEN}){return <Pressable onPress={onPress} style={[s.serverButton,{borderColor:accent}]}><View style={[s.serverPlay,{backgroundColor:accent}]}><Text style={s.serverPlayText}>▶</Text></View><View style={{flex:1}}><Text style={s.serverButtonTitle}>{title}</Text><Text style={s.serverButtonSub}>{subtitle}</Text></View><Text style={[s.serverArrow,{color:accent}]}>›</Text></Pressable>}\nfunction PlayButton"
);

app=app.replace(/function PlayButton\([\s\S]*?\nfunction CapeCharacter/, "function CapeCharacter");

app=app.replace(
  /function Home\([\s\S]*?\nfunction Settings/,
  `function Home({onPlay}){return <ScrollView style={s.scroll} contentContainerStyle={s.page} showsVerticalScrollIndicator={false}><View style={s.header}><View><Text style={s.brand}>MYTHØS</Text><Text style={s.role}>ROLEPLAY</Text></View><View style={s.online}><View style={s.dot}/><Text style={s.onlineText}>ONLINE</Text><Text style={s.onlineIp}>{SERVER.host}:{SERVER.port}</Text></View></View><View style={s.hero}><Image source={APP_ICON} style={s.logo}/><CapeCharacter/></View><ServerStats/><Text style={s.chooseTitle}>ESCOLHA ONDE JOGAR</Text><ServerButton title="Jogar - Lex City RP" subtitle="151.242.227.34:7777" accent={RED} onPress={()=>onPlay(LEX_URI)}/><ServerButton title="Jogar-Nyx City RP" subtitle="51.68.107.75:10961" accent={GREEN} onPress={()=>onPlay(NYX_URI)}/></ScrollView>}\nfunction Settings`
);

app=app.replace(
  "const[screen,setScreen]=useState('home'),[busy,setBusy]=useState(false),[phase,setPhase]=useState('ready'),[progress,setProgress]=useState(0),[pending,setPending]=useState(false);",
  "const[screen,setScreen]=useState('home'),[busy,setBusy]=useState(false),[phase,setPhase]=useState('ready'),[progress,setProgress]=useState(0),[pending,setPending]=useState(false);"
);

app=app.replace(
  /const play=useCallback\(async\(\)=>\{[\s\S]*?\},\[busy\]\);/,
  "const play=useCallback(async(serverUri=NYX_URI)=>{if(busy)return;setBusy(true);setProgress(3);try{setPhase('cache');await installBundledOrRemoteCache((p)=>setProgress(Math.max(3,Math.min(92,Number(p)||3))));setProgress(94);setPhase('client');const r=await prepareClient(v=>setProgress(94+Math.round((Number(v)||0)*4)),serverUri);if(r?.awaitingAndroidInstaller){setPending(true);setPhase('install');setProgress(98);return}setPhase('launch');setProgress(99);if(!await launchClient(serverUri))throw new Error('CLIENT_LAUNCH_FAILED');setProgress(100);setPhase('playing')}catch(e){setPhase('error');Alert.alert('MYTHØS','Não foi possível preparar o jogo.\\n\\n'+String(e?.message||e))}finally{setBusy(false)}},[busy]);"
);

app=app.replace(/<BottomNav setScreen=\{setScreen\} onPlay=\{play\}\/>/,"<BottomNav setScreen={setScreen}/>");
app=app.replace(/<View style=\{s.downloadCard\}>[\s\S]*?<\/View><View style=\{s.permission\}>[\s\S]*?<\/View><View style=\{s.links\}>[\s\S]*?<\/View>/,"");

app=app.replace(
  "bottom:{position:'absolute',left:0,right:0,bottom:0,height:88,backgroundColor:'rgba(0,0,0,.94)',borderTopWidth:1,borderTopColor:GREEN,flexDirection:'row',alignItems:'center',justifyContent:'space-around'},nav:{width:120,height:88,alignItems:'center',justifyContent:'center'},",
  "bottom:{position:'absolute',left:0,right:0,bottom:0,height:88,backgroundColor:'rgba(0,0,0,.94)',borderTopWidth:1,borderTopColor:GREEN,flexDirection:'row',alignItems:'center',justifyContent:'space-around'},nav:{width:150,height:88,alignItems:'center',justifyContent:'center'},navSpacer:{flex:1},serverButton:{height:82,borderWidth:2,borderRadius:18,backgroundColor:'rgba(0,0,0,.86)',marginTop:10,paddingHorizontal:16,flexDirection:'row',alignItems:'center'},serverPlay:{width:48,height:48,borderRadius:24,alignItems:'center',justifyContent:'center',marginRight:14},serverPlayText:{color:'#050505',fontSize:20,fontWeight:'900'},serverButtonTitle:{color:WHITE,fontSize:19,fontWeight:'900'},serverButtonSub:{color:'#aaa',fontSize:11,marginTop:4},serverArrow:{fontSize:42,fontWeight:'300',marginLeft:10},chooseTitle:{color:WHITE,fontSize:18,fontWeight:'900',marginTop:18,marginBottom:2,textAlign:'center'},"
);

fs.writeFileSync(appPath,app);
console.log('Server selection patched: Lex City RP + Nyx City RP');
