import { useState } from 'react'
import { X } from 'lucide-react'

interface TagsInputProps {
  label?: string
  tags: string[]
  onTagsChange: (tags: string[]) => void
  placeholder?: string
  error?: string
}

export function TagsInput({ label, tags, onTagsChange, placeholder = 'Dodaj stavku...' }: TagsInputProps) {
  const [input, setInput] = useState('')

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const value = input.trim()
      if (value && !tags.includes(value)) {
        onTagsChange([...tags, value])
        setInput('')
      }
    }
  }

  function removeTag(tag: string) {
    onTagsChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
      <div className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 p-2">
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="text-teal-600 dark:text-teal-400 hover:text-teal-800"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="w-full bg-transparent text-sm text-slate-900 dark:text-slate-100 outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  )
}
