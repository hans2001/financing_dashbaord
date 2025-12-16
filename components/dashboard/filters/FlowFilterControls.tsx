import type { FlowFilterValue } from "../dashboard-utils";
import { FLOW_FILTERS } from "../dashboard-utils";

type FlowFilterControlsProps = {
  flowFilter: FlowFilterValue;
  onFlowFilterChange: (value: FlowFilterValue) => void;
};

const CONTAINER_CLASSES = "flex flex-wrap gap-2";
const BUTTON_BASE_CLASSES =
  "min-w-[120px] rounded-full border px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] outline-none transition focus-visible:ring-2 focus-visible:ring-slate-400";
const ACTIVE_BUTTON_CLASSES =
  "bg-slate-900/10 border-slate-400 text-slate-900 shadow-none";
const INACTIVE_BUTTON_CLASSES =
  "bg-white border-slate-200 text-slate-600 hover:border-slate-400";

export function FlowFilterControls({
  flowFilter,
  onFlowFilterChange,
}: FlowFilterControlsProps) {
  const handleClick = (value: FlowFilterValue) => {
    if (value === flowFilter) {
      return;
    }
    onFlowFilterChange(value);
  };

  return (
    <div className={CONTAINER_CLASSES}>
      {FLOW_FILTERS.map((option) => {
        const isActive = option.value === flowFilter;
        const buttonClasses = `${BUTTON_BASE_CLASSES} ${
          isActive ? ACTIVE_BUTTON_CLASSES : INACTIVE_BUTTON_CLASSES
        }`;
        return (
          <button
            key={option.value}
            type="button"
            className={buttonClasses}
            aria-pressed={isActive}
            onClick={() => handleClick(option.value)}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
