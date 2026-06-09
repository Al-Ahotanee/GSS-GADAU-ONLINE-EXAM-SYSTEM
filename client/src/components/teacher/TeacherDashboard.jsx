import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { LayoutDashboard, FileText, Plus, Bell, BarChart2, PlusCircle, Pencil, Trash2, Upload, Eye, X, CheckCircle, AlertCircle } from 'lucide-react';
import Layout from '../shared/Layout';
import Notifications from '../shared/Notifications';
import { examAPI, miscAPI, attemptAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const NAV = [
  { to:'/teacher',              icon:LayoutDashboard, label:'Dashboard',      end:true },
  { to:'/teacher/exams',        icon:FileText,        label:'My Exams'              },
  { to:'/teacher/notifications',icon:Bell,            label:'Notifications'         },
];

export default function TeacherDashboard() {
  return (
    <Layout nav={NAV}>
      <Routes>
        <Route index              element={<TeacherHome/>}/>
        <Route path="exams"       element={<TeacherExams/>}/>
        <Route path="exams/new"   element={<ExamBuilder/>}/>
        <Route path="exams/:id"   element={<ExamBuilder/>}/>
        <Route path="exams/:id/results" element={<ExamResults/>}/>
        <Route path="notifications" element={<Notifications/>}/>
      </Routes>
    </Layout>
  );
}

// ── HOME ─────────────────────────────────────────────────────────────────────
function TeacherHome() {
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [ann,   setAnn]   = useState([]);

  useEffect(()=>{
    examAPI.list().then(r=>setExams(r.data));
    miscAPI.announcements().then(r=>setAnn(r.data));
  },[]);

  const stats = {
    total:     exams.length,
    published: exams.filter(e=>e.status==='published').length,
    active:    exams.filter(e=>e.status==='active').length,
    completed: exams.filter(e=>e.status==='completed').length,
  };

  return (
    <div className="page">
      <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)',marginBottom:4}}>Welcome, {user?.full_name?.split(' ')[0]} 👋</h1>
      <p style={{color:'var(--text-2)',fontSize:14,marginBottom:24}}>Manage your exams and track student performance</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:24}}>
        {[
          ['Total Exams',  stats.total,     '#6366f1','#eef2ff'],
          ['Published',    stats.published, '#3b82f6','#eff6ff'],
          ['Active',       stats.active,    '#10b981','#ecfdf5'],
          ['Completed',    stats.completed, '#8b5cf6','#f5f3ff'],
        ].map(([l,v,c,bg])=>(
          <div key={l} className="stat-card">
            <p style={{fontSize:11,color:'var(--text-2)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:5}}>{l}</p>
            <p style={{fontSize:26,fontWeight:800,color:c}}>{v}</p>
          </div>
        ))}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <div className="card">
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <h3 style={{fontSize:15,fontWeight:700}}>Recent Exams</h3>
            <Link to="/teacher/exams/new" className="btn btn-primary btn-sm"><Plus size={13}/> New</Link>
          </div>
          {exams.slice(0,5).map(e=>(
            <Link key={e.id} to={`/teacher/exams/${e.id}`} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 0',borderBottom:'1px solid var(--border)',textDecoration:'none'}}>
              <div>
                <div style={{fontSize:14,fontWeight:600,color:'var(--primary)'}}>{e.title}</div>
                <div style={{fontSize:12,color:'var(--text-3)',marginTop:2}}>{e.class_level} · {e.question_count||0} questions</div>
              </div>
              <span className={`badge badge-${e.status}`} style={{textTransform:'capitalize'}}>{e.status}</span>
            </Link>
          ))}
          {!exams.length && <p style={{color:'var(--text-3)',textAlign:'center',padding:20,fontSize:13}}>No exams yet. Create your first!</p>}
        </div>

        <div className="card">
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:14}}>Announcements</h3>
          {ann.slice(0,4).map(a=>(
            <div key={a.id} style={{padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
              {a.is_pinned && <span className="badge badge-warning" style={{fontSize:10,marginBottom:4}}>📌 Pinned</span>}
              <div style={{fontSize:13,fontWeight:600,color:'var(--primary)'}}>{a.title}</div>
              <div style={{fontSize:12,color:'var(--text-2)',marginTop:3,lineHeight:1.5}}>{a.content.substring(0,100)}{a.content.length>100?'…':''}</div>
              <div style={{fontSize:11,color:'var(--text-3)',marginTop:4}}>{new Date(a.created_at).toLocaleDateString()}</div>
            </div>
          ))}
          {!ann.length && <p style={{color:'var(--text-3)',textAlign:'center',padding:20,fontSize:13}}>No announcements</p>}
        </div>
      </div>
    </div>
  );
}

