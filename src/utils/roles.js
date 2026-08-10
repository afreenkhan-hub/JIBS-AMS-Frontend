// Single source of truth for the Ticket Management role-based workflow.
//
// NOTE FOR BACKEND: the login `role` values below (MANAGER, CDO, DIRECTOR,
// IT_TEAM, ADMINISTRATION_TEAM) do not exist on the Spring Boot side yet -
// today `/api/auth/login` only ever returns SUPER_ADMIN, ADMIN or EMPLOYEE.
// The frontend is built ahead of that so the workflow "just works" once the
// backend User.role enum + JWT claims include these values. Until then,
// anyone who doesn't have one of these roles is treated as EMPLOYEE for
// ticket purposes (see resolveTicketRole below).
export const ROLES = {
  EMPLOYEE: 'EMPLOYEE',
  MANAGER: 'MANAGER',
  TEAM_LEAD: 'TEAM_LEAD',
  CDO: 'CDO',
  DIRECTOR: 'DIRECTOR',
  IT_TEAM: 'IT_TEAM',
  ADMINISTRATION_TEAM: 'ADMINISTRATION_TEAM',
  SUPER_ADMIN: 'SUPER_ADMIN',
  // Legacy role, kept so the existing Project Employees / Project Assets
  // pages (out of scope for this refactor) keep working.
  
};

export const ROLE_LABELS = {
  [ROLES.EMPLOYEE]: 'Employee',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.CDO]: 'CDO',
  [ROLES.DIRECTOR]: 'Director',
  [ROLES.IT_TEAM]: 'IT Team',
  [ROLES.ADMINISTRATION_TEAM]: 'Administration Team',
  [ROLES.SUPER_ADMIN]: 'Super Admin',
  [ROLES.TEAM_LEAD]: 'Team Lead'
};

// Roles allowed to raise a ticket (Scenario 1/2/3 creators).
// IT_TEAM/ADMINISTRATION_TEAM are individual staff too (their own laptop
// can break) and Sidebar.jsx already links them to /my-tickets and
// EmployeeDashboardPage already lets them raise a ticket - they must be
// included here or RoleGate on the /my-tickets route bounces them straight
// back to /dashboard the moment they click it.
export const TICKET_CREATOR_ROLES = [
  ROLES.EMPLOYEE,
  ROLES.MANAGER,
  ROLES.CDO,
  ROLES.DIRECTOR,
  ROLES.TEAM_LEAD,
  ROLES.IT_TEAM,
  ROLES.ADMINISTRATION_TEAM
];

// Roles that can appear in the single Approval page (Super Admin approves
// on its own Ticket Management page instead, since it already has full
// ticket visibility there).
export const APPROVER_ROLES = [ROLES.TEAM_LEAD, ROLES.MANAGER, ROLES.CDO, ROLES.DIRECTOR];

// Roles that action a department queue (work status only).
export const DEPARTMENT_ROLES = [ROLES.IT_TEAM, ROLES.ADMINISTRATION_TEAM];

export const DEPARTMENT_BY_ROLE = {
  [ROLES.IT_TEAM]: 'IT Team',
  [ROLES.ADMINISTRATION_TEAM]: 'Administration Team'
};

export const APPROVAL_STATUS = { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected' };

export const WORK_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  OPEN: "OPEN",
  IN_PROGRESS: "IN_PROGRESS",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED"
};
export const APPROVAL_LEVEL = {
  NONE: 'None',
  LEAD_MANAGER: 'Lead/Manager',
  CDO: 'CDO',
  DIRECTOR: 'Director',
  SUPER_ADMIN: 'Super Admin'
};

export const NEXT_APPROVAL = {
  [APPROVAL_LEVEL.LEAD_MANAGER]: APPROVAL_LEVEL.CDO,
  [APPROVAL_LEVEL.CDO]: APPROVAL_LEVEL.DIRECTOR,
  [APPROVAL_LEVEL.DIRECTOR]: APPROVAL_LEVEL.SUPER_ADMIN
};
// A user's `role` decides the workflow - never branch UI/business logic on
// designation/title text. Anything unrecognised falls back to Employee so
// the "raise a ticket" flow never breaks for an unmapped role.
export function resolveTicketRole(role) {
  return Object.values(ROLES).includes(role) ? role : ROLES.EMPLOYEE;
}

// Scenario 1/2/3 - decides where a newly created ticket starts out, purely
// from the creator's role.
//   Employee            -> Manager approval
//   Manager              -> CDO/Director approval
//   CDO / Director        -> Super Admin approval (Super Admin picks the
//                            department + assignee, same as any other level)
export function getInitialRouting(approvalRoles = []) {

  if (approvalRoles.includes("TEAM_LEAD")) {
    return {
      approval_level: APPROVAL_LEVEL.LEAD_MANAGER,
      approval_status: APPROVAL_STATUS.PENDING,
      work_status: WORK_STATUS.PENDING
    };
  }

  if (approvalRoles.includes("MANAGER")) {
    return {
      approval_level: APPROVAL_LEVEL.LEAD_MANAGER,
      approval_status: APPROVAL_STATUS.PENDING,
      work_status: WORK_STATUS.PENDING
    };
  }

  if (approvalRoles.includes("CDO")) {
    return {
      approval_level: APPROVAL_LEVEL.CDO,
      approval_status: APPROVAL_STATUS.PENDING,
      work_status: WORK_STATUS.PENDING
    };
  }

  if (approvalRoles.includes("DIRECTOR")) {
    return {
      approval_level: APPROVAL_LEVEL.DIRECTOR,
      approval_status: APPROVAL_STATUS.PENDING,
      work_status: WORK_STATUS.PENDING
    };
  }

  return {
    approval_level: APPROVAL_LEVEL.SUPER_ADMIN,
    approval_status: APPROVAL_STATUS.PENDING,
    work_status: WORK_STATUS.PENDING
  };
}
export function isApproverForTicket(role, ticket, approvalRoles = []) {

  const resolved = resolveTicketRole(role);

  switch (resolved) {

    case ROLES.TEAM_LEAD:
      return approvalRoles.includes("TEAM_LEAD");

    case ROLES.MANAGER:
      return approvalRoles.includes("MANAGER");

    case ROLES.CDO:
      return approvalRoles.includes("CDO");

    case ROLES.DIRECTOR:
      return approvalRoles.includes("DIRECTOR");

    case ROLES.SUPER_ADMIN:
      return approvalRoles.length === 0;

    default:
      return false;
  }
}