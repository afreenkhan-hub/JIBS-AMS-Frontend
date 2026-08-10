import { FiSave } from 'react-icons/fi';
import { useTableActions } from '../../hooks/useTableActions.jsx';

export default function SettingsPage() {
  const fields = [
    { key: 'company_name', label: 'Company Name' },
    { key: 'company_email', label: 'Company Email', type: 'email' },
    { key: 'theme', label: 'Theme' },
    { key: 'password_policy', label: 'Password Policy' },
    { key: 'session_timeout', label: 'Session Timeout Minutes', type: 'number' },
    { key: 'account_lock', label: 'Account Lock' }
  ];
  const { rows, pageActions, modals } = useTableActions({
    initialRows: [{
      company_name: 'JOBIXOINDIA Business Services',
      company_email: 'admin@company.com',
      theme: 'Light Theme',
      password_policy: 'Minimum 8 characters, uppercase, number and symbol',
      session_timeout: '30',
      account_lock: 'Account lock enabled'
    }],
    fields,
    entityName: 'Setting',
    fileName: 'settings.csv',
    getLabel: (row) => row?.company_name
  });
  const settings = rows[0] || {};

  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Settings</h1>
          <p>Configure company profile, SMTP, password policy, permissions and theme.</p>
        </div>
        <div className="page-actions">
          {pageActions}
        </div>
      </div>

      <div className="settings-grid">
        <div className="panel form-stack">
          <h2>Company Settings</h2>
          <input className="form-control" value={settings.company_name || ''} readOnly />
          <input className="form-control" placeholder="Company email" value={settings.company_email || ''} readOnly />
          <select className="form-select" value={settings.theme || 'Light Theme'} disabled>
            <option value="Light Theme">Light Theme</option>
            <option value="Dark Theme">Dark Theme</option>
          </select>
        </div>
        <div className="panel form-stack">
          <h2>Security Settings</h2>
          <input className="form-control" value={settings.password_policy || ''} readOnly />
          <input className="form-control" placeholder="Session timeout minutes" value={settings.session_timeout || ''} readOnly />
          <select className="form-select" value={settings.account_lock || 'Account lock enabled'} disabled>
            <option value="Account lock enabled">Account lock enabled</option>
            <option value="Account lock disabled">Account lock disabled</option>
          </select>
        </div>
      </div>

      <button className="btn btn-primary mt-3"><FiSave /> Save Settings</button>
      {modals}
    </section>
  );
}