// ── EXAMS LIST ────────────────────────────────────────────────────────────────
function TeacherExams() {
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(()=>{ examAPI.list().then(r=>setExams(r.data)).finally(()=>setLoading(false)); },[]);

  const publish = async (id,e) => {
    e.stopPropagation();
    try { const {data} = await examAPI.publish(id); setExams(p=>p.map(x=>x.id===id?data:x)); toast.success('Exam published!'); }
    catch(err) { toast.error(err.response?.data?.error||'Error'); }
  };

  const del = async (id,e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this exam?')) return;
    try { await examAPI.remove(id); setExams(p=>p.filter(x=>x.id!==id)); toast.success('Deleted'); }
    catch { toast.error('Error'); }
  };

  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)'}}>My Exams</h1>
          <p style={{color:'var(--text-2)',fontSize:13,marginTop:2}}>{exams.length} exams created</p>
        </div>
        <Link to="/teacher/exams/new" className="btn btn-primary"><Plus size={16}/> Create Exam</Link>
      </div>

      {loading ? <div style={{textAlign:'center',paddingTop:60}}><span className="spinner spinner-lg" style={{margin:'0 auto'}}/></div>
      : exams.length ? (
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:16}}>
          {exams.map(e=>(
            <div key={e.id} className="card" style={{cursor:'pointer',transition:'all .2s'}}
              onClick={()=>nav(`/teacher/exams/${e.id}`)}
              onMouseEnter={ev=>ev.currentTarget.style.boxShadow='var(--shadow-lg)'}
              onMouseLeave={ev=>ev.currentTarget.style.boxShadow='var(--shadow)'}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12}}>
                <span className={`badge badge-${e.status}`} style={{textTransform:'capitalize'}}>{e.status}</span>
                <div style={{display:'flex',gap:6}}>
                  {e.status==='draft'&&(
                    <button className="btn btn-success btn-sm" onClick={ev=>publish(e.id,ev)}><Upload size={12}/> Publish</button>
                  )}
                  <button className="btn btn-ghost btn-sm" onClick={ev=>{ev.stopPropagation();nav(`/teacher/exams/${e.id}/results`)}}>
                    <BarChart2 size={12}/>
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={ev=>del(e.id,ev)}><Trash2 size={12}/></button>
                </div>
              </div>
              <h3 style={{fontSize:16,fontWeight:700,color:'var(--primary)',marginBottom:6,lineHeight:1.3}}>{e.title}</h3>
              <p style={{fontSize:12,color:'var(--text-2)',marginBottom:14}}>{e.subject_name||'No subject'} · {e.class_level}</p>
              <div style={{display:'flex',gap:16,fontSize:12,color:'var(--text-3)'}}>
                <span>📋 {e.question_count||0} questions</span>
                <span>⏱ {e.duration_minutes}min</span>
                <span>📊 {e.submissions||0} submissions</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{textAlign:'center',paddingTop:80}}>
          <FileText size={48} color="var(--border-2)" style={{margin:'0 auto 16px'}}/>
          <h3 style={{fontSize:18,color:'var(--text-2)',marginBottom:8}}>No exams yet</h3>
          <p style={{color:'var(--text-3)',marginBottom:20,fontSize:14}}>Create your first exam to get started</p>
          <Link to="/teacher/exams/new" className="btn btn-primary btn-lg"><Plus size={16}/> Create First Exam</Link>
        </div>
      )}
    </div>
  );
}

// ── EXAM BUILDER ──────────────────────────────────────────────────────────────
const CLASSES   = ['JSS 1','JSS 2','JSS 3','SS 1','SS 2','SS 3'];
const EMPTY_Q   = { question_text:'', question_type:'mcq', options:['','','',''], correct_answer:'', marks:1, explanation:'' };

