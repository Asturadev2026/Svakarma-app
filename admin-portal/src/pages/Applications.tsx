import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, TextField, Select, MenuItem,
  FormControl, InputLabel, CircularProgress, Pagination, Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import client from '../api/client';
import type { Application } from '../types';

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error' | 'default'> = {
  PENDING: 'warning', APPROVED: 'success', REJECTED: 'error',
};

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Applications() {
  const navigate = useNavigate();
  const [apps, setApps]         = useState<Application[]>([]);
  const [total, setTotal]       = useState(0);
  const [page, setPage]         = useState(1);
  const [status, setStatus]     = useState('');
  const [search, setSearch]     = useState('');
  const [loading, setLoading]   = useState(true);

  const load = (p = page, s = status) => {
    setLoading(true);
    const params: any = { page: p, limit: 20 };
    if (s) params.status = s;
    client.get('/applications', { params } as any)
      .then((r: any) => { setApps(r.items); setTotal(r.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleStatus = (v: string) => { setStatus(v); setPage(1); load(1, v); };
  const handlePage   = (_: any, p: number) => { setPage(p); load(p, status); };

  const filtered = search
    ? apps.filter(a =>
        a.user.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.user.phone.includes(search) ||
        a.purpose.toLowerCase().includes(search.toLowerCase()))
    : apps;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>Applications</Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 3 }}>Review and manage loan applications.</Typography>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          size="small" placeholder="Search name, phone, purpose…" value={search}
          onChange={e => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#9CA3AF', mr: 1 }} /> } }}
          sx={{ width: 280, bgcolor: '#fff', borderRadius: 2 }}
        />
        <FormControl size="small" sx={{ width: 160 }}>
          <InputLabel>Status</InputLabel>
          <Select value={status} label="Status" onChange={e => handleStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="APPROVED">Approved</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>
        <Chip label={`${total} total`} variant="outlined" sx={{ alignSelf: 'center' }} />
      </Box>

      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F9FAFB' }}>
                  {['Applicant', 'Company', 'Amount', 'Purpose', 'Status', 'Date', ''].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: '#374151', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 6, color: '#9CA3AF' }}>No applications found.</TableCell></TableRow>
                ) : filtered.map(app => (
                  <TableRow key={app.id} hover sx={{ cursor: 'pointer', '&:hover': { bgcolor: '#F9FAFB' } }}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600, color: '#111827' }}>{app.user.name || '—'}</Typography>
                      <Typography variant="caption" sx={{ color: '#6B7280' }}>{app.user.phone}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: '#374151' }}>{app.user.companyName || '—'}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#111827' }}>{fmt(app.requestedAmount)}</TableCell>
                    <TableCell sx={{ color: '#374151', maxWidth: 160 }}>
                      <Typography noWrap>{app.purpose}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={app.status} color={STATUS_COLORS[app.status]} size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ color: '#6B7280', fontSize: 13 }}>{fmtDate(app.createdAt)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => navigate(`/applications/${app.id}`)}>
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Card>

      {total > 20 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={Math.ceil(total / 20)} page={page} onChange={handlePage} color="primary" />
        </Box>
      )}
    </Box>
  );
}
