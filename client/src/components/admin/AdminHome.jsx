import React, { useState, useEffect } from 'react';
import { Users, BookOpen, FileText, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { adminAPI } from '../../utils/api';

const PIE_COLORS = ['#4338ca','#10b981','#f59e0b','#f43f5e','#0ea5e9'];

export default function AdminHome() {
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    Promise.all([adminAPI.stats(), adminAPI.results()])
      .then(([s,r])=>{ setStats(s.data); setResults(r.data.slice(0,8)); })
      .finally(()=>setLoading(false));
  },[]);

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:300}}>
      <span className="spinner spinner-lg"/>
    </div>
  );

  const userPie = stats ? [
    { name:'Students', value: stats.users.student },
    { name:'Teachers', value: stats.users.teacher },
    { name:'Admins',   value: stats.users.admin   },
  ] : [];

  const examBar = stats ? [
    { name:'Draft',     count: stats.exams.draft     || 0, fill:'#9ca3af' },
    { name:'Published', count: stats.exams.published || 0, fill:'#3b82f6' },
    { name:'Active',    count: stats.exams.active    || 0, fill:'#10b981' },
    { name:'Completed', count: stats.exams.completed || 0, fill:'#8b5cf6' },
  ] : [];

  const CARDS = [
    { label:'Total Users',    value: stats?.users.total || 0,        icon:Users,     color:'#6366f1', bg:'#eef2ff' },
    { label:'Students',       value: stats?.users.student || 0,      icon:Users,     color:'#10b981', bg:'#ecfdf5' },
    { label:'Total Exams',    value: stats?.exams.total || 0,        icon:FileText,  color:'#f59e0b', bg:'#fffbeb' },
    { label:'Avg Score',      value:`${stats?.attempts.avg_score||0}%`, icon:TrendingUp, color:'#0ea5e9', bg:'#e0f2fe' },
    { label:'Subjects',       value: stats?.subjects || 0,           icon:BookOpen,  color:'#8b5cf6', bg:'#f5f3ff' },
    { label:'Submissions',    value: stats?.attempts.total || 0,     icon:CheckCircle,color:'#ec4899', bg:'#fdf2f8' },
  ];

  return (
    <div className="page">
      <div style={{marginBottom:24}}>
        <h1 style={{fontSize:24,fontWeight:800,color:'var(--primary)'}}>Admin Dashboard</h1>
        <p style={{color:'var(--text-2)',fontSize:14,marginTop:3}}>Overview of GSS Gadau Examination System</p>
      </div>

      {/* stat cards */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:28}}>
        {CARDS.map(({label,value,icon:Icon,color,bg})=>(
          <div key={label} className="stat-card">
            <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between'}}>
              <div>
                <p style={{fontSize:12,color:'var(--text-2)',fontWeight:600,textTransform:'uppercase',letterSpacing:'.5px',marginBottom:6}}>{label}</p>
                <p style={{fontSize:28,fontWeight:800,color:'var(--primary)'}}>{value}</p>
              </div>
              <div style={{width:42,height:42,borderRadius:12,background:bg,display:'flex',alignItems:'center',justifyContent:'center'}}>
                <Icon size={20} color={color}/>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* charts row */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:28}}>
        <div className="card">
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:18,color:'var(--primary)'}}>Exam Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={examBar} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff"/>
              <XAxis dataKey="name" fontSize={12} tick={{fill:'#6b7280'}}/>
              <YAxis fontSize={12} tick={{fill:'#6b7280'}} allowDecimals={false}/>
              <Tooltip contentStyle={{borderRadius:10,border:'1px solid #e0e7ff',fontSize:13}}/>
              <Bar dataKey="count" radius={[6,6,0,0]}>
                {examBar.map((e,i)=><Cell key={i} fill={e.fill}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{fontSize:15,fontWeight:700,marginBottom:18,color:'var(--primary)'}}>User Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={userPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                {userPie.map((_,i)=><Cell key={i} fill={PIE_COLORS[i]}/>)}
              </Pie>
              <Tooltip contentStyle={{borderRadius:10,border:'1px solid #e0e7ff',fontSize:13}}/>
              <Legend iconType="circle" iconSize={10} wrapperStyle={{fontSize:12}}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* recent results */}
      <div className="card">
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
          <h3 style={{fontSize:15,fontWeight:700,color:'var(--primary)'}}>Recent Submissions</h3>
          <a href="/admin/results" style={{fontSize:13,color:'var(--primary-light)',fontWeight:600}}>View all →</a>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr>
              <th>Student</th><th>Class</th><th>Exam</th><th>Score</th><th>Grade</th><th>Submitted</th>
            </tr></thead>
            <tbody>
              {results.map(r=>(
                <tr key={r.id}>
                  <td style={{fontWeight:600}}>{r.student_name}</td>
                  <td>{r.class}</td>
                  <td style={{color:'var(--text-2)'}}>{r.exam_title}</td>
                  <td><strong>{r.score}/{r.total_marks}</strong> <span style={{color:'var(--text-3)',fontSize:12}}>({parseFloat(r.percentage).toFixed(0)}%)</span></td>
                  <td><span className={`badge badge-${r.grade==='A'||r.grade==='B'?'success':r.grade==='F'?'danger':'warning'}`}>{r.grade}</span></td>
                  <td style={{color:'var(--text-3)',fontSize:12}}>{new Date(r.submitted_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {!results.length && <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-3)',padding:32}}>No submissions yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