function ExamBuilder() {
  const { id } = useParams();
  const nav     = useNavigate();
  const isEdit  = Boolean(id);

  const [exam,    setExam]    = useState(null);
  const [subjects,setSubjects]= useState([]);
  const [form,    setForm]    = useState({ title:'', subject_id:'', class_level:'', instructions:'', duration_minutes:60, pass_mark:50 });
  const [questions,setQuestions]=useState([]);
  const [qModal,  setQModal]  = useState(null); // null | 'new' | question-obj
  const [qForm,   setQForm]   = useState(EMPTY_Q);
  const [saving,  setSaving]  = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(()=>{
    miscAPI.subjects().then(r=>setSubjects(r.data));
    if (isEdit) {
      examAPI.get(id).then(r=>{
        const e = r.data;
        setExam(e);
        setForm({ title:e.title, subject_id:e.subject_id||'', class_level:e.class_level, instructions:e.instructions||'', duration_minutes:e.duration_minutes, pass_mark:e.pass_mark });
        setQuestions(e.questions||[]);
      }).finally(()=>setLoading(false));
    }
  },[id]);

  const saveExam = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (isEdit) {
        await examAPI.update(id, form);
        toast.success('Exam updated');
      } else {
        const { data } = await examAPI.create(form);
        toast.success('Exam created');
        nav(`/teacher/exams/${data.id}`, { replace:true });
      }
    } catch(err) { toast.error(err.response?.data?.error||'Error'); }
    finally { setSaving(false); }
  };

  const openQ = (q=null) => {
    setQForm(q ? { ...q, options: q.options||['','','',''] } : { ...EMPTY_Q, options:['','','',''] });
    setQModal(q||'new');
  };

  const saveQ = async e => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...qForm, options: qForm.question_type==='mcq' ? qForm.options.filter(Boolean) : null };
      if (qModal === 'new') {
        const { data } = await examAPI.addQuestion(id, payload);
        setQuestions(p=>[...p, data]);
        toast.success('Question added');
      } else {
        const { data } = await examAPI.updateQuestion(id, qModal.id, payload);
        setQuestions(p=>p.map(q=>q.id===data.id?data:q));
        toast.success('Question updated');
      }
      setQModal(null);
    } catch(err) { toast.error(err.response?.data?.error||'Error'); }
    finally { setSaving(false); }
  };

  const delQ = async qid => {
    if (!window.confirm('Delete this question?')) return;
    try { await examAPI.deleteQuestion(id, qid); setQuestions(p=>p.filter(q=>q.id!==qid)); toast.success('Deleted'); }
    catch { toast.error('Error'); }
  };

  const publish = async () => {
    try { const {data} = await examAPI.publish(id); setExam(data); toast.success('Exam published!'); }
    catch(err) { toast.error(err.response?.data?.error||'Error'); }
  };

  if (loading) return <div style={{textAlign:'center',paddingTop:80}}><span className="spinner spinner-lg" style={{margin:'0 auto'}}/></div>;

  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)'}}>{isEdit ? 'Edit Exam' : 'Create New Exam'}</h1>
          {exam && <span className={`badge badge-${exam.status}`} style={{marginTop:4,textTransform:'capitalize'}}>{exam.status}</span>}
        </div>
        {isEdit && exam?.status==='draft' && (
          <button className="btn btn-success" onClick={publish}><Upload size={15}/> Publish Exam</button>
        )}
      </div>

      {/* Exam form */}
      <div className="card" style={{marginBottom:20}}>
        <h3 style={{fontSize:15,fontWeight:700,marginBottom:18,color:'var(--primary)'}}>Exam Details</h3>
        <form onSubmit={saveExam}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label className="form-label">Exam Title</label>
              <input className="form-input" required placeholder="e.g. Mathematics Mid-Term Examination" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-input form-select" value={form.subject_id} onChange={e=>setForm({...form,subject_id:e.target.value})}>
                <option value="">No subject</option>
                {subjects.map(s=><option key={s.id} value={s.id}>{s.name} ({s.class_level})</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Class Level</label>
              <select className="form-input form-select" required value={form.class_level} onChange={e=>setForm({...form,class_level:e.target.value})}>
                <option value="">Select class</option>
                {CLASSES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (minutes)</label>
              <input className="form-input" type="number" min={5} max={300} value={form.duration_minutes} onChange={e=>setForm({...form,duration_minutes:+e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Pass Mark (%)</label>
              <input className="form-input" type="number" min={0} max={100} value={form.pass_mark} onChange={e=>setForm({...form,pass_mark:+e.target.value})}/>
            </div>
            <div className="form-group" style={{gridColumn:'1/-1'}}>
              <label className="form-label">Instructions</label>
              <textarea className="form-input" rows={2} placeholder="Instructions shown to students before starting…" value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})}/>
            </div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving?<span className="spinner" style={{width:15,height:15,borderWidth:2}}/>:isEdit?'Save Changes':'Create Exam'}
          </button>
        </form>
      </div>

      {/* Questions section */}
      {isEdit && (
        <div className="card">
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:18}}>
            <h3 style={{fontSize:15,fontWeight:700,color:'var(--primary)'}}>
              Questions <span style={{color:'var(--text-3)',fontWeight:400,fontSize:13}}>({questions.length})</span>
            </h3>
            <button className="btn btn-primary btn-sm" onClick={()=>openQ()}><PlusCircle size={14}/> Add Question</button>
          </div>

          {questions.map((q,i)=>(
            <div key={q.id} style={{border:'1px solid var(--border)',borderRadius:12,padding:16,marginBottom:12}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:12}}>
                <div style={{flex:1}}>
                  <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:8}}>
                    <span style={{width:24,height:24,borderRadius:99,background:'var(--primary-pale)',color:'var(--primary-light)',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</span>
                    <span className={`badge ${q.question_type==='mcq'?'badge-published':q.question_type==='true_false'?'badge-success':'badge-warning'}`} style={{fontSize:10}}>
                      {q.question_type==='true_false'?'T/F':q.question_type==='short_answer'?'Short':q.question_type?.toUpperCase()}
                    </span>
                    <span style={{fontSize:12,color:'var(--text-3)'}}>{q.marks} mark{q.marks!==1?'s':''}</span>
                  </div>
                  <p style={{fontSize:14,color:'var(--text)',lineHeight:1.55}}>{q.question_text}</p>
                  {q.options && <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>
                    {(Array.isArray(q.options)?q.options:JSON.parse(q.options||'[]')).map((o,j)=>(
                      <span key={j} style={{fontSize:12,padding:'2px 10px',borderRadius:99,
                        background: o===q.correct_answer?'var(--emerald)':'var(--bg-subtle)',
                        color: o===q.correct_answer?'white':'var(--text-2)',
                        fontWeight: o===q.correct_answer?600:400}}>
                        {o}
                      </span>
                    ))}
                  </div>}
                  {q.question_type!=='mcq' && <div style={{marginTop:6,fontSize:12,color:'var(--emerald)',fontWeight:600}}>✓ {q.correct_answer}</div>}
                </div>
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button className="btn btn-ghost btn-sm" onClick={()=>openQ(q)}><Pencil size={12}/></button>
                  <button className="btn btn-danger btn-sm" onClick={()=>delQ(q.id)}><Trash2 size={12}/></button>
                </div>
              </div>
            </div>
          ))}
          {!questions.length && (
            <div style={{textAlign:'center',padding:'40px 0',color:'var(--text-3)'}}>
              <AlertCircle size={36} style={{margin:'0 auto 12px',opacity:.4}}/>
              <p style={{fontSize:13}}>No questions yet. Add at least one to publish the exam.</p>
            </div>
          )}
        </div>
      )}

      {/* Question modal */}
      {qModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setQModal(null)}>
          <div style={{background:'white',borderRadius:20,padding:28,width:'100%',maxWidth:560,maxHeight:'92vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,.2)'}} onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <h2 style={{fontSize:17,fontWeight:700,color:'var(--primary)'}}>{qModal==='new'?'Add Question':'Edit Question'}</h2>
              <button onClick={()=>setQModal(null)} style={{background:'var(--bg-subtle)',border:'none',borderRadius:8,padding:'6px 8px',color:'var(--text-2)'}}><X size={16}/></button>
            </div>
            <form onSubmit={saveQ} style={{display:'flex',flexDirection:'column',gap:14}}>
              <div className="form-group">
                <label className="form-label">Question Text</label>
                <textarea className="form-input" required rows={3} value={qForm.question_text} onChange={e=>setQForm({...qForm,question_text:e.target.value})}/>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <div className="form-group">
                  <label className="form-label">Question Type</label>
                  <select className="form-input form-select" value={qForm.question_type} onChange={e=>setQForm({...qForm,question_type:e.target.value,options:e.target.value==='mcq'?['','','','']:null,correct_answer:''})}>
                    <option value="mcq">Multiple Choice</option>
                    <option value="true_false">True / False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Marks</label>
                  <input className="form-input" type="number" min={1} max={20} value={qForm.marks} onChange={e=>setQForm({...qForm,marks:+e.target.value})}/>
                </div>
              </div>

              {qForm.question_type==='mcq' && (
                <div className="form-group">
                  <label className="form-label">Options (enter the correct one too)</label>
                  {(qForm.options||['','','','']).map((o,i)=>(
                    <div key={i} style={{display:'flex',gap:8,marginBottom:7,alignItems:'center'}}>
                      <span style={{width:22,fontSize:12,fontWeight:600,color:'var(--text-3)',flexShrink:0}}>{String.fromCharCode(65+i)}.</span>
                      <input className="form-input" placeholder={`Option ${String.fromCharCode(65+i)}`} value={o}
                        onChange={e=>{ const opts=[...(qForm.options||[])]; opts[i]=e.target.value; setQForm({...qForm,options:opts}); }}/>
                      <input type="radio" name="correct" value={o} checked={qForm.correct_answer===o} onChange={()=>setQForm({...qForm,correct_answer:o})} title="Mark as correct"/>
                    </div>
                  ))}
                  {!qForm.correct_answer && <p style={{fontSize:12,color:'var(--rose)',marginTop:4}}>⚠ Select the correct option using the radio button</p>}
                </div>
              )}

              {qForm.question_type==='true_false' && (
                <div className="form-group">
                  <label className="form-label">Correct Answer</label>
                  <select className="form-input form-select" value={qForm.correct_answer} onChange={e=>setQForm({...qForm,correct_answer:e.target.value})} required>
                    <option value="">Select</option>
                    <option value="True">True</option>
                    <option value="False">False</option>
                  </select>
                </div>
              )}

              {qForm.question_type==='short_answer' && (
                <div className="form-group">
                  <label className="form-label">Correct Answer</label>
                  <input className="form-input" required placeholder="Exact answer (case-insensitive)" value={qForm.correct_answer} onChange={e=>setQForm({...qForm,correct_answer:e.target.value})}/>
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Explanation <span style={{color:'var(--text-3)',fontWeight:400}}>(shown after submission)</span></label>
                <textarea className="form-input" rows={2} value={qForm.explanation} onChange={e=>setQForm({...qForm,explanation:e.target.value})}/>
              </div>

              <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
                <button type="button" className="btn btn-ghost" onClick={()=>setQModal(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving||(!qForm.correct_answer&&qForm.question_type==='mcq')}>
                  {saving?<span className="spinner" style={{width:15,height:15,borderWidth:2}}/>:qModal==='new'?'Add Question':'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── EXAM RESULTS ──────────────────────────────────────────────────────────────
function ExamResults() {
  const { id } = useParams();
  const [results, setResults] = useState([]);
  const [exam,    setExam]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([examAPI.get(id), examAPI.results(id)])
      .then(([e,r])=>{ setExam(e.data); setResults(r.data); })
      .finally(()=>setLoading(false));
  },[id]);

  const gc = g => g==='A'||g==='B'?'#10b981':g==='F'?'#f43f5e':'#f59e0b';

  if (loading) return <div style={{textAlign:'center',paddingTop:80}}><span className="spinner spinner-lg" style={{margin:'0 auto'}}/></div>;

  const avg = results.length ? (results.reduce((a,r)=>a+parseFloat(r.percentage||0),0)/results.length).toFixed(1) : 0;
  const pass = results.filter(r=>parseFloat(r.percentage)>=( exam?.pass_mark||50)).length;

  return (
    <div className="page">
      <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)',marginBottom:4}}>{exam?.title} — Results</h1>
      <p style={{color:'var(--text-2)',fontSize:13,marginBottom:22}}>{results.length} submissions · Avg: {avg}% · Pass rate: {results.length?Math.round(pass/results.length*100):0}%</p>

      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:22}}>
        {[['Submissions',results.length,'#6366f1'],['Average',`${avg}%`,'#10b981'],['Highest',results[0]?`${parseFloat(results[0].percentage).toFixed(0)}%`:'—','#f59e0b'],['Pass Rate',`${results.length?Math.round(pass/results.length*100):0}%`,'#0ea5e9']].map(([l,v,c])=>(
          <div key={l} className="stat-card">
            <p style={{fontSize:11,color:'var(--text-2)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:5}}>{l}</p>
            <p style={{fontSize:24,fontWeight:800,color:c}}>{v}</p>
          </div>
        ))}
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>#</th><th>Student</th><th>Score</th><th>%</th><th>Grade</th><th>Time</th><th>Submitted</th></tr></thead>
            <tbody>
              {results.map((r,i)=>(
                <tr key={r.id}>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{i+1}</td>
                  <td style={{fontWeight:600,fontSize:13}}>{r.student_name}<div style={{fontSize:11,color:'var(--text-3)'}}>{r.student_no}</div></td>
                  <td style={{fontWeight:700}}>{r.score}/{r.total_marks}</td>
                  <td style={{fontWeight:600,color:gc(r.grade)}}>{parseFloat(r.percentage).toFixed(1)}%</td>
                  <td><strong style={{color:gc(r.grade),fontSize:16}}>{r.grade}</strong></td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{r.time_taken_minutes}m</td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{new Date(r.submitted_at).toLocaleString()}</td>
                </tr>
              ))}
              {!results.length && <tr><td colSpan={7} style={{textAlign:'center',color:'var(--text-3)',padding:40}}>No submissions yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
