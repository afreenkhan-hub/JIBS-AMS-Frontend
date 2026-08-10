import { useMemo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  FiEdit2,
  FiPlus,
  FiTrash2,
  FiX,
  FiUpload,
  FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { DataTable } from '../../components/ui/DataTable.jsx';
import { StatusBadge } from '../../components/ui/StatusBadge.jsx';
import { ExportMenu } from '../../components/ui/ExportMenu.jsx';
import { ImportModal } from '../../components/ui/ImportModal.jsx';
import { ConfirmModal } from '../../components/ui/ConfirmModal.jsx';
import { parseCsv } from '../../utils/csv.js';
import { assetApi } from "../../api/assetApi.js";
import { FilterPanel } from "../../components/ui/FilterPanel.jsx";
import { useAssignedAssets } from "../../context/AssignedAssetsContext.jsx";
import { dashboardApi } from '../../api/modules.js';

const assetCategories = [
  'Own',
  'Rental',
  'Client'
];

const assetTypes = [
  'Laptop',
  'Desktop',
  'CPU',
  'Monitor',
  'Mouse',
  'Keyboard',
  'LAN Cable',
  'HDMI Cable',
  'Headset',
  'Mobile',
  'Charger',
  'Adapter',
  'Network Device',
  'Other'
];

const assetStatus = [
  'Available',
  'Assigned',
  'Repair',
  'Damaged'
];

const assetConditions = [
  'Good',
  'Bad',
  'Repair',
  'Returned',
  'Replacement'
];

const seed = [];

const blank = {
  assetId: '',
  assetCategory: 'Own',
  assetType: '',
  assetName: '',
  brand: '',
  model: '',
  serialNumber: '',
  configuration: '',
  purchaseDate: '',
  vendor: '',
  invoiceNumber: '',
  purchaseCost: '',
  warrantyExpiry: '',
  lastVerificationDate: '',
  assetCondition: 'Good',
  status: 'Available',
  remarks: ''
};


const normalizeImportedAsset = (row, index, assets) => {
  // Normalize CSV column names
  const normalizedRow = {};

  Object.keys(row).forEach((key) => {
    const cleanKey = String(key)
      .replace(/^\uFEFF/, '')       // remove BOM
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '');

    normalizedRow[cleanKey] = String(row[key] ?? '').trim();
  });

  return {
    id: Date.now() + index,

    assetId:
      normalizedRow.assetid ||
      getNextAssetId(assets),

    assetCategory:
      normalizedRow.assetcategory ||
      'Own',

    assetType:
      normalizedRow.assettype ||
      '',

    assetName:
      normalizedRow.assetname ||
      '',

    brand:
      normalizedRow.brand ||
      '',

    model:
      normalizedRow.model ||
      '',

    serialNumber:
      normalizedRow.serialnumber ||
      '',

    configuration:
      normalizedRow.configuration ||
      '',

    purchaseDate:
      normalizedRow.purchasedate ||
      '',

    vendor:
      normalizedRow.vendor ||
      '',

    invoiceNumber:
      normalizedRow.invoicenumber ||
      '',

    purchaseCost:
      normalizedRow.purchasecost ||
      '',

    warrantyExpiry:
      normalizedRow.warrantyexpiry ||
      '',

    lastVerificationDate:
      normalizedRow.lastverificationdate ||
      '',

    assetCondition:
      normalizedRow.assetcondition ||
      'Good',

    status:
      normalizedRow.status ||
      'Available',

    remarks:
      normalizedRow.remarks ||
      ''
  };
};
const normalizeDateForBackend = (value) => {
  if (!value) return null;

  const dateString = String(value).trim();

  // Already in yyyy-MM-dd format
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  // Handle M/D/YYYY or MM/DD/YYYY
  const slashMatch = dateString.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );

  if (slashMatch) {
    const month = slashMatch[1].padStart(2, '0');
    const day = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3];

    return `${year}-${month}-${day}`;
  }

  console.warn(
    'Invalid date format:',
    dateString
  );

  return null;
};
const getNextAssetId = (assets = []) => {
  const prefix = "JIBS";

  const numbers = assets
    .filter(asset => asset && asset.assetId)
    .map(asset => {
      const num = String(asset.assetId).replace(/\D/g, "");
      return Number(num) || 0;
    });

  const max = numbers.length ? Math.max(...numbers) : 0;

  return `${prefix}${String(max + 1).padStart(3, "0")}`;
};
export default function AssetsPage() {
   const { refreshAssets } = useAssignedAssets();
    const [availableStock, setAvailableStock] = useState(0);

 

  const [assets, setAssets] = useState([]);

  const [filters, setFilters] = useState({
    search: '',
    assetCategory: '',
    assetType: '',
    status: ''
  });

  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);


