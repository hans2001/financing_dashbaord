"use client"

import { useMemo } from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type CategorySelectorProps = {
  categories: string[]
  selectedCategories: string[]
  onChange: (value: string[]) => void
  isLoading?: boolean
}

type CompactCategoryOptionProps = {
  category: string
  checked: boolean
  onToggle: () => void
}

function CompactCategoryOption({
  category,
  checked,
  onToggle,
}: CompactCategoryOptionProps) {
  return (
    <label
      className="flex items-center gap-2 rounded border border-slate-200 bg-white/60 px-2 py-1 text-[0.65rem] text-slate-800 shadow-sm shadow-slate-900/5"
    >
      <Checkbox
        checked={checked}
        onCheckedChange={onToggle}
        aria-label={`Filter by ${category}`}
      />
      <span className="flex-1 text-[0.7rem] leading-tight">{category}</span>
    </label>
  )
}

export function CategorySelector({
  categories,
  selectedCategories,
  onChange,
  isLoading = false,
}: CategorySelectorProps) {
  const normalizedCategories = useMemo(() => {
    return Array.from(
      new Set(
        categories
          .map((value) => value?.trim())
          .filter(Boolean),
      ),
    ).sort((a, b) => a.localeCompare(b))
  }, [categories])

  const selectedCount = selectedCategories.length
  const label = selectedCount === 0 ? "All categories" : `${selectedCount} selected`

  const handleToggle = (category: string) => {
    const normalized = category.trim()
    if (!normalized) return
    const isSelected = selectedCategories.includes(normalized)
    const nextSelection = isSelected
      ? selectedCategories.filter((value) => value !== normalized)
      : [...selectedCategories, normalized]
    onChange(nextSelection)
  }

  const clearSelection = () => {
    if (selectedCategories.length > 0) {
      onChange([])
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-6 w-full justify-between px-1.5 py-0 text-[0.6rem] tracking-[0.3em]",
            "border-slate-200 bg-white text-slate-700 hover:border-slate-300",
          )}
          type="button"
        >
          <span className="flex-1 text-left text-[0.65rem]">{label}</span>
          <ChevronDown className="h-3 w-3 text-slate-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[220px] space-y-2 p-2 shadow-lg shadow-slate-900/20">
        {isLoading ? (
          <p className="text-[0.65rem] text-slate-500">Loading categories…</p>
        ) : normalizedCategories.length === 0 ? (
          <p className="text-[0.65rem] text-slate-400">
            No category data available for this range yet.
          </p>
        ) : (
          <div className="flex max-h-[260px] flex-col gap-1.5 overflow-y-auto pr-1">
            {normalizedCategories.map((category) => {
              const isChecked = selectedCategories.includes(category)
              return (
                <CompactCategoryOption
                  key={category}
                  category={category}
                  checked={isChecked}
                  onToggle={() => handleToggle(category)}
                />
              )
            })}
          </div>
        )}
        <div className="flex items-center justify-between gap-1 border-t border-slate-100 pt-1 text-[0.6rem] text-slate-500">
          <span className="text-slate-400">
            {selectedCount ? `${selectedCount} categories selected` : "No selection"}
          </span>
          <button
            type="button"
            className="text-slate-500 transition hover:text-slate-800"
            onClick={clearSelection}
            disabled={selectedCount === 0}
          >
            Clear
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
