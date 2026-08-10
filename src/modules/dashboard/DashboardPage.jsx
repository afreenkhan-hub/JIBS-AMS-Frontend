import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { MetricCard } from '../../components/ui/MetricCard.jsx';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { useEffect, useState } from 'react';
import { dashboardApi } from '../../api/modules.js';
import { APPROVAL_STATUS, WORK_STATUS } from '../../utils/roles.js';
 
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
 
// FIX: this page used to render entirely hardcoded ticket numbers
// (openTickets: 29, a static ticketStatus chart, an empty recentTickets
// table wired through useTableActions with no apiUrl - none of it read
// from the real ticket store). That's why a ticket raised anywhere neverF
// showed up here: this page never looked at useSharedTickets in the first
// place. The ticket-related cards/chart/table below now read the same
// live store every other ticket page uses (see useSharedTickets.js), so
// they update immediately when a ticket is raised, approved, rejected or
// reassigned from any other screen.
//
// Asset/employee/project/stock counts are still placeholders - there is no
// shared asset/employee summary hook yet (out of scope here, frontend
// only), so those cards are left as-is rather than guessed at.
 
 
 
 
export default function DashboardPage() {
  const [dashboard, setDashboard] = useState({
  totalAssets: 0,
  totalUsers: 0,
  totalProjects: 0,
  availableAssets: 0,
  assignedAssets: 0,
  repairAssets: 0,
  damagedAssets: 0,
  openTickets: 0,
  pendingTickets: 0,
  closedTickets: 0,
  inProgressTickets: 0,
  warrantyExpiry: 0,
  assetCategories: {},
  tickets: []
});
  useEffect(() => {
  loadDashboard();
}, []);
 
const loadDashboard = async () => {
  try {
    const response = await dashboardApi.getSuperAdminDashboard();
    setDashboard(response.data);
  } catch (error) {
    console.error("Dashboard API error:", error);
    // Keep the default values if the backend is unavailable
  }
};
const tickets = [...(dashboard.tickets || [])].sort((a, b) => b.id - a.id);
const ASSET_TYPES = [
  "Laptop",
  "Desktop",
  "CPU",
  "Monitor",
  "Mouse",
  "Keyboard",
  "LAN Cable",
  "HDMI Cable",
  "Headset",
  "Mobile",
  "Charger",
  "Adapter",
  "Network Device",
  "Other"
];
 
 
const assetCategoryChart = ASSET_TYPES.map((type) => ({
  label: type,
  value: dashboard.assetCategories?.[type] || 0
}));
 
  const openTickets = tickets.filter((ticket) =>
   
    ticket.work_status !== WORK_STATUS.CLOSED
  ).length;
 const pending = tickets.filter(
  (ticket) => ticket.work_status === WORK_STATUS.PENDING
).length;
  const inProgress = tickets.filter((ticket) => ticket.work_status === WORK_STATUS.IN_PROGRESS).length;
  const closed = tickets.filter((ticket) => ticket.work_status === WORK_STATUS.CLOSED).length;
const ticketStatusChart = [
  { label: 'Pending', value: dashboard.pendingTickets },
  { label: 'Open', value: dashboard.openTickets },
  { label: 'In Progress', value: dashboard.inProgressTickets },
  { label: 'Closed', value: dashboard.closedTickets }
];
console.log("Tickets:", tickets);
const recentTickets = tickets.map(ticket => ({
  ticket_number: ticket.ticketId,
  employee: ticket.employeeName,
  asset: ticket.assetName,
  priority: ticket.priority,
  work_status: ticket.workStatus,
  created_at: ticket.createdAt
}));
  return (
    <section>
      <div className="page-title">
        <div>
          <h1>Super Admin Dashboard</h1>
          <p>Complete overview of assets, employees, stock, tickets and warranty alerts.</p>
        </div>
      </div>
 
 <div className="metric-grid">
  <MetricCard label="Total Assets" value={dashboard.totalAssets} tone="blue" />
 
  <MetricCard label="Total Users" value={dashboard.totalUsers} tone="green" />
 
  <MetricCard label="Total Projects" value={dashboard.totalProjects} tone="teal" />
 
  <MetricCard label="Assigned Assets" value={dashboard.assignedAssets} tone="orange" />

 
  <MetricCard label="Pending Tickets" value={dashboard.pendingTickets} tone="amber" />
 
  <MetricCard label="Open Tickets" value={dashboard.openTickets} tone="red" />
 
 <MetricCard label="In Progress" value={dashboard.inProgressTickets} tone="violet" />  
 
  <MetricCard label="Closed Tickets" value={dashboard.closedTickets} tone="gray" />
 
  <MetricCard label="Stock" value={dashboard.availableAssets} tone="green" />
 
  <MetricCard label="Warranty Expiry" value={dashboard.warrantyExpiry} tone="gray"/>
 
</div>
 
<div className="chart-grid">
 
  <div className="panel">
    <h2>Ticket Status</h2>
 
    <Doughnut
      data={toChart(ticketStatusChart)}
      options={{
        responsive: true,
        plugins: {
          legend: {
            position: "right"
          }
        }
      }}
    />
 
  </div>
 
 
  <div className="panel">
    <h2>Asset Categories</h2>
 
<div style={{ height: "400px" }}>
  <Bar
    data={toChart(assetCategoryChart)}
    options={{
      responsive: true,
      maintainAspectRatio: false,
 
      plugins: {
        legend: {
          display: false
        }
      },
 
      scales: {
        y: {
          beginAtZero: true,
          min: 0,
          max: 50,
          ticks: {
            stepSize: 10
          },
          grid: {
            display: false
          }
        },
 
        x: {
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45,
            font: {
              size: 10
            }
          },
          grid: {
            display: false
          }
        }
      }
    }}
  />
</div>
  </div>
 
</div>
      <DataTable
        columns={[
          { key: 'ticket_number', label: 'Ticket ID' },
          { key: 'employee', label: 'Employee' },
          { key: 'asset', label: 'Asset' },
          { key: 'priority', label: 'Priority', render: (row) => <StatusBadge value={row.priority} /> },
          { key: 'work_status', label: 'Work Status', render: (row) => <StatusBadge value={row.work_status} /> },
          { key: 'created_at', label: 'Date & Time' }
        ]}
        rows={recentTickets}
        empty="No tickets raised yet."
      />
    </section>
  );
}
 
function toChart(rows = []) {
  return {
    labels: rows.map((item) => item.label),
    datasets: [{
      data: rows.map((item) => Number(item.value)),
      backgroundColor: ['#2563eb', '#16a34a', '#f59e0b', '#dc2626', '#7c3aed', '#0891b2']
    }]
  };
}
 