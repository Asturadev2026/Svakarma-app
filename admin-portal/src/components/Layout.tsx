import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
  Toolbar, Typography, AppBar, IconButton, Avatar, Chip, Divider, Tooltip,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useAuth } from '../context/AuthContext';

const DRAWER_WIDTH = 240;

const NAV = [
  { label: 'Dashboard',    path: '/',             icon: <DashboardIcon /> },
  { label: 'Applications', path: '/applications', icon: <AssignmentIcon /> },
  { label: 'Users',        path: '/users',        icon: <PeopleIcon /> },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  const drawer = (
    <Box sx={{ display:'flex', flexDirection:'column', height:'100%', bgcolor:'#0F1117' }}>
      {/* Brand */}
      <Box sx={{ p: 3, display:'flex', alignItems:'center', gap: 1.5 }}>
        <AccountBalanceIcon sx={{ color:'#E53935', fontSize: 28 }} />
        <Box>
          <Typography variant="h6" sx={{ color:'#fff', fontWeight:800, lineHeight:1 }}>Svakarma</Typography>
          <Typography variant="caption" sx={{ color:'#6B7280', letterSpacing:1 }}>ADMIN PORTAL</Typography>
        </Box>
      </Box>
      <Divider sx={{ borderColor:'rgba(255,255,255,0.06)' }} />

      {/* Navigation */}
      <List sx={{ mt: 1, flex: 1 }}>
        {NAV.map(({ label, path, icon }) => {
          const active = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
          return (
            <ListItem key={path} disablePadding sx={{ px: 1.5, mb: 0.5 }}>
              <ListItemButton
                selected={active}
                onClick={() => navigate(path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': { bgcolor:'rgba(229,57,53,0.15)', '&:hover': { bgcolor:'rgba(229,57,53,0.2)' } },
                  '&:hover': { bgcolor:'rgba(255,255,255,0.05)' },
                }}
              >
                <ListItemIcon sx={{ color: active ? '#E53935' : '#6B7280', minWidth: 40 }}>{icon}</ListItemIcon>
                <ListItemText primary={label} sx={{ '& span': { color: active ? '#fff' : '#9CA3AF', fontWeight: active ? 700 : 400 } }} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      {/* Admin info + logout */}
      <Divider sx={{ borderColor:'rgba(255,255,255,0.06)' }} />
      <Box sx={{ p: 2, display:'flex', alignItems:'center', gap: 1.5 }}>
        <Avatar sx={{ bgcolor:'#E53935', width:36, height:36, fontSize:14 }}>
          {admin?.name?.charAt(0).toUpperCase() || 'A'}
        </Avatar>
        <Box sx={{ flex: 1, overflow: 'hidden' }}>
          <Typography variant="body2" sx={{ color:'#fff', fontWeight:600 }} noWrap>{admin?.name}</Typography>
          <Chip label={admin?.role?.toUpperCase()} size="small" sx={{ height:16, fontSize:9, bgcolor:'rgba(229,57,53,0.2)', color:'#E53935', mt:0.3 }} />
        </Box>
        <Tooltip title="Logout">
          <IconButton onClick={handleLogout} size="small" sx={{ color:'#6B7280', '&:hover':{ color:'#E53935' } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display:'flex', minHeight:'100vh', bgcolor:'#F8FAFC' }}>
      {/* Sidebar */}
      <Drawer variant="persistent" open={open} sx={{
        width: DRAWER_WIDTH, flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing:'border-box', border:'none' },
      }}>
        {drawer}
      </Drawer>

      {/* Main */}
      <Box sx={{ flex:1, display:'flex', flexDirection:'column', transition:'margin .2s', ml: open ? 0 : `-${DRAWER_WIDTH}px` }}>
        <AppBar position="sticky" elevation={0} sx={{ bgcolor:'#fff', borderBottom:'1px solid #E5E7EB', color:'#111827' }}>
          <Toolbar>
            <IconButton edge="start" onClick={() => setOpen(!open)} sx={{ mr:2, color:'#374151' }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ fontWeight:700, color:'#111827' }}>
              {NAV.find(n => n.path === location.pathname || (n.path !== '/' && location.pathname.startsWith(n.path)))?.label ?? 'Dashboard'}
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ flex:1, p: 3, overflowY:'auto' }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
