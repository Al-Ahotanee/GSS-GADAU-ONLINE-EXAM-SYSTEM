import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, BookOpen, Users, Award, Shield, Clock, Zap, Globe, ArrowRight, Star, ChevronRight, CheckCircle } from 'lucide-react';

const STATS  = [
  { value:'2,400+', label:'Students Enrolled',  icon: Users },
  { value:'180+',   label:'Exams Conducted',     icon: BookOpen },
  { value:'98%',    label:'Pass Rate',            icon: Award },
  { value:'24/7',   label:'System Uptime',        icon: Clock },
];
const FEATURES = [
  { icon:Shield,   title:'Secure & Proctored',   desc:'IP tracking, auto-timeout and session monitoring keeps every exam fair.',        color:'#6366f1' },
  { icon:Zap,      title:'Instant Results',       desc:'Automated grading delivers scores and detailed feedback the moment you submit.', color:'#f59e0b' },
  { icon:Globe,    title:'Any Device, Anywhere',  desc:'Phone, tablet or laptop — the responsive UI adapts to every screen.',            color:'#10b981' },
  { icon:BookOpen, title:'Rich Question Bank',    desc:'MCQ, True/False and Short Answer questions with full explanations.',             color:'#ec4899' },
  { icon:Award,    title:'Grade Analytics',       desc:'Students and teachers see trends, class rankings and performance breakdowns.',    color:'#0ea5e9' },
  { icon:Users,    title:'Multi-Role Dashboards', desc:'Tailored views for Admins, Teachers and Students — everyone sees what matters.', color:'#8b5cf6' },
];
const CLASSES = ['JSS 1','JSS 2','JSS 3','SS 1','SS 2','SS 3'];
const STEPS   = [
  { n:'01', title:'Create Account',  desc:'Register with your student ID. Teachers and admins can also self-register.',         color:'#6366f1' },
  { n:'02', title:'Take the Exam',   desc:'Log in, open your available exam and start. The countdown timer runs automatically.', color:'#f59e0b' },
  { n:'03', title:'See Your Score',  desc:'Submit and instantly view your score, grade and correct answers with explanations.',   color:'#10b981' },
];

const S = {
  page: { background:'#0f0e23', color:'#e0e7ff', fontFamily:"'Plus Jakarta Sans', sans-serif", overflow:'hidden' },
  nav:  { position:'fixed', top:0, left:0, right:0, zIndex:100, borderBottom:'1px solid rgba(255,255,255,0.06)', background:'rgba(15,14,35,0.88)', backdropFilter:'blur(20px)', padding:'0 24px' },
  navInner: { maxWidth:1280, margin:'0 auto', height:66, display:'flex', alignItems:'center', justifyContent:'space-between' },
  logo: { display:'flex', alignItems:'center', gap:10 },
  logoBox: { width:38, height:38, borderRadius:10, background:'linear-gradient(135deg,#4338ca,#f59e0b)', display:'flex', alignItems:'center', justifyContent:'center' },
};

