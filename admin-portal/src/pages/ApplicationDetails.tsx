import { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, Tab, Tabs, Table, TableBody, TableCell, TableRow,
  IconButton, Tooltip,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useNavigate, useParams } from 'react-router-dom';
import client from '../api/client';

const STATUS_COLORS: Record<string, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning', APPROVED: 'success', REJECTED: 'error',
};
const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const fmtDate = (d: string) => new Date(d).toLocaleString('en-IN');

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <TableRow>
      <TableCell sx={{ color: '#6B7280', fontWeight: 600, fontSize: 13, border: 'none', py: 1, width: '40%' }}>{label}</TableCell>
      <TableCell sx={{ color: '#111827', fontWeight: 500, border: 'none', py: 1 }}>{value || '—'}</TableCell>
    </TableRow>
  );
}

export default function ApplicationDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [app, setApp]           = useState<any>(null);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState(0);
  const [dialog, setDialog]     = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [notes, setNotes]       = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  const load = () => {
    setLoading(true);
    client.get(`/applications/${id}`)
      .then((r: any) => setApp(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleAction = async () => {
    if (!dialog) return;
    setSubmitting(true);
    try {
      await client.patch(`/applications/${id}/status`, { status: dialog, notes });
      setAlert({ type: 'success', msg: `Application ${dialog.toLowerCase()} successfully.` });
      setDialog(null); setNotes('');
      load();
    } catch (err: any) {
      setAlert({ type: 'error', msg: err?.message || 'Action failed.' });
    } finally { setSubmitting(false); }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>;
  if (!app) return <Typography color="error">Application not found.</Typography>;

  const { user, statusHistory } = app;
  const bp = user?.businessProfile;
  const docs = user?.documents || [];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/applications')} sx={{ bgcolor: '#F3F4F6' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 800, color: '#111827' }}>
            {user?.name || user?.phone}
          </Typography>
          <Typography variant="body2" sx={{ color: '#6B7280' }}>Application ID: {app.id.slice(0, 8)}…</Typography>
        </Box>
        <Chip label={app.status} color={STATUS_COLORS[app.status]} sx={{ fontWeight: 700, px: 1 }} />
        {app.status === 'PENDING' && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained" startIcon={<CheckCircleIcon />}
              onClick={() => setDialog('APPROVED')}
              sx={{ bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' }, borderRadius: 2, fontWeight: 700 }}
            >Approve</Button>
            <Button
              variant="outlined" startIcon={<CancelIcon />} color="error"
              onClick={() => setDialog('REJECTED')}
              sx={{ borderRadius: 2, fontWeight: 700 }}
            >Reject</Button>
          </Box>
        )}
      </Box>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3, borderRadius: 2 }} onClose={() => setAlert(null)}>
          {alert.msg}
        </Alert>
      )}

      {/* Tabs */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 700 } }}>
        <Tab label="User Info" />
        <Tab label="Business Info" />
        <Tab label={`Documents (${docs.length})`} />
        <Tab label={`Status History (${statusHistory?.length || 0})`} />
      </Tabs>

      {/* Tab 0 — User Info */}
      {tab === 0 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Personal Details</Typography>
                <Table size="small"><TableBody>
                  <InfoRow label="Full Name"   value={user?.name} />
                  <InfoRow label="Phone"       value={user?.phone} />
                  <InfoRow label="Company"     value={user?.companyName} />
                  <InfoRow label="Location"    value={user?.location} />
                  <InfoRow label="Role"        value={user?.role} />
                  <InfoRow label="Joined"      value={fmtDate(user?.createdAt)} />
                </TableBody></Table>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Loan Application</Typography>
                <Table size="small"><TableBody>
                  <InfoRow label="Requested Amount" value={fmt(app.requestedAmount)} />
                  <InfoRow label="Purpose"          value={app.purpose} />
                  <InfoRow label="Status"           value={app.status} />
                  <InfoRow label="Notes"            value={app.notes} />
                  <InfoRow label="Applied On"       value={fmtDate(app.createdAt)} />
                  <InfoRow label="Last Updated"     value={fmtDate(app.updatedAt)} />
                </TableBody></Table>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tab 1 — Business Info */}
      {tab === 1 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
          <CardContent sx={{ p: 3 }}>
            {!bp ? (
              <Typography color="text.secondary">No business profile found for this user.</Typography>
            ) : (
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Business Details</Typography>
                  <Table size="small"><TableBody>
                    <InfoRow label="Business Name"    value={bp.businessName} />
                    <InfoRow label="Business Type"    value={bp.businessType} />
                    <InfoRow label="Industry"         value={bp.industry} />
                    <InfoRow label="Annual Turnover"  value={bp.annualTurnover} />
                    <InfoRow label="GST Number"       value={bp.gstNumber} />
                    <InfoRow label="PAN Number"       value={bp.panNumber} />
                    <InfoRow label="Aadhaar"          value={bp.aadhaarNumber ? '••••' + bp.aadhaarNumber.slice(-4) : null} />
                    <InfoRow label="Udyam Number"     value={bp.udyamNumber} />
                  </TableBody></Table>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>Address</Typography>
                  <Table size="small"><TableBody>
                    <InfoRow label="Address Line 1" value={bp.addressLine1} />
                    <InfoRow label="Address Line 2" value={bp.addressLine2} />
                    <InfoRow label="City"           value={bp.city} />
                    <InfoRow label="State"          value={bp.state} />
                    <InfoRow label="Pincode"        value={bp.pincode} />
                  </TableBody></Table>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tab 2 — Documents */}
      {tab === 2 && (
        <Grid container spacing={2}>
          {docs.length === 0 ? (
            <Grid size={{ xs: 12 }}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">No documents uploaded.</Typography>
              </Card>
            </Grid>
          ) : docs.map((doc: any) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={doc.id}>
              <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Chip label={doc.docType.replace(/_/g, ' ')} size="small" color="primary" variant="outlined" sx={{ fontWeight: 700 }} />
                  <Chip
                    label={doc.status} size="small"
                    color={doc.status === 'verified' ? 'success' : doc.status === 'rejected' ? 'error' : 'warning'}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>
                <Typography variant="body2" sx={{ color: '#374151', fontWeight: 600, mb: 0.5 }} noWrap>{doc.fileName}</Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF' }}>{fmtDate(doc.createdAt)}</Typography>
                <Box sx={{ mt: 1.5 }}>
                  <Tooltip title="Open file">
                    <Button
                      size="small" variant="outlined" startIcon={<OpenInNewIcon />} fullWidth
                      href={`http://localhost:5000${doc.fileUrl}`} target="_blank"
                      sx={{ borderRadius: 2, fontWeight: 600 }}
                    >View File</Button>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Tab 3 — Status History */}
      {tab === 3 && (
        <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #E5E7EB' }}>
          <CardContent sx={{ p: 3 }}>
            {(!statusHistory || statusHistory.length === 0) ? (
              <Typography color="text.secondary">No status changes recorded yet.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {statusHistory.map((h: any) => (
                  <Box key={h.id} sx={{ display: 'flex', gap: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2 }}>
                    <Chip label={h.status} color={STATUS_COLORS[h.status]} size="small" sx={{ fontWeight: 700, alignSelf: 'flex-start', mt: 0.3 }} />
                    <Box sx={{ flex: 1 }}>
                      {h.notes && <Typography variant="body2" sx={{ color: '#374151' }}>{h.notes}</Typography>}
                      <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                        By {h.changedBy || 'System'} · {fmtDate(h.createdAt)}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Approve / Reject Dialog */}
      <Dialog open={!!dialog} onClose={() => setDialog(null)} maxWidth="sm" fullWidth slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>
          {dialog === 'APPROVED' ? '✅ Approve Application' : '❌ Reject Application'}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2, color: '#374151' }}>
            {dialog === 'APPROVED'
              ? 'Are you sure you want to approve this loan application?'
              : 'Are you sure you want to reject this loan application?'}
          </Typography>
          <TextField
            fullWidth multiline rows={3} label="Notes (optional)"
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="Add reason or remarks…"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialog(null)} sx={{ borderRadius: 2 }}>Cancel</Button>
          <Button
            variant="contained" onClick={handleAction} disabled={submitting}
            color={dialog === 'APPROVED' ? 'success' : 'error'}
            sx={{ borderRadius: 2, fontWeight: 700, minWidth: 100 }}
          >
            {submitting ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
