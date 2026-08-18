package com.mythosnetwork.nyx;

import android.app.*;
import android.content.*;
import android.graphics.*;
import android.graphics.drawable.GradientDrawable;
import android.os.*;
import android.view.*;
import android.view.inputmethod.InputMethodManager;
import android.widget.*;
import java.util.*;

public class MainActivity extends Activity {
    private FrameLayout root;
    private GameView game;
    private EditText nameInput;
    private final int PURPLE = Color.rgb(139,92,246);

    @Override public void onCreate(Bundle saved) {
        super.onCreate(saved);
        setContentView(new FrameLayout(this));
        root = (FrameLayout) findViewById(android.R.id.content);
        hideSystemBars();
        showLogin();
    }

    private void hideSystemBars() {
        Window w = getWindow();
        if (w == null) return;
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController c = w.getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.statusBars() | WindowInsets.Type.navigationBars());
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            w.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION |
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN |
                View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
        }
    }

    private TextView label(String text, int size) {
        TextView v = new TextView(this);
        v.setText(text); v.setTextColor(Color.WHITE); v.setTextSize(size); v.setGravity(Gravity.CENTER);
        return v;
    }

    private GradientDrawable bg(int color, float radius) {
        GradientDrawable d = new GradientDrawable(); d.setColor(color); d.setCornerRadius(radius); return d;
    }

    private void showLogin() {
        LinearLayout page = new LinearLayout(this); page.setOrientation(LinearLayout.VERTICAL);
        page.setGravity(Gravity.CENTER); page.setPadding(36,20,36,20); page.setBackgroundColor(Color.rgb(5,7,13));

        TextView logo = label("NYX", 64); logo.setTextColor(PURPLE);
        page.addView(logo, new LinearLayout.LayoutParams(-1,90));
        TextView sub = label("ROLEPLAY • BRASIL", 17); page.addView(sub, new LinearLayout.LayoutParams(-1,45));

        LinearLayout card = new LinearLayout(this); card.setOrientation(LinearLayout.VERTICAL); card.setPadding(34,28,34,28);
        card.setBackground(bg(Color.rgb(18,22,34),28));
        TextView title = label("ENTRAR NA CIDADE",22); card.addView(title,new LinearLayout.LayoutParams(-1,45));
        nameInput = new EditText(this); nameInput.setHint("Nome do personagem"); nameInput.setHintTextColor(Color.rgb(150,155,170)); nameInput.setTextColor(Color.WHITE); nameInput.setSingleLine(true);
        card.addView(nameInput,new LinearLayout.LayoutParams(-1,58));
        Button play = new Button(this); play.setText("JOGAR"); play.setTextColor(Color.WHITE); play.setTextSize(17); play.setBackground(bg(PURPLE,22));
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(-1,58); bp.topMargin=20; card.addView(play,bp);
        page.addView(card,new LinearLayout.LayoutParams(Math.min(620, getResources().getDisplayMetrics().widthPixels-60),260));
        TextView foot = label("MYTHØS NETWORK • NYX MOBILE",12); LinearLayout.LayoutParams fp=new LinearLayout.LayoutParams(-1,45); fp.topMargin=25; page.addView(foot,fp);
        root.removeAllViews(); root.addView(page);
        play.setOnClickListener(v -> startGame());
        nameInput.requestFocus();
        nameInput.postDelayed(() -> { ((InputMethodManager)getSystemService(INPUT_METHOD_SERVICE)).hideSoftInputFromWindow(nameInput.getWindowToken(),0); nameInput.clearFocus(); },250);
    }

    private void startGame() {
        String name = nameInput == null ? "" : nameInput.getText().toString().trim();
        if (name.length() < 3) { nameInput.setError("Digite pelo menos 3 caracteres"); return; }
        game = new GameView(this,name); root.removeAllViews(); root.addView(game); hideSystemBars(); game.requestFocus();
    }

    @Override public void onWindowFocusChanged(boolean hasFocus) { super.onWindowFocusChanged(hasFocus); if (hasFocus) hideSystemBars(); }

    private class GameView extends View {
        Paint p = new Paint(Paint.ANTI_ALIAS_FLAG); Paint stroke = new Paint(Paint.ANTI_ALIAS_FLAG);
        String playerName, job="Desempregado", org="Nenhuma"; int cash=500, bank=2500, hp=100, fuel=100; boolean driving=false, working=false;
        float px=0, py=0, joyX=0, joyY=0; long workUntil=0; SharedPreferences save;
        final HashMap<String, Integer> salaries = new HashMap<>();
        String[] jobs={"Entregador","Motorista","Mecânico","Jornalista","Médico","Policial"};
        ArrayList<String> chat = new ArrayList<>();

        GameView(Context c,String n) { super(c); playerName=n; setFocusable(true); save=getSharedPreferences("nyx_rp",0); load();
            salaries.put("Entregador",120); salaries.put("Motorista",180); salaries.put("Mecânico",220); salaries.put("Jornalista",250); salaries.put("Médico",450); salaries.put("Policial",400);
            chat.add("Sistema: Bem-vindo à cidade de Nyx."); chat.add("Dica: escolha um emprego e trabalhe para ganhar dinheiro.");
        }
        void load(){ cash=save.getInt("cash",500); bank=save.getInt("bank",2500); job=save.getString("job","Desempregado"); }
        void save(){ save.edit().putInt("cash",cash).putInt("bank",bank).putString("job",job).apply(); }

        @Override protected void onDraw(Canvas c) { super.onDraw(c); int w=getWidth(),h=getHeight();
            p.setStyle(Paint.Style.FILL); p.setColor(Color.rgb(20,26,32)); c.drawRect(0,0,w,h,p);
            drawCity(c,w,h); drawHud(c,w,h); drawControls(c,w,h); drawPlayer(c,w,h); if (working && System.currentTimeMillis()<workUntil) postInvalidateDelayed(100); else if(working){ working=false; int s=salaries.containsKey(job)?salaries.get(job):0; cash+=s; chat.add("Pagamento: +$"+s); save(); }
            postInvalidateDelayed(33);
        }

        void drawCity(Canvas c,int w,int h){
            float cx=w/2f, cy=h/2f; float scale=1f;
            p.setColor(Color.rgb(44,50,58)); for(int i=-8;i<=8;i++){ float x=cx+i*150-px*scale; c.drawRect(x,0,x+92,h,p); }
            p.setColor(Color.rgb(58,63,70)); for(int j=-5;j<=5;j++){ float y=cy+j*130-py*scale; c.drawRect(0,y,w,y+86,p); }
            p.setColor(Color.rgb(34,39,45)); for(int i=-8;i<=8;i++) for(int j=-5;j<=5;j++){ float x=cx+i*150-px*scale+102, y=cy+j*130-py*scale+8; c.drawRect(x,y,x+38,y+65,p); }
            poi(c,cx+310-px,cy-150-py,"PREFEITURA",Color.rgb(80,110,160)); poi(c,cx-360-px,cy-120-py,"HOSPITAL",Color.rgb(180,70,80)); poi(c,cx+330-px,cy+190-py,"POLÍCIA",Color.rgb(60,90,150)); poi(c,cx-330-px,cy+210-py,"BANCO",Color.rgb(50,130,90));
        }
        void poi(Canvas c,float x,float y,String s,int color){ p.setColor(color); c.drawCircle(x,y,34,p); p.setColor(Color.WHITE); p.setTextSize(13); p.setTextAlign(Paint.Align.CENTER); c.drawText(s,x,y+55,p); p.setTextAlign(Paint.Align.LEFT); }

        void drawPlayer(Canvas c,int w,int h){ float x=w/2f,y=h/2f; p.setColor(driving?Color.rgb(240,170,50):PURPLE); if(driving){c.drawRoundRect(x-32,y-18,x+32,y+18,10,10,p); p.setColor(Color.BLACK); c.drawRect(x-20,y-12,x+20,y-4,p);} else {c.drawCircle(x,y,22,p); p.setColor(Color.WHITE); c.drawCircle(x,y-7,8,p);} }

        void drawHud(Canvas c,int w,int h){
            p.setColor(Color.argb(225,7,10,18)); c.drawRoundRect(18,16,500,118,18,18,p); p.setColor(Color.WHITE); p.setTextSize(22); c.drawText("NYX ROLEPLAY",34,45,p); p.setTextSize(14); c.drawText(playerName+" • "+job,34,69,p); c.drawText("Dinheiro: $"+cash+"   Banco: $"+bank,34,91,p); c.drawText("HP "+hp+"%   Combustível "+fuel+"%",34,111,p);
            p.setColor(Color.argb(220,8,12,20)); c.drawRoundRect(w-205,16,w-18,203,18,18,p); p.setColor(Color.WHITE); p.setTextSize(14); c.drawText("MINIMAPA",w-188,42,p); p.setColor(Color.rgb(45,55,62)); c.drawRect(w-188,55,w-35,185,p); p.setColor(PURPLE); c.drawCircle(w-112,120,6,p); p.setColor(Color.rgb(80,110,160)); c.drawCircle(w-150,92,6,p); p.setColor(Color.rgb(180,70,80)); c.drawCircle(w-75,150,6,p);
            p.setColor(Color.argb(205,6,8,13)); c.drawRoundRect(18,h-145,Math.min(w-240,650),h-20,18,18,p); p.setColor(Color.WHITE); p.setTextSize(13); float yy=h-118; for(int i=Math.max(0,chat.size()-3);i<chat.size();i++){c.drawText(chat.get(i),32,yy,p);yy+=28;}
        }

        void button(Canvas c,float l,float t,float r,float b,String text,boolean active){ p.setColor(active?PURPLE:Color.argb(225,16,21,32)); c.drawRoundRect(l,t,r,b,18,18,p); p.setColor(Color.WHITE); p.setTextSize(15); p.setTextAlign(Paint.Align.CENTER); c.drawText(text,(l+r)/2,(t+b)/2+5,p); p.setTextAlign(Paint.Align.LEFT); }
        void drawControls(Canvas c,int w,int h){
            float baseX=115,baseY=h-82; p.setColor(Color.argb(100,255,255,255)); c.drawCircle(baseX,baseY,76,p); p.setColor(Color.argb(220,139,92,246)); c.drawCircle(baseX+joyX,baseY+joyY,32,p);
            button(c,w-205,h-270,w-25,h-210,"CARRO",driving); button(c,w-205,h-195,w-25,h-135,"TRABALHAR",working); button(c,w-205,h-120,w-25,h-60,"CELULAR",false); button(c,w-410,h-120,w-225,h-60,"EMPREGO",false);
        }

        @Override public boolean onTouchEvent(android.view.MotionEvent e){ float x=e.getX(),y=e.getY(); int action=e.getActionMasked(); int w=getWidth(),h=getHeight();
            if(action==MotionEvent.ACTION_DOWN || action==MotionEvent.ACTION_MOVE){
                if(x<260 && y>h-190){ joyX=Math.max(-55,Math.min(55,x-115)); joyY=Math.max(-55,Math.min(55,y-(h-82))); invalidate(); return true; }
            }
            if(action==MotionEvent.ACTION_UP){
                if(x<260 && y>h-190){ moveFromJoy(); joyX=joyY=0; return true; }
                if(x>w-215 && y>h-285 && y<h-205){ driving=!driving; chat.add(driving?"Você entrou no veículo.":"Você saiu do veículo."); return true; }
                if(x>w-215 && y>h-205 && y<h-130){ work(); return true; }
                if(x>w-215 && y>h-130){ phone(); return true; }
                if(x>w-420 && x<w-215 && y>h-130){ chooseJob(); return true; }
            }
            return true;
        }
        void moveFromJoy(){ float speed=driving?10f:5f; px += joyX/55f*speed; py += joyY/55f*speed; fuel=driving?Math.max(0,fuel-1):fuel; }
        void work(){ if(job.equals("Desempregado")){chat.add("Você precisa escolher um emprego.");return;} if(working){return;} working=true; workUntil=System.currentTimeMillis()+4000; chat.add("Trabalho iniciado como "+job+"..."); }
        void chooseJob(){ final String[] opts=jobs; new AlertDialog.Builder(MainActivity.this).setTitle("Escolha seu emprego").setItems(opts,(d,which)->{job=opts[which]; chat.add("Emprego: "+job+" ($"+salaries.get(job)+")");save();}).setNegativeButton("Cancelar",null).show(); }
        void phone(){ String[] opts={"Banco: depositar $100","Banco: sacar $100","Organização","Atendimento"}; new AlertDialog.Builder(MainActivity.this).setTitle("Celular Nyx").setItems(opts,(d,which)->{if(which==0&&cash>=100){cash-=100;bank+=100;chat.add("Banco: depósito de $100.");save();}else if(which==1&&bank>=100){bank-=100;cash+=100;chat.add("Banco: saque de $100.");save();}else if(which==2){org=org.equals("Nenhuma")?"Cidadãos de Nyx":"Nenhuma";chat.add("Organização: "+org);}else chat.add("Atendimento: chamado registrado.");}).setNegativeButton("Fechar",null).show(); }
    }
}
