import axios from "axios";
import { createContext, useContext, useMemo, useState } from 'react';
import { demoUsers } from '../data/roleData.js';

const AuthContext = createContext(null);

// The ticket workflow (and several other modules) read user.employeeId,
// user.employee_id, user.username, user.full_name, user.project and
// user.role. The Spring Boot login/register response doesn't reliably use
// those exact names (e.g. it may send `name`/`id`/`projectName` instead),
// which was silently breaking things downstream - e.g. a missing
// user.project meant every new ticket was saved with project: undefined,
// which made projectsOverlap() always return false and hid the ticket
// from the Manager's approval page entirely.
// This only fills in aliases that are missing; every original field from
// the backend response is preserved as-is.
function normalizeUser(raw) {
  if (!raw) return raw;

  const employeeId = raw.employeeId ?? raw.employee_id ?? raw.empId ?? raw.userId ?? raw.id;
  const fullName = raw.full_name ?? raw.fullName ?? raw.name ?? raw.username;
  const username = raw.username ?? raw.email ?? fullName;
  const project = raw.project ?? raw.projectName ?? raw.project_name
    ?? (Array.isArray(raw.projects) ? raw.projects.join(', ') : raw.projects);
  const role = raw.role ?? raw.userRole ?? raw.roleName;

  return {
    ...raw,
    employeeId,
    employee_id: employeeId,
    full_name: fullName,
    username,
    project,
    role
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('ealms_user');
    return stored ? normalizeUser(JSON.parse(stored)) : null;
  });

  const login = async (identifier, password) => {

    const response = await axios.post(
        "https://jibs-ams-backend-production.up.railway.app/api/auth/login",
        {
            email: identifier,
            password: password
        }
    );

    const normalized = normalizeUser(response.data);

    localStorage.setItem("ealms_token", "token");

    localStorage.setItem("ealms_user", JSON.stringify(normalized));

    setUser(normalized);

    return normalized;
};
 const registerSuperAdmin = async (payload) => {
  try {
    const response = await axios.post(
      "https://jibs-ams-backend-production.up.railway.app/api/auth/register",
      payload
    );

    const normalized = normalizeUser(response.data);

    localStorage.setItem("ealms_token", "frontend-demo-token");
    localStorage.setItem("ealms_user", JSON.stringify(normalized));

    setUser(normalized);

    return normalized;
  } catch (error) {
    throw new Error(
      error.response?.data || "Registration failed"
    );
  }
};
 
  const logout = () => {
    localStorage.removeItem('ealms_token');
    localStorage.removeItem('ealms_user');
    setUser(null);
  };
 
  const value = useMemo(
    () => ({ user, login, logout, registerSuperAdmin, isAuthenticated: Boolean(user) }),
    [user]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
 
export function useAuth() {
  return useContext(AuthContext);
}