import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, FileText, History, Bell, Clock, CheckCircle, AlertTriangle, ChevronRight, ArrowLeft, ArrowRight } from 'lucide-react';
import Layout from '../shared/Layout';
import Notifications from '../shared/Notifications';
import { examAPI, attemptAPI, miscAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to:'/student',               icon:LayoutDashboard, label:'Dashboard',    end:true },
  { to:'/student/exams',         icon:FileText,        label:'My Exams'            },
  { to:'/student/history',       icon:History,         label:'History'             },
  { to:'/student/notifications', icon:Bell,            label:'Notifications'       },
];

export default function StudentDashboard() {
  return (
    <Layout nav={NAV}>
      <Routes>
        <Route index                    element={<StudentHome/>}/>
        <Route path="exams"             element={<StudentExams/>}/>
        <Route path="exams/:examId/take" element={<TakeExam/>}/>
        <Route path="results/:id"        element={<ExamResult/>}/>
        <Route path="history"            element={<StudentHistory/>}/>
        <Route path="notifications"      element={<Notifications/>}/>
      </Routes>
    </Layout>
  );
}

// ── HOME ─────────────────────────────────────────────────────────────────────
function StudentHome() {
  const { user } = useAuth();
  const [exams,   setExams]   = useState([]);
  const [history, setHistory] = useState([]);
  const [ann,     setAnn]     = useState([]);

  useEffect(()=>{
    examAPI.list().then(r=>setExams(r.data));
    attemptAPI.history().then(r=>setHistory(r.data));
    miscAPI.announcements().then(r=>setAnn(r.data));
  },[]);

  const submitted = history.filter(h=>h.status==='submitted');
  const avg = submitted.length ? (submitted.reduce((a,h)=>a+parseFloat(h.percentage||0),0)/submitted.length).toFixed(1) : 0;
  const available = exams.filter(e=>e.status==='published'||e.status==='active');

  return (
    <div className="page">
      <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)',marginBottom:4}}>Hello, {user?.full_name?.split(' ')[0]} 👋</h1>
      <p style={{color:'var(--text-2)',fontSize:14,marginBottom:24}}>{user?.class} · Student Portal</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        {[
          ['Available Exams', available.length, '#6366f1'],
          ['Completed',       submitted.length, '#10b981'],
          ['Avg Score',       `${avg}%`,        '#f59e0b'],
          ['In Progress',     history.filter(h=>h.status==='in_progress').length, '#0ea5e9'],
        ].map(([l,v,c])=>(
          <div key={l} className="stat-card">
            <p style={{fontSize:11,color:'var(--text-2)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:5}}>{l}</p>
            <p style={{fontSize:26,fontWeight:800,color:c}}>{v}</p>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
        {/* Available exams */}
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h3 style={{fontSize:15,fontWeight:700}}>Available Exams</h3>
            <Link to="/student/exams" style={{fontSize:13,color:'var(--primary-light)',fontWeight:600}}>See all →</Link>
          </div>
          {available.slice(0,4).map(e=>(
            <div key={e.id} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid var(--border)'}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:'var(--primary)'}}>{e.title}</div>
                <div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>{e.subject_name} · ⏱ {e.duration_minutes}min</div>
              </div>
              {e.attempt_id ? (
                <Link to={`/student/results/${e.attempt_id}`} className="btn btn-ghost btn-sm">View Result</Link>
              ) : (
                <Link to={`/student/exams/${e.id}/take`} className="btn btn-primary btn-sm">Start →</Link>
              )}
            </div>
          ))}
          {!available.length && <p style={{color:'var(--text-3)',textAlign:'center',padding:24,fontSize:13}}>No exams available right now</p>}
        </div>

        {/* Announcements */}
        <div className="card">
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:14}}>Announcements</h3>
          {ann.slice(0,5).map(a=>(
            <div key={a.id} style={{padding:'9px 0',borderBottom:'1px solid var(--border)'}}>
              {a.is_pinned && <div style={{fontSize:10,color:'#b45309',fontWeight:700,marginBottom:3}}>📌 PINNED</div>}
              <div style={{fontSize:13,fontWeight:600,color:'var(--primary)',marginBottom:2}}>{a.title}</div>
              <div style={{fontSize:12,color:'var(--text-3)'}}>{new Date(a.created_at).toLocaleDateString()}</div>
            </div>
          ))}
          {!ann.length && <p style={{color:'var(--text-3)',textAlign:'center',padding:20,fontSize:13}}>No announcements</p>}
        </div>
      </div>
    </div>
  );
}

// ── EXAMS LIST ────────────────────────────────────────────────────────────────
function StudentExams() {
  const [exams, setExams]   = useState([]);
  const [loading,setLoading]= useState(true);
  const nav = useNavigate();

  useEffect(()=>{ examAPI.list().then(r=>setExams(r.data)).finally(()=>setLoading(false)); },[]);

  if (loading) return <div style={{textAlign:'center',paddingTop:80}}><span className="spinner spinner-lg" style={{margin:'0 auto'}}/></div>;

  return (
    <div className="page">
      <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)',marginBottom:6}}>My Exams</h1>
      <p style={{color:'var(--text-2)',fontSize:14,marginBottom:22}}>All exams available for your class</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:16}}>
        {exams.map(e=>(
          <div key={e.id} className="card" style={{position:'relative'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
              <span className={`badge badge-${e.status}`} style={{textTransform:'capitalize'}}>{e.status}</span>
              {e.my_score!=null && <span style={{fontSize:12,fontWeight:700,color:'#10b981'}}>✓ {parseFloat(e.my_score).toFixed(0)}%</span>}
            </div>
            <h3 style={{fontSize:16,fontWeight:700,color:'var(--primary)',marginBottom:6,lineHeight:1.3}}>{e.title}</h3>
            <p style={{fontSize:12,color:'var(--text-3)',marginBottom:14}}>{e.subject_name||'General'} · {e.teacher_name}</p>
            <div style={{display:'flex',gap:14,fontSize:12,color:'var(--text-3)',marginBottom:16}}>
              <span>📋 {e.question_count||0} questions</span>
              <span>⏱ {e.duration_minutes}min</span>
              <span>🎯 Pass: {e.pass_mark}%</span>
            </div>
            {e.attempt_id ? (
              <Link to={`/student/results/${e.attempt_id}`} className="btn btn-ghost btn-sm" style={{width:'100%',justifyContent:'center'}}>
                <CheckCircle size={14} color="#10b981"/> View Result
              </Link>
            ) : (e.status==='published'||e.status==='active') ? (
              <Link to={`/student/exams/${e.id}/take`} className="btn btn-primary btn-sm" style={{width:'100%',justifyContent:'center'}}>
                Start Exam →
              </Link>
            ) : (
              <div className="btn btn-ghost btn-sm" style={{width:'100%',justifyContent:'center',opacity:.5,cursor:'default'}}>Not available</div>
            )}
          </div>
        ))}
        {!exams.length && (
          <div style={{gridColumn:'1/-1',textAlign:'center',paddingTop:60}}>
            <FileText size={48} color="var(--border-2)" style={{margin:'0 auto 16px'}}/>
            <h3 style={{fontSize:17,color:'var(--text-2)',marginBottom:8}}>No exams available</h3>
            <p style={{color:'var(--text-3)',fontSize:14}}>Check back later or contact your teacher</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TAKE EXAM ─────────────────────────────────────────────────────────────────
function TakeExam() {
  const { examId } = useParams();
  const nav = useNavigate();

  const [exam,      setExam]      = useState(null);
  const [attempt,   setAttempt]   = useState(null);
  const [answers,   setAnswers]   = useState({});
  const [current,   setCurrent]   = useState(0);
  const [timeLeft,  setTimeLeft]  = useState(null);
  const [phase,     setPhase]     = useState('loading'); // loading|intro|exam|submitting|done
  const [result,    setResult]    = useState(null);
  const timerRef = useRef(null);

  useEffect(()=>{
    examAPI.get(examId).then(r=>{ setExam(r.data); setPhase('intro'); }).catch(()=>{ toast.error('Exam not found'); nav('/student'); });
    return ()=>clearInterval(timerRef.current);
  },[examId]);

  const startExam = async () => {
    try {
      const { data } = await attemptAPI.start(examId);
      setAttempt(data.attempt);
      setAnswers(data.attempt.answers||{});
      const secs = (exam.duration_minutes||60)*60;
      setTimeLeft(secs);
      setPhase('exam');
      // Timer
      timerRef.current = setInterval(()=>{
        setTimeLeft(t=>{
          if (t<=1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
          return t-1;
        });
      },1000);
    } catch(err) { toast.error(err.response?.data?.error||'Could not start exam'); }
  };

  const selectAnswer = async (questionId, answer) => {
    const updated = { ...answers, [questionId]: answer };
    setAnswers(updated);
    if (attempt) {
      try { await attemptAPI.answer(attempt.id, questionId, answer); } catch {}
    }
  };

  const handleSubmit = useCallback(async (auto=false) => {
    if (!attempt) return;
    if (!auto && !window.confirm('Are you sure you want to submit? You cannot change your answers after submission.')) return;
    clearInterval(timerRef.current);
    setPhase('submitting');
    try {
      const { data } = await attemptAPI.submit(attempt.id, answers);
      setResult(data);
      setPhase('done');
    } catch(err) { toast.error('Submission failed. Retrying…'); setPhase('exam'); }
  },[attempt, answers]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const pct = exam ? Math.round(Object.keys(answers).length / (exam.questions?.length||1) * 100) : 0;

  if (phase==='loading') return <div style={{textAlign:'center',paddingTop:100}}><span className="spinner spinner-lg" style={{margin:'0 auto'}}/></div>;

  // ── INTRO ────────────────────────────────────────────────────────────────
  if (phase==='intro') return (
    <div className="page" style={{maxWidth:640,margin:'0 auto'}}>
      <div className="card" style={{textAlign:'center'}}>
        <div style={{width:68,height:68,borderRadius:20,background:'var(--primary-pale)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
          <FileText size={30} color="var(--primary-light)"/>
        </div>
        <h1 style={{fontSize:24,fontWeight:800,color:'var(--primary)',marginBottom:8}}>{exam.title}</h1>
        <p style={{color:'var(--text-2)',marginBottom:24}}>{exam.subject_name} · {exam.class_level}</p>

        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24}}>
          {[['Questions',exam.questions?.length||0,'📋'],['Duration',`${exam.duration_minutes} min`,'⏱'],['Pass Mark',`${exam.pass_mark}%`,'🎯']].map(([l,v,i])=>(
            <div key={l} style={{background:'var(--bg-subtle)',borderRadius:12,padding:'14px 10px',textAlign:'center'}}>
              <div style={{fontSize:22,marginBottom:6}}>{i}</div>
              <div style={{fontSize:20,fontWeight:800,color:'var(--primary)'}}>{v}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginTop:2}}>{l}</div>
            </div>
          ))}
        </div>

        {exam.instructions && (
          <div style={{background:'#fffbeb',border:'1px solid #fcd34d',borderRadius:12,padding:16,marginBottom:24,textAlign:'left'}}>
            <div style={{fontSize:13,fontWeight:700,color:'#b45309',marginBottom:6}}>📌 Instructions</div>
            <p style={{fontSize:13,color:'#78350f',lineHeight:1.65,whiteSpace:'pre-wrap'}}>{exam.instructions}</p>
          </div>
        )}

        <div style={{background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:12,padding:14,marginBottom:24,fontSize:13,color:'#166534',textAlign:'left'}}>
          <div style={{fontWeight:700,marginBottom:4}}>✅ Before you start:</div>
          <ul style={{paddingLeft:18,lineHeight:1.9}}>
            <li>Ensure you have a stable internet connection</li>
            <li>Find a quiet place — the timer starts immediately</li>
            <li>Answers are auto-saved as you go</li>
            <li>You can revisit questions before submitting</li>
          </ul>
        </div>

        <button className="btn btn-primary btn-lg" onClick={startExam} style={{width:'100%',justifyContent:'center',fontSize:16}}>
          Start Exam — Timer Begins Now →
        </button>
      </div>
    </div>
  );

  // ── SUBMITTING ────────────────────────────────────────────────────────────
  if (phase==='submitting') return (
    <div style={{textAlign:'center',paddingTop:120}}>
      <span className="spinner spinner-lg" style={{margin:'0 auto 20px'}}/>
      <h2 style={{fontSize:20,color:'var(--primary)'}}>Submitting your exam…</h2>
      <p style={{color:'var(--text-2)',marginTop:8}}>Please wait, do not close this page</p>
    </div>
  );

  // ── RESULT PREVIEW ────────────────────────────────────────────────────────
  if (phase==='done' && result) {
    const att  = result.attempt;
    const pct2 = parseFloat(att.percentage||0);
    const pass = pct2 >= (exam?.pass_mark||50);
    const gc   = g => g==='A'||g==='B'?'#10b981':g==='F'?'#f43f5e':'#f59e0b';
    return (
      <div className="page" style={{maxWidth:600,margin:'0 auto'}}>
        <div className="card" style={{textAlign:'center'}}>
          <div style={{width:80,height:80,borderRadius:99,background:pass?'#ecfdf5':'#fff1f2',border:`3px solid ${pass?'#10b981':'#f43f5e'}`,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:32}}>
            {pass?'🎉':'😔'}
          </div>
          <h1 style={{fontSize:28,fontWeight:800,color:'var(--primary)',marginBottom:8}}>{pass?'Congratulations!':'Keep Trying!'}</h1>
          <p style={{color:'var(--text-2)',marginBottom:28}}>{pass?'You passed this exam!':'You did not meet the pass mark this time.'}</p>

          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:28}}>
            {[['Score',`${att.score}/${att.total_marks}`,'#6366f1'],['Percentage',`${pct2.toFixed(1)}%`,gc(att.grade)],['Grade',att.grade,gc(att.grade)]].map(([l,v,c])=>(
              <div key={l} style={{background:'var(--bg-subtle)',borderRadius:14,padding:'18px 10px'}}>
                <div style={{fontSize:11,color:'var(--text-3)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:6}}>{l}</div>
                <div style={{fontSize:28,fontWeight:800,color:c}}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{display:'flex',gap:10,justifyContent:'center',flexWrap:'wrap'}}>
            <Link to={`/student/results/${att.id}`} className="btn btn-primary">View Detailed Results</Link>
            <Link to="/student/exams" className="btn btn-ghost">Back to Exams</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── EXAM UI ───────────────────────────────────────────────────────────────
  const questions  = exam?.questions||[];
  const q          = questions[current];
  const totalQ     = questions.length;
  const answered   = Object.keys(answers).length;
  const isLow      = timeLeft !== null && timeLeft < 300;

  return (
    <div style={{maxWidth:900,margin:'0 auto'}}>
      {/* Top bar */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18,background:'white',borderRadius:14,padding:'12px 18px',border:'1px solid var(--border)',boxShadow:'var(--shadow)'}}>
        <div>
          <div style={{fontSize:14,fontWeight:700,color:'var(--primary)'}}>{exam.title}</div>
          <div style={{fontSize:12,color:'var(--text-3)',marginTop:1}}>Question {current+1} of {totalQ} · {answered} answered</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:14}}>
          {/* Progress */}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <div style={{width:80,height:6,background:'var(--border)',borderRadius:99,overflow:'hidden'}}>
              <div style={{height:'100%',width:`${pct}%`,background:'var(--primary-light)',borderRadius:99,transition:'width .3s'}}/>
            </div>
            <span style={{fontSize:12,color:'var(--text-3)'}}>{pct}%</span>
          </div>
          {/* Timer */}
          <div style={{display:'flex',alignItems:'center',gap:6,padding:'7px 14px',borderRadius:99,background:isLow?'#fff1f2':'var(--bg-subtle)',border:`1px solid ${isLow?'#fecdd3':'var(--border)'}`,color:isLow?'#f43f5e':'var(--text-2)'}}>
            <Clock size={14}/>
            <span style={{fontWeight:700,fontSize:14,fontVariantNumeric:'tabular-nums'}}>{timeLeft!==null?fmt(timeLeft):'--:--'}</span>
          </div>
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 200px',gap:16}}>
        {/* Question card */}
        <div className="card">
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}>
            <span style={{width:30,height:30,borderRadius:99,background:'var(--primary)',color:'white',fontSize:13,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{current+1}</span>
            <div style={{display:'flex',gap:8}}>
              <span className={`badge ${q?.question_type==='mcq'?'badge-published':q?.question_type==='true_false'?'badge-success':'badge-warning'}`} style={{fontSize:10}}>
                {q?.question_type==='true_false'?'T/F':q?.question_type==='short_answer'?'Short':'MCQ'}
              </span>
              <span style={{fontSize:12,color:'var(--text-3)'}}>{q?.marks} mark{q?.marks!==1?'s':''}</span>
            </div>
          </div>

          <p style={{fontSize:16,color:'var(--text)',lineHeight:1.7,marginBottom:22}}>{q?.question_text}</p>

          {/* MCQ */}
          {q?.question_type==='mcq' && (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {(Array.isArray(q.options)?q.options:JSON.parse(q.options||'[]')).map((opt,i)=>{
                const sel = answers[q.id]===opt;
                return (
                  <button key={i} onClick={()=>selectAnswer(q.id,opt)}
                    style={{padding:'13px 18px',borderRadius:12,border:`2px solid ${sel?'var(--primary-light)':'var(--border)'}`,
                      background: sel?'var(--primary-pale)':'white',
                      color: sel?'var(--primary-light)':'var(--text)',
                      fontWeight: sel?600:400, fontSize:14, textAlign:'left',
                      transition:'all .15s', cursor:'pointer', display:'flex', alignItems:'center', gap:12}}>
                    <span style={{width:26,height:26,borderRadius:99,border:`2px solid ${sel?'var(--primary-light)':'var(--border-2)'}`,
                      background: sel?'var(--primary-light)':'transparent',
                      color: sel?'white':'var(--text-3)',
                      display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,flexShrink:0}}>
                      {sel?'✓':String.fromCharCode(65+i)}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* T/F */}
          {q?.question_type==='true_false' && (
            <div style={{display:'flex',gap:12}}>
              {['True','False'].map(opt=>{
                const sel = answers[q.id]===opt;
                return (
                  <button key={opt} onClick={()=>selectAnswer(q.id,opt)}
                    style={{flex:1,padding:'16px',borderRadius:14,border:`2px solid ${sel?'var(--primary-light)':'var(--border)'}`,
                      background: sel?'var(--primary-pale)':'white',
                      color: sel?'var(--primary-light)':'var(--text)',
                      fontWeight:700, fontSize:16, transition:'all .15s',cursor:'pointer'}}>
                    {opt==='True'?'✅ True':'❌ False'}
                  </button>
                );
              })}
            </div>
          )}

          {/* Short answer */}
          {q?.question_type==='short_answer' && (
            <input className="form-input" placeholder="Type your answer…" style={{fontSize:15}}
              value={answers[q?.id]||''} onChange={e=>selectAnswer(q.id,e.target.value)}/>
          )}

          {/* Nav buttons */}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:24}}>
            <button className="btn btn-ghost" onClick={()=>setCurrent(p=>Math.max(0,p-1))} disabled={current===0}>
              <ArrowLeft size={15}/> Previous
            </button>
            {current < totalQ-1 ? (
              <button className="btn btn-primary" onClick={()=>setCurrent(p=>Math.min(totalQ-1,p+1))}>
                Next <ArrowRight size={15}/>
              </button>
            ) : (
              <button className="btn btn-success" onClick={()=>handleSubmit(false)}>
                <CheckCircle size={15}/> Submit Exam
              </button>
            )}
          </div>
        </div>

        {/* Question grid sidebar */}
        <div>
          <div className="card" style={{padding:16}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--text-2)',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:12}}>Questions</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:5}}>
              {questions.map((_,i)=>{
                const answered2 = answers[questions[i]?.id] !== undefined;
                const active    = i === current;
                return (
                  <button key={i} onClick={()=>setCurrent(i)}
                    style={{width:'100%',aspectRatio:'1',borderRadius:8,border:`2px solid ${active?'var(--primary-light)':answered2?'var(--emerald)':'var(--border)'}`,
                      background: active?'var(--primary-light)':answered2?'#ecfdf5':'white',
                      color: active?'white':answered2?'#059669':'var(--text-3)',
                      fontSize:12,fontWeight:active||answered2?700:400,transition:'all .12s',cursor:'pointer'}}>
                    {i+1}
                  </button>
                );
              })}
            </div>
            <div style={{marginTop:14,fontSize:11,color:'var(--text-3)',display:'flex',flexDirection:'column',gap:5}}>
              <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:10,height:10,borderRadius:2,background:'var(--emerald)',display:'block'}}/> Answered ({answered})</div>
              <div style={{display:'flex',alignItems:'center',gap:6}}><span style={{width:10,height:10,borderRadius:2,background:'white',border:'1.5px solid var(--border)',display:'block'}}/> Unanswered ({totalQ-answered})</div>
            </div>
            <button className="btn btn-danger" onClick={()=>handleSubmit(false)} style={{width:'100%',justifyContent:'center',marginTop:16,fontSize:13}}>
              Submit Exam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── RESULT DETAIL ─────────────────────────────────────────────────────────────
function ExamResult() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ attemptAPI.result(id).then(r=>setData(r.data)).finally(()=>setLoading(false)); },[id]);

  if (loading) return <div style={{textAlign:'center',paddingTop:80}}><span className="spinner spinner-lg" style={{margin:'0 auto'}}/></div>;
  if (!data)   return <div style={{textAlign:'center',paddingTop:80,color:'var(--text-3)'}}>Result not found</div>;

  const pct  = parseFloat(data.percentage||0);
  const pass = pct >= 50;
  const gc   = g => g==='A'||g==='B'?'#10b981':g==='F'?'#f43f5e':'#f59e0b';
  const answers = typeof data.answers === 'string' ? JSON.parse(data.answers||'{}') : (data.answers||{});

  return (
    <div className="page">
      <Link to="/student/exams" style={{display:'inline-flex',alignItems:'center',gap:6,color:'var(--text-2)',fontSize:13,marginBottom:18}}><ArrowLeft size={14}/> Back to Exams</Link>
      <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)',marginBottom:4}}>{data.exam_title}</h1>
      <p style={{color:'var(--text-2)',fontSize:14,marginBottom:24}}>{data.subject_name} · Submitted {new Date(data.submitted_at).toLocaleString()}</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        {[['Score',`${data.score}/${data.total_marks}`,'#6366f1'],['Percentage',`${pct.toFixed(1)}%`,gc(data.grade)],['Grade',data.grade,gc(data.grade)],['Time',`${data.time_taken_minutes}min`,'#0ea5e9']].map(([l,v,c])=>(
          <div key={l} className="stat-card">
            <p style={{fontSize:11,color:'var(--text-2)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:5}}>{l}</p>
            <p style={{fontSize:26,fontWeight:800,color:c}}>{v}</p>
          </div>
        ))}
      </div>

      {/* Result band */}
      <div style={{padding:'14px 20px',borderRadius:14,background:pass?'#f0fdf4':'#fff1f2',border:`1px solid ${pass?'#bbf7d0':'#fecdd3'}`,marginBottom:24,display:'flex',alignItems:'center',gap:12}}>
        <span style={{fontSize:28}}>{pass?'🎉':'📚'}</span>
        <div>
          <div style={{fontWeight:700,color:pass?'#166534':'#9f1239',fontSize:15}}>{pass?'You Passed!':'Below Pass Mark'}</div>
          <div style={{fontSize:13,color:pass?'#166534':'#9f1239',marginTop:2}}>{pass?'Great work! Keep up the excellent performance.':'Review the material and try again. You can do it!'}</div>
        </div>
      </div>

      {/* Question review */}
      {data.questions?.length > 0 && (
        <div className="card">
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:18,color:'var(--primary)'}}>Answer Review</h3>
          {data.questions.map((q,i)=>{
            const ans = answers[q.id];
            const correct = ans?.is_correct;
            return (
              <div key={q.id} style={{padding:'16px 0',borderBottom:'1px solid var(--border)',lastChild:{borderBottom:'none'}}}>
                <div style={{display:'flex',gap:10,alignItems:'flex-start'}}>
                  <span style={{width:26,height:26,borderRadius:99,background:correct?'#ecfdf5':'#fff1f2',border:`1.5px solid ${correct?'#10b981':'#f43f5e'}`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>
                    {correct?'✓':'✗'}
                  </span>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,color:'var(--text)',lineHeight:1.6,marginBottom:10}}><strong>Q{i+1}.</strong> {q.question_text}</p>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,fontSize:13}}>
                      <div style={{padding:'8px 12px',borderRadius:9,background:'#fff1f2',border:'1px solid #fecdd3'}}>
                        <div style={{fontSize:10,fontWeight:700,color:'#9f1239',marginBottom:3}}>YOUR ANSWER</div>
                        <div style={{color:'#e11d48'}}>{ans?.student_answer||'Not answered'}</div>
                      </div>
                      <div style={{padding:'8px 12px',borderRadius:9,background:'#f0fdf4',border:'1px solid #bbf7d0'}}>
                        <div style={{fontSize:10,fontWeight:700,color:'#166534',marginBottom:3}}>CORRECT ANSWER</div>
                        <div style={{color:'#059669',fontWeight:600}}>{ans?.correct_answer||q.correct_answer}</div>
                      </div>
                    </div>
                    {q.explanation && <div style={{marginTop:8,padding:'8px 12px',borderRadius:9,background:'#eff6ff',border:'1px solid #bfdbfe',fontSize:12,color:'#1d4ed8'}}><strong>💡 Explanation:</strong> {q.explanation}</div>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── HISTORY ──────────────────────────────────────────────────────────────────
function StudentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ attemptAPI.history().then(r=>setHistory(r.data)).finally(()=>setLoading(false)); },[]);

  const gc = g => g==='A'||g==='B'?'#10b981':g==='F'?'#f43f5e':'#f59e0b';

  return (
    <div className="page">
      <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)',marginBottom:6}}>Exam History</h1>
      <p style={{color:'var(--text-2)',fontSize:14,marginBottom:22}}>All your past exam attempts</p>
      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Exam</th><th>Subject</th><th>Score</th><th>%</th><th>Grade</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {loading?<tr><td colSpan={8} style={{textAlign:'center',padding:40}}><span className="spinner" style={{margin:'0 auto'}}/></td></tr>
              :history.map(h=>(
                <tr key={h.id}>
                  <td style={{fontWeight:600,fontSize:13}}><div style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{h.exam_title}</div></td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{h.subject_name||'—'}</td>
                  <td style={{fontWeight:600}}>{h.status==='submitted'?`${h.score}/${h.total_marks}`:'—'}</td>
                  <td style={{fontWeight:600,color:h.grade?gc(h.grade):'var(--text-3)'}}>{h.percentage?`${parseFloat(h.percentage).toFixed(1)}%`:'—'}</td>
                  <td>{h.grade?<strong style={{color:gc(h.grade),fontSize:15}}>{h.grade}</strong>:'—'}</td>
                  <td><span className={`badge badge-${h.status==='submitted'?'success':h.status==='in_progress'?'published':'archived'}`} style={{textTransform:'capitalize'}}>{h.status}</span></td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{new Date(h.created_at).toLocaleDateString()}</td>
                  <td>{h.status==='submitted'&&<Link to={`/student/results/${h.id}`} style={{fontSize:12,color:'var(--primary-light)',fontWeight:600}}>View →</Link>}</td>
                </tr>
              ))}
              {!loading&&!history.length&&<tr><td colSpan={8} style={{textAlign:'center',color:'var(--text-3)',padding:40}}>No exam history yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
