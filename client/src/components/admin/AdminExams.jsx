import React, { useState, useEffect } from 'react';
import { Trash2, Search } from 'lucide-react';
import { examAPI, adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export function AdminExams() {
  const [exams,   setExams]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ examAPI.list().then(r=>setExams(r.data)).finally(()=>setLoading(false)); },[]);

  const del = async id => {
    if (!window.confirm('Delete this exam and all its questions?')) return;
    try { await examAPI.remove(id); setExams(p=>p.filter(e=>e.id!==id)); toast.success('Exam deleted'); }
    catch { toast.error('Error deleting exam'); }
  };

  const statusBadge = s => {
    const map={draft:'badge-draft',published:'badge-published',active:'badge-active',completed:'badge-completed',archived:'badge-archived'};
    return <span className={`badge ${map[s]||'badge-draft'}`} style={{textTransform:'capitalize'}}>{s}</span>;
  };

  return (
    <div className="page">
      <div style={{marginBottom:22}}>
        <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)'}}>All Exams</h1>
        <p style={{color:'var(--text-2)',fontSize:13,marginTop:2}}>{exams.length} exams in the system</p>
      </div>
      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Title</th><th>Subject</th><th>Class</th><th>Teacher</th><th>Questions</th><th>Submissions</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading?<tr><td colSpan={8} style={{textAlign:'center',padding:40}}><span className="spinner" style={{margin:'0 auto'}}/></td></tr>
              :exams.map(e=>(
                <tr key={e.id}>
                  <td style={{fontWeight:600}}><div style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.title}</div></td>
                  <td style={{color:'var(--text-2)',fontSize:13}}>{e.subject_name||'—'}</td>
                  <td>{e.class_level}</td>
                  <td style={{color:'var(--text-2)',fontSize:13}}>{e.teacher_name||'—'}</td>
                  <td style={{textAlign:'center'}}>{e.question_count||0}</td>
                  <td style={{textAlign:'center'}}>{e.submissions||0}</td>
                  <td>{statusBadge(e.status)}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={()=>del(e.id)}><Trash2 size={13}/></button></td>
                </tr>
              ))}
              {!loading&&!exams.length&&<tr><td colSpan={8} style={{textAlign:'center',color:'var(--text-3)',padding:40}}>No exams yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminResults() {
  const [results, setResults] = useState([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ adminAPI.results().then(r=>setResults(r.data)).finally(()=>setLoading(false)); },[]);

  const filtered = results.filter(r=>!search||r.student_name?.toLowerCase().includes(search.toLowerCase())||r.exam_title?.toLowerCase().includes(search.toLowerCase()));
  const gc = g => g==='A'||g==='B'?'#10b981':g==='F'?'#f43f5e':'#f59e0b';

  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)'}}>Exam Results</h1>
          <p style={{color:'var(--text-2)',fontSize:13,marginTop:2}}>{results.length} total submissions</p>
        </div>
        <div style={{position:'relative'}}>
          <Search size={15} style={{position:'absolute',left:11,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}}/>
          <input className="form-input" placeholder="Search student or exam…" style={{paddingLeft:34,width:240}} value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
      </div>
      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Student</th><th>Class</th><th>Exam</th><th>Score</th><th>%</th><th>Grade</th><th>Time</th><th>Date</th></tr></thead>
            <tbody>
              {loading?<tr><td colSpan={8} style={{textAlign:'center',padding:40}}><span className="spinner" style={{margin:'0 auto'}}/></td></tr>
              :filtered.map(r=>(
                <tr key={r.id}>
                  <td style={{fontWeight:600,fontSize:13}}>{r.student_name}</td>
                  <td style={{fontSize:12}}>{r.class}</td>
                  <td style={{color:'var(--text-2)',fontSize:12}}><div style={{maxWidth:160,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.exam_title}</div></td>
                  <td style={{fontWeight:700}}>{r.score}/{r.total_marks}</td>
                  <td style={{fontWeight:600,color:gc(r.grade)}}>{parseFloat(r.percentage).toFixed(1)}%</td>
                  <td><strong style={{color:gc(r.grade)}}>{r.grade}</strong></td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{r.time_taken_minutes}m</td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{new Date(r.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {!loading&&!filtered.length&&<tr><td colSpan={8} style={{textAlign:'center',color:'var(--text-3)',padding:40}}>No results found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminExams;
