import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

export default function MedicineAutocomplete({ medicines, value, onSelect }) {
  const selected = medicines.find((medicine) => Number(medicine.thuocID) === Number(value));
  const [query, setQuery] = useState(selected ? `${selected.maATC} - ${selected.tenThuongMai}` : '');
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);

  const localMatches = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return medicines.slice(0, 8);
    return medicines.filter((medicine) => (
      medicine.maATC?.toLowerCase().includes(keyword)
      || medicine.tenThuongMai?.toLowerCase().includes(keyword)
      || medicine.hoatChat?.toLowerCase().includes(keyword)
    )).slice(0, 8);
  }, [medicines, query]);

  useEffect(() => {
    const keyword = query.trim();
    if (!open) return undefined;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/thuoc/search?q=${encodeURIComponent(keyword)}&limit=8`);
        if (!response.ok) throw new Error('Search failed');
        setSuggestions(await response.json());
      } catch (error) {
        console.error(error);
        setSuggestions(localMatches);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [localMatches, open, query]);

  function selectMedicine(medicine) {
    setQuery(`${medicine.maATC} - ${medicine.tenThuongMai}`);
    setOpen(false);
    onSelect(medicine);
  }

  return (
    <div className="medicine-autocomplete">
      <Search size={16} aria-hidden="true" />
      <input
        aria-label="Tìm theo mã ATC hoặc tên thuốc"
        aria-expanded={open}
        aria-controls="medicine-suggestions"
        role="combobox"
        value={query}
        onFocus={() => {
          setSuggestions(localMatches);
          setOpen(true);
        }}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
          if (event.key === 'Enter' && open && suggestions.length) {
            event.preventDefault();
            selectMedicine(suggestions[0]);
          }
        }}
        placeholder="Nhập mã ATC hoặc tên thuốc"
      />
      {open && (
        <div className="autocomplete-list" id="medicine-suggestions" role="listbox">
          {suggestions.length ? suggestions.map((medicine) => (
            <button key={medicine.thuocID} type="button" role="option" onMouseDown={() => selectMedicine(medicine)}>
              <strong>{medicine.maATC} · {medicine.tenThuongMai}</strong>
              <span>{medicine.hoatChat} · {medicine.hamLuong || 'Chưa nhập hàm lượng'}</span>
            </button>
          )) : <p>Không tìm thấy thuốc phù hợp</p>}
        </div>
      )}
    </div>
  );
}
