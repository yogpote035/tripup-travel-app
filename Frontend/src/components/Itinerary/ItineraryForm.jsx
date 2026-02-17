import { useState, useRef, useEffect } from "react";
import { toast } from "react-toastify";
import { generateItinerary } from "../../../AllStatesFeatures/Itinerary/AllItinerarySlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loading from "../../General/Loading";
import {
  MapPin, Calendar, Heart, Users, Wallet,
  Sunrise, Sunset, Bus, Sparkles, AlertTriangle,
  ArrowRight, ChevronLeft, ChevronRight, ChevronDown, Check,
} from "lucide-react";

// ─── Font + animation injection ───────────────────────────────────────────────
const FontLoader = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');
    .font-serif-display { font-family: 'Cormorant Garamond', serif; }
    .font-dm { font-family: 'DM Sans', sans-serif; }

    .cal-range-mid   { background-color:#FDE8E2; border-radius:0; color:#E8694A; }
    .cal-range-start,
    .cal-range-end   {
      background:linear-gradient(135deg,#E8694A,#D44F30)!important;
      color:white!important; border-radius:8px!important; font-weight:600!important;
      box-shadow:0 3px 10px rgba(232,105,74,.30);
    }

    @keyframes popIn  { from{opacity:0;transform:scaleY(.90) translateY(-8px)} to{opacity:1;transform:scaleY(1) translateY(0)} }
    @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
    .anim-pop  { animation:popIn  .22s cubic-bezier(.34,1.4,.64,1); transform-origin:top center; }
    .anim-fade { animation:fadeUp .35s ease both; }

    .scrollbar-hide::-webkit-scrollbar { display:none; }
    .scrollbar-hide { -ms-overflow-style:none; scrollbar-width:none; }

    .interest-pill { transition:all .22s cubic-bezier(.34,1.56,.64,1); }
    .interest-pill:hover:not(.interest-pill-active) { transform:translateY(-2px); }
    .interest-pill-active { transform:translateY(-2px); }

    .tp-sel { background:linear-gradient(135deg,#E8694A,#D44F30)!important; color:white!important; font-weight:600!important; }

    .trig-base {
      width:100%; display:flex; align-items:center; gap:12px;
      padding:11px 16px; border-radius:12px; border:1.5px solid #e7ddd3;
      background:#fdf9f5; font-family:'DM Sans',sans-serif; font-size:0.875rem;
      cursor:pointer; transition:all .2s; text-align:left;
    }
    .trig-base:hover { border-color:#f5c4b8; background:white; }
    .trig-open { border-color:#E8694A!important; box-shadow:0 0 0 3px rgba(232,105,74,.10)!important; background:white!important; }
    .trig-err  { border-color:#F5A592!important; background:#FFF8F6!important; }
  `}</style>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────
const MONTHS = ["January","February","March","April","May","June",
                "July","August","September","October","November","December"];
const WD     = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const sameDay   = (a,b) => a&&b && a.toDateString()===b.toDateString();
const isBetween = (d,s,e)=> s&&e && d>s && d<e;
const toISO     = d => !d?"": `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
const fmtDate   = d => d?.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const diffDays  = (s,e)=> s&&e ? Math.round((e-s)/86400000) : 0;

function buildCells(y,m){
  const cells=[], first=new Date(y,m,1).getDay(), tot=new Date(y,m+1,0).getDate(), prev=new Date(y,m,0).getDate();
  for(let i=first-1;i>=0;i--) cells.push({d:new Date(m===0?y-1:y,m===0?11:m-1,prev-i),other:true});
  for(let d=1;d<=tot;d++)      cells.push({d:new Date(y,m,d),other:false});
  while(cells.length<42)       cells.push({d:new Date(m===11?y+1:y,m===11?0:m+1,cells.length-first-tot+1),other:true});
  return cells;
}

function useOutside(ref,cb){
  useEffect(()=>{
    const h=e=>{ if(ref.current&&!ref.current.contains(e.target)) cb(); };
    document.addEventListener("mousedown",h);
    return ()=>document.removeEventListener("mousedown",h);
  },[cb]);
}

// ═══════════════════════════════════════════════════════════
// DATE RANGE PICKER
// ═══════════════════════════════════════════════════════════
function DateRangePicker({ onChange, hasError }){
  const today=new Date(); today.setHours(0,0,0,0);
  const [open,setOpen]   = useState(false);
  const [vy,setVy]       = useState(today.getFullYear());
  const [vm,setVm]       = useState(today.getMonth());
  const [start,setStart] = useState(null);
  const [end,setEnd]     = useState(null);
  const [hov,setHov]     = useState(null);
  const [phase,setPhase] = useState("start");
  const ref = useRef(null);
  useOutside(ref,()=>setOpen(false));

  const prevM=()=>{ vm===0?(setVm(11),setVy(y=>y-1)):setVm(v=>v-1); };
  const nextM=()=>{ vm===11?(setVm(0),setVy(y=>y+1)):setVm(v=>v+1); };

  const pick=d=>{
    if(d<today&&!sameDay(d,today)) return;
    if(phase==="start"||(start&&end)){
      setStart(d); setEnd(null); setPhase("end");
    } else {
      const s=d<start?d:start, e=d<start?start:d;
      setStart(s); setEnd(e); setPhase("start"); setOpen(false);
      onChange({startDate:toISO(s),endDate:toISO(e)});
    }
  };

  const clear=()=>{ setStart(null);setEnd(null);setPhase("start");onChange({startDate:"",endDate:""}); };
  const effEnd = end||hov;
  const nights = diffDays(start,end);
  const cells  = buildCells(vy,vm);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button type="button"
        className={`trig-base ${open?"trig-open":""} ${hasError?"trig-err":""}`}
        onClick={()=>setOpen(v=>!v)}>
        <span className="flex items-center justify-center w-7 h-7 bg-orange-50 rounded-[8px] flex-shrink-0">
          <Calendar size={14} color="#E8694A" strokeWidth={2.2}/>
        </span>
        <span className="flex-1 min-w-0 font-dm">
          {start&&end ? (
            <span className="flex items-center gap-2 flex-wrap text-stone-700 font-medium">
              <span>{fmtDate(start)}</span>
              <span className="text-orange-400 font-bold text-base leading-none">→</span>
              <span>{fmtDate(end)}</span>
              <span className="text-stone-400 text-xs font-normal">· {nights} night{nights!==1?"s":""}</span>
            </span>
          ) : start ? (
            <span className="text-stone-700 font-medium">{fmtDate(start)} <span className="text-stone-400 font-normal">→ Pick end date</span></span>
          ) : (
            <span className="text-stone-400">Select your travel dates…</span>
          )}
        </span>
        <ChevronDown size={15} className="text-stone-400 flex-shrink-0 transition-transform duration-200"
          style={{transform:open?"rotate(180deg)":"none"}}/>
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border-[1.5px] border-stone-200 rounded-2xl overflow-hidden anim-pop
          shadow-[0_20px_60px_rgba(26,18,8,.13),0_6px_18px_rgba(26,18,8,.07)]">

          {/* Month nav */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100">
            <button type="button" onClick={prevM}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-stone-200 bg-stone-50 text-stone-500
                hover:bg-orange-50 hover:border-orange-200 hover:text-orange-500 transition-all">
              <ChevronLeft size={14}/>
            </button>
            <span className="font-serif-display text-lg font-bold tracking-tight text-stone-700">
              {MONTHS[vm]} <span className="text-stone-400 font-normal text-base">{vy}</span>
            </span>
            <button type="button" onClick={nextM}
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-stone-200 bg-stone-50 text-stone-500
                hover:bg-orange-50 hover:border-orange-200 hover:text-orange-500 transition-all">
              <ChevronRight size={14}/>
            </button>
          </div>

          {/* Weekdays */}
          <div className="grid grid-cols-7 px-3 pt-3 pb-1">
            {WD.map(d=>(
              <div key={d} className="text-center text-[0.62rem] font-bold tracking-widest uppercase text-stone-400 py-1 font-dm">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 px-3 pb-4 gap-y-0.5">
            {cells.map(({d,other},i)=>{
              const isPast  = d<today&&!sameDay(d,today);
              const isStart = sameDay(d,start);
              const isEnd   = sameDay(d,end);
              const inRange = start&&effEnd&&isBetween(d,start,effEnd);
              const isToday = sameDay(d,today);

              let cls="relative flex items-center justify-center h-9 text-sm font-dm border-none cursor-pointer transition-all duration-100 ";
              if(other)        cls+="text-stone-300 cursor-default pointer-events-none ";
              else if(isPast)  cls+="text-stone-300 cursor-not-allowed opacity-40 ";
              else if(isStart) cls+="cal-range-start ";
              else if(isEnd)   cls+="cal-range-end ";
              else if(inRange) cls+="cal-range-mid cursor-pointer ";
              else             cls+="text-stone-600 hover:bg-orange-50 hover:text-orange-500 rounded-lg ";

              return (
                <button key={i} type="button" className={cls}
                  onClick={()=>!other&&!isPast&&pick(d)}
                  onMouseEnter={()=>{ if(start&&!end) setHov(d); }}
                  onMouseLeave={()=>setHov(null)}
                  disabled={isPast||other}>
                  {d.getDate()}
                  {isToday&&!isStart&&!isEnd&&(
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-400"/>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-stone-100 bg-stone-50/80">
            <span className="text-xs text-stone-500 font-dm">
              {!start ? "Click to choose start date"
               : !end ? "Now pick your end date"
               : <><span className="text-orange-500 font-semibold">{nights} night{nights!==1?"s":""}</span> selected</>}
            </span>
            <button type="button" onClick={clear}
              className="text-xs font-semibold text-stone-400 hover:text-orange-500 transition-colors font-dm">
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TIME PICKER
// ═══════════════════════════════════════════════════════════
function TimePicker({ value, onChange, placeholder, icon: Icon, hasError }){
  const [open,setOpen] = useState(false);
  const ref=useRef(null), hrRef=useRef(null), minRef=useRef(null);
  useOutside(ref,()=>setOpen(false));

  const parse=v=>{
    if(!v) return {h:8,m:0,ap:"AM"};
    const [hh,mm]=v.split(":").map(Number);
    return {h:hh===0?12:hh>12?hh-12:hh, m:mm, ap:hh<12?"AM":"PM"};
  };
  const {h,m,ap}=parse(value);
  const to24=(hh,mm,a)=>{ let h24=hh%12; if(a==="PM") h24+=12; return `${String(h24).padStart(2,"0")}:${String(mm).padStart(2,"0")}`; };

  useEffect(()=>{
    if(open) setTimeout(()=>{
      hrRef.current?.querySelector(".tp-sel")?.scrollIntoView({block:"center",behavior:"smooth"});
      minRef.current?.querySelector(".tp-sel")?.scrollIntoView({block:"center",behavior:"smooth"});
    },80);
  },[open]);

  const HOURS=[...Array(12)].map((_,i)=>i+1);
  const MINS =[...Array(12)].map((_,i)=>i*5);
  const display=value?`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")} ${ap}`:null;

  return (
    <div className="relative" ref={ref}>
      <button type="button"
        className={`trig-base ${open?"trig-open":""} ${hasError?"trig-err":""}`}
        onClick={()=>setOpen(v=>!v)}>
        <span className="flex items-center justify-center w-7 h-7 bg-orange-50 rounded-[8px] flex-shrink-0">
          <Icon size={14} color="#E8694A" strokeWidth={2.2}/>
        </span>
        <span className="flex-1 font-dm">
          {display
            ? <span className="font-semibold text-stone-700 tracking-wide">{display}</span>
            : <span className="text-stone-400">{placeholder}</span>}
        </span>
        <ChevronDown size={15} className="text-stone-400 transition-transform duration-200"
          style={{transform:open?"rotate(180deg)":"none"}}/>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 w-56 bg-white border-[1.5px] border-stone-200 rounded-2xl overflow-hidden anim-pop
          shadow-[0_20px_60px_rgba(26,18,8,.13),0_6px_18px_rgba(26,18,8,.07)]">

          {/* Header preview */}
          <div className="px-4 py-3 bg-gradient-to-br from-stone-50 to-orange-50/30 border-b border-stone-100">
            <p className="text-[0.62rem] font-bold uppercase tracking-[.12em] text-stone-400 font-dm mb-0.5">{placeholder}</p>
            <p className="font-serif-display text-2xl font-bold text-orange-500 leading-none tracking-tight">
              {display||"—"}
            </p>
          </div>

          {/* Columns */}
          <div className="flex border-b border-stone-100">
            {/* Hours */}
            <div ref={hrRef} className="flex-1 max-h-48 overflow-y-auto scrollbar-hide border-r border-stone-100 py-1">
              <div className="text-center text-[0.58rem] font-bold tracking-[.14em] uppercase text-stone-300 py-1.5 sticky top-0 bg-white font-dm">HR</div>
              {HOURS.map(hh=>(
                <button key={hh} type="button" onClick={()=>onChange(to24(hh,m,ap))}
                  className={`w-full h-9 text-sm font-dm font-medium transition-colors
                    ${hh===h?"tp-sel":"text-stone-600 hover:bg-orange-50 hover:text-orange-500"}`}>
                  {String(hh).padStart(2,"0")}
                </button>
              ))}
            </div>

            {/* Minutes */}
            <div ref={minRef} className="flex-1 max-h-48 overflow-y-auto scrollbar-hide border-r border-stone-100 py-1">
              <div className="text-center text-[0.58rem] font-bold tracking-[.14em] uppercase text-stone-300 py-1.5 sticky top-0 bg-white font-dm">MIN</div>
              {MINS.map(mm=>(
                <button key={mm} type="button" onClick={()=>onChange(to24(h,mm,ap))}
                  className={`w-full h-9 text-sm font-dm font-medium transition-colors
                    ${mm===m?"tp-sel":"text-stone-600 hover:bg-orange-50 hover:text-orange-500"}`}>
                  {String(mm).padStart(2,"0")}
                </button>
              ))}
            </div>

            {/* AM / PM */}
            <div className="w-16 flex flex-col py-1">
              <div className="text-center text-[0.58rem] font-bold tracking-[.14em] uppercase text-stone-300 py-1.5 bg-white font-dm">—</div>
              {["AM","PM"].map(a=>(
                <button key={a} type="button" onClick={()=>onChange(to24(h,m,a))}
                  className={`flex-1 text-xs font-dm font-bold tracking-widest transition-colors
                    ${a===ap?"tp-sel":"text-stone-500 hover:bg-orange-50 hover:text-orange-500"}`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          {/* Done button */}
          <div className="flex justify-end px-4 py-2.5 bg-stone-50">
            <button type="button" onClick={()=>setOpen(false)}
              className="flex items-center gap-1.5 text-[0.72rem] font-bold uppercase tracking-widest font-dm
                text-orange-500 bg-orange-50 border border-orange-200 rounded-full px-4 py-1.5
                hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all">
              <Check size={11} strokeWidth={3}/> Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// CUSTOM SELECT
// ═══════════════════════════════════════════════════════════
function CustomSelect({ options, value, onChange, placeholder, hasError }){
  const [open,setOpen]=useState(false);
  const ref=useRef(null);
  useOutside(ref,()=>setOpen(false));
  const sel=options.find(o=>o.value===value);

  return (
    <div className="relative" ref={ref}>
      <button type="button"
        className={`trig-base ${open?"trig-open":""} ${hasError?"trig-err":""}`}
        onClick={()=>setOpen(v=>!v)}>
        <span className={`flex-1 font-dm ${sel?"text-stone-700 font-medium":"text-stone-400"}`}>
          {sel ? `${sel.emoji} ${sel.label}` : placeholder}
        </span>
        <ChevronDown size={15} className="text-stone-400 flex-shrink-0 transition-transform duration-200"
          style={{transform:open?"rotate(180deg)":"none"}}/>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white border-[1.5px] border-stone-200 rounded-xl overflow-hidden anim-pop
          shadow-[0_12px_40px_rgba(26,18,8,.11),0_4px_12px_rgba(26,18,8,.06)]">
          {options.map(o=>(
            <button key={o.value} type="button"
              onClick={()=>{ onChange(o.value); setOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-dm transition-colors text-left
                ${o.value===value
                  ? "bg-orange-50 text-orange-600 font-semibold"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"}`}>
              <span className="text-base">{o.emoji}</span>
              <span className="flex-1">{o.label}</span>
              {o.value===value && <Check size={14} className="text-orange-500" strokeWidth={2.5}/>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// FIELD ERROR
// ═══════════════════════════════════════════════════════════
const FieldError = ({ msg }) => msg ? (
  <span className="flex items-center gap-1.5 text-red-500 text-xs font-medium font-dm mt-0.5">
    <AlertTriangle size={11}/> {msg}
  </span>
) : null;

// ═══════════════════════════════════════════════════════════
// SECTION LABEL
// ═══════════════════════════════════════════════════════════
const SectionLabel = ({ icon: Icon, children, required }) => (
  <label className="flex items-center gap-2 text-sm font-semibold text-stone-700 font-dm">
    <span className="flex items-center justify-center w-6 h-6 bg-orange-50 rounded-[7px] flex-shrink-0">
      <Icon size={13} color="#E8694A" strokeWidth={2.3}/>
    </span>
    {children}
    {required && <span className="text-orange-400 text-[0.65rem] ml-0.5">*</span>}
  </label>
);

// ═══════════════════════════════════════════════════════════
// MAIN FORM
// ═══════════════════════════════════════════════════════════
const ItineraryForm = () => {
  const { loading, error } = useSelector((state) => state.itinerary);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    destination:"", startDate:"", endDate:"",
    interests:[], tripType:"", startTime:"",
    endTime:"", budget:"", transportMode:"",
  });
  const [touched, setTouched] = useState({});
  const touch = f => setTouched(p=>({...p,[f]:true}));

  const INTERESTS = [
    {value:"nature",   icon:"🌿",label:"Nature"},
    {value:"food",     icon:"🍜",label:"Food"},
    {value:"heritage", icon:"🏛️",label:"Heritage"},
    {value:"nightlife",icon:"🌃",label:"Nightlife"},
    {value:"adventure",icon:"🏔️",label:"Adventure"},
    {value:"shopping", icon:"🛍️",label:"Shopping"},
    {value:"romantic", icon:"💑",label:"Romantic"},
  ];
  const TRIP_TYPES = [
    {value:"solo",   emoji:"🧳",label:"Solo"},
    {value:"couple", emoji:"💑",label:"Couple"},
    {value:"family", emoji:"👨‍👩‍👧‍👦",label:"Family"},
    {value:"friends",emoji:"👯",label:"Friends"},
  ];
  const BUDGETS = [
    {value:"low",   emoji:"💵",label:"Low"},
    {value:"medium",emoji:"💴",label:"Medium"},
    {value:"high",  emoji:"💎",label:"High"},
  ];
  const TRANSPORT = [
    {value:"public", emoji:"🚌",label:"Public Transport"},
    {value:"private",emoji:"🚙",label:"Private Vehicle"},
    {value:"walking",emoji:"🚶",label:"Walking"},
  ];

  const toggleInterest = v => {
    setFormData(p=>({...p, interests: p.interests.includes(v) ? p.interests.filter(i=>i!==v) : [...p.interests,v]}));
    touch("interests");
  };

  const validate = () => {
    const e=[];
    if(!formData.destination.trim()) e.push("Destination is required");
    if(!formData.startDate)          e.push("Start date is required");
    if(!formData.endDate)            e.push("End date is required");
    if(!formData.interests.length)   e.push("Select at least one interest");
    if(!formData.tripType)           e.push("Trip type is required");
    if(!formData.startTime)          e.push("Start time is required");
    if(!formData.endTime)            e.push("End time is required");
    if(!formData.budget)             e.push("Budget is required");
    if(!formData.transportMode)      e.push("Transport mode is required");
    if(formData.startTime&&formData.endTime&&formData.startTime>=formData.endTime)
      e.push("End time must be after start time");
    return e;
  };

  const handleSubmit = e => {
    e.preventDefault();
    const keys=["destination","startDate","endDate","interests","tripType","startTime","endTime","budget","transportMode"];
    setTouched(Object.fromEntries(keys.map(k=>[k,true])));
    const errors=validate();
    if(errors.length){ errors.forEach(err=>toast.warn(err)); return; }
    dispatch(generateItinerary(formData,navigate));
  };

  const fe = {
    destination:   touched.destination&&!formData.destination.trim()?"Destination is required":"",
    dates:         touched.startDate&&(!formData.startDate||!formData.endDate)?"Please select trip dates":"",
    interests:     touched.interests&&!formData.interests.length?"Select at least one interest":"",
    tripType:      touched.tripType&&!formData.tripType?"Trip type is required":"",
    budget:        touched.budget&&!formData.budget?"Budget is required":"",
    startTime:     touched.startTime&&!formData.startTime?"Start time is required":"",
    endTime:       touched.endTime&&!formData.endTime?"End time is required"
                   :(touched.endTime&&formData.startTime&&formData.endTime&&formData.startTime>=formData.endTime
                     ?"End time must be after start time":""),
    transportMode: touched.transportMode&&!formData.transportMode?"Transport mode is required":"",
  };

  if(loading) return <Loading message="Generating your perfect itinerary…" color="border-t-orange-400"/>;

  return (
    <div className="min-h-screen bg-[#FAF7F2] font-dm py-12 px-4"
      style={{backgroundImage:`
        radial-gradient(ellipse 80% 60% at 20% -10%, rgba(232,105,74,0.07) 0%, transparent 60%),
        radial-gradient(ellipse 60% 50% at 85% 10%, rgba(201,168,124,0.09) 0%, transparent 55%)
      `}}>
      <FontLoader/>

      <form onSubmit={handleSubmit} noValidate
        className="max-w-3xl mx-auto bg-white border-[1.5px] border-stone-100 rounded-3xl overflow-hidden anim-fade
          shadow-[0_10px_40px_rgba(26,18,8,.10),0_4px_12px_rgba(26,18,8,.06)]">

        {/* ── HEADER ── */}
        <div className="text-center px-8 pt-10 pb-8 bg-gradient-to-b from-[#FDF5EE] to-white border-b border-stone-100">
          <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-500
            text-[0.68rem] font-bold tracking-[.12em] uppercase px-3.5 py-1.5 rounded-full mb-5 font-dm">
            <Sparkles size={10}/> AI-Powered
          </div>

          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[18px] mb-5
            bg-gradient-to-br from-orange-400 to-orange-600
            shadow-[0_8px_24px_rgba(232,105,74,0.30)]">
            <MapPin size={30} color="white" strokeWidth={2.2}/>
          </div>

          <h2 className="font-serif-display text-4xl font-bold text-stone-800 leading-tight tracking-tight mb-2">
            Plan Your <em className="text-orange-500">Dream Trip</em>
          </h2>
          <p className="text-stone-400 text-sm font-light font-dm">
            Answer a few questions and let AI craft your perfect itinerary
          </p>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1 mt-6 flex-wrap">
            {["Destination","Dates","Interests","Details"].map((s,i)=>(
              <span key={s} className="flex items-center gap-1">
                {i>0 && <span className="w-6 h-px bg-stone-200"/>}
                <span className="flex items-center gap-1.5 text-[0.72rem] font-semibold text-orange-500 font-dm">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_0_3px_rgba(232,105,74,0.15)]"/>
                  {s}
                </span>
              </span>
            ))}
          </div>
        </div>

        {/* ── FORM BODY ── */}
        <div className="px-8 py-8 flex flex-col gap-7">

          {/* Destination */}
          <div className="flex flex-col gap-2">
            <SectionLabel icon={MapPin} required>Destination</SectionLabel>
            <input
              name="destination" value={formData.destination} autoComplete="off"
              onChange={e=>{ setFormData(p=>({...p,destination:e.target.value})); touch("destination"); }}
              onBlur={()=>touch("destination")}
              placeholder="Where are you heading? e.g. Paris, Bali, Tokyo…"
              className={[
                "w-full px-4 py-3 rounded-xl border-[1.5px] bg-stone-50 text-stone-800 text-sm font-dm outline-none",
                "transition-all duration-200 placeholder:text-stone-400",
                "hover:border-orange-200 hover:bg-white",
                "focus:border-orange-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(232,105,74,0.10)]",
                fe.destination ? "border-orange-300 bg-orange-50/30" : "border-stone-200",
              ].join(" ")}
            />
            <FieldError msg={fe.destination}/>
          </div>

          <hr className="border-stone-100"/>

          {/* Trip Dates */}
          <div className="flex flex-col gap-2">
            <SectionLabel icon={Calendar} required>Trip Dates</SectionLabel>
            <DateRangePicker
              onChange={({startDate,endDate})=>{ setFormData(p=>({...p,startDate,endDate})); touch("startDate"); touch("endDate"); }}
              hasError={!!fe.dates}
            />
            <FieldError msg={fe.dates}/>
          </div>

          <hr className="border-stone-100"/>

          {/* Interests */}
          <div className="flex flex-col gap-2.5">
            <SectionLabel icon={Heart} required>Your Interests</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map(({value,icon,label})=>{
                const active=formData.interests.includes(value);
                return (
                  <button key={value} type="button" onClick={()=>toggleInterest(value)}
                    className={[
                      "interest-pill inline-flex items-center gap-2 px-4 py-2.5 rounded-full",
                      "border-[1.5px] text-sm font-medium font-dm outline-none select-none",
                      active
                        ? "interest-pill-active bg-gradient-to-br from-orange-400 to-orange-600 border-orange-500 text-white shadow-[0_4px_14px_rgba(232,105,74,0.28)]"
                        : "bg-stone-50 border-stone-200 text-stone-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600",
                    ].join(" ")}>
                    <span className="text-base leading-none">{icon}</span>
                    {label}
                  </button>
                );
              })}
            </div>
            <FieldError msg={fe.interests}/>
          </div>

          <hr className="border-stone-100"/>

          {/* Grid: Trip Type + Budget + Times + Transport */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div className="flex flex-col gap-2">
              <SectionLabel icon={Users} required>Trip Type</SectionLabel>
              <CustomSelect options={TRIP_TYPES} value={formData.tripType} hasError={!!fe.tripType}
                placeholder="Select type…"
                onChange={v=>{ setFormData(p=>({...p,tripType:v})); touch("tripType"); }}/>
              <FieldError msg={fe.tripType}/>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel icon={Wallet} required>Budget</SectionLabel>
              <CustomSelect options={BUDGETS} value={formData.budget} hasError={!!fe.budget}
                placeholder="Select budget…"
                onChange={v=>{ setFormData(p=>({...p,budget:v})); touch("budget"); }}/>
              <FieldError msg={fe.budget}/>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel icon={Sunrise} required>Daily Start Time</SectionLabel>
              <TimePicker value={formData.startTime} icon={Sunrise} hasError={!!fe.startTime}
                placeholder="Choose start time…"
                onChange={v=>{ setFormData(p=>({...p,startTime:v})); touch("startTime"); }}/>
              <FieldError msg={fe.startTime}/>
            </div>

            <div className="flex flex-col gap-2">
              <SectionLabel icon={Sunset} required>Daily End Time</SectionLabel>
              <TimePicker value={formData.endTime} icon={Sunset} hasError={!!fe.endTime}
                placeholder="Choose end time…"
                onChange={v=>{ setFormData(p=>({...p,endTime:v})); touch("endTime"); }}/>
              <FieldError msg={fe.endTime}/>
            </div>

            <div className="flex flex-col gap-2 sm:col-span-2">
              <SectionLabel icon={Bus} required>Transport Mode</SectionLabel>
              <CustomSelect options={TRANSPORT} value={formData.transportMode} hasError={!!fe.transportMode}
                placeholder="Select transport…"
                onChange={v=>{ setFormData(p=>({...p,transportMode:v})); touch("transportMode"); }}/>
              <FieldError msg={fe.transportMode}/>
            </div>
          </div>

          {/* API Error */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-dm">
              <AlertTriangle size={17} className="flex-shrink-0"/> {error}
            </div>
          )}

          {/* Submit */}
          <div className="text-center pt-2">
            <button type="submit"
              className="inline-flex items-center gap-2.5 px-9 py-3.5 rounded-full font-semibold text-white text-sm font-dm
                bg-gradient-to-br from-orange-400 to-orange-600
                shadow-[0_8px_24px_rgba(232,105,74,0.30)]
                hover:shadow-[0_14px_34px_rgba(232,105,74,0.38)]
                hover:-translate-y-0.5 active:translate-y-0
                transition-all duration-200">
              <Sparkles size={16} strokeWidth={2}/>
              Generate My Itinerary
              <ArrowRight size={16} strokeWidth={2.5}/>
            </button>
            <p className="mt-3 text-xs text-stone-400 font-light font-dm">
              Usually takes 10–20 seconds · Powered by AI
            </p>
          </div>

        </div>
      </form>
    </div>
  );
};

export default ItineraryForm;