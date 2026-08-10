import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiArrowRight, FiLock } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext.jsx';
import companyLogo from '../../assets/ji-final-icon.png';

export default function LoginPage() {
  const { register, handleSubmit } = useForm({ defaultValues: { identifier: '', password: '' } });
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await login(values.identifier, values.password);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page brand-auth-page">
      <section className="login-shell">
        <div className="auth-panel login-panel-modern">
          <div className="brand auth-brand compact-auth-brand">
            <img src={companyLogo} alt="Company logo" className="auth-logo" />
            <div>
              <strong>Welcome Back</strong>
              <small>Login to Super Admin console</small>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form login-form-modern">
            <label>
              Email ID
              <input
                className="form-control"
                placeholder="Enter email id"
                {...register('identifier', { required: true })}
              />
            </label>
            <label>
              Password
              <input
                className="form-control"
                type="password"
                placeholder="Enter password"
                {...register('password', { required: true })}
              />
            </label>
            <button className="btn register-btn w-100" disabled={loading}>
              <FiLock /> {loading ? 'Signing in...' : 'Login'} <FiArrowRight />
            </button>
          </form>

          <p className="auth-switch">
            New Super Admin? <Link to="/register">Create account</Link>
          </p>
        </div>

        <aside className="login-showcase">
          <img src={companyLogo} alt="Company logo" className="login-logo-xl" />
          <span className="auth-eyebrow">Secure Asset Control</span>
          <h1>Manage assets and tickets with confidence.</h1>
          <p>Use your username or email ID to access the administrator dashboard.</p>
        </aside>
      </section>
    </main>
  );
}