useEffect(() => {
  loadAssets();
  loadAvailableStock();
}, []);
const loadAvailableStock = async () => {
  try {
    const response = await dashboardApi.getSuperAdminDashboard();
    setAvailableStock(response.data.availableAssets);
  } catch (error) {
    console.error(error);
  }
};
  const loadAssets = async () => {
    try {

      const response = await assetApi.list();

      setAssets(response.data);

    } catch (error) {

      console.error(error);

      toast.error("Failed to load assets");

    }
  };


  const counts = useMemo(() => ({

    total: assets.length,

    assigned: assets.filter(
      (asset) => asset.status === 'Assigned'
    ).length,

    repair: assets.filter(
  (asset) => asset.status === 'Repair'
).length,

damaged: assets.filter(
  (asset) => asset.status === 'Damaged'
).length,

    own: assets.filter(
      (asset) => asset.assetCategory === 'Own'
    ).length,

    rental: assets.filter(
      (asset) => asset.assetCategory === 'Rental'
    ).length,

    client: assets.filter(
      (asset) => asset.assetCategory === 'Client'
    ).length,

   

    totalValue: assets.reduce(
      (total, asset) =>
        total + (Number(asset.purchaseCost) || 0),
      0
    )

  }), [assets]);



  const brand = useMemo(
    () =>
      [
        ...new Set(
          assets
            .map((asset) => asset.brand)
            .filter(Boolean)
        )
      ].sort(),

    [assets]
  );



  const filtered = useMemo(() => {

    const keyword = filters.search
      .trim()
      .toLowerCase();


    return assets.filter((asset) => {

      const searchMatches =
        !keyword ||
        [
          asset.assetId,
          asset.assetName,
          asset.assetType,
          asset.brand,
          asset.serialNumber,
          asset.vendor
        ]
          .join(' ')
          .toLowerCase()
          .includes(keyword);



      return (

        searchMatches &&

        (
          !filters.assetCategory ||
          asset.assetCategory === filters.assetCategory
        ) &&

        (
          !filters.assetType ||
          asset.assetType === filters.assetType
        ) &&

        (
          !filters.status ||
          asset.status === filters.status
        )

      );

    });

  }, [assets, filters]);



  const save = async (value) => {

    try {


      if (editing?.id) {


        await assetApi.update(
          editing.id,
          value
        );


        toast.success(
          "Asset Updated Successfully"
        );


      } else {


        await assetApi.create(
          value
        );


        toast.success(
          "Asset Added Successfully"
        );


      }


   await loadAssets();       // Refresh Asset Page
   await loadAvailableStock();
await refreshAssets();    // Refresh AssignedAssetsContext

      setEditing(null);



    } catch (error) {


      console.error(error);

      toast.error(
        "Unable to save asset"
      );


    }

  };



  const deleteAsset = async () => {


    if (!deleteTarget) return;



    try {


      await assetApi.remove(
        deleteTarget.id
      );


      toast.success(
        "Asset Deleted Successfully"
      );


      await loadAssets();
      await loadAvailableStock();
await refreshAssets();


      setDeleteTarget(null);



    } catch (error) {


      console.error(error);


      toast.error(
        "Delete Failed"
      );


    }

  };
