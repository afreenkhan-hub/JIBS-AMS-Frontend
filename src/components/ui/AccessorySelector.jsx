const accessoryOptions = [
  'Mouse',
  'Charger',
  'Keyboard',
  'LAN Cable',
  'Headset',
  'CPU',
  'HDMI Cable',
  'Adapter',
  'Other'
];

export function AccessorySelector({ value = [], onChange }) {
  const selected = Array.isArray(value) ? value : [];

  const toggle = (name) => {
    if (selected.some((item) => item.name === name)) {
      onChange(selected.filter((item) => item.name !== name));
    } else {
      onChange([...selected, { name, serial_number: '' }]);
    }
  };

  const updateSerial = (name, serialNumber) => {
    onChange(selected.map((item) => item.name === name ? { ...item, serial_number: serialNumber } : item));
  };

  return (
    <div className="accessory-selector">
      <div className="accessory-options">
        {accessoryOptions.map((option) => (
          <label key={option}>
            <input
              type="checkbox"
              checked={selected.some((item) => item.name === option)}
              onChange={() => toggle(option)}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="accessory-serials">
          {selected.map((item) => (
            <label key={item.name}>
              <span>{item.name} Serial Number</span>
              <input className="form-control" value={item.serial_number || ''} onChange={(event) => updateSerial(item.name, event.target.value)} />
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
