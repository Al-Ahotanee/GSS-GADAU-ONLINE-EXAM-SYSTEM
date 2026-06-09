import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const CLASSES = ['JSS 1','JSS 2','JSS 3','SS 1','SS 2','SS 3'];

const Modal = ({ title, onClose, children }) => (
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={onClose}>
    <div style={{background:'white',borderRadius:20,padding:28,width:'100%',maxWidth:500,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,.2)'}} onClick={e=>e.stopPropagation()}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
        <h2 style={{fontSize:18,fontWeight:700,color:'var(--primary)'}}>{title}</h2>
        <button onClick={onClose} style={{background:'var(--bg-subtle)',border:'none',borderRadius:8,padding:'6px 8px',color:'var(--text-2)'}}><X size={16}/></button>
      </div>
      {children}
    </div>
  </div>
);

export default function AdminSubjects() {
  const [subjects,  setSubjects]  = useState([]);
  const [teachers,  setTeachers]  = useState([]);
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState({ name:'', code:'', class_level:'', teacher_id:'', description:'' });
  const [saving,    setSaving]    = useState(false);

  useEffect(()=>{
    adminAPI.subjects().then(r=>setSubjects(r.data));
    adminAPI.users({ role:'teacher' }).then(r=>setTeachers(r.data.users));
  },[]);

  const open = (s=null) => {
    setForm(s
      ? { name:s.name, code:s.code, class_level:s.class_level, teacher_id:s.teacher_id||'', description:s.description||'' }
      : { name:'', code:'', class_level:'', teacher_id:'', description:'' });
    setModal(s || 'new');
  };

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal === 'new') {
        const { data } = await adminAPI.createSubject(form);
        setSubjects(p=>[data,...p]); toast.success('Subject created');
      } else {
        const { data } = await adminAPI.updateSubject(modal.id, form);
        setSubjects(p=>p.map(s=>s.id===data.id?data:s)); toast.success('Subject updated');
      }
      setModal(null);
    } catch(err) { toast.error(err.response?.data?.error||'Error'); }
    finally { setSaving(false); }
  };

  const del = async id => {
    if (!window.confirm('Delete this subject?')) return;
    try { await adminAPI.deleteSubject(id); setSubjects(p=>p.filter(s=>s.id!==id)); toast.success('Deleted'); }
    catch { toast.error('Cannot delete — exams may depend on it'); }
  };

  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)'}}>Subjects</h1>
          <p style={{color:'var(--text-2)',fontSize:13,marginTop:2}}>{subjects.length} subjects configured</p>
        </div>
        <button className="btn btn-primary" onClick={()=>open()}><Plus size={16}/> Add Subject</button>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Subject</th><th>Code</th><th>Class</th><th>Teacher</th><th>Actions</th></tr></thead>
            <tbody>
              {subjects.map(s=>(
                <tr key={s.id}>
                  <td style={{fontWeight:600}}>{s.name}</td>
                  <td><code style={{background:'var(--bg-subtle)',padding:'2px 7px',borderRadius:5,fontSize:12}}>{s.code}</code></td>
                  <td>{s.class_level}</td>
                  <td style={{color:'var(--text-2)',fontSize:13}}>{s.teacher_name||'Unassigned'}</td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>open(s)}><Pencil size={13}/></button>
                      <button className="btn btn-danger btn-sm" onClick={()=>del(s.id)}><Trash2 size={13}/></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!subjects.length && <tr><td colSpan={5} style={{textAlign:'center',color:'var(--text-3)',padding:40}}>No subjects yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal==='new'?'Add Subject':'Edit Subject'} onClose={()=>setModal(null)}>
          <form onSubmit={save} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group">
                <label className="form-label">Subject Name</label>
                <input className="form-input" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
              </div>
              <div className="form-group">
                <label className="form-label">Code</label>
                <input className="form-input" required placeholder="e.g. MATH" value={form.code} onChange={e=>setForm({...form,code:e.target.value.toUpperCase()})}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group">
                <label className="form-label">Class Level</label>
                <select className="form-input form-select" required value={form.class_level} onChange={e=>setForm({...form,class_level:e.target.value})}>
                  <option value="">Select class</option>
                  {CLASSES.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Assigned Teacher</label>
                <select className="form-input form-select" value={form.teacher_id} onChange={e=>setForm({...form,teacher_id:e.target.value})}>
                  <option value="">None</option>
                  {teachers.map(t=><option key={t.id} value={t.id}>{t.full_name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows={2} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
            </div>
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:4}}>
              <button type="button" className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" style={{width:15,height:15,borderWidth:2}}/> : modal==='new'?'Create':'Save'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
