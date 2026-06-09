import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GraduationCap, Bell, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { miscAPI } from '../../utils/api';
import toast from 'react-hot-toast';

export default function Layout({ children, nav }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate  = useNavigate();
  const [open, setOpen]     = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(()=>{
    miscAPI.notifications().then(r=>setUnread(r.data.unread_count)).catch(()=>{});
  },[]);

  const doLogout = () => { logout(); navigate('/'); toast.success('Signed out'); };

  const initials = user?.full_name?.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() || '?';

  return (
    <div style={{display:'flex',minHeight:'100vh',background:'var(--bg)'}}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width:240, flexShrink:0, background:'var(--primary)', display:'flex', flexDirection:'column',
        position:'fixed', top:0, left:0, bottom:0, zIndex:50,
        transform: open ? 'translateX(0)' : undefined,
        transition:'transform .25s ease',
      }} className={open ? '' : 'hide-mobile'}>
        {/* Logo */}
        <div style={{padding:'20px 20px 14px',borderBottom:'1px solid rgba(255,255,255,.08)'}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}>
            <div style={{width:34,height:34,borderRadius:9,background:'linear-gradient(135deg,#6366f1,#f59e0b)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <GraduationCap size={17} color="white"/>
            </div>
            <div>
              <div style={{fontSize:13,fontWeight:800,color:'white',lineHeight:1.2}}>GSS Gadau</div>
              <div style={{fontSize:10,color:'rgba(255,255,255,.4)',letterSpacing:'.8px',textTransform:'uppercase'}}>Exam Portal</div>
            </div>
          </div>
        </div>

        {/* User pill */}
        <div style={{padding:'14px 16px',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{width:34,height:34,borderRadius:99,background:user?.avatar_color||'#6366f1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'white',flexShrink:0}}>
              {initials}
            </div>
            <div style={{overflow:'hidden'}}>
              <div style={{fontSize:13,fontWeight:600,color:'white',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{user?.full_name}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,.4)',textTransform:'capitalize'}}>{user?.role}{user?.class ? ` · ${user.class}` : ''}</div>
            </div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={{flex:1,padding:'12px 10px',overflowY:'auto'}}>
          {nav.map(({to,icon:Icon,label,end})=>{
            const active = end ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} onClick={()=>setOpen(false)}
                style={{display:'flex',alignItems:'center',gap:10,padding:'9px 11px',borderRadius:10,marginBottom:2,
                  background: active?'rgba(255,255,255,.1)':'transparent',
                  color: active?'white':'rgba(255,255,255,.5)',
                  fontWeight: active?600:400, fontSize:14,
                  transition:'all .18s'}}>
                <Icon size={17} strokeWidth={active?2.2:1.8}/>
                {label}
                {active && <ChevronRight size={13} style={{marginLeft:'auto'}}/>}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div style={{padding:'12px 10px',borderTop:'1px solid rgba(255,255,255,.07)'}}>
          <button onClick={doLogout}
            style={{display:'flex',alignItems:'center',gap:10,padding:'9px 11px',borderRadius:10,width:'100%',background:'transparent',color:'rgba(255,255,255,.4)',fontSize:14,transition:'all .18s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(244,63,94,.15)';e.currentTarget.style.color='#f87171'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='rgba(255,255,255,.4)'}}>
            <LogOut size={17}/> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {open && <div onClick={()=>setOpen(false)} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:49}}/>}

      {/* ── MAIN ── */}
      <div style={{flex:1,marginLeft:240,display:'flex',flexDirection:'column',minWidth:0}} className="main-offset">
        {/* Top bar */}
        <header style={{height:58,background:'white',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',position:'sticky',top:0,zIndex:40,flexShrink:0}}>
          <button className="hide-desktop" onClick={()=>setOpen(!open)} style={{background:'none',color:'var(--text-2)',marginRight:8}}>
            {open ? <X size={20}/> : <Menu size={20}/>}
          </button>
          <div style={{flex:1}}/>
          {/* notifications */}
          <Link to={`/${user?.role}/notifications`} style={{position:'relative',padding:8,borderRadius:10,background:'var(--bg-subtle)',color:'var(--text-2)',display:'flex',alignItems:'center',justifyContent:'center',marginRight:10}}>
            <Bell size={18}/>
            {unread > 0 && (
              <span style={{position:'absolute',top:4,right:4,width:8,height:8,borderRadius:'50%',background:'var(--rose)',border:'2px solid white'}}/>
            )}
          </Link>
          {/* avatar */}
          <div style={{width:34,height:34,borderRadius:99,background:user?.avatar_color||'#6366f1',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,fontWeight:700,color:'white'}}>
            {initials}
          </div>
        </header>

        {/* Page content */}
        <main style={{flex:1,padding:'28px 24px',maxWidth:1200,width:'100%',margin:'0 auto'}}>
          {children}
        </main>
      </div>

      <style>{`
        @media(max-width:768px){
          .main-offset{margin-left:0!important}
          .hide-desktop{display:flex!important}
          aside{transform:translateX(-100%)!important}
          aside.open-sidebar{transform:translateX(0)!important}
        }
        @media(min-width:769px){.hide-desktop{display:none!important}}
      `}</style>
    </div>
  );
}
