import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Info, CheckCircle, AlertTriangle, BookOpen } from 'lucide-react';
import { miscAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const TYPE_ICON = {
  info:    <Info size={16} color="#2563eb"/>,
  success: <CheckCircle size={16} color="#059669"/>,
  warning: <AlertTriangle size={16} color="#b45309"/>,
  exam:    <BookOpen size={16} color="#7c3aed"/>,
};
const TYPE_BG = {
  info:    '#eff6ff',
  success: '#f0fdf4',
  warning: '#fffbeb',
  exam:    '#f5f3ff',
};

export default function Notifications() {
  const [data,    setData]    = useState({ notifications:[], unread_count:0 });
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    miscAPI.notifications().then(r=>setData(r.data)).finally(()=>setLoading(false));
  },[]);

  const markAll = async () => {
    try {
      await miscAPI.markRead();
      setData(d=>({ ...d, unread_count:0, notifications: d.notifications.map(n=>({...n,is_read:true})) }));
      toast.success('All marked as read');
    } catch { toast.error('Error'); }
  };

  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:800,color:'var(--primary)'}}>Notifications</h1>
          <p style={{color:'var(--text-2)',fontSize:13,marginTop:2}}>
            {data.unread_count > 0 ? `${data.unread_count} unread` : 'All caught up'}
          </p>
        </div>
        {data.unread_count > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={markAll}>
            <CheckCheck size={14}/> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div style={{textAlign:'center',paddingTop:60}}><span className="spinner spinner-lg" style={{margin:'0 auto'}}/></div>
      ) : data.notifications.length === 0 ? (
        <div style={{textAlign:'center',paddingTop:80}}>
          <Bell size={48} color="var(--border-2)" style={{margin:'0 auto 16px'}}/>
          <h3 style={{fontSize:17,color:'var(--text-2)',marginBottom:8}}>No notifications yet</h3>
          <p style={{color:'var(--text-3)',fontSize:14}}>You'll see exam alerts and updates here</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          {data.notifications.map(n=>(
            <div key={n.id} style={{
              background: n.is_read ? 'white' : TYPE_BG[n.type]||'#eff6ff',
              border:`1px solid ${n.is_read?'var(--border)':'var(--border-2)'}`,
              borderRadius:14, padding:'14px 18px',
              display:'flex', alignItems:'flex-start', gap:14,
              opacity: n.is_read ? 0.72 : 1,
              transition:'opacity .2s',
            }}>
              <div style={{width:36,height:36,borderRadius:10,background:'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,boxShadow:'0 1px 4px rgba(0,0,0,.08)'}}>
                {TYPE_ICON[n.type]||TYPE_ICON.info}
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                  <span style={{fontSize:14,fontWeight:n.is_read?500:700,color:'var(--primary)'}}>{n.title}</span>
                  {!n.is_read && <span style={{width:8,height:8,borderRadius:'50%',background:'var(--primary-light)',flexShrink:0,display:'block'}}/>}
                </div>
                <p style={{fontSize:13,color:'var(--text-2)',marginTop:3,lineHeight:1.55}}>{n.message}</p>
                <span style={{fontSize:11,color:'var(--text-3)',marginTop:5,display:'block'}}>
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
