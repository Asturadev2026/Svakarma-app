import { useEffect, useState } from 'react';
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Paper } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import client from '../api/client';
import type { DashboardStats } from '../types';

const statCards = (stats: DashboardStats) => [
  { label: 'Total Users',          value: stats.totalUsers,          icon: <PeopleIcon />,          color: '#3B82F6', bg: '#EFF6FF' },
  { label: 'Total Applications',   value: stats.totalApplications,   icon: <AssignmentIcon />,      color: '#8B5CF6', bg: '#F5F3FF' },
  { label: 'Pending Applications', value: stats.pendingApplications, icon: <HourglassEmptyIcon />,  color: '#F59E0B', bg: '#FFFBEB' },
  { label: 'Approved',             value: stats.approvedApplications,icon: <CheckCircleIcon />,     color: '#10B981', bg: '#ECFDF5' },
];

export default function Dashboard() {
  const [stats, setStats]     = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get('/dashboard')
      .then((r: any) => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box sx={{ display:'flex', justifyContent:'center', mt: 8 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#111827', mb: 1 }}>Dashboard</Typography>
      <Typography variant="body1" sx={{ color: '#6B7280', mb: 4 }}>Welcome to the Svakarma admin portal.</Typography>

      {stats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards(stats).map(({ label, value, icon, color, bg }) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={label}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', '&:hover': { boxShadow: '0 8px 24px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' }, transition: 'all 0.2s' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body2" sx={{ color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.8 }}>
                      {label}
                    </Typography>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color }}>
                      {icon}
                    </Box>
                  </Box>
                  <Typography variant="h3" sx={{ fontWeight: 800, color: '#111827' }}>{value}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', p: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827', mb: 2 }}>Quick Stats</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {stats && [
            { label: 'Rejection Rate', value: stats.totalApplications ? `${((stats.totalApplications - stats.approvedApplications - stats.pendingApplications) / stats.totalApplications * 100).toFixed(1)}%` : '0%', color: 'error' },
            { label: 'Approval Rate', value: stats.totalApplications ? `${(stats.approvedApplications / stats.totalApplications * 100).toFixed(1)}%` : '0%', color: 'success' },
            { label: 'Pending Rate', value: stats.totalApplications ? `${(stats.pendingApplications / stats.totalApplications * 100).toFixed(1)}%` : '0%', color: 'warning' },
          ].map(({ label, value }) => (
            <Box key={label} sx={{ bgcolor: '#F9FAFB', borderRadius: 2, px: 3, py: 2, minWidth: 140 }}>
              <Typography variant="caption" sx={{ color: '#6B7280', fontWeight: 600, display: 'block' }}>{label}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827', mt: 0.5 }}>{value}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
