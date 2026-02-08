import { useState, useRef, useCallback, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import {
  Upload,
  Download,
  Save,
  Trash2,
  FilePlus,
  CalendarDays,
} from 'lucide-react'

const EMPTY_FORM = {
  id: null,
  title: '',
  category: '',
  start: '',
  end: '',
  description: '',
  location: '',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

// FullCalendar uses exclusive end dates internally.
// Our JSON stores inclusive end dates (the last day the event occurs on).
// When passing to FullCalendar, add 1 day to end date.
// When reading back from FullCalendar, subtract 1 day from end date.
function inclusiveToExclusive(dateStr) {
  if (!dateStr) return undefined
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + 1)
  return d.toISOString().slice(0, 10)
}

function exclusiveToInclusive(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export default function App() {
  const [events, setEvents] = useState([])
  const [categories, setCategories] = useState([])
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef(null)
  const calendarRef = useRef(null)

  // Build a lookup map from category id -> category object
  const categoryMap = useMemo(() => {
    const map = {}
    categories.forEach((c) => {
      map[c.id] = c
    })
    return map
  }, [categories])

  // Convert our events to FullCalendar event objects
  const calendarEvents = useMemo(() => {
    return events.map((ev) => {
      const cat = categoryMap[ev.category]
      return {
        id: String(ev.id),
        title: ev.title,
        start: ev.start,
        end: inclusiveToExclusive(ev.end),
        backgroundColor: cat?.color || '#6366f1',
        borderColor: cat?.color || '#6366f1',
        textColor: '#ffffff',
        extendedProps: {
          category: ev.category,
          description: ev.description,
          location: ev.location,
        },
      }
    })
  }, [events, categoryMap])

  // --- File Management ---
  const handleUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result)
        setCategories(Array.isArray(data.categories) ? data.categories : [])
        setEvents(Array.isArray(data.events) ? data.events : [])
        setForm({ ...EMPTY_FORM })
      } catch {
        alert('Invalid JSON file. Please upload a valid calendar JSON.')
      }
    }
    reader.readAsText(file)
    // Reset so re-uploading the same file triggers onChange
    e.target.value = ''
  }, [])

  const handleDownload = useCallback(() => {
    const data = JSON.stringify({ categories, events }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'calendar.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [categories, events, fileName])

  // --- Form Handlers ---
  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(() => {
    if (!form.title.trim()) {
      alert('Please enter an event title.')
      return
    }
    if (!form.start) {
      alert('Please select a start date.')
      return
    }

    setEvents((prev) => {
      if (form.id !== null) {
        // Update existing event
        return prev.map((ev) =>
          ev.id === form.id
            ? {
                id: ev.id,
                title: form.title,
                start: form.start,
                end: form.end || form.start,
                category: form.category,
                description: form.description,
                location: form.location,
              }
            : ev
        )
      } else {
        // Create new event with robust ID generation
        const maxId =
          prev.length > 0 ? Math.max(...prev.map((ev) => ev.id)) : 0
        return [
          ...prev,
          {
            id: maxId + 1,
            title: form.title,
            start: form.start,
            end: form.end || form.start,
            category: form.category,
            description: form.description,
            location: form.location,
          },
        ]
      }
    })
    setForm({ ...EMPTY_FORM })
  }, [form])

  const handleDelete = useCallback(() => {
    if (form.id === null) return
    if (!confirm('Are you sure you want to delete this event?')) return
    setEvents((prev) => prev.filter((ev) => ev.id !== form.id))
    setForm({ ...EMPTY_FORM })
  }, [form.id])

  const handleClear = useCallback(() => {
    setForm({ ...EMPTY_FORM })
  }, [])

  // --- Calendar Interactions ---
  const handleEventClick = useCallback((info) => {
    const ev = info.event
    setForm({
      id: Number(ev.id),
      title: ev.title,
      start: formatDate(ev.startStr),
      end: ev.endStr
        ? exclusiveToInclusive(ev.endStr)
        : formatDate(ev.startStr),
      category: ev.extendedProps.category || '',
      description: ev.extendedProps.description || '',
      location: ev.extendedProps.location || '',
    })
  }, [])

  const handleDateClick = useCallback((info) => {
    setForm({
      ...EMPTY_FORM,
      start: info.dateStr,
    })
  }, [])

  const handleEventDrop = useCallback((info) => {
    const ev = info.event
    const newStart = formatDate(ev.startStr)
    const newEnd = ev.endStr ? exclusiveToInclusive(ev.endStr) : newStart
    setEvents((prev) =>
      prev.map((e) =>
        e.id === Number(ev.id) ? { ...e, start: newStart, end: newEnd } : e
      )
    )
    // If the moved event is currently in the form, update form dates too
    setForm((prev) =>
      prev.id === Number(ev.id)
        ? { ...prev, start: newStart, end: newEnd }
        : prev
    )
  }, [])

  const isEditing = form.id !== null

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-600" />
          <h1 className="text-lg font-bold text-gray-900">
            University Calendar Manager
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Upload JSON
          </button>
          <button
            onClick={handleDownload}
            disabled={events.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download JSON
          </button>
          {fileName && (
            <span className="text-xs text-gray-500 ml-2">
              Loaded: {fileName}
            </span>
          )}
        </div>
      </header>

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Editor Form */}
        <aside className="w-[350px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-5 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-gray-700">
            {isEditing ? 'Edit Event' : 'Add New Event'}
          </h2>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Event title"
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Category Selection */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Category
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = form.category === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => updateField('category', cat.id)}
                      className="px-3 py-1 text-xs font-medium rounded-full transition-all cursor-pointer"
                      style={{
                        backgroundColor: isSelected
                          ? cat.color
                          : `${cat.color}20`,
                        color: isSelected ? '#fff' : cat.color,
                        border: `2px solid ${cat.color}`,
                      }}
                    >
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={form.start}
              onChange={(e) => updateField('start', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={form.end}
              onChange={(e) => updateField('end', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Description
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Event description"
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Location
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Event location"
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Update Event' : 'Save Event'}
            </button>
            {isEditing && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Delete Event
              </button>
            )}
            <button
              onClick={handleClear}
              className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300 cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              New / Clear
            </button>
          </div>

          {/* Event count summary */}
          {events.length > 0 && (
            <div className="mt-auto pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {events.length} event{events.length !== 1 ? 's' : ''} loaded
                {categories.length > 0 &&
                  ` across ${categories.length} categor${
                    categories.length !== 1 ? 'ies' : 'y'
                  }`}
              </p>
            </div>
          )}
        </aside>

        {/* Right Panel - Calendar */}
        <main className="flex-1 overflow-auto p-4">
          {events.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <CalendarDays className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-lg font-medium">No events loaded</p>
              <p className="text-sm mt-1">
                Upload a JSON file to get started
              </p>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={calendarEvents}
              editable={true}
              selectable={true}
              eventClick={handleEventClick}
              dateClick={handleDateClick}
              eventDrop={handleEventDrop}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: '',
              }}
              height="100%"
              dayMaxEvents={3}
              eventDisplay="block"
            />
          )}
        </main>
      </div>
    </div>
  )
}
