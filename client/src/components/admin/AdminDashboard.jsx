import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Users, BookOpen, FileText, BarChart2, Megaphone, Settings, Bell } from 'lucide-react';
import Layout from '../shared/Layout';
import AdminHome from './AdminHome';
import AdminUsers from './AdminUsers';
import AdminSubjects from './AdminSubjects';
import AdminExams from './AdminExams';
import AdminResults from './AdminResults';
import Notifications from '../shared/Notifications';

const NAV = [
  { to:'/admin',          icon:LayoutDashboard, label:'Dashboard',     end:true },
  { to:'/admin/users',    icon:Users,           label:'Users'          },
  { to:'/admin/subjects', icon:BookOpen,        label:'Subjects'       },
  { to:'/admin/exams',    icon:FileText,        label:'Exams'          },
  { to:'/admin/results',  icon:BarChart2,       label:'Results'        },
  { to:'/admin/notifications', icon:Bell,       label:'Notifications'  },
];

export default function AdminDashboard() {
  return (
    <Layout nav={NAV}>
      <Routes>
        <Route index             element={<AdminHome/>}/>
        <Route path="users"      element={<AdminUsers/>}/>
        <Route path="subjects"   element={<AdminSubjects/>}/>
        <Route path="exams"      element={<AdminExams/>}/>
        <Route path="results"    element={<AdminResults/>}/>
        <Route path="notifications" element={<Notifications/>}/>
      </Routes>
    </Layout>
  );
}
