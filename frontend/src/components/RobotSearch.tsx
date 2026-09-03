interface RobotSearchProps {
  searchQuery: string;
  filterAttention: boolean;
  onSearchChange: (query: string) => void;
  onFilterChange: (filter: boolean) => void;
}

export function RobotSearch({
  searchQuery,
  filterAttention,
  onSearchChange,
  onFilterChange,
}: RobotSearchProps) {
  return (
    <div className="robot-search">
      <div className="search-input">
        <label htmlFor="robot-search">Search by Robot ID:</label>
        <input
          id="robot-search"
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="e.g., r1"
        />
      </div>
      <div className="filter-attention">
        <label>
          <input
            type="checkbox"
            checked={filterAttention}
            onChange={(e) => onFilterChange(e.target.checked)}
          />
          Show only robots needing attention (blocked, error, offline, maintenance)
        </label>
      </div>
    </div>
  );
}