export default function Landing() {
  const [activeClass, setActiveClass] = useState(0);

  useEffect(()=>{
    const t = setInterval(()=>setActiveClass(p=>(p+1)%CLASSES.length), 1800);
    return ()=>clearInterval(t);
  },[]);

  return (
    <div style={S.page}>
      {/* ── NAV ── */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.logo}>
            <div style={S.logoBox}><GraduationCap size={20} color="white"/></div>
            <div>
              <div style={{fontSize:15,fontWeight:800,color:'#e0e7ff'}}>GSS Gadau</div>
              <div style={{fontSize:10,color:'#6b7280',letterSpacing:'1.2px',textTransform:'uppercase',marginTop:-2}}>Exam Portal</div>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <Link to="/login"    style={{padding:'8px 18px',borderRadius:10,border:'1px solid rgba(255,255,255,0.12)',color:'#c7d2fe',fontSize:14,fontWeight:600}}>Sign In</Link>
            <Link to="/register" style={{padding:'8px 18px',borderRadius:10,background:'linear-gradient(135deg,#4338ca,#6366f1)',color:'white',fontSize:14,fontWeight:600,boxShadow:'0 2px 12px rgba(99,102,241,0.4)'}}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{minHeight:'100vh',display:'flex',alignItems:'center',position:'relative',paddingTop:80}}>
        {/* BG glows */}
        <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none'}}>
          <div style={{position:'absolute',top:'8%',left:'3%',  width:520,height:520,borderRadius:'50%',background:'radial-gradient(circle,rgba(99,102,241,.14) 0%,transparent 70%)',animation:'float 7s ease-in-out infinite'}}/>
          <div style={{position:'absolute',bottom:'8%',right:'3%',width:420,height:420,borderRadius:'50%',background:'radial-gradient(circle,rgba(245,158,11,.11) 0%,transparent 70%)',animation:'float 9s ease-in-out infinite reverse'}}/>
          {/* Grid */}
          <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.035}}>
            <defs><pattern id="g" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0L0 0 0 48" fill="none" stroke="#c7d2fe" strokeWidth=".6"/></pattern></defs>
            <rect width="100%" height="100%" fill="url(#g)"/>
          </svg>
        </div>

        <div style={{maxWidth:1280,margin:'0 auto',padding:'60px 24px',position:'relative',zIndex:1,width:'100%'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:72,alignItems:'center'}}>

            {/* LEFT */}
            <div style={{animation:'fadeUp .7s ease both'}}>
              <div style={{display:'inline-flex',alignItems:'center',gap:7,padding:'5px 13px',borderRadius:99,border:'1px solid rgba(99,102,241,.3)',background:'rgba(99,102,241,.1)',marginBottom:22}}>
                <Star size={11} color="#f59e0b" fill="#f59e0b"/>
                <span style={{fontSize:12,color:'#a5b4fc',fontWeight:600}}>Government Secondary School Gadau · Bauchi State</span>
              </div>
              <h1 style={{fontFamily:"'Fraunces',serif",fontSize:'clamp(40px,5vw,66px)',fontWeight:700,lineHeight:1.1,marginBottom:22,color:'#f0f4ff'}}>
                The Future of<br/>
                <span style={{background:'linear-gradient(135deg,#6366f1,#f59e0b)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>School Exams</span><br/>
                Is Here
              </h1>
              <p style={{fontSize:17,color:'#94a3b8',lineHeight:1.8,marginBottom:28,maxWidth:460}}>
                A comprehensive online examination platform built for GSS Gadau — secure, instant, and accessible for every class from JSS1 to SS3.
              </p>

              {/* Class pills */}
              <div style={{display:'flex',flexWrap:'wrap',gap:7,marginBottom:32}}>
                {CLASSES.map((cls,i)=>(
                  <span key={cls} onClick={()=>setActiveClass(i)} style={{padding:'4px 13px',borderRadius:99,fontSize:12,fontWeight:600,cursor:'pointer',transition:'all .3s',
                    background: i===activeClass?'rgba(99,102,241,.28)':'rgba(255,255,255,.04)',
                    border:`1px solid ${i===activeClass?'rgba(99,102,241,.55)':'rgba(255,255,255,.07)'}`,
                    color: i===activeClass?'#a5b4fc':'#6b7280'}}>
                    {cls}
                  </span>
                ))}
              </div>

              <div style={{display:'flex',gap:11,flexWrap:'wrap'}}>
                <Link to="/register" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 28px',borderRadius:14,background:'linear-gradient(135deg,#4338ca,#6366f1)',color:'white',fontWeight:700,fontSize:15,boxShadow:'0 4px 20px rgba(99,102,241,.42)'}}>
                  Start Your Journey <ArrowRight size={16}/>
                </Link>
                <Link to="/login" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'13px 28px',borderRadius:14,border:'1.5px solid rgba(255,255,255,.1)',color:'#c7d2fe',fontWeight:700,fontSize:15}}>
                  Sign In <ChevronRight size={15}/>
                </Link>
              </div>
            </div>

            {/* RIGHT – mock exam card */}
            <div style={{position:'relative',animation:'fadeUp .95s ease both'}}>
              <div style={{background:'rgba(26,24,54,.92)',border:'1px solid rgba(255,255,255,.08)',borderRadius:24,padding:26,boxShadow:'0 32px 80px rgba(0,0,0,.5)'}}>
                {/* header */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                  <div>
                    <div style={{fontSize:11,color:'#6b7280',textTransform:'uppercase',letterSpacing:'.6px',marginBottom:3}}>Active Exam</div>
                    <div style={{fontSize:17,fontWeight:700,color:'#e0e7ff'}}>Mathematics — SS 2</div>
                  </div>
                  <div style={{padding:'5px 12px',borderRadius:99,background:'rgba(16,185,129,.14)',color:'#10b981',fontSize:11,fontWeight:700,border:'1px solid rgba(16,185,129,.3)',display:'flex',alignItems:'center',gap:5}}>
                    <span style={{width:5,height:5,borderRadius:'50%',background:'#10b981',display:'block',animation:'pulse 1.8s infinite'}}/>LIVE
                  </div>
                </div>
                {/* question */}
                <div style={{background:'rgba(99,102,241,.08)',border:'1px solid rgba(99,102,241,.14)',borderRadius:12,padding:16,marginBottom:14}}>
                  <div style={{fontSize:11,color:'#6b7280',marginBottom:6}}>Question 3 of 20</div>
                  <div style={{fontSize:13,color:'#c7d2fe',lineHeight:1.65}}>What is the value of <em>x</em> in the equation: 3x + 12 = 27?</div>
                </div>
                {/* options */}
                {[['A','x = 3',false],['B','x = 5',true],['C','x = 7',false],['D','x = 9',false]].map(([ltr,txt,correct])=>(
                  <div key={ltr} style={{padding:'9px 13px',borderRadius:9,marginBottom:7,
                    background: correct?'rgba(16,185,129,.11)':'rgba(255,255,255,.025)',
                    border:`1px solid ${correct?'rgba(16,185,129,.28)':'rgba(255,255,255,.05)'}`,
                    fontSize:13,color:correct?'#10b981':'#94a3b8',fontWeight:correct?600:400,
                    display:'flex',alignItems:'center',gap:8}}>
                    {correct && <CheckCircle size={13}/>}{ltr}. {txt}
                  </div>
                ))}
                {/* timer */}
                <div style={{display:'flex',justifyContent:'space-between',marginTop:14,padding:'10px 14px',background:'rgba(245,158,11,.07)',borderRadius:9,border:'1px solid rgba(245,158,11,.14)'}}>
                  <span style={{fontSize:12,color:'#d97706',fontWeight:600}}>⏱ Time Remaining</span>
                  <span style={{fontSize:13,color:'#f59e0b',fontWeight:700,fontVariantNumeric:'tabular-nums'}}>42:18</span>
                </div>
              </div>

              {/* floating score */}
              <div style={{position:'absolute',top:-22,right:-28,background:'rgba(16,185,129,.12)',border:'1px solid rgba(16,185,129,.28)',backdropFilter:'blur(14px)',borderRadius:14,padding:'12px 18px',animation:'float 4s ease-in-out infinite'}}>
                <div style={{fontSize:10,color:'#6b7280',marginBottom:3}}>Latest Score</div>
                <div style={{fontSize:26,fontWeight:800,color:'#10b981'}}>87%</div>
                <div style={{fontSize:10,color:'#059669',fontWeight:600}}>Grade A — Excellent</div>
              </div>

              {/* floating students */}
              <div style={{position:'absolute',bottom:-18,left:-28,background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.28)',backdropFilter:'blur(14px)',borderRadius:14,padding:'12px 18px',animation:'float 5.5s ease-in-out infinite reverse'}}>
                <div style={{fontSize:10,color:'#6b7280',marginBottom:3}}>Students Online</div>
                <div style={{fontSize:22,fontWeight:800,color:'#818cf8'}}>1,248</div>
                <div style={{display:'flex',gap:3,marginTop:5}}>
                  {['#6366f1','#ec4899','#10b981','#f59e0b','#0ea5e9'].map(c=>(
                    <div key={c} style={{width:18,height:18,borderRadius:'50%',background:c,border:'2px solid rgba(26,24,54,.9)'}}/>
                  ))}
                  <span style={{fontSize:10,color:'#6b7280',marginLeft:3,lineHeight:'18px'}}>+243</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={{padding:'56px 24px',borderTop:'1px solid rgba(255,255,255,.05)',background:'rgba(99,102,241,.04)'}}>
        <div style={{maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:24}}>
          {STATS.map(({value,label,icon:Icon},i)=>(
            <div key={i} style={{textAlign:'center'}}>
              <div style={{width:46,height:46,borderRadius:13,background:'rgba(99,102,241,.12)',border:'1px solid rgba(99,102,241,.2)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 10px'}}>
                <Icon size={19} color="#818cf8"/>
              </div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:700,color:'#f0f4ff',letterSpacing:'-1px'}}>{value}</div>
              <div style={{fontSize:12,color:'#6b7280',marginTop:3}}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={{padding:'96px 24px'}}>
        <div style={{maxWidth:1280,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:60}}>
            <div style={{fontSize:12,fontWeight:700,color:'#6366f1',textTransform:'uppercase',letterSpacing:'2px',marginBottom:10}}>Everything You Need</div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:'clamp(30px,4vw,46px)',fontWeight:700,color:'#f0f4ff',lineHeight:1.2}}>Built for Modern Education</h2>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:22}}>
            {FEATURES.map(({icon:Icon,title,desc,color},i)=>(
              <div key={i} style={{background:'rgba(26,24,54,.55)',border:'1px solid rgba(255,255,255,.06)',borderRadius:20,padding:26,transition:'border-color .3s',cursor:'default'}}>
                <div style={{width:46,height:46,borderRadius:13,background:`${color}1a`,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
                  <Icon size={21} color={color}/>
                </div>
                <h3 style={{fontSize:16,fontWeight:700,color:'#e0e7ff',marginBottom:9}}>{title}</h3>
                <p style={{fontSize:13,color:'#64748b',lineHeight:1.75}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{padding:'80px 24px',background:'rgba(26,24,54,.45)'}}>
        <div style={{maxWidth:900,margin:'0 auto',textAlign:'center'}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:40,fontWeight:700,color:'#f0f4ff',marginBottom:12}}>How It Works</h2>
          <p style={{fontSize:15,color:'#64748b',marginBottom:56}}>Three simple steps — from registration to results</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:36}}>
            {STEPS.map(({n,title,desc,color},i)=>(
              <div key={i} style={{position:'relative'}}>
                {i<2 && <div style={{position:'absolute',top:26,left:'60%',width:'75%',height:1,borderTop:'2px dashed rgba(255,255,255,.07)'}}/>}
                <div style={{width:54,height:54,borderRadius:15,background:`${color}18`,border:`2px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 18px',fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color}}>
                  {n}
                </div>
                <h3 style={{fontSize:17,fontWeight:700,color:'#e0e7ff',marginBottom:9}}>{title}</h3>
                <p style={{fontSize:13,color:'#64748b',lineHeight:1.75}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{padding:'96px 24px',textAlign:'center'}}>
        <div style={{maxWidth:640,margin:'0 auto'}}>
          <div style={{width:68,height:68,borderRadius:19,background:'linear-gradient(135deg,#4338ca,#f59e0b)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 22px'}}>
            <GraduationCap size={30} color="white"/>
          </div>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:46,fontWeight:700,color:'#f0f4ff',marginBottom:14,lineHeight:1.15}}>Ready to Excel?</h2>
          <p style={{fontSize:16,color:'#64748b',marginBottom:36,lineHeight:1.8}}>
            Join thousands of GSS Gadau students and teachers on the platform built to transform how we assess learning.
          </p>
          <div style={{display:'flex',gap:11,justifyContent:'center',flexWrap:'wrap',marginBottom:28}}>
            <Link to="/register" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'14px 30px',borderRadius:14,background:'linear-gradient(135deg,#4338ca,#6366f1)',color:'white',fontWeight:700,fontSize:15,boxShadow:'0 4px 24px rgba(99,102,241,.5)'}}>
              Register Now <ArrowRight size={17}/>
            </Link>
            <Link to="/login" style={{display:'inline-flex',alignItems:'center',gap:8,padding:'14px 30px',borderRadius:14,border:'1.5px solid rgba(255,255,255,.1)',color:'#c7d2fe',fontWeight:700,fontSize:15}}>
              Admin Login
            </Link>
          </div>
          <div style={{fontSize:12,color:'#374151',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.07)',borderRadius:10,padding:'10px 18px',display:'inline-block'}}>
            Default admin — <code style={{color:'#818cf8'}}>admin@gssgadau.edu.ng</code> &nbsp;/&nbsp; <code style={{color:'#818cf8'}}>Admin@2024</code>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{borderTop:'1px solid rgba(255,255,255,.05)',padding:'36px 24px',textAlign:'center'}}>
        <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center',marginBottom:10}}>
          <div style={{width:26,height:26,borderRadius:7,background:'linear-gradient(135deg,#4338ca,#f59e0b)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <GraduationCap size={13} color="white"/>
          </div>
          <span style={{fontWeight:700,color:'#e0e7ff',fontSize:14}}>GSS Gadau Examination Portal</span>
        </div>
        <p style={{fontSize:12,color:'#374151'}}>© 2024 Government Secondary School Gadau, Bauchi State, Nigeria. All rights reserved.</p>
      </footer>
    </div>
  );
}