const importAssets = async (event) => {
  const [file] = event.target.files || [];

  if (!file) return;

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      const importedRows = parseCsv(
        String(reader.result || '')
      );

      if (!importedRows.length) {
        toast.error(
          'The selected CSV file does not contain any records.'
        );
        return;
      }

      console.log(
        'CSV IMPORT - RAW ROWS:',
        importedRows
      );

      // Existing Asset IDs from database
      const existingAssetIds = new Set(
        assets
          .map((asset) =>
            String(asset.assetId || '')
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      );

      // Existing Serial Numbers from database
      const existingSerialNumbers = new Set(
        assets
          .map((asset) =>
            String(asset.serialNumber || '')
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      );

      let ignored = 0;
      let importedCount = 0;
      let failedCount = 0;

      const validAssets = [];

      /*
       * STEP 1
       * Validate CSV rows
       */
      importedRows.forEach((row, index) => {

        const asset = normalizeImportedAsset(
          row,
          index,
          assets
        );

        const assetId = String(
          asset.assetId || ''
        )
          .trim()
          .toLowerCase();

        const serialNumber = String(
          asset.serialNumber || ''
        )
          .trim()
          .toLowerCase();

        console.log(
          `CSV ROW ${index + 1}:`,
          asset
        );

        /*
         * Check duplicate Asset ID
         */
        const duplicateAssetId =
          assetId &&
          existingAssetIds.has(assetId);

        /*
         * Check duplicate Serial Number
         */
        const duplicateSerialNumber =
          serialNumber &&
          existingSerialNumbers.has(serialNumber);

        if (duplicateAssetId) {
          console.warn(
            `ROW ${index + 1} REJECTED: Duplicate Asset ID`,
            asset.assetId
          );
        }

        if (duplicateSerialNumber) {
          console.warn(
            `ROW ${index + 1} REJECTED: Duplicate Serial Number`,
            asset.serialNumber
          );
        }

        /*
         * Ignore duplicate records
         */
        if (
          duplicateAssetId ||
          duplicateSerialNumber
        ) {
          ignored++;
          return;
        }

        /*
         * Add immediately so duplicate IDs
         * inside the SAME CSV are detected.
         */
        if (assetId) {
          existingAssetIds.add(assetId);
        }

        if (serialNumber) {
          existingSerialNumbers.add(serialNumber);
        }

        validAssets.push(asset);
      });

      console.log(
        'VALID ASSETS:',
        validAssets
      );

      console.log(
        'IGNORED COUNT:',
        ignored
      );

      /*
       * STEP 2
       * Send every valid asset to backend
       */
      for (const asset of validAssets) {

        try {

          /*
           * IMPORTANT:
           * Do not send frontend-only "id"
           * when creating a new asset.
           */
          const payload = {
            assetId: asset.assetId || null,
            assetCategory: asset.assetCategory || 'Own',
            assetType: asset.assetType || null,
            assetName: asset.assetName || null,
            brand: asset.brand || null,
            model: asset.model || null,
            serialNumber: asset.serialNumber || null,
            configuration: asset.configuration || null,
purchaseDate:
  normalizeDateForBackend(asset.purchaseDate),

            vendor:
              asset.vendor || null,

            invoiceNumber:
              asset.invoiceNumber || null,

            purchaseCost:
              asset.purchaseCost === '' ||
              asset.purchaseCost == null
                ? null
                : Number(asset.purchaseCost),

           purchaseDate:
  normalizeDateForBackend(asset.purchaseDate),


         lastVerificationDate:
  normalizeDateForBackend(asset.lastVerificationDate),
  
            assetCondition:
              asset.assetCondition || 'Good',

            status:
              asset.status || 'Available',

            remarks:
              asset.remarks || null
          };

          /*
           * DEBUG
           */
          console.log(
            'SENDING ASSET TO BACKEND:',
            payload
          );

          await assetApi.create(payload);

          importedCount++;

          console.log(
            `ASSET ${asset.assetId} IMPORTED SUCCESSFULLY`
          );

        } catch (error) {

          failedCount++;

          console.error(
            `FAILED TO CREATE ASSET: ${asset.assetId}`,
            error
          );

          /*
           * Show backend response if available
           */
          console.error(
            'BACKEND ERROR RESPONSE:',
            error?.response?.data
          );
        }
      }

      /*
       * STEP 3
       * Refresh frontend only after import is completed
       */
      await loadAssets();
      await loadAvailableStock();
      await refreshAssets();

      /*
       * SUCCESS MESSAGE
       */
      if (importedCount > 0) {
        toast.success(
          `${importedCount} asset(s) imported successfully.`
        );
      }

      /*
       * FAILED MESSAGE
       */
      if (failedCount > 0) {
        toast.error(
          `${failedCount} asset(s) failed to import. Check browser console for the exact backend error.`
        );
      }

      /*
       * DUPLICATE MESSAGE
       */
      if (ignored > 0) {
        toast.warning(
          `${ignored} duplicate record(s) were ignored.`
        );
      }

      /*
       * If absolutely nothing was imported
       */
      if (
        importedCount === 0 &&
        failedCount === 0 &&
        ignored === 0
      ) {
        toast.warning(
          'No assets were imported.'
        );
      }

      setShowImport(false);

    } catch (error) {

      console.error(
        'CSV IMPORT ERROR:',
        error
      );

      console.error(
        'BACKEND ERROR RESPONSE:',
        error?.response?.data
      );

      toast.error(
        'CSV import failed. Check console.'
      );
    }
  };

  reader.readAsText(file);
};



  const clearFilters = () => {

    setFilters({

      search: '',

      assetCategory: '',

      assetType: '',

      status: ''

    });

  };



  const columns = [

    {
      key: 'assetId',
      label: 'Asset ID'
    },

    {
      key: 'assetCategory',
      label: 'Category'
    },

    {
      key: 'assetType',
      label: 'Type'
    },

    {
      key: 'assetName',
      label: 'Asset Name'
    },

    {
      key: 'brand',
      label: 'Brand'
    },

    {
      key: 'model',
      label: 'Model'
    },

    {
      key: 'serialNumber',
      label: 'Serial Number'
    },

    {
      key: 'configuration',
      label: 'Configuration'
    },

    {
      key: 'purchaseDate',
      label: 'Purchase Date'
    },

    {
      key: 'vendor',
      label: 'Vendor'
    },

    {
      key: 'invoiceNumber',
      label: 'Invoice Number'
    },

    {
      key: 'purchaseCost',
      label: 'Purchase Cost',

      render: (row) =>
        Number(
          row.purchaseCost || 0
        ).toLocaleString(
          'en-IN',
          {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
          }
        )
    },

    {
      key: 'warrantyExpiry',
      label: 'Warranty Expiry'
    },

    {
      key: 'lastVerificationDate',
      label: 'Last Verification'
    },

    {
      key: 'assetCondition',
      label: 'Condition'
    },

    {
      key: 'status',

      label: 'Status',

      render: (row) =>
        <StatusBadge value={row.status} />

    },    {
      key: 'remarks',
      label: 'Remarks'
    },

    {
      key: 'actions',
      label: 'Actions',

      render: (row) => (

        <div className="row-actions">

          <button
            className="icon-btn icon-btn-sm"
            type="button"
            title="Edit asset"
            onClick={() =>
              setEditing(row)
            }
          >
            <FiEdit2 />
          </button>


          <button
            className="icon-btn icon-btn-sm danger"
            type="button"
            title="Delete asset"
            onClick={() =>
              setDeleteTarget(row)
            }
          >
            <FiTrash2 />
          </button>

        </div>

      )
    }

  ];



  return (

    <section>

      <div className="page-title">

        <div>

          <h1>
            Asset Master
          </h1>

          <p>
            Manage all Own, Rental, Client assets.
          </p>

        </div>


        <div className="page-actions">


          <button
            className="btn btn-outline-secondary"
            type="button"
            onClick={() =>
              setShowImport(true)
            }
          >

            <FiUpload />

            Import CSV

          </button>



          <button
  className="btn btn-outline-success"
  type="button"
  onClick={() => {
    
    setShowExport(current => !current);
  }}
>
  Export
</button>



          <button
            className="btn btn-outline-primary"
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >

            <FiRefreshCw />

            Refresh

          </button>



          <button
            className="btn btn-primary"
            type="button"
            onClick={() =>
              setEditing({

                ...blank,

                assetId:
                  getNextAssetId(assets)

              })
            }
          >

            <FiPlus />

            Add Asset

          </button>


        </div>

      </div>



      {/* Summary Cards */}

<div className="metric-grid">

  <div className="metric-card">
    <span>Total Assets</span>
    <strong>{counts.total}</strong>
  </div>

  <div className="metric-card tone-green">
    <span>Assigned</span>
    <strong>{counts.assigned}</strong>
  </div>

  <div className="metric-card tone-violet">
    <span>Own</span>
    <strong>{counts.own}</strong>
  </div>

  <div className="metric-card tone-orange">
    <span>Rental</span>
    <strong>{counts.rental}</strong>
  </div>

  <div className="metric-card tone-teal">
    <span>Client</span>
    <strong>{counts.client}</strong>
  </div>
   <div className="metric-card tone-teal">
    <span>Repair</span>
    <strong>{counts.repair}</strong>
  </div>
  <div className="metric-card tone-teal">
    <span>Damaged</span>
    <strong>{counts.damaged}</strong>
  </div>


 <div className="metric-card tone-gray">
  <span>Stock/Available</span>
  <strong>{availableStock}</strong>
</div>


</div>

<FilterPanel
  filters={[
    {
      key: "search",
      label: "Search",
      placeholder: "Search Asset"
    },
    {
      key: "assetCategory",
      label: "Category",
      type: "select",
      options: assetCategories
    },
    {
      key: "assetType",
      label: "Asset Type",
      type: "select",
      options: assetTypes
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: assetStatus
    }
  ]}
  values={filters}
  onChange={(key, value) =>
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }
  onReset={clearFilters}
/>

{showExport && (
  <ExportMenu
    columns={columns}
    filteredRows={filtered}
    allRows={assets}
    filename="Assets"
  />
)}

<DataTable
  columns={columns}
  rows={filtered}
  empty="No assets found."
  searchable={false}
/>


      <ImportModal

        open={showImport}

        title="Import Assets from CSV"

        onFile={importAssets}

        onClose={() =>
          setShowImport(false)
        }

      />



      <ConfirmModal

        open={
          Boolean(deleteTarget)
        }

        title="Delete Asset"

        message={
          `Delete ${
            deleteTarget?.assetName ||
            'this asset'
          }? This action cannot be undone.`
        }

        onConfirm={deleteAsset}

        onClose={() =>
          setDeleteTarget(null)
        }

      />


  <ConfirmModal
  open={Boolean(deleteTarget)}
  title="Delete Asset"
  message={`Delete ${
    deleteTarget?.assetName || "this asset"
  }? This action cannot be undone.`}
  onConfirm={deleteAsset}
  onClose={() => setDeleteTarget(null)}
/>

{/* Add Asset Popup */}
{editing && (
  <AssetModal
    value={editing}
    onSave={save}
    onClose={() => setEditing(null)}
  />
)}



</section>

  );

}



