import React, { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, X, UserCheck, UserX } from 'lucide-react';
import { adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const ROLES    = ['student','teacher','admin'];
const CLASSES  = ['JSS 1','JSS 2','JSS 3','SS 1','SS 2','SS 3'];
const EMPTY    = { full_name:'', email:'', password:'', role:'student', class:'', student_id:'', subject_specialization:'' };

const Modal = ({ title, onClose, children }) => (
  <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.45)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={onClose}>
    <div style={{background:'white',borderRadius:20,padding:28,width:'100%',maxWidth:480,maxHeight:'90vh',overflowY:'auto',boxShadow:'0 24px 64px rgba(0,0,0,.2)'}} onClick={e=>e.stopPropagation()}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22}}>
        <h2 style={{fontSize:18,fontWeight:700,color:'var(--primary)'}}>{title}</h2>
        <button onClick={onClose} style={{background:'var(--bg-subtle)',border:'none',borderRadius:8,padding:'6px 8px',color:'var(--text-2)'}}><X size={16}/></button>
      </div>
      {children}
    </div>
  </div>
);

export default function AdminUsers() {
  const [users, setUsers]   = useState([]);
  const [total, setTotal]   = useState(0);
  const [search, setSearch] = useState('');
  const [role,   setRole]   = useState('');
  const [modal,  setModal]  = useState(null); // null | 'create' | user-obj
  const [form,   setForm]   = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [loading,setLoading]= useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.users({ role, search });
      setUsers(data.users); setTotal(data.total);
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, [role, search]);

  const openCreate = () => { setForm(EMPTY); setModal('create'); };
  const openEdit   = u  => { setForm({ ...u, password:'' }); setModal(u); };

  const save = async e => {
    e.preventDefault(); setSaving(true);
    try {
      if (modal === 'create') {
        const { data } = await adminAPI.createUser(form);
        setUsers(p=>[data,...p]); toast.success('User created');
      } else {
        const { data } = await adminAPI.updateUser(modal.id, form);
        setUsers(p=>p.map(u=>u.id===data.id?{...u,...data}:u)); toast.success('User updated');
      }
      setModal(null);
    } catch(err) { toast.error(err.response?.data?.error||'Error'); }
    finally { setSaving(false); }
  };

  const toggle = async u => {
    try {
      await adminAPI.updateUser(u.id, { is_active: !u.is_active });
      setUsers(p=>p.map(x=>x.id===u.id?{...x,is_active:!x.is_active}:x));
      toast.success(u.is_active ? 'User deactivated' : 'User activated');
    } catch { toast.error('Error'); }
  };

  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22,flexWrap:'wrap',gap:12}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)'}}>Users</h1>
          <p style={{color:'var(--text-2)',fontSize:13,marginTop:2}}>{total} total users</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}><Plus size={16}/> Add User</button>
      </div>

      {/* filters */}
      <div style={{display:'flex',gap:10,marginBottom:18,flexWrap:'wrap'}}>
        <div style={{position:'relative',flex:'1 1 220px'}}>
          <Search size={15} style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-3)'}}/>
          <input className="form-input" placeholder="Search name or email…" style={{paddingLeft:36}}
            value={search} onChange={e=>setSearch(e.target.value)}/>
        </div>
        <select className="form-input form-select" style={{width:140}} value={role} onChange={e=>setRole(e.target.value)}>
          <option value="">All roles</option>
          {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="card" style={{padding:0}}>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Class / Subject</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{textAlign:'center',padding:40}}><span className="spinner" style={{margin:'0 auto'}}/></td></tr>
              ) : users.map(u=>(
                <tr key={u.id}>
                  <td>
                    <div style={{display:'flex',alignItems:'center',gap:9}}>
                      <div style={{width:30,height:30,borderRadius:99,background:u.avatar_color||'#6366f1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:11,fontWeight:700,color:'white',flexShrink:0}}>
                        {u.full_name.split(' ').slice(0,2).map(w=>w[0]).join('')}
                      </div>
                      <span style={{fontWeight:600,fontSize:13}}>{u.full_name}</span>
                    </div>
                  </td>
                  <td style={{color:'var(--text-2)',fontSize:13}}>{u.email}</td>
                  <td><span className={`badge badge-${u.role==='admin'?'danger':u.role==='teacher'?'published':'success'}`} style={{textTransform:'capitalize'}}>{u.role}</span></td>
                  <td style={{color:'var(--text-2)',fontSize:13}}>{u.class || u.subject_specialization || '—'}</td>
                  <td>
                    <span className={`badge badge-${u.is_active?'success':'archived'}`}>
                      {u.is_active?'Active':'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:6}}>
                      <button className="btn btn-ghost btn-sm" onClick={()=>openEdit(u)}><Pencil size={13}/></button>
                      <button className={`btn btn-sm ${u.is_active?'btn-danger':'btn-success'}`} onClick={()=>toggle(u)} title={u.is_active?'Deactivate':'Activate'}>
                        {u.is_active?<UserX size={13}/>:<UserCheck size={13}/>}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && !users.length && <tr><td colSpan={6} style={{textAlign:'center',color:'var(--text-3)',padding:40}}>No users found</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <Modal title={modal==='create'?'Add New User':'Edit User'} onClose={()=>setModal(null)}>
          <form onSubmit={save} style={{display:'flex',flexDirection:'column',gap:14}}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" required value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select className="form-input form-select" value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
                  {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {form.role==='student' && (
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <select className="form-input form-select" value={form.class||''} onChange={e=>setForm({...form,class:e.target.value})}>
                    <option value="">Select</option>
                    {CLASSES.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>
            {modal==='create' && (
              <div className="form-group">
                <label className="form-label">Password <span style={{color:'var(--text-3)',fontWeight:400}}>(default: Password@123)</span></label>
                <input className="form-input" type="password" placeholder="Leave blank for default" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
              </div>
            )}
            <div style={{display:'flex',gap:10,justifyContent:'flex-end',marginTop:6}}>
              <button type="button" className="btn btn-ghost" onClick={()=>setModal(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="spinner" style={{width:15,height:15,borderWidth:2}}/> : modal==='create'?'Create User':'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
