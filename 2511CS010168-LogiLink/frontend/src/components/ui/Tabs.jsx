export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="tabs" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab ${active === tab ? 'active' : ''}`}
          type="button"
          role="tab"
          aria-selected={active === tab}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
