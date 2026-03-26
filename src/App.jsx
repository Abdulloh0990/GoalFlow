import { useState, useEffect, useMemo, useCallback, useRef } from "react";

// ── XP & Achievement System ─────────────────────────────────────
const ACHIEVEMENTS = [
  { id:"first",     icon:"🎯", title:"First Step",    desc:"Complete your first goal",        xp:50  },
  { id:"streak3",   icon:"🔥", title:"On Fire",       desc:"3-day streak achieved",           xp:30  },
  { id:"streak7",   icon:"⚡", title:"Week Warrior",  desc:"7-day streak achieved",           xp:70  },
  { id:"streak30",  icon:"👑", title:"Month Master",  desc:"30-day streak achieved",          xp:300 },
  { id:"goals10",   icon:"📋", title:"Planner Pro",   desc:"Created 10 goals",                xp:50  },
  { id:"done10",    icon:"✨", title:"Achiever",      desc:"Completed 10 goals",              xp:100 },
  { id:"done50",    icon:"🏆", title:"Legend",        desc:"Completed 50 goals",              xp:500 },
  { id:"allcats",   icon:"🌈", title:"Balanced",      desc:"Goals in all 6 categories",       xp:100 },
  { id:"speedrun",  icon:"🚀", title:"Speed Runner",  desc:"Completed goal same day created", xp:30  },
  { id:"earlybird", icon:"🐦", title:"Early Bird",    desc:"Completed goal before deadline",  xp:50  },
  { id:"lv10",      icon:"⭐", title:"Rising Star",   desc:"Reached Level 10",                xp:200 },
  { id:"subtask20", icon:"☑️", title:"Detail Master", desc:"Completed 20 subtasks total",     xp:75  },
  { id:"pom5",      icon:"🍅", title:"Deep Worker",   desc:"Completed 5 Pomodoro sessions",   xp:50  },
  { id:"pinmaster", icon:"📌", title:"Prioritizer",   desc:"Pinned 5 goals",                  xp:25  },
  { id:"lv25",      icon:"💎", title:"Elite",         desc:"Reached Level 25",                xp:500 },
];
const XP_VAL = { goal:50, critical:50, high:30, medium:10, low:0, subtask:5, create:2, pomodoro:5 };
const getLvl = (xp) => Math.floor(xp/200)+1;
const getLvlPct = (xp) => ((xp%200)/200)*100;
const getLvlTitle = (lv) => lv>=25?"💎 Elite":lv>=15?"🔮 Expert":lv>=10?"⭐ Advanced":lv>=5?"🌱 Intermediate":"🌟 Beginner";
const CAT_EMOJI = { work:"💼",personal:"🌟",health:"💪",learning:"📚",finance:"💰",other:"✨" };

// ── Translations ────────────────────────────────────────────────
const T = {
  en: {
    appTitle:"GoalFlow",appSubtitle:"Achieve what matters",addGoal:"Add Goal",editGoal:"Edit Goal",saveChanges:"Save",cancel:"Cancel",
    taskTitle:"Title",taskTitlePlaceholder:"What do you want to achieve?",taskDesc:"Description",taskDescPlaceholder:"Add details...",
    priority:"Priority",low:"Low",medium:"Medium",high:"High",critical:"Critical",
    deadline:"Deadline",category:"Category",tags:"Tags",
    search:"Search goals...",all:"All",active:"Active",completed:"Completed",archived:"Archived",
    totalGoals:"Total",completedGoals:"Done",activeGoals:"Active",streak:"Streak",
    todayCompleted:"Today",overallProgress:"Progress",
    emptyTitle:"No goals yet",emptyDesc:"Add your first goal below",emptySearch:"No results",deleteConfirm:"Delete this goal?",
    toastAdded:"Goal added! 🎯",toastUpdated:"Goal updated! ✨",toastDeleted:"Goal deleted",toastCompleted:"Goal completed! 🎉",
    toastUndone:"Marked as active",toastArchived:"Goal archived",
    overdue:"Overdue",dueToday:"Due today",dueTomorrow:"Due tomorrow",
    subtasks:"Subtasks",addSubtask:"Add subtask...",of:"of",notes:"Notes",notesPlaceholder:"Private notes...",
    archive:"Archive",unarchive:"Restore",duplicate:"Duplicate",exportData:"Export",importData:"Import",
    sortBy:"Sort",sortCreated:"Created",sortPriority:"Priority",sortDeadline:"Deadline",sortTitle:"Title",
    pomodoro:"Pomodoro",pomStart:"Start",pomStop:"Stop",
    focusMode:"Focus Mode",exitFocus:"Exit Focus",stats:"Statistics",weeklyStats:"This Week",
    cat_work:"Work",cat_personal:"Personal",cat_health:"Health",cat_learning:"Learning",cat_finance:"Finance",cat_other:"Other",
    quickAdd:"Enter to add",pin:"Pin",unpin:"Unpin",
    bulkSelect:"Select",bulkDelete:"Delete",bulkComplete:"Complete",deselectAll:"Deselect",
    mood:"Mood",moodGreat:"Great",moodGood:"Good",moodOkay:"Okay",moodBad:"Bad",
    templateUse:"Templates",keyboardShortcuts:"Shortcuts",shortcutsHint:"? for help",
    aiBreakdown:"✦ AI subtasks",aiThinking:"Thinking...",
    // NEW
    level:"Level",xpLabel:"XP",achievements:"Achievements",achievUnlocked:"Achievement Unlocked!",
    aiCoach:"AI Coach",aiCoachPH:"Ask your goal coach...",aiCoachSend:"Send",aiCoachClear:"Clear",
    visionBoard:"Board",listView:"List",
    timeTracker:"Timer",startTimer:"Start",stopTimer:"Stop",resetTimer:"Reset",totalTime:"Total",
    projects:"Projects",addProject:"Add project",noProject:"No project",assignProject:"Assign project",
    recurring:"Recurring",daily:"Daily",weekly:"Weekly",monthly:"Monthly",
    habitToday:"Today's habit",impactScore:"Impact",
    newGoalBonus:"+XP earned!",levelUp:"Level Up! 🎉",
    radarChart:"Category Radar",groupBy:"Group",groupNone:"None",groupProject:"Project",groupCategory:"Category",
    sortWeight:"Impact",goalTimer:"Goal Timer",
  },
  ru: {
    appTitle:"GoalFlow",appSubtitle:"Достигайте главного",addGoal:"Добавить цель",editGoal:"Редактировать",saveChanges:"Сохранить",cancel:"Отмена",
    taskTitle:"Название",taskTitlePlaceholder:"Чего хотите достичь?",taskDesc:"Описание",taskDescPlaceholder:"Детали...",
    priority:"Приоритет",low:"Низкий",medium:"Средний",high:"Высокий",critical:"Критичный",
    deadline:"Дедлайн",category:"Категория",tags:"Теги",
    search:"Поиск...",all:"Все",active:"Активные",completed:"Выполненные",archived:"Архив",
    totalGoals:"Всего",completedGoals:"Готово",activeGoals:"Активных",streak:"Стрик",
    todayCompleted:"Сегодня",overallProgress:"Прогресс",
    emptyTitle:"Целей нет",emptyDesc:"Добавьте первую цель",emptySearch:"Ничего не найдено",deleteConfirm:"Удалить цель?",
    toastAdded:"Цель добавлена! 🎯",toastUpdated:"Цель обновлена! ✨",toastDeleted:"Цель удалена",toastCompleted:"Цель выполнена! 🎉",
    toastUndone:"Помечено активным",toastArchived:"Цель архивирована",
    overdue:"Просрочено",dueToday:"Сегодня",dueTomorrow:"Завтра",
    subtasks:"Подзадачи",addSubtask:"Добавить...",of:"из",notes:"Заметки",notesPlaceholder:"Личные заметки...",
    archive:"Архив",unarchive:"Восстановить",duplicate:"Дублировать",exportData:"Экспорт",importData:"Импорт",
    sortBy:"Сорт.",sortCreated:"Дата",sortPriority:"Приоритет",sortDeadline:"Дедлайн",sortTitle:"Название",
    pomodoro:"Помодоро",pomStart:"Старт",pomStop:"Стоп",
    focusMode:"Фокус",exitFocus:"Выйти",stats:"Статистика",weeklyStats:"Эта неделя",
    cat_work:"Работа",cat_personal:"Личное",cat_health:"Здоровье",cat_learning:"Обучение",cat_finance:"Финансы",cat_other:"Другое",
    quickAdd:"Enter для добавления",pin:"Закрепить",unpin:"Открепить",
    bulkSelect:"Выбрать",bulkDelete:"Удалить",bulkComplete:"Завершить",deselectAll:"Снять",
    mood:"Настроение",moodGreat:"Отлично",moodGood:"Хорошо",moodOkay:"Нормально",moodBad:"Плохо",
    templateUse:"Шаблоны",keyboardShortcuts:"Горячие клавиши",shortcutsHint:"? справка",
    aiBreakdown:"✦ AI подзадачи",aiThinking:"Думаю...",
    level:"Уровень",xpLabel:"XP",achievements:"Достижения",achievUnlocked:"Достижение открыто!",
    aiCoach:"AI Коуч",aiCoachPH:"Спросите коуча...",aiCoachSend:"Отправить",aiCoachClear:"Очистить",
    visionBoard:"Доска",listView:"Список",
    timeTracker:"Таймер",startTimer:"Старт",stopTimer:"Стоп",resetTimer:"Сброс",totalTime:"Всего",
    projects:"Проекты",addProject:"Новый проект",noProject:"Без проекта",assignProject:"Проект",
    recurring:"Повтор",daily:"Ежедневно",weekly:"Еженедельно",monthly:"Ежемесячно",
    habitToday:"Привычка сегодня",impactScore:"Вес",
    newGoalBonus:"+XP получено!",levelUp:"Уровень повышен! 🎉",
    radarChart:"Радар категорий",groupBy:"Группа",groupNone:"Нет",groupProject:"Проект",groupCategory:"Категория",
    sortWeight:"Важность",goalTimer:"Таймер цели",
  },
  uz: {
    appTitle:"GoalFlow",appSubtitle:"Muhimga erishing",addGoal:"Maqsad qo'shish",editGoal:"Tahrirlash",saveChanges:"Saqlash",cancel:"Bekor",
    taskTitle:"Nomi",taskTitlePlaceholder:"Nima erishmoqchisiz?",taskDesc:"Tavsif",taskDescPlaceholder:"Tafsilotlar...",
    priority:"Ustuvorlik",low:"Past",medium:"O'rta",high:"Yuqori",critical:"Muhim",
    deadline:"Muddat",category:"Kategoriya",tags:"Teglar",
    search:"Qidirish...",all:"Barchasi",active:"Faol",completed:"Bajarilgan",archived:"Arxiv",
    totalGoals:"Jami",completedGoals:"Bajarildi",activeGoals:"Faol",streak:"Ketma-ket",
    todayCompleted:"Bugun",overallProgress:"Umumiy",
    emptyTitle:"Maqsad yo'q",emptyDesc:"Birinchi maqsadingizni qo'shing",emptySearch:"Natija topilmadi",deleteConfirm:"O'chirasizmi?",
    toastAdded:"Qo'shildi! 🎯",toastUpdated:"Yangilandi! ✨",toastDeleted:"O'chirildi",toastCompleted:"Bajarildi! 🎉",
    toastUndone:"Faolga o'tkazildi",toastArchived:"Arxivlandi",
    overdue:"Muddati o'tgan",dueToday:"Bugun",dueTomorrow:"Ertaga",
    subtasks:"Kichik vazifalar",addSubtask:"Vazifa qo'shish...",of:"dan",notes:"Eslatmalar",notesPlaceholder:"Shaxsiy eslatmalar...",
    archive:"Arxiv",unarchive:"Tiklash",duplicate:"Nusxa",exportData:"Export",importData:"Import",
    sortBy:"Saralash",sortCreated:"Sana",sortPriority:"Ustuvorlik",sortDeadline:"Muddat",sortTitle:"Nom",
    pomodoro:"Pomodoro",pomStart:"Boshlash",pomStop:"To'xtatish",
    focusMode:"Fokus",exitFocus:"Chiqish",stats:"Statistika",weeklyStats:"Bu hafta",
    cat_work:"Ish",cat_personal:"Shaxsiy",cat_health:"Salomatlik",cat_learning:"O'rganish",cat_finance:"Moliya",cat_other:"Boshqa",
    quickAdd:"Enter bilan qo'shish",pin:"Mahkamlash",unpin:"Olib tashlash",
    bulkSelect:"Tanlash",bulkDelete:"O'chirish",bulkComplete:"Bajarish",deselectAll:"Bekor",
    mood:"Kayfiyat",moodGreat:"A'lo",moodGood:"Yaxshi",moodOkay:"Normal",moodBad:"Yomon",
    templateUse:"Shablonlar",keyboardShortcuts:"Yorliqlar",shortcutsHint:"? yordam",
    aiBreakdown:"✦ AI vazifalar",aiThinking:"O'ylamoqda...",
    level:"Daraja",xpLabel:"XP",achievements:"Yutuqlar",achievUnlocked:"Yutuq ochildi!",
    aiCoach:"AI Murabbiy",aiCoachPH:"Murabbiydan so'rang...",aiCoachSend:"Yuborish",aiCoachClear:"Tozalash",
    visionBoard:"Daftar",listView:"Ro'yxat",
    timeTracker:"Taymer",startTimer:"Boshlash",stopTimer:"To'xtatish",resetTimer:"Qayta",totalTime:"Jami",
    projects:"Loyihalar",addProject:"Loyiha qo'shish",noProject:"Loyihasiz",assignProject:"Loyiha",
    recurring:"Takroriy",daily:"Har kun",weekly:"Har hafta",monthly:"Har oy",
    habitToday:"Bugungi odat",impactScore:"Ta'sir",
    newGoalBonus:"+XP olindi!",levelUp:"Daraja ko'tarildi! 🎉",
    radarChart:"Kategoriya radari",groupBy:"Guruh",groupNone:"Yo'q",groupProject:"Loyiha",groupCategory:"Kategoriya",
    sortWeight:"Muhimlik",goalTimer:"Maqsad taymeri",
  },
};

