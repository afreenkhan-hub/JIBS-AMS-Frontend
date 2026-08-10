import { NavLink, useLocation } from "react-router-dom";
import {
  FiActivity,
  FiArchive,
  FiBarChart2,
  FiBell,
  FiChevronDown,
  FiCircle,
  FiHome,
  FiTool,
  FiShield,
  FiUser,
  FiTruck
} from "react-icons/fi";

import { useAuth } from "../../context/AuthContext.jsx";
import { ROLES, ROLE_LABELS } from "../../utils/roles.js";
import companyLogo from "../../assets/ji-final-icon.png";

const links = [
  // =========================
  // Dashboard
  // =========================
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: FiHome,
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.TEAM_LEAD,
      ROLES.MANAGER,
      ROLES.CDO,
      ROLES.DIRECTOR,
      ROLES.IT_TEAM,
      ROLES.ADMINISTRATION_TEAM,
      ROLES.EMPLOYEE
    ]
  },

  // =========================
  // SUPER ADMIN
  // =========================
  {
    to: "/users",
    label: "Add Users",
    icon: FiUser,
    roles: [ROLES.SUPER_ADMIN]
  },

  {
    to: "/assets",
    label: "Assets",
    icon: FiArchive,
    roles: [ROLES.SUPER_ADMIN]
  },

  {
    to: "/assigned-assets",
    label: "Assigned Assets",
    icon: FiArchive,
    roles: [ROLES.SUPER_ADMIN]
  },
{
  to: "/vendors",
  label: "Vendor Management",
  icon: FiTruck,
  roles: [ROLES.SUPER_ADMIN]
},
                                              
  {
    to: "/tickets",
    label: "Ticket Management",
    icon: FiActivity,
    roles: [ROLES.SUPER_ADMIN]
  },

  {
    to: "/technicalIssues",
    label: "Technical Issues",
    icon: FiActivity,
    roles: [ROLES.SUPER_ADMIN]
  },
  // =========================
  // TEAM LEAD / MANAGER / CDO / DIRECTOR
  // =========================
  {
    to: "/my-tickets",
    label: "My Tickets",
    icon: FiActivity,
    roles: [
      ROLES.TEAM_LEAD,
      ROLES.MANAGER,
      ROLES.CDO,
      ROLES.DIRECTOR
    ]
  },

  {
    to: "/employee/assets",
    label: "My Assets",
    icon: FiArchive,
    roles: [
      ROLES.TEAM_LEAD,
      ROLES.MANAGER,
      ROLES.CDO,
      ROLES.DIRECTOR,
      ROLES.IT_TEAM,
      ROLES.ADMINISTRATION_TEAM,
      ROLES.EMPLOYEE
    ]
  },

  {
    to: "/admin/employees",
    label: "Project Employees",
    icon: FiUser,
    roles: [
      ROLES.TEAM_LEAD,
      ROLES.MANAGER,
      ROLES.CDO,
      ROLES.DIRECTOR
    ]
  },

  {
    to: "/admin/assets",
    label: "Project Assets",
    icon: FiArchive,
    roles: [
      ROLES.TEAM_LEAD,
      ROLES.MANAGER,
      ROLES.CDO,
      ROLES.DIRECTOR
    ]
  },

  {
    to: "/ticket-approval",
    label: "Ticket Approval",
    icon: FiActivity,
    roles: [
      ROLES.TEAM_LEAD,
      ROLES.MANAGER,
      ROLES.CDO,
      ROLES.DIRECTOR
    ]
  },

  // =========================
  // IT TEAM / ADMINISTRATION TEAM
  // =========================
  {
    to: "/my-tickets",
    label: "My Tickets",
    icon: FiActivity,
    roles: [
      ROLES.IT_TEAM,
      ROLES.ADMINISTRATION_TEAM
    ]
  },

  {
    to: "/department/tickets",
    label: "Department Tickets",
    icon: FiTool,
    roles: [
      ROLES.IT_TEAM,
      ROLES.ADMINISTRATION_TEAM
    ]
  },
 {
    to: "/technicalIssues",
    label: "Technical Issues",
    icon: FiActivity,
    roles: [ROLES.IT_TEAM]
  },


  // =========================
  // EMPLOYEE
  // =========================
  {
    to: "/my-tickets",
    label: "My Tickets",
    icon: FiActivity,
    roles: [ROLES.EMPLOYEE]
  },

  // =========================
  // COMMON
  // =========================
  {
    to: "/notifications",
    label: "Notifications",
    icon: FiBell,
    roles: [
      ROLES.SUPER_ADMIN,
      ROLES.TEAM_LEAD,
      ROLES.MANAGER,
      ROLES.CDO,
      ROLES.DIRECTOR,
      ROLES.IT_TEAM,
      ROLES.ADMINISTRATION_TEAM,
      ROLES.EMPLOYEE
    ]
  }
];
export function Sidebar() {
  const { user } = useAuth();

  const location = useLocation();

  const visibleLinks = links.filter((link) => link.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="brand sidebar-brand">
        <img src={companyLogo} alt="Company Logo" className="sidebar-logo" />

        <div>
          <strong>JIBS-AMS</strong>
            <small>{ROLE_LABELS[user?.role] || user?.role || 'User'}</small>
        </div>
      </div>

      <nav>
       {visibleLinks.map((link) => {
            const Icon = link.icon;

            if (link.children) {
              const isOpen = location.pathname.startsWith("/assets");

              return (
                <div className="nav-group" key={link.label}>
                  <div className={`nav-item nav-parent ${isOpen ? "active" : ""}`}>
                    <Icon />
                    <span>{link.label}</span>
                    <FiChevronDown className={`nav-chevron ${isOpen ? "open" : ""}`} />
                  </div>

                  <div className="nav-submenu">
                    {link.children.map((child) => (
                      <NavLink
                        key={child.to}
                        to={child.to}
                        className="nav-subitem"
                      >
                        <FiCircle />
                        <span>{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <NavLink key={link.to} to={link.to} className="nav-item">
                <Icon />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
}