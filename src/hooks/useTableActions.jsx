import { useMemo, useState, useEffect } from 'react';
import { FiDownload, FiPlus, FiUpload } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { ConfirmModal } from '../components/ui/ConfirmModal.jsx';
import { CrudModal } from '../components/ui/CrudModal.jsx';
import { ImportModal } from '../components/ui/ImportModal.jsx';
import { RowActions } from '../components/ui/RowActions.jsx';
import { exportRowsToCsv, parseCsv } from '../utils/csv.js';
import { apiClient } from "../api/axios.js";
 
export function useTableActions({
    initialRows,
    fields,
    entityName,
    fileName,
    getLabel,
    fetchUsers,
    apiUrl,
    defaultValues = {},
    onSaved,
    transformPayload

}) {
  const [rows, setRows] = useState(initialRows);
  useEffect(() => {
  setRows(initialRows);
}, [initialRows]);
  const [modal, setModal] = useState(null);
  const [formValues, setFormValues] = useState({});
 
  const emptyValues = useMemo(
    () => fields.reduce((values, field) => ({ ...values, [field.key]: '' }), {}),
    [fields]
  );
 
const openAdd = () => {
    setFormValues({
        ...emptyValues,
        ...defaultValues
    });
    setModal({ type: 'add' });
};
  const openEdit = (row, index, type = 'edit') => {
    setFormValues({ ...emptyValues, ...row });
    setModal({ type, row, index });
  };
 
  const openDelete = (row, index) => {
    setModal({ type: 'delete', row, index });
  };
 
  const closeModal = () => {
    setModal(null);
    setFormValues({});
  };
 
  const submitForm = async (event) => {
  event.preventDefault();
 
   console.log("FORM VALUES BEFORE SAVE", formValues);
  try {
 
// ADD USER
if (modal?.type === "add") {

const payload = transformPayload 
    ? transformPayload(formValues)
    : formValues;


const response = await apiClient.post(
    apiUrl,
    payload
);


if (fetchUsers) {
    await fetchUsers();
}


toast.success(`${entityName} added successfully`);

onSaved?.(
    'add',
    formValues,
    null,
    response.data
);

}
  else if (modal?.type === "edit") {

  const payload = transformPayload
    ? transformPayload(formValues)
    : formValues;

  const response = await apiClient.put(
    `${apiUrl}/${modal.row.id}`,
    payload
  );

  if (fetchUsers) {
    await fetchUsers();
  }

  toast.success(`${entityName} updated successfully`);

  onSaved?.(
    "edit",
    formValues,
    modal.row,
    response.data
  );
}
 
    closeModal();
 
  } catch (error) {
 
    console.error(error);
 
    toast.error("Something went wrong");
  }
};
 
  const confirmDelete = async () => {
 
  try {
 
   await apiClient.delete(
  `${apiUrl}/${modal.row.id}`
);
 
    setRows((current) =>
      current.filter((row) => row.id !== modal.row.id)
    );
 
    toast.success(`${entityName} deleted`);
 
    closeModal();
 
  } catch (error) {
 
    console.error(error);
 
    toast.error("Delete failed");
  }
 
};
 const importFile = async (event) => {
 
  const file = event.target.files[0];
 
  if (!file) return;
 
  const formData = new FormData();
 
  formData.append("file", file);
 
  try {
 
    await apiClient.post(
      `${apiUrl}/import`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
 
    toast.success(`${entityName} imported successfully`);
 
    if (fetchUsers) {
      fetchUsers();
    }
 
    closeModal();
 
  } catch (error) {
 
    console.error(error);
 
    toast.error("Import Failed");
  }
 
};
  const pageActions = (
    <>
      <button className="btn btn-outline-secondary" type="button" onClick={() => exportRowsToCsv(rows, fileName)}>
        <FiDownload /> Export
      </button>
      <button className="btn btn-primary" type="button" onClick={openAdd}>
        <FiPlus /> Add {entityName}
      </button>
    </>
  );
 
  const actionColumn = {
    key: 'actions',
    label: 'Actions',
    render: (row) => {
      const index = rows.indexOf(row);
      return (
        <RowActions
          onEdit={() => openEdit(row, index, 'edit')}
          onDelete={() => setModal({ type: 'delete', row, index })}
        />
      );
    }
  };
 
  const modals = (
    <>
      <CrudModal
        open={['add', 'edit', 'update'].includes(modal?.type)}
        title={`${modal?.type === 'add' ? 'Add' : modal?.type === 'update' ? 'Update' : 'Edit'} ${entityName}`}
        fields={fields}
        values={formValues}
        onChange={(key, value) => setFormValues((current) => ({ ...current, [key]: value }))}
        onSubmit={submitForm}
        onClose={closeModal}
        submitLabel={modal?.type === 'add' ? 'Add' : modal?.type === 'update' ? 'Update' : 'Save'}
      />
      <ImportModal
        open={modal?.type === 'import'}
        title={`Import ${entityName}`}
        onFile={importFile}
        onClose={closeModal}
      />
      <ConfirmModal
        open={modal?.type === 'delete'}
        message={`Delete ${getLabel?.(modal?.row) || entityName.toLowerCase()}? This removes it from the current table.`}
        onConfirm={confirmDelete}
        onClose={closeModal}
      />
    </>
  );
 
  return { rows, setRows, pageActions, actionColumn, modals, openAdd, openEdit, openDelete };
}
 