const uid = () => `g_${Date.now()}_${Math.random().toString(36).substr(2,9)}`;
const todayStr = () => new Date().toISOString().split("T")[0];
const fmtTime = (s) => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60; return h>0?`${h}:${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`; };
const PRIORITIES = ["critical","high","medium","low"];
const PRIORITY_ORDER = { critical:0, high:1, medium:2, low:3 };
const CATEGORIES = ["work","personal","health","learning","finance","other"];
const CAT_COLOR = { work:"#3b82f6",personal:"#a855f7",health:"#10b981",learning:"#f59e0b",finance:"#06b6d4",other:"#6b7280" };
const PRI_STYLE = {
  critical:{ bg:"rgba(239,68,68,0.12)",text:"#dc2626",border:"rgba(239,68,68,0.3)" },
  high:    { bg:"rgba(249,115,22,0.12)",text:"#ea580c",border:"rgba(249,115,22,0.3)" },
  medium:  { bg:"rgba(217,119,6,0.12)", text:"#b45309",border:"rgba(217,119,6,0.3)"  },
  low:     { bg:"rgba(22,163,74,0.12)", text:"#15803d",border:"rgba(22,163,74,0.3)"  },
};
const MOODS = [{key:"great",emoji:"🤩"},{key:"good",emoji:"😊"},{key:"okay",emoji:"😐"},{key:"bad",emoji:"😔"}];
const QUOTES = [
  "Every goal starts with a decision to try.",
  "Small steps every day lead to big results.",
  "Focus on progress, not perfection.",
  "Your future self will thank you.",
  "One goal at a time. Full focus.",
  "Consistency beats intensity every time.",
];
const DEFAULT_TEMPLATES = [
  {id:"t1",title:"Read 20 pages",category:"learning",priority:"medium",desc:"Build a daily reading habit",tags:"reading,habit",weight:6,subtasks:[{id:"s1",title:"Find book",done:false},{id:"s2",title:"Set reading time",done:false}]},
  {id:"t2",title:"Morning workout",category:"health",priority:"high",desc:"Start the day with energy",tags:"fitness",weight:8,subtasks:[{id:"s3",title:"Warm up 5min",done:false},{id:"s4",title:"Main workout",done:false}]},
  {id:"t3",title:"Weekly review",category:"work",priority:"high",desc:"Reflect and plan ahead",tags:"planning",weight:7,subtasks:[{id:"s5",title:"Review last week",done:false},{id:"s6",title:"Plan next week",done:false}]},
  {id:"t4",title:"Learn new skill",category:"learning",priority:"medium",desc:"Invest in yourself",tags:"growth",weight:7,subtasks:[{id:"s7",title:"Find resources",done:false},{id:"s8",title:"Practice daily",done:false}]},
  {id:"t5",title:"Save money",category:"finance",priority:"high",desc:"Build financial discipline",tags:"finance",weight:9,subtasks:[{id:"s9",title:"Track expenses",done:false},{id:"s10",title:"Cut costs",done:false}]},
  {id:"t6",title:"Connect with someone",category:"personal",priority:"low",desc:"Nurture relationships",tags:"social",weight:5,subtasks:[{id:"s11",title:"Choose a person",done:false},{id:"s12",title:"Schedule call",done:false}]},
];

const getDeadlineStatus = (dl,done) => {
  if(!dl)return null; if(done)return "done";
  const now=todayStr(), tom=new Date(); tom.setDate(tom.getDate()+1);
  const ts=tom.toISOString().split("T")[0];
  if(dl<now)return "overdue"; if(dl===now)return "today"; if(dl===ts)return "tomorrow";
  return "upcoming";
};
const ls = {
  get:(k,fb)=>{ try{const v=localStorage.getItem(k);return v?JSON.parse(v):fb;}catch{return fb;} },
  set:(k,v)=>{ try{localStorage.setItem(k,JSON.stringify(v));}catch{} },
};

// ─────────────────────────────────────────────
//  CONFETTI
// ─────────────────────────────────────────────
const Confetti = ({active}) => {
  const [p,setP]=useState([]);
  useEffect(()=>{
    if(!active)return;
    const c=["#f59e0b","#10b981","#3b82f6","#ec4899","#8b5cf6","#f97316"];
    setP(Array.from({length:90},(_,i)=>({id:i,left:`${Math.random()*100}%`,col:c[Math.floor(Math.random()*c.length)],sz:Math.random()*8+3,dl:Math.random()*3,dr:Math.random()*2+1.5})));
    const t=setTimeout(()=>setP([]),5000); return()=>clearTimeout(t);
  },[active]);
  if(!p.length)return null;
  return <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>{p.map(x=><div key={x.id} style={{position:"absolute",top:0,left:x.left,width:x.sz,height:x.sz,background:x.col,borderRadius:"50%",animation:`cfFall ${x.dr}s ${x.dl}s ease-in forwards`}}/>)}</div>;
};

// ─────────────────────────────────────────────
//  TOASTS
// ─────────────────────────────────────────────
const Toasts = ({toasts,onUndo}) => (
  <div style={{position:"fixed",bottom:56,right:14,zIndex:8888,display:"flex",flexDirection:"column",gap:7,maxWidth:"calc(100vw - 28px)"}}>
    {toasts.map(t=>(
      <div key={t.id} style={{padding:"10px 15px",borderRadius:11,fontSize:13,fontWeight:600,boxShadow:"0 8px 28px rgba(0,0,0,0.28)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",gap:9,
        background:t.type==="success"?"rgba(16,185,129,0.95)":t.type==="xp"?"rgba(99,102,241,0.95)":t.type==="error"?"rgba(239,68,68,0.95)":"rgba(99,102,241,0.95)",color:"#fff",
        transform:t.visible?"translateY(0) scale(1)":"translateY(14px) scale(0.95)",opacity:t.visible?1:0,transition:"all 0.28s cubic-bezier(0.34,1.56,0.64,1)"}}>
        <span style={{flex:1}}>{t.message}</span>
        {t.undoable&&<button onClick={()=>onUndo(t.id)} style={{background:"rgba(255,255,255,0.22)",border:"none",borderRadius:7,padding:"3px 9px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Undo</button>}
      </div>
    ))}
  </div>
);

// ─────────────────────────────────────────────
//  ACHIEVEMENT NOTIFICATION
// ─────────────────────────────────────────────
const AchievNotif = ({achiev,t,th,onClose}) => {
  useEffect(()=>{ const timer=setTimeout(onClose,4000); return()=>clearTimeout(timer); },[onClose]);
  if(!achiev)return null;
  return (
    <div style={{position:"fixed",top:20,left:"50%",transform:"translateX(-50%)",zIndex:9997,
      background:"linear-gradient(135deg,rgba(99,102,241,0.97),rgba(168,85,247,0.97))",
      borderRadius:14,padding:"13px 20px",boxShadow:"0 16px 48px rgba(99,102,241,0.45)",
      display:"flex",alignItems:"center",gap:12,maxWidth:320,animation:"slideDown 0.4s cubic-bezier(0.34,1.56,0.64,1)"}}>
      <span style={{fontSize:28}}>{achiev.icon}</span>
      <div>
        <div style={{fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.75)",letterSpacing:"0.1em",textTransform:"uppercase"}}>{t.achievUnlocked}</div>
        <div style={{fontSize:14,fontWeight:800,color:"#fff"}}>{achiev.title}</div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.7)"}}>{achiev.desc} · +{achiev.xp} XP</div>
      </div>
      <button onClick={onClose} style={{background:"rgba(255,255,255,0.15)",border:"none",borderRadius:7,width:22,height:22,cursor:"pointer",color:"#fff",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
    </div>
  );
};

// ─────────────────────────────────────────────
//  RADAR CHART
// ─────────────────────────────────────────────
const RadarChart = ({byCat,th,accent,t}) => {
  const cats=CATEGORIES;const N=cats.length;const size=160;const cx=size/2,cy=size/2,r=62;
  const angle=(i)=>((i/N)*2*Math.PI)-Math.PI/2;
  const pt=(i,pct)=>{const a=angle(i);const dist=r*(pct/100);return{x:cx+dist*Math.cos(a),y:cy+dist*Math.sin(a)};};
  const pts=cats.map((c,i)=>{const d=byCat[c];const pct=d&&d.total?Math.round((d.done/d.total)*100):0;return pt(i,Math.max(pct,5));});
  const polygonPts=pts.map(p=>`${p.x},${p.y}`).join(" ");
  const gridLevels=[25,50,75,100];
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{maxWidth:180}}>
      {gridLevels.map(gl=>{
        const gpts=cats.map((_,i)=>pt(i,gl));
        return <polygon key={gl} points={gpts.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke={th.border} strokeWidth="0.8" strokeDasharray={gl===100?"none":"3,3"}/>;
      })}
      {cats.map((_,i)=>{const outer=pt(i,100);return <line key={i} x1={cx} y1={cy} x2={outer.x} y2={outer.y} stroke={th.border} strokeWidth="0.8"/>;  })}
      <polygon points={polygonPts} fill={`${accent}25`} stroke={accent} strokeWidth="1.5" strokeLinejoin="round"/>
      {pts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r="3" fill={accent}/>)}
      {cats.map((c,i)=>{
        const lp=pt(i,120);
        return <text key={c} x={lp.x} y={lp.y} textAnchor="middle" dominantBaseline="middle" fontSize="9" fontWeight="700" fill={th.textSub}>{CAT_EMOJI[c]}</text>;
      })}
    </svg>
  );
};

// ─────────────────────────────────────────────
//  POMODORO
// ─────────────────────────────────────────────
const Pomodoro = ({t,th,goalTitle,onSession}) => {
  const [mode,setMode]=useState("work");
  const [time,setTime]=useState(25*60);
  const [running,setRunning]=useState(false);
  const [sessions,setSessions]=useState(0);
  const ref=useRef(null);
  const DUR={work:25*60,short:5*60,long:15*60};
  useEffect(()=>{
    if(running){ref.current=setInterval(()=>setTime(p=>{if(p<=1){clearInterval(ref.current);setRunning(false);if(mode==="work"){setSessions(s=>s+1);onSession&&onSession();}return 0;}return p-1;}),1000);}
    else clearInterval(ref.current);
    return()=>clearInterval(ref.current);
  },[running,mode,onSession]);
  const reset=(m=mode)=>{setMode(m);setTime(DUR[m]);setRunning(false);};
  const mm=String(Math.floor(time/60)).padStart(2,"0"), ss2=String(time%60).padStart(2,"0");
  const pct=(time/DUR[mode])*100, r=33, circ=2*Math.PI*r;
  return (
    <div style={{borderRadius:13,padding:"13px 15px",background:th.card,border:`1px solid ${th.border}`,boxShadow:th.shadow}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
        <span style={{fontSize:11,fontWeight:700,letterSpacing:"0.07em",textTransform:"uppercase",color:th.muted}}>🍅 {t.pomodoro}</span>
        {goalTitle&&<span style={{fontSize:10,color:th.muted}}>→ {goalTitle.slice(0,16)}</span>}
        <span style={{fontSize:11,color:th.muted}}>✦{sessions}</span>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:13}}>
        <div style={{position:"relative",width:80,height:80,flexShrink:0}}>
          <svg width="80" height="80" style={{transform:"rotate(-90deg)"}}>
            <circle cx="40" cy="40" r={r} fill="none" stroke={th.btnBg} strokeWidth="4"/>
            <circle cx="40" cy="40" r={r} fill="none" stroke={mode==="work"?"#f97316":"#10b981"} strokeWidth="4"
              strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 1s linear"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <span style={{fontSize:14,fontWeight:800,color:th.text}}>{mm}:{ss2}</span>
          </div>
        </div>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:4,marginBottom:7}}>
            {["work","short","long"].map(m=>(
              <button key={m} onClick={()=>reset(m)} style={{flex:1,padding:"4px 0",borderRadius:7,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,
                background:mode===m?(m==="work"?"#f97316":"#10b981"):th.btnBg,color:mode===m?"#fff":th.muted,transition:"all 0.2s"}}>
                {m==="work"?"25m":m==="short"?"5m":"15m"}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:5}}>
            <button onClick={()=>setRunning(r=>!r)} style={{flex:1,padding:"6px 0",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,
              background:running?"#ef4444":(mode==="work"?"#f97316":"#10b981"),color:"#fff",transition:"all 0.2s"}}>
              {running?t.pomStop:t.pomStart}
            </button>
            <button onClick={()=>reset()} style={{padding:"6px 11px",borderRadius:8,border:"none",cursor:"pointer",fontWeight:700,fontSize:13,background:th.btnBg,color:th.text}}>↺</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  SUBTASK LIST
// ─────────────────────────────────────────────
const SubtaskList = ({subtasks,onChange,th,t}) => {
  const [val,setVal]=useState("");
  const add=()=>{if(!val.trim())return;onChange([...subtasks,{id:uid(),title:val.trim(),done:false}]);setVal("");};
  const toggle=id=>onChange(subtasks.map(s=>s.id===id?{...s,done:!s.done}:s));
  const remove=id=>onChange(subtasks.filter(s=>s.id!==id));
  const done=subtasks.filter(s=>s.done).length;
  const inp={flex:1,borderRadius:8,padding:"6px 10px",fontSize:12,background:th.inputBg,border:`1px solid ${th.border}`,color:th.text,outline:"none"};
  return (
    <div>
      {subtasks.length>0&&(
        <div style={{marginBottom:8}}>
          <div style={{height:3,borderRadius:3,background:th.btnBg,marginBottom:8,overflow:"hidden"}}>
            <div style={{height:"100%",borderRadius:3,background:`linear-gradient(90deg,${th.accent},#a855f7)`,width:`${(done/subtasks.length)*100}%`,transition:"width 0.5s ease"}}/>
          </div>
          {subtasks.map(s=>(
            <div key={s.id} style={{display:"flex",alignItems:"center",gap:8,padding:"3px 0"}}>
              <button onClick={()=>toggle(s.id)} style={{width:16,height:16,borderRadius:4,flexShrink:0,cursor:"pointer",border:`2px solid ${s.done?th.accent:th.border}`,background:s.done?th.accent:"transparent",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:9,fontWeight:900,transition:"all 0.2s"}}>{s.done?"✓":""}</button>
              <span style={{fontSize:12,flex:1,color:s.done?th.muted:th.text,textDecoration:s.done?"line-through":"none"}}>{s.title}</span>
              <button onClick={()=>remove(s.id)} style={{background:"none",border:"none",cursor:"pointer",color:th.muted,fontSize:12,padding:"0 2px",lineHeight:1}}>✕</button>
            </div>
          ))}
          {done>0&&<div style={{fontSize:10,color:th.muted,marginTop:3}}>{done} {t.of} {subtasks.length}</div>}
        </div>
      )}
      <div style={{display:"flex",gap:6}}>
        <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()} placeholder={t.addSubtask} style={inp}/>
        <button onClick={add} style={{padding:"6px 10px",borderRadius:8,border:"none",cursor:"pointer",background:`${th.accent}1a`,color:th.accent,fontWeight:700,fontSize:13}}>+</button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  AI SUBTASK GENERATOR
// ─────────────────────────────────────────────
const AIGen = ({goalTitle,th,t,onSubtasks}) => {
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState(null);
  const go=async()=>{
    if(!goalTitle.trim())return;
    setLoading(true);setErr(null);
    try{
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:500,messages:[{role:"user",content:`Break down this goal into 4-6 actionable subtasks. Goal: "${goalTitle}". Reply ONLY with a JSON array of strings, no explanation. Example: ["subtask1","subtask2"]`}]})});
      const d=await r.json();
      const txt=d.content?.find(b=>b.type==="text")?.text||"[]";
      const arr=JSON.parse(txt.replace(/```json|```/g,"").trim());
      if(Array.isArray(arr))onSubtasks(arr.map(s=>({id:uid(),title:String(s),done:false})));
    }catch{setErr("AI unavailable");}
    setLoading(false);
  };
  return (
    <div>
      <button onClick={go} disabled={loading||!goalTitle.trim()} style={{
        padding:"4px 10px",borderRadius:7,border:`1px solid ${th.accent}45`,cursor:loading||!goalTitle.trim()?"not-allowed":"pointer",
        fontSize:11,fontWeight:700,background:`${th.accent}12`,color:th.accent,
        opacity:!goalTitle.trim()?0.45:1,display:"flex",alignItems:"center",gap:5,transition:"all 0.2s"}}>
        {loading?<><span style={{display:"inline-block",animation:"spin 1s linear infinite"}}>⟳</span>{t.aiThinking}</>:t.aiBreakdown}
      </button>
      {err&&<div style={{fontSize:10,color:"#ef4444",marginTop:3}}>{err}</div>}
    </div>
  );
};