function AssetModal({
  value,
  onClose,
  onSave
}) {


  const {

    register,

    handleSubmit,

    formState: {
      errors
    }

  } = useForm({

    defaultValues: value

  });



  return (

    <div
      className="modal-backdrop-custom"
      role="presentation"
    >

      <div
        className="action-modal asset-modal"
        role="dialog"
      >


        <div className="action-modal-header">


          <h2>

            {
              value.id
                ? 'Edit Asset'
                : 'Add New Asset'
            }

          </h2>


          <button

            className="icon-btn"

            type="button"

            onClick={onClose}

          >

            <FiX />

          </button>


        </div>



        <form
  className="action-form asset-form-grid"
  onSubmit={handleSubmit(onSave)}
>

  <Field label="Asset ID">
    <input
      className="form-control"
      readOnly
      {...register("assetId")}
    />
  </Field>

  <Field label="Asset Category">
    <select
      className="form-control"
      {...register("assetCategory")}
    >
      {assetCategories.map(item => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  </Field>

  <Field label="Asset Type">
    <select
      className="form-control"
      {...register("assetType")}
    >
      <option value="">Select Type</option>

      {assetTypes.map(item => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  </Field>

  <Field label="Asset Name">
    <input
      className="form-control"
      {...register("assetName")}
    />
  </Field>

  <Field label="Brand">
    <input
      className="form-control"
      {...register("brand")}
    />
  </Field>

  <Field label="Model">
    <input
      className="form-control"
      {...register("model")}
    />
  </Field>

  <Field label="Serial Number">
    <input
      className="form-control"
      {...register("serialNumber")}
    />
  </Field>

  <Field label="Configuration">
    <input
      className="form-control"
      {...register("configuration")}
    />
  </Field>

  <Field label="Purchase Date">
    <input
      type="date"
      className="form-control"
      {...register("purchaseDate")}
    />
  </Field>

  <Field label="Vendor">
    <input
      className="form-control"
      {...register("vendor")}
    />
  </Field>

  <Field label="Invoice Number">
    <input
      className="form-control"
      {...register("invoiceNumber")}
    />
  </Field>

  <Field label="Purchase Cost">
    <input
      type="number"
      className="form-control"
      {...register("purchaseCost")}
    />
  </Field>

  <Field label="Warranty Expiry">
    <input
      type="date"
      className="form-control"
      {...register("warrantyExpiry")}
    />
  </Field>

  <Field label="Last Verification">
    <input
      type="date"
      className="form-control"
      {...register("lastVerificationDate")}
    />
  </Field>

  <Field label="Condition">
    <select
      className="form-control"
      {...register("assetCondition")}
    >
      {assetConditions.map(item => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  </Field>

  <Field label="Status">
    <select
      className="form-control"
      {...register("status")}
    >
      {assetStatus.map(item => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  </Field>

  <Field
    label="Remarks"
    span
  >
    <textarea
      rows="4"
      className="form-control"
      {...register("remarks")}
    />
  </Field>

  <div className="asset-modal-footer">

    <button
      type="button"
      className="btn btn-secondary"
      onClick={onClose}
    >
      Cancel
    </button>

    <button
      type="submit"
      className="btn btn-primary"
    >
      {value.id ? "Update Asset" : "Save Asset"}
    </button>

  </div>

</form>
      </div>


    </div>

  );

}



function Field({
  label,
  error,
  children,
  span
}) {


  return (

    <label
      className={
        span
        ? 'form-span'
        : ''
      }
    >

      <span className="field-label">

        {label}

      </span>


      {children}



      {
        error &&
        <span className="field-error">

          {error.message}

        </span>
      }


    </label>

  );

}