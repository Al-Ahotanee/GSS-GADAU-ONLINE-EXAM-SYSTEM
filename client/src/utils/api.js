// Works both locally (proxy in package.json → localhost:5000)
// and on Vercel (same origin /api/...)
import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

API.interceptors.request.use(cfg => {
  const token = localStorage.getItem('gss_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

API.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gss_token');
      localStorage.removeItem('gss_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default API;

// ─── Helpers ────────────────────────────────────────────────────────────────
export const authAPI = {
  login:          d => API.post('/auth/login',           d),
  register:       d => API.post('/auth/register',        d),
  me:             ()=> API.get('/auth/me'),
  updateMe:       d => API.put('/auth/me',               d),
  changePassword: d => API.put('/auth/change-password',  d),
};

export const adminAPI = {
  stats:        ()  => API.get('/admin/stats'),
  users:        p   => API.get('/admin/users',          { params: p }),
  createUser:   d   => API.post('/admin/users',          d),
  updateUser:   (id,d) => API.put(`/admin/users?id=${id}`, d),
  deleteUser:   id  => API.delete(`/admin/users?id=${id}`),
  subjects:     ()  => API.get('/admin/subjects'),
  createSubject: d  => API.post('/admin/subjects',       d),
  updateSubject: (id,d) => API.put(`/admin/subjects?id=${id}`, d),
  deleteSubject: id => API.delete(`/admin/subjects?id=${id}`),
  results:      ()  => API.get('/admin/results'),
  announce:     d   => API.post('/admin/announcements',  d),
};

export const examAPI = {
  list:           ()       => API.get('/exams'),
  get:            id       => API.get(`/exams?id=${id}`),
  create:         d        => API.post('/exams', d),
  update:         (id,d)   => API.put(`/exams?id=${id}`, d),
  remove:         id       => API.delete(`/exams?id=${id}`),
  publish:        id       => API.post(`/exams?id=${id}&action=publish`),
  addQuestion:    (id,d)   => API.post(`/exams?id=${id}&action=questions`, d),
  updateQuestion: (id,qid,d) => API.put(`/exams?id=${id}&action=questions&qid=${qid}`, d),
  deleteQuestion: (id,qid) => API.delete(`/exams?id=${id}&action=questions&qid=${qid}`),
  results:        id       => API.get(`/exams?id=${id}&action=results`),
};

export const attemptAPI = {
  start:   examId  => API.post('/attempts?action=start',         { exam_id: examId }),
  answer:  (id, q, a) => API.put(`/attempts?id=${id}&action=answer`, { question_id: q, answer: a }),
  submit:  (id, answers) => API.post(`/attempts?id=${id}&action=submit`, { answers }),
  result:  id      => API.get(`/attempts?id=${id}&action=result`),
  history: ()      => API.get('/attempts?action=history'),
};

export const miscAPI = {
  notifications:  ()  => API.get('/misc/notifications'),
  markRead:       ()  => API.put('/misc/notifications'),
  announcements:  ()  => API.get('/misc/announcements'),
  subjects:       ()  => API.get('/misc/subjects'),
  teachers:       ()  => API.get('/misc/teachers'),
};