// ─────────────────────────────────────────────
//  AI COACH PANEL
// ─────────────────────────────────────────────
const AICoach = ({goals,t,th,accent,onClose}) => {
  const [msgs,setMsgs]=useState([{role:"assistant",content:"👋 Hi! I'm your AI Goal Coach. Tell me about your goals and I'll help you achieve them!"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>bottomRef.current?.scrollIntoView({behavior:"smooth"}),[msgs]);

  const send=async()=>{
    if(!input.trim()||loading)return;
    const userMsg={role:"user",content:input.trim()};
    const newMsgs=[...msgs,userMsg];
    setMsgs(newMsgs);setInput("");setLoading(true);
    try{
      const goalSummary=goals.filter(g=>!g.archived).slice(0,10).map(g=>`- ${g.title} (${g.priority}, ${g.category}, ${g.completed?"done":"active"})`).join("\n");
      const r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:400,
          system:`You are an expert goal achievement coach. Be concise, motivating, and practical. The user's current goals:\n${goalSummary}`,
          messages:newMsgs.filter(m=>m.role!=="assistant"||msgs.indexOf(m)>0).map(m=>({role:m.role,content:m.content}))})});
      const d=await r.json();
      const reply=d.content?.find(b=>b.type==="text")?.text||"I'm here to help!";
      setMsgs(p=>[...p,{role:"assistant",content:reply}]);
    }catch{setMsgs(p=>[...p,{role:"assistant",content:"Connection error. Please try again."}]);}
    setLoading(false);
  };

  const inp={width:"100%",borderRadius:9,padding:"8px 11px",background:th.inputBg,border:`1px solid ${th.border}`,color:th.text,fontSize:12,outline:"none",boxSizing:"border-box",resize:"none"};

  return (
    <div style={{position:"fixed",right:0,top:0,bottom:0,width:"min(340px,100vw)",zIndex:9980,
      background:th.dark?"rgba(8,12,20,0.97)":th.card,backdropFilter:"blur(24px)",
      borderLeft:`1px solid ${th.border}`,display:"flex",flexDirection:"column",boxShadow:"-8px 0 32px rgba(0,0,0,0.3)"}}>
      <div style={{padding:"14px 16px",borderBottom:`1px solid ${th.border}`,display:"flex",alignItems:"center",gap:9}}>
        <span style={{fontSize:18}}>🤖</span>
        <div style={{flex:1}}>
          <div style={{fontWeight:800,fontSize:13,color:th.text}}>{t.aiCoach}</div>
          <div style={{fontSize:10,color:th.muted}}>Powered by Claude</div>
        </div>
        <button onClick={()=>setMsgs([{role:"assistant",content:"Chat cleared! How can I help?"}])} style={{background:th.btnBg,border:"none",cursor:"pointer",borderRadius:7,padding:"4px 8px",fontSize:10,color:th.muted}}>{t.aiCoachClear}</button>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:th.muted,lineHeight:1}}>×</button>
      </div>
      <div style={{flex:1,overflow:"auto",padding:"12px 14px",display:"flex",flexDirection:"column",gap:9}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
            <div style={{maxWidth:"85%",borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",
              padding:"8px 12px",fontSize:12,lineHeight:1.55,fontWeight:500,
              background:m.role==="user"?`linear-gradient(135deg,${accent},${accent}cc)`:`${th.btnBg}`,
              color:m.role==="user"?"#fff":th.text,
              boxShadow:m.role==="user"?`0 3px 12px ${accent}40`:"none"}}>
              {m.content}
            </div>
          </div>
        ))}
        {loading&&(
          <div style={{display:"flex",gap:4,alignItems:"center",padding:"6px 10px"}}>
            {[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:accent,animation:`pulse 1.2s ${i*0.2}s infinite`}}/>)}
          </div>
        )}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"10px 14px",borderTop:`1px solid ${th.border}`,display:"flex",gap:8}}>
        <textarea value={input} onChange={e=>setInput(e.target.value)}
          onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}}
          placeholder={t.aiCoachPH} rows={2} style={inp}/>
        <button onClick={send} disabled={!input.trim()||loading} style={{
          borderRadius:9,border:"none",cursor:input.trim()&&!loading?"pointer":"not-allowed",
          padding:"0 13px",fontWeight:700,fontSize:12,color:"#fff",
          background:input.trim()&&!loading?`linear-gradient(135deg,${accent},${accent}bb)`:"rgba(128,128,128,0.3)",
          transition:"all 0.2s",flexShrink:0}}>
          ↑
        </button>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  VISION BOARD CARD
