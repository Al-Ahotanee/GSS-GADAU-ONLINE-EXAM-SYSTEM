import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

const CLASSES = ['JSS 1','JSS 2','JSS 3','SS 1','SS 2','SS 3'];
const SUBJECTS = ['Mathematics','English Language','Physics','Chemistry','Biology','Geography','History','Civic Education','Agricultural Science','Economics','Government','Literature','Further Mathematics','Technical Drawing','Computer Science'];

// ── Shared card shell ──────────────────────────────────────────────────────
const Shell = ({ title, sub, children }) => (
  <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#f8f7ff 0%,#eef2ff 100%)',padding:'24px 16px'}}>
    <div style={{width:'100%',maxWidth:480}}>
      {/* logo */}
      <div style={{textAlign:'center',marginBottom:28}}>
        <Link to="/" style={{display:'inline-flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <div style={{width:52,height:52,borderRadius:15,background:'linear-gradient(135deg,#4338ca,#f59e0b)',display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 6px 20px rgba(67,56,202,.35)'}}>
            <GraduationCap size={24} color="white"/>
          </div>
          <span style={{fontSize:13,fontWeight:700,color:'#4338ca',letterSpacing:'.3px'}}>GSS Gadau Exam Portal</span>
        </Link>
        <h1 style={{marginTop:16,fontSize:26,fontWeight:800,color:'#1e1b4b'}}>{title}</h1>
        <p style={{fontSize:14,color:'#6b7280',marginTop:4}}>{sub}</p>
      </div>

      <div style={{background:'white',borderRadius:24,padding:32,boxShadow:'0 8px 40px rgba(30,27,75,.1)',border:'1px solid #e0e7ff'}}>
        {children}
      </div>
    </div>
  </div>
);

// ── LOGIN ──────────────────────────────────────────────────────────────────
export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handle = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.full_name.split(' ')[0]}!`);
      nav(user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student');
    } catch(err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <Shell title="Welcome Back" sub="Sign in to your account">
      <form onSubmit={handle} style={{display:'flex',flexDirection:'column',gap:18}}>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="you@gssgadau.edu.ng" required
            value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        </div>
        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{position:'relative'}}>
            <input className="form-input" type={show?'text':'password'} placeholder="Enter password" required
              style={{paddingRight:42}} value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
            <button type="button" onClick={()=>setShow(!show)}
              style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',color:'#9ca3af'}}>
              {show ? <EyeOff size={17}/> : <Eye size={17}/>}
            </button>
          </div>
        </div>
        <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{justifyContent:'center',marginTop:4}}>
          {loading ? <><span className="spinner" style={{width:18,height:18,borderWidth:2}}/> Signing in…</> : 'Sign In'}
        </button>
      </form>
      <p style={{textAlign:'center',marginTop:20,fontSize:14,color:'#6b7280'}}>
        Don't have an account? <Link to="/register" style={{color:'#4338ca',fontWeight:600}}>Register here</Link>
      </p>
      <div style={{marginTop:20,padding:14,background:'#f8f7ff',borderRadius:12,border:'1px solid #e0e7ff',fontSize:12,color:'#6b7280',textAlign:'center'}}>
        Admin demo: <strong style={{color:'#4338ca'}}>admin@gssgadau.edu.ng</strong> / <strong style={{color:'#4338ca'}}>Admin@2024</strong>
      </div>
    </Shell>
  );
}

// ── REGISTER ───────────────────────────────────────────────────────────────
export function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ full_name:'', email:'', password:'', role:'student', class:'', student_id:'', subject_specialization:'' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const handle = async e => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    if (form.role === 'student' && !form.class) return toast.error('Please select your class');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created! Welcome aboard 🎉');
      nav(user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student');
    } catch(err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <Shell title="Create Account" sub="Join the GSS Gadau Exam Portal">
      <form onSubmit={handle} style={{display:'flex',flexDirection:'column',gap:16}}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input className="form-input" placeholder="e.g. Aisha Suleiman" required
            value={form.full_name} onChange={e=>set('full_name',e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="email@example.com" required
            value={form.email} onChange={e=>set('email',e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">I am a…</label>
          <select className="form-input form-select" value={form.role} onChange={e=>set('role',e.target.value)}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>

        {form.role === 'student' && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <div className="form-group">
              <label className="form-label">Class</label>
              <select className="form-input form-select" value={form.class} onChange={e=>set('class',e.target.value)} required>
                <option value="">Select class</option>
                {CLASSES.map(c=><option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Student ID <span style={{color:'#9ca3af',fontWeight:400}}>(optional)</span></label>
              <input className="form-input" placeholder="e.g. GSS/24/001"
                value={form.student_id} onChange={e=>set('student_id',e.target.value)}/>
            </div>
          </div>
        )}

        {form.role === 'teacher' && (
          <div className="form-group">
            <label className="form-label">Subject Specialisation</label>
            <select className="form-input form-select" value={form.subject_specialization} onChange={e=>set('subject_specialization',e.target.value)}>
              <option value="">Select subject</option>
              {SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Password</label>
          <div style={{position:'relative'}}>
            <input className="form-input" type={show?'text':'password'} placeholder="Min. 6 characters" required
              style={{paddingRight:42}} value={form.password} onChange={e=>set('password',e.target.value)}/>
            <button type="button" onClick={()=>setShow(!show)}
              style={{position:'absolute',right:12,top:'50%',transform:'translateY(-50%)',background:'none',color:'#9ca3af'}}>
              {show ? <EyeOff size={17}/> : <Eye size={17}/>}
            </button>
          </div>
        </div>

        <button className="btn btn-primary btn-lg" type="submit" disabled={loading} style={{justifyContent:'center',marginTop:4}}>
          {loading ? <><span className="spinner" style={{width:18,height:18,borderWidth:2}}/> Creating account…</> : 'Create Account'}
        </button>
      </form>
      <p style={{textAlign:'center',marginTop:18,fontSize:14,color:'#6b7280'}}>
        Already have an account? <Link to="/login" style={{color:'#4338ca',fontWeight:600}}>Sign in</Link>
      </p>
    </Shell>
  );
}
