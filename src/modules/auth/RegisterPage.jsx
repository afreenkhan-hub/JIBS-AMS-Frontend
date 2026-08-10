import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUserPlus } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';
import companyLogo from '../../assets/ji-final-icon.png';
 
export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    mode: 'onChange',
    defaultValues: {
      username: '',
      designation: '',
      email: '',
      phone_no: '',
      password: '',
      confirm_password: ''
    }
  });
  const { registerSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const password = watch('password');
  const passwordStrength = getPasswordStrength(password);
 
 const onSubmit = async (values) => {
  if (values.password !== values.confirm_password) {
    toast.error('Passwords do not match');
    return;
  }
 
  if (passwordStrength.level === 'weak') {
    toast.warning('Password is weak. Use uppercase, lowercase, number and symbol.');
    return;
  }
 
  setLoading(true);
 
  try {
    await registerSuperAdmin(values);
    toast.success('Super Admin registered');
    navigate('/dashboard');
  } catch (error) {
    toast.error(error.message);
  } finally {
    setLoading(false);
  }
};
 
  return (
    <main className="auth-page brand-auth-page">
      <section className="register-shell">
        <aside className="register-showcase">
          <img src={companyLogo} alt="Company logo" className="register-logo" />
          <div>
            <span className="auth-eyebrow">Asset Management System</span>
            <h1>Register your Super Admin account</h1>
            <p>Manage company assets, users, approvals and tickets from one secure dashboard.</p>
          </div>
        </aside>
 
        <div className="auth-panel register-panel">
          <div className="brand auth-brand compact-auth-brand">
            <img src={companyLogo} alt="Company logo" className="auth-logo" />
            <div>
              <strong>Super Admin Register</strong>
              <small>Create your administrator profile</small>
            </div>
          </div>
 
          <form onSubmit={handleSubmit(onSubmit)} className="auth-form register-form">
            <label>
              Username
              <input
                className="form-control"
                placeholder="Enter username"
                {...register('username', {
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' }
                })}
              />
              {errors.username && <span className="field-error">{errors.username.message}</span>}
            </label>
            <label>
              Employee ID
              <input
                className="form-control"
                placeholder="Enter employee ID"
                {...register('employeeId', {
                  required: 'Employee ID is required',
                })}
              />
              {errors.employee_id && <span className="field-error">{errors.employee_id.message}</span>}
            </label>
 
            <label>
              Designation
              <input
                className="form-control"
                placeholder="Example: IT Manager"
                {...register('designation', { required: 'Designation is required' })}
              />
              {errors.designation && <span className="field-error">{errors.designation.message}</span>}
            </label>
            <label>
              Email
              <input
                className="form-control"
                type="email"
                placeholder="name@company.com"
                {...register('email', {
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' }
                })}
              />
              {errors.email && <span className="field-error">{errors.email.message}</span>}
            </label>
            <label>
              Phone No
              <input
                className="form-control"
                placeholder="Enter phone number"
                {...register('phone_no', {
                  required: 'Phone number is required',
                  pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10 digit phone number' }
                })}
              />
              {errors.phone_no && <span className="field-error">{errors.phone_no.message}</span>}
            </label>
            <label>
              Password
              <input
                className="form-control"
                type="password"
                placeholder="Minimum 8 characters"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
              />
              {password && (
                <div className={`password-strength strength-${passwordStrength.level}`}>
                  <span><i style={{ width: `${passwordStrength.score * 25}%` }} /></span>
                  <strong>{passwordStrength.label}</strong>
                </div>
              )}
              {errors.password && <span className="field-error">{errors.password.message}</span>}
            </label>
            <label>
              Confirm Password
              <input
                className="form-control"
                type="password"
                placeholder="Re-enter password"
                {...register('confirm_password', {
                  required: 'Confirm password is required',
                  validate: (value) => value === watch('password') || 'Passwords do not match'
                })}
              />
              {errors.confirm_password && <span className="field-error">{errors.confirm_password.message}</span>}
            </label>
            <label>
              Role
              <input
                className="form-control"
                defaultValue="Super Admin"
               
              />
              {errors.role && <span className="field-error">{errors.role.message}</span>}
            </label>
 
            <button className="btn register-btn w-100" disabled={loading || !watch('email')}>
              <FiUserPlus /> {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>
 
          <p className="auth-switch">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
 
function getPasswordStrength(password = '') {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
 
  if (score <= 1) {
    return { score: Math.max(score, 1), level: 'weak', label: 'Weak password' };
  }
 
  if (score <= 3) {
    return { score, level: 'medium', label: 'Medium password' };
  }
 
  return { score, level: 'strong', label: 'Strong password' };
}