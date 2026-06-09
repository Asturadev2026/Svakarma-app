import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography,
  CircularProgress, Alert, InputAdornment, IconButton,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import EmailIcon from '@mui/icons-material/Email';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('admin@svakarma.com');
  const [password, setPassword] = useState('Admin@123');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const res: any = await client.post('/login', { email, password });
      if (res.success) { login(res.token, res.admin); navigate('/'); }
      else setError(res.message || 'Login failed.');
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'linear-gradient(135deg, #0F1117 0%, #1a1f2e 100%)',
    }}>
      <Card sx={{ width: 420, borderRadius: 4, overflow:'hidden', boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }}>
        {/* Header strip */}
        <Box sx={{ bgcolor:'#E53935', p: 3, textAlign:'center' }}>
          <AccountBalanceIcon sx={{ color:'#fff', fontSize: 40, mb: 1 }} />
          <Typography variant="h5" sx={{ color:'#fff', fontWeight:800 }}>Svakarma Admin</Typography>
          <Typography variant="body2" sx={{ color:'rgba(255,255,255,0.75)' }}>Loan Management Portal</Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth label="Email Address" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color:'#9CA3AF' }} /></InputAdornment> } }}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth label="Password" type={showPw ? 'text' : 'password'} value={password}
              onChange={(e) => setPassword(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start"><LockIcon sx={{ color:'#9CA3AF' }} /></InputAdornment>,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowPw(!showPw)} edge="end">
                        {showPw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }
              }}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth type="submit" variant="contained" size="large" disabled={loading}
              sx={{ height: 52, borderRadius: 2, bgcolor:'#E53935', '&:hover':{ bgcolor:'#C62828' }, fontWeight: 700, fontSize: 16 }}
            >
              {loading ? <CircularProgress size={24} sx={{ color:'#fff' }} /> : 'Sign In'}
            </Button>
          </form>
          <Typography variant="caption" sx={{ display:'block', textAlign:'center', mt: 2, color:'#9CA3AF' }}>
            Default: admin@svakarma.com / Admin@123
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}
