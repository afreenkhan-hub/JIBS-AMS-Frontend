import { FiSave, FiUser } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTableActions } from '../../hooks/useTableActions.jsx';

export default function ProfileSettingsPage() {
  const { user } = useAuth();
  const fields = [
    { key: 'full_name', label: 'Full Name' },
    { key: 'designation', label: 'Designation' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone_no', label: 'Phone Number' },
    { key: 'current_password', label: 'Current Password', type: 'password' },
    { key: 'new_password', label: 'New Password', type: 'password' }
  ];
  const { rows, pageActions, modals } = useTableActions({
    initialRows: [{
      full_name: user?.full_name || 'Super Admin',
      designation: user?.designation || 'Super Admin',
      email: user?.email || 'superadmin@company.com',
      phone_no: user?.phone_no || '',
      current_password: '',
      new_password: ''
    }],
    fields,
    entityName: 'Profile',
    fileName: 'profile.csv',
    getLabel: (row) => row?.full_name
  });
  const profile = rows[0] || {};

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Profile Setting</h1>
          <p>Update Super Admin profile details, contact information and password preferences.</p>
        </div>
        <div className="page-actions">
          {pageActions}
        </div>
      </div>

      <div className="settings-grid">
        <div className="panel form-stack">
          <h2><FiUser /> Profile Details</h2>
          <input className="form-control" value={profile.full_name || ''} readOnly />
          <input className="form-control" value={profile.designation || ''} readOnly />
          <input className="form-control" value={profile.email || ''} readOnly />
          <input className="form-control" placeholder="Phone number" value={profile.phone_no || ''} readOnly />
        </div>

        <div className="panel form-stack">
          <h2>Password Setting</h2>
          <input className="form-control" type="password" placeholder="Current password" />
          <input className="form-control" type="password" placeholder="New password" />
          <input className="form-control" type="password" placeholder="Confirm new password" />
        </div>
      </div>

      <button className="btn btn-primary mt-3"><FiSave /> Save Profile</button>
      {modals}
    </section>
  );
}
