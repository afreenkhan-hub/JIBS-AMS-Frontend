import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from './AuthContext.jsx';
import { assetApi } from '../api/assetApi.js';
import { assignedAssetApi } from '../api/assignedAssetApi.js';
 
const AssignedAssetsContext = createContext(null);
 
// Only the assigned-asset lifecycle records (active/history) are cached
// locally as a resilience fallback - the asset pool itself always comes
// from Asset Master (assetApi), never from localStorage or a hardcoded list.
const STORAGE_KEY = 'ealms_assigned_assets_lifecycle_cache';
const now = () => new Date().toISOString().slice(0, 19);
 
const getCurrentUser = () => {
  try {
    return JSON.parse(localStorage.getItem('ealms_user'));
  } catch {
    return null;
  }
};
 
const readCache = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { active: [], history: [] };
  } catch {
    return { active: [], history: [] };
  }
};
 
// Asset Master only knows Available / Assigned / Repair / Damaged.
// This maps an Assigned Assets lifecycle status onto the correct
// Asset Master status for the underlying physical asset.
const toAssetMasterStatus = (lifecycleStatus, progress = null) => {
  switch (lifecycleStatus) {
    case 'Active':
      return 'Assigned';

    case 'Returned':
      return 'Available';

    case 'Replacement':
      if (progress === 'Repair') {
        return 'Repair';
      }

      if (progress === 'Damaged') {
        return 'Damaged';
      }

      return 'Repair';

    case 'Inactive':
      return 'Damaged';

    default:
      return 'Available';
  }
};
 
export function AssignedAssetsProvider({ children }) {
 
  const cache = readCache();
 
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [active, setActive] = useState(cache.active);
  const [history, setHistory] = useState(cache.history);
 
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ active, history }));
  }, [active, history]);
 
 const loadAssets = async () => {
  setAssetsLoading(true);
  try {
    const response = await assetApi.list();
 
    console.log("API Response:", response.data);
 
    setAssets(response.data || []);
  } finally {
    setAssetsLoading(false);
  }
};
  // Best-effort sync from the server so multiple tabs/sessions stay
  // consistent. Falls back silently to the local cache if the endpoints
  // are not available yet.
  const loadAssignedAssets = async () => {
    try {
      const [activeResponse, historyResponse] = await Promise.all([
        assignedAssetApi.list(),
        assignedAssetApi.history()
      ]);
      if (Array.isArray(activeResponse?.data)) setActive(activeResponse.data);
      if (Array.isArray(historyResponse?.data)) setHistory(historyResponse.data);
      console.log("ACTIVE API:", activeResponse.data);
console.log("HISTORY API:", historyResponse.data);
    } catch (error) {
      // Endpoints may not exist yet - keep using the cached/local state.
      console.warn('Assigned assets API unavailable, using local cache.', error?.message);
    }
  };
 
  useEffect(() => {
    loadAssets();
    loadAssignedAssets();
  }, []);
 
  const findAvailableAsset = (assetId) => assets.find((asset) => asset.id === assetId && asset.status === 'Available');
 
  const assign = async ({ employee, rows }) => {
    if (!rows || !rows.length) throw new Error('Add at least one asset.');
    const selectedIds = rows.map((row) => Number(row.assetId));
    if (selectedIds.some((id) => !id)) throw new Error('Please complete every asset row.');
    if (new Set(selectedIds).size !== selectedIds.length) throw new Error('The same serial number cannot be assigned twice.');
 
    const selected = selectedIds.map((id) => findAvailableAsset(id));
    if (selected.some((asset) => !asset)) throw new Error('One or more selected assets are no longer available.');
 
    const assignedAt = employee.assignedDate || now();
    const created = [];
 
    for (let index = 0; index < selected.length; index += 1) {
      const asset = selected[index];
      const status = rows[index].status || 'Active';
    const payload = {
    employeeId: employee.employeeId.trim(),
    employeeName: employee.employeeName.trim(),
    project: employee.project.trim(),
 
    asset: {
        id: asset.id
    },
 
    assignedDate: assignedAt,
 
    status,
 
    remarks: employee.remarks
};
      let createdRecord;
      try {
        const response = await assignedAssetApi.create(payload);
        createdRecord = response?.data ? { ...payload, ...response.data } : { ...payload, id: `${Date.now()}-${asset.id}-${index}` };
     } catch (error) {
  console.error(error);
  const detail = error?.response?.data?.message;
  throw new Error(detail || 'Failed to create the assignment record.');
}
 
      try {
        await assetApi.update(asset.id, { ...asset, status: toAssetMasterStatus(status) });
      } catch (error) {
        console.error(error);
        throw new Error('Assignment was created but the asset status could not be updated.');
      }
 
      created.push(createdRecord);
    }
 
    setActive((current) => [...created.filter((item) => item.status === 'Active'), ...current]);
    setHistory((current) => [
      ...created
        .filter((item) => item.status !== 'Active')
        .map((item) => ({
          ...item,
          id: `${item.id}-history`,
          previousStatus: 'Available',
          currentStatus: item.status,
          completedDate: assignedAt,
          reason: 'Recorded during assignment'
        })),
      ...current
    ]);
 
    await loadAssets();
  };
 
  // Moves an active assignment into history (Returned / Replacement / Inactive).
  // `rows` is only relevant when nextStatus === 'Replacement' and represents
  // the new replacement asset(s) picked via the dependent dropdowns.
