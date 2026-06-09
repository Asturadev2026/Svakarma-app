import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, Pagination,
  LinearProgress, Tooltip, Avatar,
} from '@mui/material';
import client from '../api/client';
import type { User } from '../types';

const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });

function getInitials(name?: string, phone?: string) {
  if (name) return name.split(' ').map(w => w[0]).slice(0,2).join('').toUpperCase();
  return phone?.slice(-2) || '?';
}

const AVATAR_COLORS = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#E53935','#06B6D4'];

export default function Users() {
  const [users, setUsers]   = useState<User[]>([]);
  const [total, setTotal]   = useState(0);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);

  const load = (p = 1) => {
    setLoading(true);
    client.get('/users', { params: { page: p, limit: 20 } } as any)
      .then((r: any) => { setUsers(r.items); setTotal(r.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handlePage = (_: any, p: number) => { setPage(p); load(p); };

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight:800, color:'#111827', mb:1 }}>Users</Typography>
      <Typography variant="body1" sx={{ color:'#6B7280', mb:3 }}>
        All registered borrowers — {total} total.
      </Typography>

      <Card elevation={0} sx={{ borderRadius:3, border:'1px solid #E5E7EB', overflow:'hidden' }}>
        {loading ? (
          <Box sx={{ display:'flex', justifyContent:'center', p:8 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor:'#F9FAFB' }}>
                  {['User','Phone','Company','Profile','Applications','Documents','Joined'].map(h => (
                    <TableCell key={h} sx={{ fontWeight:700, color:'#374151', fontSize:12, textTransform:'uppercase', letterSpacing:0.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py:6, color:'#9CA3AF' }}>No users found.</TableCell>
                  </TableRow>
                ) : users.map((u, i) => (
                  <TableRow key={u.id} hover>
                    <TableCell>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                        <Avatar sx={{ width:36, height:36, bgcolor: AVATAR_COLORS[i % AVATAR_COLORS.length], fontSize:14, fontWeight:700 }}>
                          {getInitials(u.name, u.phone)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ fontWeight:600, color:'#111827' }}>{u.name || '—'}</Typography>
                          <Chip label={u.role} size="small" sx={{ height:16, fontSize:9, mt:0.3 }} variant="outlined" />
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color:'#374151', fontFamily:'monospace' }}>{u.phone}</TableCell>
                    <TableCell sx={{ color:'#374151' }}>
                      {u.businessProfile ? (
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight:600 }}>{u.businessProfile.businessName}</Typography>
                          <Typography variant="caption" sx={{ color:'#9CA3AF' }}>{u.businessProfile.businessType}</Typography>
                        </Box>
                      ) : '—'}
                    </TableCell>
                    <TableCell sx={{ minWidth:120 }}>
                      <Box>
                        <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                          <Typography variant="caption" sx={{ color:'#6B7280' }}>Profile</Typography>
                          <Typography variant="caption" sx={{ fontWeight:700, color:'#111827' }}>{u.profileCompletion}%</Typography>
                        </Box>
                        <Tooltip title={`${u.profileCompletion}% complete`}>
                          <LinearProgress
                            variant="determinate" value={u.profileCompletion}
                            sx={{
                              height:6, borderRadius:3,
                              bgcolor:'#F3F4F6',
                              '& .MuiLinearProgress-bar': {
                                bgcolor: u.profileCompletion >= 80 ? '#10B981' : u.profileCompletion >= 50 ? '#F59E0B' : '#E53935',
                              },
                            }}
                          />
                        </Tooltip>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={u._count?.applications ?? 0} size="small" color="primary" />
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={u._count?.documents ?? 0} size="small" color="secondary" />
                    </TableCell>
                    <TableCell sx={{ color:'#6B7280', fontSize:13 }}>{fmtDate(u.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {total > 20 && (
        <Box sx={{ display:'flex', justifyContent:'center', mt:3 }}>
          <Pagination count={Math.ceil(total / 20)} page={page} onChange={handlePage} color="primary" />
        </Box>
      )}
    </Box>
  );
}