// ─────────────────────────────────────────────
const VisionCard = ({goal,th,t,accent,onToggle,onEdit}) => {
  const cc=CAT_COLOR[goal.category]||"#6b7280";
  const emoji=CAT_EMOJI[goal.category]||"✨";
  const pc=PRI_STYLE[goal.priority]||PRI_STYLE.medium;
  const sd=(goal.subtasks||[]).filter(s=>s.done).length;
  const st=(goal.subtasks||[]).length;
  const pct=st>0?Math.round((sd/st)*100):goal.completed?100:0;
  const dl=getDeadlineStatus(goal.deadline,goal.completed);
  return (
    <div className="vc" style={{borderRadius:16,overflow:"hidden",background:th.card,
      border:`1px solid ${goal.completed?th.border:`${cc}35`}`,
      boxShadow:goal.completed?th.shadow:`0 4px 20px ${cc}1a`,
      transition:"all 0.25s cubic-bezier(0.4,0,0.2,1)",opacity:goal.completed?0.65:1,
      display:"flex",flexDirection:"column"}}>
      <div style={{background:`linear-gradient(135deg,${cc}22,${cc}08)`,padding:"18px 16px",textAlign:"center",borderBottom:`1px solid ${cc}1a`}}>
        <div style={{fontSize:32,marginBottom:7,lineHeight:1}}>{emoji}</div>
        <div style={{fontSize:10,fontWeight:700,color:cc,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{t[`cat_${goal.category}`]}</div>
        {goal.pinned&&<span style={{fontSize:11}}>📌</span>}
      </div>
      <div style={{padding:"13px 14px",flex:1,display:"flex",flexDirection:"column",gap:7}}>
        <div style={{fontWeight:800,fontSize:13,lineHeight:1.35,color:th.text,textDecoration:goal.completed?"line-through":"none"}}>{goal.title}</div>
        {goal.desc&&<div style={{fontSize:11,color:th.textSub,lineHeight:1.45}}>{goal.desc.slice(0,60)}{goal.desc.length>60?"...":""}</div>}
        <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
          <span style={{padding:"2px 7px",borderRadius:16,fontSize:9,fontWeight:700,textTransform:"uppercase",background:pc.bg,color:pc.text,border:`1px solid ${pc.border}`}}>{t[goal.priority]}</span>
          {goal.deadline&&<span style={{padding:"2px 7px",borderRadius:16,fontSize:9,fontWeight:600,background:dl==="overdue"?"rgba(239,68,68,0.1)":th.btnBg,color:dl==="overdue"?"#dc2626":th.muted}}>📅 {goal.deadline}</span>}
        </div>
        {st>0&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:3,fontSize:9,color:th.muted}}>
              <span>{t.subtasks}</span><span>{sd}/{st}</span>
            </div>
            <div style={{height:4,borderRadius:4,background:th.btnBg,overflow:"hidden"}}>
              <div style={{height:"100%",width:`${pct}%`,borderRadius:4,background:`linear-gradient(90deg,${cc},${cc}99)`,transition:"width 0.5s"}}/>
            </div>
          </div>
        )}
        <div style={{display:"flex",gap:6,marginTop:"auto",paddingTop:5}}>
          <button onClick={()=>onToggle(goal.id)} style={{flex:1,padding:"7px 0",borderRadius:9,border:`1.5px solid ${goal.completed?"#10b981":cc}`,
            cursor:"pointer",fontSize:11,fontWeight:700,
            background:goal.completed?"rgba(16,185,129,0.12)":"transparent",
            color:goal.completed?"#10b981":cc,transition:"all 0.2s"}}>
            {goal.completed?"✓ Done":"○ Complete"}
          </button>
          <button onClick={()=>onEdit(goal)} style={{width:32,height:32,borderRadius:9,border:`1px solid ${th.border}`,
            cursor:"pointer",background:th.btnBg,color:th.muted,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  GOAL TIMER
// ─────────────────────────────────────────────
const GoalTimer = ({goalId,timeData,setTimeData,th,t}) => {
  const td=timeData[goalId]||{total:0,running:false,startedAt:null};
  const [display,setDisplay]=useState(td.total);
  const ref=useRef(null);

  useEffect(()=>{
    if(td.running){
      ref.current=setInterval(()=>{
        const elapsed=Math.floor((Date.now()-td.startedAt)/1000);
        setDisplay(td.total+elapsed);
      },1000);
    } else {
      clearInterval(ref.current);
      setDisplay(td.total);
    }
    return()=>clearInterval(ref.current);
  },[td.running,td.startedAt,td.total]);

  const toggle=()=>{
    setTimeData(prev=>{
      const cur=prev[goalId]||{total:0,running:false,startedAt:null};
      if(cur.running){
        const elapsed=Math.floor((Date.now()-cur.startedAt)/1000);
        return{...prev,[goalId]:{total:cur.total+elapsed,running:false,startedAt:null}};
      }
      return{...prev,[goalId]:{...cur,running:true,startedAt:Date.now()}};
    });
  };
  const reset=()=>setTimeData(prev=>({...prev,[goalId]:{total:0,running:false,startedAt:null}}));

  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:9,background:th.btnBg,border:`1px solid ${th.border}`}}>
      <span style={{fontSize:11,color:th.muted,fontWeight:600}}>⏱️</span>
      <span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:td.running?"#f97316":th.text,flex:1,letterSpacing:"0.05em"}}>{fmtTime(display)}</span>
      <button onClick={toggle} style={{padding:"3px 8px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,
        background:td.running?"rgba(239,68,68,0.15)":"rgba(16,185,129,0.15)",
        color:td.running?"#dc2626":"#059669"}}>
        {td.running?t.stopTimer:t.startTimer}
      </button>
      {td.total>0&&<button onClick={reset} style={{padding:"3px 6px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,background:"transparent",color:th.muted}}>↺</button>}
    </div>
  );
};

// ─────────────────────────────────────────────
//  HEATMAP
// ─────────────────────────────────────────────
const Heatmap = ({goals,th,accent}) => {
  const weeks=8,days=7,cells=[],today=new Date();
  for(let w=weeks-1;w>=0;w--)for(let d=0;d<days;d++){
    const dt=new Date(today); dt.setDate(today.getDate()-(w*7+(days-1-d)));
    const ds=dt.toISOString().split("T")[0];
    const count=goals.filter(g=>g.completedAt?.startsWith(ds)).length;
    cells.push({ds,count,isToday:ds===today.toISOString().split("T")[0]});
  }
  const mx=Math.max(...cells.map(c=>c.count),1);
  return (
    <div>
      <div style={{fontSize:10,fontWeight:700,color:th.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:7}}>Activity · 8 weeks</div>
      <div style={{display:"grid",gridTemplateColumns:`repeat(${weeks},1fr)`,gridTemplateRows:`repeat(${days},1fr)`,gap:2,gridAutoFlow:"column"}}>
        {cells.map((c,i)=>(
          <div key={i} title={`${c.ds}: ${c.count}`} style={{width:"100%",paddingBottom:"100%",borderRadius:2,cursor:"default",
            background:c.count===0?th.btnBg:`${accent}${Math.round((c.count/mx)*0.85*255).toString(16).padStart(2,"0")}`,
            outline:c.isToday?`1.5px solid ${accent}`:"none"}}/>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:9,color:th.muted}}>
        <span>8 weeks ago</span><span>Today</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  RING
// ─────────────────────────────────────────────
const Ring = ({pct,size=72,stroke=5,color="#6366f1",textColor}) => {
  const r=(size-stroke*2)/2, circ=2*Math.PI*r;
  return (
    <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(128,128,128,0.12)" strokeWidth={stroke}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct/100)} strokeLinecap="round"
          style={{transition:"stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)"}}/>
      </svg>
      <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{fontSize:13,fontWeight:900,color:textColor}}>{pct}%</span>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
//  SHORTCUTS MODAL
// ─────────────────────────────────────────────
const ShortcutsModal = ({onClose,th}) => (
  <div style={{position:"fixed",inset:0,zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)"}} onClick={onClose}>
    <div onClick={e=>e.stopPropagation()} style={{borderRadius:16,padding:20,minWidth:290,maxWidth:360,background:th.card,border:`1px solid ${th.border}`,boxShadow:"0 24px 60px rgba(0,0,0,0.3)",color:th.text}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <h3 style={{margin:0,fontSize:14,fontWeight:800,color:th.text}}>⌨️ Shortcuts</h3>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:th.muted,lineHeight:1}}>×</button>
      </div>
      {[["N","New goal"],["A","AI Coach"],["V","Vision Board"],["F","Focus mode"],["?","Shortcuts"],["Esc","Close"],["Ctrl+Z","Undo delete"],["Ctrl+F","Search"],["1/2/3","Filter tabs"]].map(([k,d])=>(
        <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"5px 0",borderBottom:`1px solid ${th.btnBg}`}}>
          <span style={{fontSize:12,color:th.textSub}}>{d}</span>
          <kbd style={{padding:"2px 7px",borderRadius:5,fontSize:11,fontWeight:700,background:th.btnBg,border:`1px solid ${th.border}`,color:th.text,fontFamily:"monospace"}}>{k}</kbd>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────
//  APP
// ─────────────────────────────────────────────
export default function App() {
  const [lang,setLang]          = useState(()=>ls.get("gf_lang","en"));
  const [dark,setDark]          = useState(()=>ls.get("gf_dark",true));
  const [goals,setGoals]        = useState(()=>ls.get("gf_goals",[]));
  const [filter,setFilter]      = useState("all");
  const [sortBy,setSortBy]      = useState("priority");
  const [catFilter,setCatFilter]= useState("all");
  const [search,setSearch]      = useState("");
  const [showForm,setShowForm]  = useState(false);
  const [editingId,setEditingId]= useState(null);
  const [toasts,setToasts]      = useState([]);
  const [confetti,setConfetti]  = useState(false);
  const [focusMode,setFocusMode]= useState(false);
  const [showShortcuts,setShowShortcuts]=useState(false);
  const [showPomodoro,setShowPomodoro]  =useState(false);
  const [showStats,setShowStats]        =useState(false);
  const [showCalendar,setShowCalendar]  =useState(false);
  const [showTemplates,setShowTemplates]=useState(false);
  const [pomGoal,setPomGoal]    =useState(null);
  const [expandedId,setExpandedId]=useState(null);
  const [selectedIds,setSelectedIds]=useState(new Set());
  const [bulkMode,setBulkMode]  =useState(false);
  const [delConfirm,setDelConfirm]=useState(null);
  const [undoStack,setUndoStack]=useState([]);
  const [mood,setMood]          =useState(()=>ls.get("gf_mood",null));
  const [accent,setAccent]      =useState(()=>ls.get("gf_accent","#6366f1"));
  const [quote]                 =useState(()=>QUOTES[Math.floor(Math.random()*QUOTES.length)]);

  // NEW STATE
  const [xp,setXp]              =useState(()=>ls.get("gf_xp",0));
  const [unlockedAchieves,setUnlockedAchieves]=useState(()=>ls.get("gf_achiev",[]));
  const [notifAchiev,setNotifAchiev]=useState(null);
  const [showAchieves,setShowAchieves]=useState(false);
  const [viewMode,setViewMode]  =useState("list"); // "list"|"board"
  const [showAICoach,setShowAICoach]=useState(false);
  const [timeData,setTimeData]  =useState(()=>ls.get("gf_time",{}));
  const [projects,setProjects]  =useState(()=>ls.get("gf_projects",[]));
  const [showProjects,setShowProjects]=useState(false);
  const [pomSessions,setPomSessions]=useState(()=>ls.get("gf_pomsess",0));
  const [showXpAnim,setShowXpAnim]=useState(null); // {amount, x, y}

  const [form,setForm]=useState({title:"",desc:"",priority:"medium",deadline:"",category:"personal",subtasks:[],notes:"",tags:"",pinned:false,weight:5,recurring:"none",projectId:""});
  const formRef=useRef(null), searchRef=useRef(null);
  const t=T[lang]||T.en;

  // Persist
  useEffect(()=>ls.set("gf_goals",goals),[goals]);
  useEffect(()=>ls.set("gf_lang",lang),[lang]);
  useEffect(()=>ls.set("gf_dark",dark),[dark]);
  useEffect(()=>ls.set("gf_mood",mood),[mood]);
  useEffect(()=>ls.set("gf_accent",accent),[accent]);
  useEffect(()=>ls.set("gf_xp",xp),[xp]);
  useEffect(()=>ls.set("gf_achiev",unlockedAchieves),[unlockedAchieves]);
  useEffect(()=>ls.set("gf_time",timeData),[timeData]);
  useEffect(()=>ls.set("gf_projects",projects),[projects]);
  useEffect(()=>ls.set("gf_pomsess",pomSessions),[pomSessions]);

  const level=getLvl(xp);
  const levelPct=getLvlPct(xp);
  const levelTitle=getLvlTitle(level);

  const th = useMemo(()=>({
    dark,
    bg:      dark?"#080c14":"#eef2fb",
    card:    dark?"rgba(255,255,255,0.046)":"#ffffff",
    border:  dark?"rgba(255,255,255,0.09)":"rgba(0,0,0,0.09)",
    btnBg:   dark?"rgba(255,255,255,0.08)":"rgba(0,0,0,0.055)",
    text:    dark?"#eef2ff":"#111827",
    textSub: dark?"rgba(238,242,255,0.65)":"rgba(17,24,39,0.65)",
    muted:   dark?"rgba(238,242,255,0.42)":"rgba(17,24,39,0.46)",
    inputBg: dark?"rgba(255,255,255,0.06)":"#f5f7ff",
    inputBorder: dark?"rgba(255,255,255,0.12)":"rgba(0,0,0,0.13)",
    accent,
    accentGlow:`${accent}40`,
    shadow:  dark?"0 4px 24px rgba(0,0,0,0.55)":"0 2px 14px rgba(0,0,0,0.07)",
    shadowHov: dark?"0 10px 36px rgba(0,0,0,0.6)":"0 6px 22px rgba(0,0,0,0.11)",
  }),[dark,accent]);

  const stats = useMemo(()=>{
    const active=goals.filter(g=>!g.completed&&!g.archived);
    const done=goals.filter(g=>g.completed);
    const total=goals.filter(g=>!g.archived);
    const pct=total.length?Math.round((done.length/total.length)*100):0;
    const td=todayStr();
    const todayDone=done.filter(g=>g.completedAt?.startsWith(td)).length;
    const overdue=active.filter(g=>g.deadline&&g.deadline<td).length;
    const daySet=new Set(done.filter(g=>g.completedAt).map(g=>g.completedAt.split("T")[0]));
    let streak=0,dd=new Date();
    while(true){const s=dd.toISOString().split("T")[0];if(daySet.has(s)){streak++;dd.setDate(dd.getDate()-1);}else break;}
    const weekly=Array.from({length:7},(_,i)=>{
      const d2=new Date();d2.setDate(d2.getDate()-(6-i));const s=d2.toISOString().split("T")[0];
      return{val:done.filter(g=>g.completedAt?.startsWith(s)).length,today:s===td};
    });
    const byCat={};
    CATEGORIES.forEach(c=>{byCat[c]={total:total.filter(g=>g.category===c).length,done:done.filter(g=>g.category===c).length};});
    const totalSubtasksDone=goals.reduce((acc,g)=>acc+(g.subtasks||[]).filter(s=>s.done).length,0);
    const pinnedCount=goals.filter(g=>g.pinned).length;
    return{total:total.length,done:done.length,active:active.length,pct,todayDone,streak,overdue,weekly,byCat,totalSubtasksDone,pinnedCount};
  },[goals]);

  // Achievement checker
  const checkAchievements = useCallback((newGoals,newXp,curUnlocked,newPomSessions)=>{
    const unlockable=[];
    const done=newGoals.filter(g=>g.completed);
    const total=newGoals.filter(g=>!g.archived);
    const daySet=new Set(done.filter(g=>g.completedAt).map(g=>g.completedAt.split("T")[0]));
    let streak=0,dd=new Date();
    while(true){const s=dd.toISOString().split("T")[0];if(daySet.has(s)){streak++;dd.setDate(dd.getDate()-1);}else break;}
    const totalSubDone=newGoals.reduce((a,g)=>a+(g.subtasks||[]).filter(s=>s.done).length,0);
    const catSet=new Set(total.map(g=>g.category));
    const pinnedCount=newGoals.filter(g=>g.pinned).length;
    const checks={
      first: done.length>=1,
      streak3: streak>=3,
      streak7: streak>=7,
      streak30: streak>=30,
      goals10: total.length>=10,
      done10: done.length>=10,
      done50: done.length>=50,
      allcats: CATEGORIES.every(c=>catSet.has(c)),
      speedrun: done.some(g=>g.createdAt&&g.completedAt&&g.createdAt.split("T")[0]===g.completedAt.split("T")[0]),
      earlybird: done.some(g=>g.deadline&&g.completedAt&&g.completedAt.split("T")[0]<g.deadline),
      lv10: getLvl(newXp)>=10,
      subtask20: totalSubDone>=20,
      pom5: (newPomSessions||0)>=5,
      pinmaster: pinnedCount>=5,
      lv25: getLvl(newXp)>=25,
    };
    let bonusXp=0;
    ACHIEVEMENTS.forEach(a=>{
      if(checks[a.id]&&!curUnlocked.includes(a.id)){
        unlockable.push(a);
        bonusXp+=a.xp;
      }
    });
    return{unlockable,bonusXp};
  },[]);

  const addXP = useCallback((amount,onDone)=>{
    setXp(prev=>{
      const newXp=prev+amount;
      if(onDone)onDone(newXp);
      return newXp;
    });
  },[]);

  const unlockAchievements = useCallback((list)=>{
    if(!list.length)return;
    setUnlockedAchieves(prev=>{
      const newSet=[...prev,...list.map(a=>a.id)];
      return newSet;
    });
    // Show first achievement
    setNotifAchiev(list[0]);
    if(list.length>1){
      list.slice(1).forEach((a,i)=>{
        setTimeout(()=>setNotifAchiev(a),(i+1)*4500);
      });
    }
  },[]);

  useEffect(()=>{
    if(stats.pct===100&&stats.total>0){setConfetti(true);setTimeout(()=>setConfetti(false),5000);}
  },[stats.pct,stats.total]);

  const addToast=useCallback((msg,type="success",undoable=false,onUndo=null)=>{
    const id=Date.now();
    setToasts(p=>[...p,{id,message:msg,type,visible:false,undoable,onUndo}]);
    requestAnimationFrame(()=>setToasts(p=>p.map(x=>x.id===id?{...x,visible:true}:x)));
    setTimeout(()=>setToasts(p=>p.filter(x=>x.id!==id)),3500);
  },[]);

  const handleUndo=useCallback(tid=>{
    setToasts(p=>{const toast=p.find(x=>x.id===tid);if(toast?.onUndo)toast.onUndo();return p.filter(x=>x.id!==tid);});
  },[]);

  useEffect(()=>{
    const h=e=>{
      if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA")return;
      if(e.key==="?"||e.key==="/"){e.preventDefault();setShowShortcuts(p=>!p);}
      if(e.key==="n"||e.key==="N"){e.preventDefault();setShowForm(true);}
      if(e.key==="f"||e.key==="F"){e.preventDefault();setFocusMode(p=>!p);}
      if(e.key==="a"||e.key==="A"){e.preventDefault();setShowAICoach(p=>!p);}
      if(e.key==="v"||e.key==="V"){e.preventDefault();setViewMode(p=>p==="list"?"board":"list");}
      if(e.key==="Escape"){setShowShortcuts(false);setFocusMode(false);setShowForm(false);setExpandedId(null);setDelConfirm(null);setShowAICoach(false);}
      if(e.ctrlKey&&e.key==="z"){e.preventDefault();if(undoStack.length){const last=undoStack[undoStack.length-1];setGoals(last);setUndoStack(p=>p.slice(0,-1));}}
      if(e.ctrlKey&&e.key==="f"){e.preventDefault();searchRef.current?.focus();}
      if(e.key==="1")setFilter("all");if(e.key==="2")setFilter("active");if(e.key==="3")setFilter("completed");
    };
    window.addEventListener("keydown",h); return()=>window.removeEventListener("keydown",h);
  },[undoStack]);

  const resetForm=()=>{setForm({title:"",desc:"",priority:"medium",deadline:"",category:"personal",subtasks:[],notes:"",tags:"",pinned:false,weight:5,recurring:"none",projectId:""});setEditingId(null);setShowForm(false);};
  const openEdit=g=>{
    setForm({title:g.title,desc:g.desc||"",priority:g.priority,deadline:g.deadline||"",category:g.category||"personal",subtasks:g.subtasks||[],notes:g.notes||"",tags:g.tags||"",pinned:g.pinned||false,weight:g.weight||5,recurring:g.recurring||"none",projectId:g.projectId||""});
    setEditingId(g.id);setShowForm(true);
    setTimeout(()=>formRef.current?.scrollIntoView({behavior:"smooth",block:"nearest"}),100);
  };

  const handleSubmit=()=>{
    if(!form.title.trim())return;
    if(editingId){
      setGoals(p=>p.map(g=>g.id===editingId?{...g,...form,title:form.title.trim(),updatedAt:new Date().toISOString()}:g));
      addToast(t.toastUpdated);
    }else{
      const newGoal={id:uid(),title:form.title.trim(),desc:form.desc.trim(),priority:form.priority,deadline:form.deadline,category:form.category,subtasks:form.subtasks,notes:form.notes,tags:form.tags,pinned:form.pinned,weight:form.weight,recurring:form.recurring,projectId:form.projectId,completed:false,archived:false,createdAt:new Date().toISOString(),completedAt:null};
      const newGoals=[newGoal,...goals];
      setGoals(newGoals);
      // XP for creating
      const earned=XP_VAL.create;
      addXP(earned,(newXp)=>{
        const {unlockable,bonusXp}=checkAchievements(newGoals,newXp+bonusXp,unlockedAchieves,pomSessions);
        if(unlockable.length){unlockAchievements(unlockable);addXP(bonusXp);}
      });
      addToast(`${t.toastAdded} +${earned}XP`,"xp");
    }
    resetForm();
  };

  const toggleComplete=useCallback(id=>{
    setGoals(p=>{
      const updated=p.map(g=>{
        if(g.id!==id)return g;
        const n=!g.completed;
        if(n){
          // XP
          const priBonus=XP_VAL[g.priority]||0;
          const earned=XP_VAL.goal+priBonus;
          addXP(earned,(newXp)=>{
            const newGoals=p.map(x=>x.id===id?{...x,completed:n,completedAt:n?new Date().toISOString():null}:x);
            const {unlockable,bonusXp}=checkAchievements(newGoals,newXp,unlockedAchieves,pomSessions);
            if(unlockable.length){unlockAchievements(unlockable);addXP(bonusXp);}
          });
          addToast(`${t.toastCompleted} +${XP_VAL.goal+priBonus}XP`,"success");
        } else {
          addToast(t.toastUndone,"info");
        }
        return{...g,completed:n,completedAt:n?new Date().toISOString():null};
      });
      return updated;
    });
  },[addXP,checkAchievements,unlockedAchieves,pomSessions,unlockAchievements,t]);

  const deleteGoal=id=>{const snap=[...goals];const g=goals.find(x=>x.id===id);setUndoStack(p=>[...p,snap]);setGoals(p=>p.filter(x=>x.id!==id));setDelConfirm(null);addToast(`${t.toastDeleted}: "${g?.title?.slice(0,16)}"...`,"info",true,()=>setGoals(snap));};
  const archiveGoal=id=>{setGoals(p=>p.map(g=>g.id===id?{...g,archived:!g.archived}:g));addToast(t.toastArchived,"info");};
  const pinGoal=id=>setGoals(p=>p.map(g=>g.id===id?{...g,pinned:!g.pinned}:g));
  const dupGoal=id=>{const s=goals.find(g=>g.id===id);if(!s)return;setGoals(p=>[{...s,id:uid(),createdAt:new Date().toISOString(),completed:false,completedAt:null,pinned:false},...p]);addToast(t.toastAdded);};

  const bulkAction=action=>{
    if(action==="delete"){const snap=[...goals];setUndoStack(p=>[...p,snap]);setGoals(p=>p.filter(g=>!selectedIds.has(g.id)));addToast(`${selectedIds.size} deleted`,"info",true,()=>setGoals(snap));}
    else if(action==="complete"){setGoals(p=>p.map(g=>selectedIds.has(g.id)?{...g,completed:true,completedAt:new Date().toISOString()}:g));addToast(`${selectedIds.size} completed! 🎉`);}
    setSelectedIds(new Set());setBulkMode(false);
  };

  const useTemplate=tpl=>{
    setForm({title:tpl.title,desc:tpl.desc||"",priority:tpl.priority||"medium",deadline:"",category:tpl.category||"personal",subtasks:(tpl.subtasks||[]).map(s=>({...s,id:uid(),done:false})),notes:"",tags:tpl.tags||"",pinned:false,weight:tpl.weight||5,recurring:"none",projectId:""});
    setShowTemplates(false);setShowForm(true);
  };

  const exportData=()=>{
    const d=JSON.stringify({goals,xp,projects,exportedAt:new Date().toISOString(),version:"3.0"},null,2);
    const blob=new Blob([d],{type:"application/json"});const url=URL.createObjectURL(blob);
    const a=document.createElement("a");a.href=url;a.download=`goalflow_${todayStr()}.json`;a.click();URL.revokeObjectURL(url);addToast("Exported! 📁");
  };
  const importData=e=>{
    const file=e.target.files[0];if(!file)return;
    const r=new FileReader();r.onload=ev=>{try{const parsed=JSON.parse(ev.target.result);const im=parsed.goals||parsed;if(Array.isArray(im)){setGoals(prev=>[...im.filter(g=>g.id),...prev]);addToast(`${im.length} imported! 📥`);}}catch{addToast("Import failed","error");}};
    r.readAsText(file);e.target.value="";
  };

  const handlePomSession=useCallback(()=>{
    setPomSessions(p=>{
      const n=p+1;
      addXP(XP_VAL.pomodoro,(newXp)=>{
        const {unlockable,bonusXp}=checkAchievements(goals,newXp,unlockedAchieves,n);
        if(unlockable.length){unlockAchievements(unlockable);addXP(bonusXp);}
      });
      addToast(`🍅 Session done! +${XP_VAL.pomodoro}XP`,"xp");
      return n;
    });
  },[addXP,checkAchievements,goals,unlockedAchieves,unlockAchievements,addToast]);

  // Project CRUD
  const addProject=()=>{
    const name=window.prompt("Project name:");
    if(!name?.trim())return;
    const colors=["#3b82f6","#a855f7","#10b981","#f59e0b","#ef4444","#06b6d4"];
    setProjects(p=>[...p,{id:uid(),name:name.trim(),color:colors[Math.floor(Math.random()*colors.length)]}]);
  };

  const filtered=useMemo(()=>goals
    .filter(g=>{if(filter==="active")return!g.completed&&!g.archived;if(filter==="completed")return g.completed;if(filter==="archived")return g.archived;return!g.archived;})
    .filter(g=>catFilter==="all"?true:g.category===catFilter)
    .filter(g=>{if(!search.trim())return true;const q=search.toLowerCase();return g.title.toLowerCase().includes(q)||(g.desc||"").toLowerCase().includes(q)||(g.tags||"").toLowerCase().includes(q);})
    .sort((a,b)=>{
      if(a.pinned!==b.pinned)return a.pinned?-1:1;
      if(a.completed!==b.completed)return a.completed?1:-1;
      if(sortBy==="priority")return(PRIORITY_ORDER[a.priority]??2)-(PRIORITY_ORDER[b.priority]??2);
      if(sortBy==="deadline"){if(!a.deadline&&!b.deadline)return 0;if(!a.deadline)return 1;if(!b.deadline)return-1;return a.deadline.localeCompare(b.deadline);}
      if(sortBy==="title")return a.title.localeCompare(b.title);
      if(sortBy==="weight")return(b.weight||5)-(a.weight||5);
      return new Date(b.createdAt)-new Date(a.createdAt);
    }),[goals,filter,catFilter,search,sortBy]);

  const getDL=g=>{
    const s=getDeadlineStatus(g.deadline,g.completed);if(!s||s==="done")return null;
    return{overdue:{text:t.overdue,color:"#dc2626"},today:{text:t.dueToday,color:"#d97706"},tomorrow:{text:t.dueTomorrow,color:"#2563eb"},upcoming:{text:g.deadline,color:th.muted}}[s];
  };

  const card={borderRadius:13,padding:"13px 15px",background:th.card,border:`1px solid ${th.border}`,backdropFilter:"blur(20px)",boxShadow:th.shadow,transition:"all 0.2s cubic-bezier(0.4,0,0.2,1)"};
  const inp={width:"100%",borderRadius:9,padding:"9px 12px",background:th.inputBg,border:`1px solid ${th.inputBorder}`,color:th.text,fontSize:13,outline:"none",transition:"border-color 0.2s,box-shadow 0.2s",boxSizing:"border-box"};
  const btnP={borderRadius:9,padding:"9px 16px",border:"none",cursor:"pointer",fontWeight:700,fontSize:13,color:"#fff",background:`linear-gradient(135deg,${accent},${accent}cc)`,boxShadow:`0 4px 14px ${th.accentGlow}`,transition:"all 0.2s"};
  const fi=e=>{e.target.style.borderColor=accent;e.target.style.boxShadow=`0 0 0 3px ${accent}1a`;};
  const fb=e=>{e.target.style.borderColor=th.inputBorder;e.target.style.boxShadow="none";};
  const label={display:"block",fontSize:10,fontWeight:700,color:th.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:5};

  return (
    <div style={{minHeight:"100vh",background:th.bg,color:th.text,fontFamily:"'DM Sans','Outfit',system-ui,sans-serif",transition:"background 0.35s,color 0.25s"}}>
      <Confetti active={confetti}/>
      <Toasts toasts={toasts} onUndo={handleUndo}/>
      {showShortcuts&&<ShortcutsModal onClose={()=>setShowShortcuts(false)} th={th}/>}
      {notifAchiev&&<AchievNotif achiev={notifAchiev} t={t} th={th} onClose={()=>setNotifAchiev(null)}/>}
      {showAICoach&&<AICoach goals={goals} t={t} th={th} accent={accent} onClose={()=>setShowAICoach(false)}/>}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800;900&family=DM+Sans:wght@400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:${th.bg};}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:${accent}35;border-radius:4px;}
        @keyframes cfFall{0%{opacity:1;transform:translateY(-10px)}100%{opacity:0;transform:translateY(110vh)}}
        @keyframes slideIn{from{opacity:0;transform:translateY(-7px) scale(0.97)}to{opacity:1;transform:none}}
        @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:0.4;transform:scale(0.8)}50%{opacity:1;transform:scale(1)}}
        @keyframes xpPop{0%{opacity:1;transform:translateY(0) scale(1)}100%{opacity:0;transform:translateY(-40px) scale(1.3)}}
        .ge{animation:slideIn 0.27s ease both;}
        .fu{animation:fadeUp 0.32s ease both;}
        .shim{background:linear-gradient(90deg,transparent,rgba(255,255,255,0.13),transparent);background-size:200% 100%;animation:shimmer 2.2s infinite;}
        input[type=date]::-webkit-calendar-picker-indicator{filter:${dark?"invert(1) opacity(0.45)":"opacity(0.45)"};}
        input::placeholder,textarea::placeholder{color:${th.muted};}
        select option{background:${dark?"#1a2133":"#fff"};color:${th.text};}
        .gc:hover{transform:translateY(-1px);box-shadow:${th.shadowHov} !important;}
        .sc:hover{transform:translateY(-2px) scale(1.02);}
        .ib:hover{opacity:1 !important;transform:scale(1.2);}
        .vc:hover{transform:translateY(-3px);box-shadow:0 12px 36px rgba(0,0,0,0.2) !important;}
        input[type=range]{-webkit-appearance:none;height:4px;border-radius:4px;background:${th.btnBg};width:100%;}
        input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:15px;height:15px;border-radius:50%;background:${accent};cursor:pointer;}
        .sg{display:grid;grid-template-columns:repeat(4,1fr);gap:9px;}
        .pg{display:grid;grid-template-columns:1fr 1fr;gap:9px;}
        .cs{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;}
        .f3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;}
        .f2{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
        .f4{display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;}
        .ftabs{display:flex;border-radius:10px;overflow:hidden;background:${th.btnBg};padding:3px;gap:2px;flex-shrink:0;}
        .vboard{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:12px;}
        .achiev-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;}
        @media(max-width:580px){
          .sg{grid-template-columns:repeat(2,1fr);}
          .pg{grid-template-columns:1fr;}
          .cs{grid-template-columns:repeat(2,1fr);}
          .f3{grid-template-columns:1fr 1fr;}
          .f4{grid-template-columns:1fr 1fr;}
          .f2{grid-template-columns:1fr;}
          .ac-row{display:none !important;}
          .ga-row{gap:2px !important;}
          .ga-row button{width:22px !important;height:22px !important;font-size:11px !important;}
          .vboard{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));}
        }
        @media(max-width:380px){
          .f3{grid-template-columns:1fr;}
          .ftabs button{padding:5px 7px;font-size:10px;}
        }
      `}</style>

      {/* AMBIENT */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}>
        <div style={{position:"absolute",top:"-20%",right:"-10%",width:"44vw",height:"44vw",borderRadius:"50%",background:`radial-gradient(circle,${accent}14 0%,transparent 70%)`,filter:"blur(48px)"}}/>
        <div style={{position:"absolute",bottom:"-15%",left:"-8%",width:"38vw",height:"38vw",borderRadius:"50%",background:"radial-gradient(circle,rgba(168,85,247,0.09) 0%,transparent 70%)",filter:"blur(48px)"}}/>
      </div>

      {/* FOCUS MODE */}
      {focusMode&&(
        <div style={{position:"fixed",inset:0,zIndex:9990,background:dark?"rgba(2,4,8,0.97)":"rgba(244,247,255,0.97)",backdropFilter:"blur(22px)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:26}}>
          <div style={{textAlign:"center"}}>
            <div style={{fontSize:42,marginBottom:7}}>🎯</div>
            <h2 style={{fontSize:24,fontWeight:900,fontFamily:"'Outfit',sans-serif",marginBottom:7,color:th.text}}>{t.focusMode}</h2>
            <p style={{color:th.muted,fontSize:13,maxWidth:290,lineHeight:1.6}}>{quote}</p>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,width:"min(360px,90vw)"}}>
            {goals.filter(g=>!g.completed&&!g.archived&&g.pinned).slice(0,3).map(g=>(
              <div key={g.id} style={{...card,display:"flex",alignItems:"center",gap:11,padding:"11px 14px"}}>
                <button onClick={()=>toggleComplete(g.id)} style={{width:21,height:21,borderRadius:11,border:`2px solid ${accent}`,background:"transparent",cursor:"pointer",flexShrink:0}}/>
                <span style={{fontWeight:600,fontSize:13,flex:1,color:th.text}}>{g.title}</span>
                <span style={{fontSize:10,color:th.muted}}>{CAT_EMOJI[g.category]||"✨"}</span>
              </div>
            ))}
            {!goals.filter(g=>!g.completed&&!g.archived&&g.pinned).length&&(
              <p style={{textAlign:"center",color:th.muted,fontSize:12}}>Pin goals to see them here</p>
            )}
          </div>
          <button onClick={()=>setFocusMode(false)} style={{...btnP,padding:"10px 24px",borderRadius:10}}>{t.exitFocus}</button>
        </div>
      )}

      {/* MAIN */}
      <div style={{position:"relative",zIndex:1,maxWidth:760,margin:"0 auto",padding:"16px 13px 76px",paddingRight:showAICoach?"min(354px,100vw)":13}}>

        {/* HEADER */}
        <header style={{marginBottom:16}}>
          <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:9}}>
            <div style={{flexShrink:0}}>
              <h1 style={{fontFamily:"'Outfit',sans-serif",fontSize:"clamp(21px,5vw,27px)",fontWeight:900,letterSpacing:"-0.4px",lineHeight:1,background:`linear-gradient(135deg,${th.text},${accent})`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>
                {t.appTitle}
              </h1>
              <p style={{fontSize:11,color:th.muted,marginTop:2,fontWeight:500,letterSpacing:"0.05em"}}>{t.appSubtitle}</p>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>
              <div className="ac-row" style={{display:"flex",gap:4,alignItems:"center"}}>
                {["#6366f1","#0ea5e9","#10b981","#f97316","#ec4899","#a855f7"].map(c=>(
                  <button key={c} onClick={()=>setAccent(c)} style={{width:14,height:14,borderRadius:7,border:`2px solid ${c===accent?"#fff":"transparent"}`,background:c,cursor:"pointer",boxShadow:c===accent?`0 0 0 1px ${c},0 0 7px ${c}55`:""}}/>
                ))}
              </div>
              <div style={{display:"flex",borderRadius:8,overflow:"hidden",background:th.btnBg,padding:2,gap:1}}>
                {["en","ru","uz"].map(l=>(
                  <button key={l} onClick={()=>setLang(l)} style={{padding:"4px 7px",borderRadius:7,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",background:lang===l?accent:"transparent",color:lang===l?"#fff":th.muted,transition:"all 0.2s"}}>{l}</button>
                ))}
              </div>
              {[
                {ic:"📊",act:()=>setShowStats(p=>!p),on:showStats},
                {ic:"🗓️",act:()=>setShowCalendar(p=>!p),on:showCalendar},
                {ic:"📋",act:()=>setShowTemplates(p=>!p),on:showTemplates},
                {ic:"🏆",act:()=>setShowAchieves(p=>!p),on:showAchieves},
                {ic:"🤖",act:()=>setShowAICoach(p=>!p),on:showAICoach},
                {ic:"🍅",act:()=>setShowPomodoro(p=>!p),on:showPomodoro},
                {ic:"🎯",act:()=>setFocusMode(true),on:false},
                {ic:"⌨️",act:()=>setShowShortcuts(true),on:false},
                {ic:dark?"☀️":"🌙",act:()=>setDark(p=>!p),on:false},
              ].map(({ic,act,on})=>(
                <button key={ic} onClick={act} className="ib" style={{
                  width:33,height:33,borderRadius:9,border:`1px solid ${on?accent+"55":"transparent"}`,
                  cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",
                  background:on?`${accent}14`:th.btnBg,transition:"all 0.2s",opacity:on?1:0.72,flexShrink:0}}>
                  {ic}
                </button>
              ))}
            </div>
          </div>

          {/* LEVEL BAR */}
          <div style={{...card,padding:"10px 14px"}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{flexShrink:0,width:38,height:38,borderRadius:10,background:`linear-gradient(135deg,${accent},${accent}aa)`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:900,color:"#fff",boxShadow:`0 4px 14px ${accent}45`}}>
                {level}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{fontSize:12,fontWeight:700,color:th.text}}>{levelTitle} · {t.level} {level}</span>
                  <span style={{fontSize:10,color:th.muted,fontWeight:600}}>{xp} {t.xpLabel} · {200-(xp%200)} to next</span>
                </div>
                <div style={{height:6,borderRadius:6,background:th.btnBg,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:6,width:`${levelPct}%`,background:`linear-gradient(90deg,${accent},#a855f7)`,transition:"width 1s cubic-bezier(0.4,0,0.2,1)",position:"relative",overflow:"hidden"}}>
                    <div className="shim" style={{position:"absolute",inset:0}}/>
                  </div>
                </div>
              </div>
              <div style={{display:"flex",gap:10,flexShrink:0}}>
                <div style={{textAlign:"center"}}>
                  <div style={{fontSize:14,fontWeight:900,color:accent,fontFamily:"'Outfit',sans-serif"}}>{unlockedAchieves.length}</div>
                  <div style={{fontSize:9,color:th.muted,fontWeight:600}}>/{ACHIEVEMENTS.length}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* MOOD */}
        <div style={{...card,marginBottom:10,display:"flex",alignItems:"center",gap:10,padding:"9px 13px",flexWrap:"wrap"}}>
          <span style={{fontSize:11,fontWeight:700,color:th.muted,letterSpacing:"0.06em",textTransform:"uppercase",whiteSpace:"nowrap"}}>{t.mood}</span>
          <div style={{display:"flex",gap:4,flex:1,flexWrap:"wrap"}}>
            {MOODS.map(m=>(
              <button key={m.key} onClick={()=>setMood(m.key===mood?null:m.key)} style={{
                padding:"4px 9px",borderRadius:18,border:"none",cursor:"pointer",fontSize:13,fontWeight:600,
                background:mood===m.key?`${accent}1c`:"transparent",
                boxShadow:mood===m.key?`0 0 0 1.5px ${accent}55`:"none",
                opacity:mood&&mood!==m.key?0.42:1,color:th.text,transition:"all 0.2s"}}>
                {m.emoji} <span style={{fontSize:10,color:th.textSub}}>{t[`mood${m.key.charAt(0).toUpperCase()+m.key.slice(1)}`]}</span>
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            <button onClick={()=>setViewMode(p=>p==="list"?"board":"list")} style={{
              padding:"4px 9px",borderRadius:8,border:`1px solid ${th.border}`,cursor:"pointer",
              fontSize:10,fontWeight:700,background:th.btnBg,color:th.textSub,transition:"all 0.18s"}}>
              {viewMode==="list"?`🎨 ${t.visionBoard}`:`📋 ${t.listView}`}
            </button>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="sg" style={{marginBottom:11}}>
          {[
            {ic:"🎯",val:stats.total, label:t.totalGoals,    col:"#6366f1"},
            {ic:"✅",val:stats.done,  label:t.completedGoals,col:"#10b981"},
            {ic:"⚡",val:stats.active,label:t.activeGoals,   col:"#f59e0b"},
            {ic:"🔥",val:stats.streak,label:t.streak,        col:"#f97316"},
          ].map(s=>(
            <div key={s.label} className="sc" style={{...card,padding:"12px 13px",cursor:"default",position:"relative",overflow:"hidden",transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)"}}>
              <div style={{fontSize:"clamp(18px,4vw,23px)",fontWeight:900,color:s.col,fontFamily:"'Outfit',sans-serif",lineHeight:1}}>{s.val}</div>
              <div style={{fontSize:10,color:th.muted,marginTop:3,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase"}}>{s.label}</div>
              <div style={{position:"absolute",right:9,top:7,fontSize:15,opacity:0.1}}>{s.ic}</div>
            </div>
          ))}
        </div>

        {/* PROGRESS + CHART */}
        <div className="pg" style={{marginBottom:11}}>
          <div style={{...card,padding:"12px 15px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
              <span style={{fontSize:11,color:th.muted,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>{t.overallProgress}</span>
              <span style={{fontSize:19,fontWeight:900,fontFamily:"'Outfit',sans-serif",color:stats.pct===100?"#10b981":accent}}>{stats.pct}%</span>
            </div>
            <div style={{height:6,borderRadius:6,background:th.btnBg,overflow:"hidden"}}>
              <div style={{height:"100%",borderRadius:6,width:`${stats.pct}%`,background:stats.pct===100?"linear-gradient(90deg,#10b981,#059669)":`linear-gradient(90deg,${accent},${accent}99)`,transition:"width 1.2s cubic-bezier(0.4,0,0.2,1)",position:"relative",overflow:"hidden"}}>
                <div className="shim" style={{position:"absolute",inset:0}}/>
              </div>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,color:th.muted}}>
              <span>📅 {t.todayCompleted}: {stats.todayDone}</span>
              {stats.overdue>0&&<span style={{color:"#dc2626"}}>⚠️ {stats.overdue}</span>}
            </div>
          </div>
          <div style={{...card,padding:"12px 15px"}}>
            <div style={{fontSize:10,fontWeight:600,color:th.muted,marginBottom:7,letterSpacing:"0.06em",textTransform:"uppercase"}}>{t.weeklyStats}</div>
            <div style={{display:"flex",gap:4,alignItems:"flex-end",height:46}}>
              {stats.weekly.map((d,i)=>{
                const max=Math.max(...stats.weekly.map(x=>x.val),1);
                const days=["M","T","W","T","F","S","S"];
                return(
                  <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
                    <div style={{width:"100%",borderRadius:3,background:d.today?accent:th.btnBg,height:`${Math.max((d.val/max)*38,3)}px`,transition:"height 0.5s ease"}}/>
                    <span style={{fontSize:9,color:th.muted,fontWeight:600}}>{days[i]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ACHIEVEMENTS PANEL */}
        {showAchieves&&(
          <div style={{...card,marginBottom:11,padding:"13px 16px"}} className="fu">
            <div style={{fontSize:11,fontWeight:700,color:th.muted,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:11}}>{t.achievements} ({unlockedAchieves.length}/{ACHIEVEMENTS.length})</div>
            <div className="achiev-grid">
              {ACHIEVEMENTS.map(a=>{
                const locked=!unlockedAchieves.includes(a.id);
                return (
                  <div key={a.id} title={a.desc} style={{borderRadius:10,padding:"9px 10px",background:locked?th.btnBg:`${accent}10`,border:`1px solid ${locked?th.border:`${accent}30`}`,textAlign:"center",opacity:locked?0.45:1,transition:"all 0.2s"}}>
                    <div style={{fontSize:20,marginBottom:4,filter:locked?"grayscale(1)":"none"}}>{a.icon}</div>
                    <div style={{fontSize:10,fontWeight:700,color:locked?th.muted:th.text,lineHeight:1.3}}>{a.title}</div>
                    {!locked&&<div style={{fontSize:9,color:accent,fontWeight:600,marginTop:2}}>+{a.xp}XP</div>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STATS PANEL */}
        {showStats&&(
          <div style={{...card,marginBottom:11,padding:"13px 16px"}} className="fu">
            <div style={{fontSize:11,fontWeight:700,color:th.muted,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:11}}>{t.stats}</div>
            <div style={{display:"flex",gap:16,alignItems:"center",flexWrap:"wrap"}}>
              <RadarChart byCat={stats.byCat} th={th} accent={accent} t={t}/>
              <div style={{flex:1,minWidth:160}}>
                <div className="cs">
                  {CATEGORIES.filter(c=>stats.byCat[c]?.total>0).map(c=>(
                    <div key={c} style={{borderRadius:9,padding:"8px 10px",background:th.btnBg,border:`1px solid ${CAT_COLOR[c]}22`}}>
                      <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:4}}>
                        <span style={{fontSize:12}}>{CAT_EMOJI[c]}</span>
                        <span style={{fontSize:10,fontWeight:600,color:th.textSub}}>{t[`cat_${c}`]}</span>
                      </div>
                      <div style={{fontSize:14,fontWeight:800,fontFamily:"'Outfit',sans-serif",color:CAT_COLOR[c]}}>{stats.byCat[c]?.done}/{stats.byCat[c]?.total}</div>
                      <div style={{marginTop:4,height:3,borderRadius:2,background:th.border}}>
                        <div style={{height:"100%",borderRadius:2,background:CAT_COLOR[c],width:`${stats.byCat[c]?.total?Math.round(stats.byCat[c].done/stats.byCat[c].total*100):0}%`,transition:"width 1s ease"}}/>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:10,display:"flex",gap:9,alignItems:"center"}}>
                  <Ring pct={stats.pct} size={60} stroke={5} color={accent} textColor={th.text}/>
                  <div>
                    <div style={{fontSize:12,fontWeight:700,color:th.text}}>{stats.done} completed</div>
                    <div style={{fontSize:10,color:th.muted}}>{stats.active} active · 🔥 {stats.streak} streak</div>
                    <div style={{fontSize:10,color:th.muted}}>☑️ {stats.totalSubtasksDone} subtasks done</div>
                    <div style={{fontSize:10,color:th.muted}}>⭐ {xp} XP total</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POMODORO */}
        {showPomodoro&&(
          <div style={{marginBottom:11}} className="fu">
            <Pomodoro t={t} th={th} goalTitle={pomGoal?.title} onSession={handlePomSession}/>
          </div>
        )}

        {/* HEATMAP */}
        {showCalendar&&(
          <div style={{...card,marginBottom:11,padding:"13px 16px"}} className="fu">
            <Heatmap goals={goals} th={th} accent={accent}/>
          </div>
        )}

        {/* TEMPLATES */}
        {showTemplates&&(
          <div style={{...card,marginBottom:11,padding:"13px 16px"}} className="fu">
            <div style={{fontSize:10,fontWeight:700,color:th.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:9}}>{t.templateUse}</div>
            <div className="f2">
              {DEFAULT_TEMPLATES.map(tpl=>(
                <button key={tpl.id} onClick={()=>useTemplate(tpl)} style={{
                  borderRadius:9,padding:"8px 10px",border:`1px solid ${CAT_COLOR[tpl.category]}2a`,
                  background:`${CAT_COLOR[tpl.category]}0e`,cursor:"pointer",textAlign:"left",transition:"all 0.2s",color:th.text}}
                  onMouseEnter={e=>{e.currentTarget.style.background=`${CAT_COLOR[tpl.category]}1c`;e.currentTarget.style.transform="translateY(-1px)";}}
                  onMouseLeave={e=>{e.currentTarget.style.background=`${CAT_COLOR[tpl.category]}0e`;e.currentTarget.style.transform="none";}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}>
                    <span style={{fontSize:13}}>{CAT_EMOJI[tpl.category]}</span>
                    <span style={{fontSize:11,fontWeight:700,color:th.text}}>{tpl.title}</span>
                  </div>
                  <div style={{fontSize:10,color:th.muted,marginLeft:18}}>{tpl.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS */}
        {showProjects&&(
          <div style={{...card,marginBottom:11,padding:"13px 16px"}} className="fu">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:9}}>
              <div style={{fontSize:10,fontWeight:700,color:th.muted,letterSpacing:"0.08em",textTransform:"uppercase"}}>{t.projects}</div>
              <button onClick={addProject} style={{padding:"4px 9px",borderRadius:7,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,background:`${accent}15`,color:accent}}>+ {t.addProject}</button>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              {projects.map(p=>{
                const pCount=goals.filter(g=>g.projectId===p.id&&!g.archived).length;
                return(
                  <div key={p.id} style={{padding:"5px 10px",borderRadius:18,border:`1px solid ${p.color}40`,background:`${p.color}10`,display:"flex",alignItems:"center",gap:5}}>
                    <div style={{width:7,height:7,borderRadius:4,background:p.color}}/>
                    <span style={{fontSize:11,fontWeight:600,color:th.text}}>{p.name}</span>
                    <span style={{fontSize:10,color:th.muted}}>{pCount}</span>
                    <button onClick={()=>setProjects(pp=>pp.filter(x=>x.id!==p.id))} style={{background:"none",border:"none",cursor:"pointer",color:th.muted,fontSize:11,padding:0}}>×</button>
                  </div>
                );
              })}
              {!projects.length&&<span style={{fontSize:11,color:th.muted}}>No projects yet. Create one!</span>}
            </div>
          </div>
        )}

        {/* FORM TOGGLE */}
        {!showForm?(
          <button onClick={()=>{setShowForm(true);setTimeout(()=>formRef.current?.scrollIntoView({behavior:"smooth"}),100);}} style={{
            width:"100%",borderRadius:12,padding:"12px 15px",marginBottom:11,
            border:`1.5px dashed ${accent}40`,cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:8,
            fontWeight:700,fontSize:13,color:accent,background:`${accent}08`,transition:"all 0.2s"}}
            onMouseEnter={e=>{e.currentTarget.style.background=`${accent}12`;e.currentTarget.style.borderColor=`${accent}70`;}}
            onMouseLeave={e=>{e.currentTarget.style.background=`${accent}08`;e.currentTarget.style.borderColor=`${accent}40`;}}>
            <span style={{fontSize:16,lineHeight:1}}>＋</span>
            {t.addGoal}
            <span style={{marginLeft:"auto",fontSize:10,color:th.muted,fontWeight:400}}>{t.quickAdd}</span>
          </button>
        ):(
          <div ref={formRef} style={{...card,marginBottom:11,padding:"15px 17px"}} className="ge">
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
              <h2 style={{fontFamily:"'Outfit',sans-serif",fontSize:15,fontWeight:800,color:th.text}}>{editingId?t.editGoal:t.addGoal}</h2>
              <button onClick={resetForm} style={{background:"none",border:"none",cursor:"pointer",fontSize:19,color:th.muted,lineHeight:1}}>×</button>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div>
                <label style={label}>{t.taskTitle} *</label>
                <input type="text" value={form.title} onChange={e=>setForm(p=>({...p,title:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} placeholder={t.taskTitlePlaceholder} autoFocus style={inp} onFocus={fi} onBlur={fb}/>
              </div>
              <div>
                <label style={label}>{t.taskDesc}</label>
                <textarea value={form.desc} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} placeholder={t.taskDescPlaceholder} rows={2} style={{...inp,resize:"none"}} onFocus={fi} onBlur={fb}/>
              </div>
              <div className="f3">
                <div>
                  <label style={label}>{t.priority}</label>
                  <select value={form.priority} onChange={e=>setForm(p=>({...p,priority:e.target.value}))} style={{...inp,cursor:"pointer"}}>
                    {PRIORITIES.map(pr=><option key={pr} value={pr}>{t[pr]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>{t.category}</label>
                  <select value={form.category} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={{...inp,cursor:"pointer"}}>
                    {CATEGORIES.map(c=><option key={c} value={c}>{CAT_EMOJI[c]} {t[`cat_${c}`]}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>{t.deadline}</label>
                  <input type="date" value={form.deadline} min={todayStr()} onChange={e=>setForm(p=>({...p,deadline:e.target.value}))} style={inp}/>
                </div>
              </div>
              <div className="f3">
                <div>
                  <label style={label}>{t.recurring}</label>
                  <select value={form.recurring} onChange={e=>setForm(p=>({...p,recurring:e.target.value}))} style={{...inp,cursor:"pointer"}}>
                    <option value="none">—</option>
                    <option value="daily">{t.daily}</option>
                    <option value="weekly">{t.weekly}</option>
                    <option value="monthly">{t.monthly}</option>
                  </select>
                </div>
                <div>
                  <label style={label}>{t.projects}</label>
                  <select value={form.projectId} onChange={e=>setForm(p=>({...p,projectId:e.target.value}))} style={{...inp,cursor:"pointer"}}>
                    <option value="">{t.noProject}</option>
                    {projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>{t.tags}</label>
                  <input value={form.tags} onChange={e=>setForm(p=>({...p,tags:e.target.value}))} placeholder="q4, urgent..." style={inp} onFocus={fi} onBlur={fb}/>
                </div>
              </div>
              <div className="f2">
                <div>
                  <label style={label}>{t.notes}</label>
                  <textarea value={form.notes} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} placeholder={t.notesPlaceholder} rows={2} style={{...inp,resize:"none"}} onFocus={fi} onBlur={fb}/>
                </div>
                <div>
                  <label style={label}>Weight: {form.weight}/10</label>
                  <div style={{paddingTop:6}}>
                    <input type="range" min="1" max="10" value={form.weight} onChange={e=>setForm(p=>({...p,weight:parseInt(e.target.value)}))}/>
                  </div>
                </div>
              </div>
              <div>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
                  <label style={{...label,marginBottom:0}}>{t.subtasks}</label>
                  <AIGen goalTitle={form.title} th={th} t={t} onSubtasks={subs=>setForm(p=>({...p,subtasks:[...p.subtasks,...subs]}))}/>
                </div>
                <SubtaskList subtasks={form.subtasks} onChange={v=>setForm(p=>({...p,subtasks:v}))} th={th} t={t}/>
              </div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:4,flexWrap:"wrap",gap:8}}>
                <label style={{display:"flex",alignItems:"center",gap:7,cursor:"pointer",fontSize:13,color:th.textSub}}>
                  <input type="checkbox" checked={form.pinned} onChange={e=>setForm(p=>({...p,pinned:e.target.checked}))} style={{accentColor:accent}}/>
                  📌 {t.pin}
                </label>
                <div style={{display:"flex",gap:7}}>
                  <button onClick={resetForm} style={{padding:"8px 13px",borderRadius:9,border:"none",cursor:"pointer",fontWeight:600,fontSize:13,background:th.btnBg,color:th.textSub}}>{t.cancel}</button>
                  <button onClick={handleSubmit} disabled={!form.title.trim()} style={{...btnP,opacity:form.title.trim()?1:0.4,cursor:form.title.trim()?"pointer":"not-allowed"}}>{editingId?t.saveChanges:t.addGoal}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH + FILTERS */}
        <div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}>
          <div style={{position:"relative",flex:"1 1 170px",minWidth:0}}>
            <span style={{position:"absolute",left:10,top:"50%",transform:"translateY(-50%)",fontSize:14,color:th.muted,pointerEvents:"none"}}>🔍</span>
            <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder={t.search} style={{...inp,paddingLeft:31}} onFocus={fi} onBlur={fb}/>
            {search&&<button onClick={()=>setSearch("")} style={{position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:th.muted,fontSize:15,lineHeight:1}}>×</button>}
          </div>
          <div className="ftabs">
            {["all","active","completed","archived"].map(f=>(
              <button key={f} onClick={()=>setFilter(f)} style={{
                padding:"6px 10px",borderRadius:8,border:"none",cursor:"pointer",fontSize:11,fontWeight:700,
                background:filter===f?accent:"transparent",
                color:filter===f?"#fff":th.textSub,
                boxShadow:filter===f?`0 2px 7px ${accent}40`:"none",
                transition:"all 0.18s",whiteSpace:"nowrap"}}>
                {t[f]}
              </button>
            ))}
          </div>
        </div>

        {/* CATEGORY + PROJECT FILTER */}
        <div style={{display:"flex",gap:5,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
          <button onClick={()=>setCatFilter("all")} style={{padding:"4px 9px",borderRadius:16,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,background:catFilter==="all"?accent:th.btnBg,color:catFilter==="all"?"#fff":th.textSub,transition:"all 0.18s"}}>{t.all}</button>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setCatFilter(c===catFilter?"all":c)} style={{padding:"4px 9px",borderRadius:16,border:`1px solid ${CAT_COLOR[c]}3a`,cursor:"pointer",fontSize:10,fontWeight:700,background:catFilter===c?CAT_COLOR[c]:`${CAT_COLOR[c]}12`,color:catFilter===c?"#fff":CAT_COLOR[c],transition:"all 0.18s"}}>{CAT_EMOJI[c]} {t[`cat_${c}`]}</button>
          ))}
          <button onClick={()=>setShowProjects(p=>!p)} style={{padding:"4px 9px",borderRadius:16,border:`1px solid ${showProjects?accent+"55":th.border}`,cursor:"pointer",fontSize:10,fontWeight:700,background:showProjects?`${accent}10`:th.btnBg,color:showProjects?accent:th.textSub,transition:"all 0.18s"}}>📁 {t.projects}</button>
        </div>

        {/* SORT + BULK */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:7}}>
          <div style={{display:"flex",alignItems:"center",gap:5,flexWrap:"wrap"}}>
            <span style={{fontSize:10,color:th.muted,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>{t.sortBy}:</span>
            {[["priority","sortPriority"],["created","sortCreated"],["deadline","sortDeadline"],["title","sortTitle"],["weight","sortWeight"]].map(([s,key])=>(
              <button key={s} onClick={()=>setSortBy(s)} style={{padding:"3px 7px",borderRadius:6,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,background:sortBy===s?`${accent}18`:"transparent",color:sortBy===s?accent:th.textSub,transition:"all 0.18s"}}>
                {t[key]}
              </button>
            ))}
          </div>
          <div style={{display:"flex",gap:5,alignItems:"center"}}>
            {goals.filter(g=>!g.archived).length>0&&(
              <button onClick={()=>{setBulkMode(p=>!p);setSelectedIds(new Set());}} style={{padding:"4px 9px",borderRadius:7,border:`1px solid ${bulkMode?accent:th.border}`,cursor:"pointer",fontSize:10,fontWeight:700,background:bulkMode?`${accent}10`:"transparent",color:bulkMode?accent:th.textSub,transition:"all 0.18s"}}>{bulkMode?t.deselectAll:t.bulkSelect}</button>
            )}
            {bulkMode&&selectedIds.size>0&&(
              <>
                <button onClick={()=>bulkAction("complete")} style={{padding:"4px 9px",borderRadius:7,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,background:"#10b98116",color:"#059669"}}>{t.bulkComplete} ({selectedIds.size})</button>
                <button onClick={()=>bulkAction("delete")} style={{padding:"4px 9px",borderRadius:7,border:"none",cursor:"pointer",fontSize:10,fontWeight:700,background:"#ef444416",color:"#dc2626"}}>{t.bulkDelete}</button>
              </>
            )}
            <button onClick={exportData} title={t.exportData} style={{width:27,height:27,borderRadius:7,border:"none",cursor:"pointer",fontSize:13,background:th.btnBg,color:th.textSub,display:"flex",alignItems:"center",justifyContent:"center"}}>⬆</button>
            <label title={t.importData} style={{width:27,height:27,borderRadius:7,cursor:"pointer",fontSize:13,background:th.btnBg,color:th.textSub,display:"flex",alignItems:"center",justifyContent:"center"}}>⬇<input type="file" accept=".json" onChange={importData} style={{display:"none"}}/></label>
          </div>
        </div>

        {/* GOAL LIST or BOARD */}
        {viewMode==="board" ? (
          <div className="vboard">
            {filtered.length===0?(
              <div style={{...card,padding:"42px 18px",textAlign:"center",gridColumn:"1/-1"}}>
                <div style={{fontSize:36,marginBottom:9}}>{search?"🔍":"🎯"}</div>
                <div style={{fontWeight:800,fontSize:14,color:th.textSub}}>{search?t.emptySearch:t.emptyTitle}</div>
              </div>
            ):filtered.map(goal=>(
              <VisionCard key={goal.id} goal={goal} th={th} t={t} accent={accent} onToggle={toggleComplete} onEdit={openEdit}/>
            ))}
          </div>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:7}}>
            {filtered.length===0?(
              <div style={{...card,padding:"42px 18px",textAlign:"center"}}>
                <div style={{fontSize:36,marginBottom:9}}>{search?"🔍":"🎯"}</div>
                <div style={{fontFamily:"'Outfit',sans-serif",fontWeight:800,fontSize:14,color:th.textSub,marginBottom:4}}>{search?t.emptySearch:t.emptyTitle}</div>
                <div style={{fontSize:12,color:th.muted}}>{!search&&t.emptyDesc}</div>
                <div style={{marginTop:12,fontSize:11,color:th.muted,fontStyle:"italic",maxWidth:250,margin:"12px auto 0",lineHeight:1.6}}>"{quote}"</div>
              </div>
            ):(
              filtered.map((goal,idx)=>{
                const dl=getDL(goal);
                const pc=PRI_STYLE[goal.priority]||PRI_STYLE.medium;
                const cc=CAT_COLOR[goal.category]||CAT_COLOR.other;
                const sd=(goal.subtasks||[]).filter(s=>s.done).length;
                const st=(goal.subtasks||[]).length;
                const isExp=expandedId===goal.id;
                const isSel=selectedIds.has(goal.id);
                const proj=projects.find(p=>p.id===goal.projectId);

                return (
                  <div key={goal.id} className="gc ge" style={{
                    ...card,
                    animationDelay:`${idx*0.022}s`,
                    opacity:goal.completed?0.62:1,
                    border:isSel?`1.5px solid ${accent}50`:goal.pinned?`1px solid ${accent}25`:`1px solid ${th.border}`,
                    background:isSel?`${accent}07`:th.card}}>
                    {delConfirm===goal.id?(
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                        <span style={{fontSize:13,color:th.textSub}}>{t.deleteConfirm}</span>
                        <div style={{display:"flex",gap:7}}>
                          <button onClick={()=>deleteGoal(goal.id)} style={{padding:"5px 12px",borderRadius:8,border:"none",cursor:"pointer",background:"#ef4444cc",color:"#fff",fontSize:12,fontWeight:700}}>Delete</button>
                          <button onClick={()=>setDelConfirm(null)} style={{padding:"5px 12px",borderRadius:8,border:"none",cursor:"pointer",background:th.btnBg,color:th.textSub,fontSize:12,fontWeight:700}}>{t.cancel}</button>
                        </div>
                      </div>
                    ):(
                      <>
                        <div style={{display:"flex",alignItems:"flex-start",gap:8}}>
                          {bulkMode&&(
                            <input type="checkbox" checked={isSel}
                              onChange={e=>{setSelectedIds(p=>{const n=new Set(p);e.target.checked?n.add(goal.id):n.delete(goal.id);return n;});}}
                              style={{marginTop:3,accentColor:accent,width:14,height:14,flexShrink:0,cursor:"pointer"}}
                            />
                          )}
                          <button onClick={()=>toggleComplete(goal.id)} style={{
                            width:19,height:19,borderRadius:10,flexShrink:0,marginTop:2,
                            border:`2px solid ${goal.completed?"#10b981":pc.border}`,
                            background:goal.completed?"#10b981":pc.bg,
                            cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                            color:"#fff",fontSize:9,fontWeight:900,
                            transition:"all 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                            boxShadow:goal.completed?"0 0 9px #10b98135":"none"}}>
                            {goal.completed?"✓":""}
                          </button>
                          <div style={{width:4,height:4,borderRadius:2,background:cc,flexShrink:0,marginTop:7}}/>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{display:"flex",alignItems:"center",flexWrap:"wrap",gap:5,marginBottom:2}}>
                              {goal.pinned&&<span style={{fontSize:10}}>📌</span>}
                              {goal.recurring&&goal.recurring!=="none"&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:10,background:`${accent}15`,color:accent,fontWeight:700}}>🔄 {t[goal.recurring]}</span>}
                              <span style={{fontWeight:700,fontSize:"clamp(13px,3.5vw,14px)",lineHeight:1.3,color:th.text,textDecoration:goal.completed?"line-through":"none",opacity:goal.completed?0.5:1}}>{goal.title}</span>
                              <span style={{padding:"1px 6px",borderRadius:16,fontSize:10,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase",background:pc.bg,color:pc.text,border:`1px solid ${pc.border}`}}>{t[goal.priority]}</span>
                              <span style={{padding:"1px 6px",borderRadius:16,fontSize:10,fontWeight:600,background:`${cc}16`,color:cc}}>{CAT_EMOJI[goal.category]} {t[`cat_${goal.category}`]}</span>
                              {proj&&<span style={{padding:"1px 6px",borderRadius:16,fontSize:10,fontWeight:600,background:`${proj.color}18`,color:proj.color}}>📁 {proj.name}</span>}
                            </div>
                            {goal.desc&&<p style={{fontSize:12,color:th.textSub,marginBottom:3,lineHeight:1.5}}>{goal.desc}</p>}
                            {goal.tags&&(
                              <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:3}}>
                                {goal.tags.split(",").map(tag=>tag.trim()).filter(Boolean).map(tag=>(
                                  <span key={tag} style={{padding:"1px 5px",borderRadius:4,fontSize:10,background:th.btnBg,color:th.textSub}}>#{tag}</span>
                                ))}
                              </div>
                            )}
                            {st>0&&(
                              <div style={{marginBottom:3}}>
                                <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                                  <span style={{fontSize:10,color:th.muted}}>{t.subtasks}</span>
                                  <span style={{fontSize:10,color:th.muted}}>{sd}/{st}</span>
                                </div>
                                <div style={{height:3,borderRadius:3,background:th.btnBg}}>
                                  <div style={{height:"100%",borderRadius:3,background:accent,width:`${(sd/st)*100}%`,transition:"width 0.55s ease"}}/>
                                </div>
                              </div>
                            )}
                            {dl&&<p style={{fontSize:11,fontWeight:600,color:dl.color,marginTop:2}}>📅 {dl.text}</p>}
                            <div style={{display:"flex",gap:9,marginTop:2}}>
                              {goal.weight&&goal.weight!==5&&<span style={{fontSize:10,color:th.muted}}>⚖️ {goal.weight}/10</span>}
                              {timeData[goal.id]?.total>0&&<span style={{fontSize:10,color:th.muted}}>⏱️ {fmtTime(timeData[goal.id].total)}</span>}
                            </div>
                          </div>
                          <div className="ga-row" style={{display:"flex",gap:2,flexShrink:0,alignItems:"center"}}>
                            {[
                              {ic:isExp?"▲":"▼",act:()=>setExpandedId(isExp?null:goal.id),col:th.muted,op:0.5},
                              {ic:"🍅",act:()=>{setPomGoal(goal);setShowPomodoro(true);},col:th.muted,op:0.38},
                              {ic:"📌",act:()=>pinGoal(goal.id),col:goal.pinned?accent:th.muted,op:goal.pinned?0.9:0.38},
                              {ic:"✏️",act:()=>openEdit(goal),col:th.muted,op:0.38},
                              {ic:"⧉",act:()=>dupGoal(goal.id),col:th.muted,op:0.38},
                              {ic:goal.archived?"📤":"📦",act:()=>archiveGoal(goal.id),col:th.muted,op:0.38},
                              {ic:"🗑️",act:()=>setDelConfirm(goal.id),col:"#ef4444",op:0.45},
                            ].map(({ic,act,col,op})=>(
                              <button key={ic} onClick={act} className="ib" style={{width:25,height:25,borderRadius:7,border:"none",cursor:"pointer",fontSize:12,background:"transparent",color:col,opacity:op,transition:"all 0.16s",display:"flex",alignItems:"center",justifyContent:"center"}}>{ic}</button>
                            ))}
                          </div>
                        </div>

                        {isExp&&(
                          <div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${th.border}`}} className="fu">
                            <div style={{marginBottom:9}}>
                              <div style={{...label,marginBottom:6}}>{t.subtasks}</div>
                              <SubtaskList subtasks={goal.subtasks||[]} onChange={v=>setGoals(p=>p.map(g=>g.id===goal.id?{...g,subtasks:v}:g))} th={th} t={t}/>
                            </div>
                            <div style={{marginBottom:9}}>
                              <div style={{...label,marginBottom:6}}>{t.goalTimer}</div>
                              <GoalTimer goalId={goal.id} timeData={timeData} setTimeData={setTimeData} th={th} t={t}/>
                            </div>
                            <div>
                              <div style={{...label,marginBottom:6}}>{t.notes}</div>
                              <textarea value={goal.notes||""} onChange={e=>setGoals(p=>p.map(g=>g.id===goal.id?{...g,notes:e.target.value}:g))}
                                placeholder={t.notesPlaceholder} rows={3} style={{...inp,resize:"vertical",fontSize:12}} onFocus={fi} onBlur={fb}/>
                            </div>
                            <div style={{marginTop:7,display:"flex",gap:9,flexWrap:"wrap"}}>
                              <span style={{fontSize:10,color:th.muted}}>Created: {goal.createdAt?.split("T")[0]}</span>
                              {goal.completedAt&&<span style={{fontSize:10,color:th.muted}}>Done: {goal.completedAt?.split("T")[0]}</span>}
                              {timeData[goal.id]?.total>0&&<span style={{fontSize:10,color:th.muted}}>Time: {fmtTime(timeData[goal.id].total)}</span>}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {goals.length>0&&(
          <div style={{marginTop:18,textAlign:"center",fontSize:11,color:th.muted}}>
            {stats.done}/{stats.total} goals · {stats.pct}% · 🔥 {stats.streak} day streak · ⭐ {xp} XP
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div style={{position:"fixed",bottom:0,left:0,right:0,zIndex:100,background:dark?"rgba(8,12,20,0.9)":"rgba(238,242,251,0.92)",backdropFilter:"blur(18px)",borderTop:`1px solid ${th.border}`}}>
        <div style={{height:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${stats.pct}%`,background:stats.pct===100?"linear-gradient(90deg,#10b981,#059669)":`linear-gradient(90deg,${accent},${accent}99)`,transition:"width 1.4s cubic-bezier(0.4,0,0.2,1)",position:"relative",overflow:"hidden"}}>
            <div className="shim" style={{position:"absolute",inset:0}}/>
          </div>
        </div>
        <div style={{padding:"5px 13px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:10,color:th.muted,fontWeight:600}}>{t.appTitle} · Lv.{level} {levelTitle}</span>
          <span style={{fontSize:10,color:th.muted,fontWeight:600}}>{stats.pct===100&&stats.total>0?"🎉 All done!":stats.pct+"%"}</span>
          <span style={{fontSize:10,color:th.muted}}>? for help</span>
        </div>
      </div>
    </div>
  );
}