const moveToHistory = async (
  assignment,
  nextStatus,
  reason,
  rows = [],
  progress = null
) => {
    if (!assignment) throw new Error('No assignment selected.');
    if (!reason || !reason.trim()) throw new Error('Reason is required.');
 
    const safeRows = Array.isArray(rows) ? rows.filter((row) => row && row.assetId) : [];
    const replacementRows = nextStatus === 'Replacement' ? safeRows : [];

    if (nextStatus === 'Replacement' && !['Repair', 'Damaged'].includes(progress)) {
  throw new Error('Please select a valid replacement progress.');
}
 
    if (nextStatus === 'Replacement' && !replacementRows.length) {
      throw new Error('Please select at least one replacement asset.');
    }
 
    const replacementIds = replacementRows.map((row) => Number(row.assetId));
    if (new Set(replacementIds).size !== replacementIds.length) {
      throw new Error('The same serial number cannot be assigned twice.');
    }
 
    const replacementAssets = replacementRows.map((row) => {
      const asset = findAvailableAsset(Number(row.assetId));
      if (!asset) throw new Error('One or more replacement assets are no longer available.');
      return asset;
    });
 
    const historyPayload = {
      ...assignment,
      previousStatus: assignment.status,
      currentStatus: nextStatus,
      completedDate: now(),
      reason: reason.trim(),
       progress: nextStatus === 'Replacement' ? progress : null,
      replacementAsset: replacementAssets.length
        ? replacementAssets.map((asset) => `${asset.assetName} — ${asset.serialNumber}`).join(', ')
        : '',
      updatedBy: getCurrentUser()?.username || 'Admin'
    };
console.log("Assignment =", assignment);
    const oldAsset = assignment.asset;
 
    try {
     
      await assignedAssetApi.moveToHistory(assignment.id, historyPayload);
      if (oldAsset) {
    await assetApi.update(oldAsset.id, {
  ...oldAsset,
  status: toAssetMasterStatus(nextStatus, progress)
});
      }
await loadAssignedAssets();
await loadAssets();
 
    } catch (error) {
      console.error(error);
      throw new Error('Failed to update the assignment.....');
    }
 
    const replacementAssignments = [];
    for (let index = 0; index < replacementAssets.length; index += 1) {
      const asset = replacementAssets[index];
   const payload = {
  employeeId: assignment.employeeId,
  employeeName: assignment.employeeName,
  project: assignment.project,
 
  asset: {
    id: asset.id
  },
 
  assignedDate: now(),
  status: "Active",
  remarks: `Replacement for ${assignment.asset.serialNumber}`
};
      try {
        const response = await assignedAssetApi.create(payload);
        replacementAssignments.push(
          response?.data ? { ...payload, ...response.data } : { ...payload, id: `${Date.now()}-${asset.id}-${index}` }
        );
        await assetApi.update(asset.id, { ...asset, status: 'Assigned' });
    } catch (error) {
  console.error(error);
  const detail = error?.response?.data?.message;
  throw new Error(detail || 'Failed to create replacement alignment.');
}
    }
 
  setActive((current) => [
 
  ...replacementAssignments,
 
  ...current.filter((item) => item.id !== assignment.id)
 
]);
 
setHistory((current) => [
 
  { ...historyPayload, id: `${assignment.id}-history-${Date.now()}` },
 
  ...current
 
]);
 
// Refresh from backend
 
await loadAssignedAssets();
 
await loadAssets();
 
  };
 
  const updateActive = async (id, updates) => {
    setActive((current) => current.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    try {
      await assignedAssetApi.update(id, updates);
    } catch (error) {
      console.warn('Could not sync remarks update to the server.', error?.message);
    }
  };
 
  // Removing an active assignment frees the underlying asset back to
  // "Available" in Asset Master - it does not touch any other asset.
  const deleteActive = async (id) => {
    const assignment = active.find((item) => item.id === id);
    if (!assignment) return;
 
    try {
      await assignedAssetApi.remove(id);
      const asset = assignment.asset;
      if (asset) {
        await assetApi.update(asset.id, { ...asset, status: 'Available' });
      }
    } catch (error) {
      console.error(error);
      throw new Error('Failed to delete the assignment. Please try again.');
    }
 
    setActive((current) => current.filter((item) => item.id !== id));
    await loadAssets();
  };
 
  const updateHistory = async (id, updates) => {
    setHistory((current) => current.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    try {
      await assignedAssetApi.update(id, updates);
    } catch (error) {
      console.warn('Could not sync history update to the server.', error?.message);
    }
  };
 
  const deleteHistory = async (id) => {
    setHistory((current) => current.filter((item) => item.id !== id));
    try {
      await assignedAssetApi.remove(id);
    } catch (error) {
      console.warn('Could not sync history delete to the server.', error?.message);
    }
  };
 
  const value = useMemo(
    () => ({
      assets,
      assetsLoading,
      active,
      history,
      refreshAssets: loadAssets,
      assign,
      moveToHistory,
      updateActive,
      deleteActive,
      updateHistory,
      deleteHistory
    }),
    [assets, assetsLoading, active, history]
  );
 
  return <AssignedAssetsContext.Provider value={value}>{children}</AssignedAssetsContext.Provider>;
}
 
export function useAssignedAssets() {
  const context = useContext(AssignedAssetsContext);
  if (!context) throw new Error('useAssignedAssets must be used within AssignedAssetsProvider');
  return context;
}
 