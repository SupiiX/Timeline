import { useState, useRef, useCallback, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import huLocale from '@fullcalendar/core/locales/hu'
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
  titleEn: '',
  category: '',
  date: '',
  endDate: '',
  description: '',
  descriptionEn: '',
  location: '',
  locationEn: '',
  link: '',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  return dateStr.slice(0, 10)
}

// A FullCalendar exkluzív záró dátumot használ.
// A JSON-ban inkluzív záró dátumot tárolunk (az utolsó nap, amikor az esemény tart).
// FC-nek átadáskor +1 nap, visszaolvasáskor -1 nap.
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
  const [semester, setSemester] = useState(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [fileName, setFileName] = useState('')
  const fileInputRef = useRef(null)
  const calendarRef = useRef(null)

  // Kategória lookup: id -> kategória objektum
  const categoryMap = useMemo(() => {
    const map = {}
    categories.forEach((c) => {
      map[c.id] = c
    })
    return map
  }, [categories])

  // Események átalakítása FullCalendar formátumra
  const calendarEvents = useMemo(() => {
    return events.map((ev) => {
      const cat = categoryMap[ev.category]
      return {
        id: String(ev.id),
        title: ev.title,
        start: ev.date,
        end: ev.endDate ? inclusiveToExclusive(ev.endDate) : undefined,
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

  // --- Fájlkezelés ---
  const handleUpload = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target.result)
        setSemester(data.semester || null)
        setCategories(Array.isArray(data.categories) ? data.categories : [])
        setEvents(Array.isArray(data.events) ? data.events : [])
        setForm({ ...EMPTY_FORM })
      } catch {
        alert('Hibás JSON fájl. Kérlek tölts fel egy érvényes naptár JSON-t.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }, [])

  const handleDownload = useCallback(() => {
    const output = semester
      ? { semester, categories, events }
      : { categories, events }
    const data = JSON.stringify(output, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName || 'naptar.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [semester, categories, events, fileName])

  // --- Űrlap kezelők ---
  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }, [])

  const handleSave = useCallback(() => {
    if (!form.title.trim()) {
      alert('Kérlek adj meg egy eseménynevet.')
      return
    }
    if (!form.date) {
      alert('Kérlek válassz egy kezdő dátumot.')
      return
    }

    setEvents((prev) => {
      if (form.id !== null) {
        // Meglévő esemény frissítése — spread-del megőrizzük az összes eredeti mezőt
        return prev.map((ev) =>
          ev.id === form.id
            ? {
                ...ev,
                title: form.title,
                titleEn: form.titleEn,
                date: form.date,
                endDate: form.endDate || null,
                category: form.category,
                description: form.description,
                descriptionEn: form.descriptionEn,
                location: form.location,
                locationEn: form.locationEn,
                link: form.link || null,
              }
            : ev
        )
      } else {
        // Új esemény létrehozása
        const maxId =
          prev.length > 0 ? Math.max(...prev.map((ev) => ev.id)) : 0
        return [
          ...prev,
          {
            id: maxId + 1,
            title: form.title,
            titleEn: form.titleEn || '',
            date: form.date,
            endDate: form.endDate || null,
            category: form.category,
            description: form.description,
            descriptionEn: form.descriptionEn || '',
            location: form.location,
            locationEn: form.locationEn || '',
            link: form.link || null,
          },
        ]
      }
    })
    setForm({ ...EMPTY_FORM })
  }, [form])

  const handleDelete = useCallback(() => {
    if (form.id === null) return
    if (!confirm('Biztosan törölni szeretnéd ezt az eseményt?')) return
    setEvents((prev) => prev.filter((ev) => ev.id !== form.id))
    setForm({ ...EMPTY_FORM })
  }, [form.id])

  const handleClear = useCallback(() => {
    setForm({ ...EMPTY_FORM })
  }, [])

  // --- Naptár interakciók ---
  const handleEventClick = useCallback(
    (info) => {
      const ev = info.event
      // Az eredeti esemény kikeresése a kétnyelvű mezőkért
      const original = events.find((e) => e.id === Number(ev.id))
      setForm({
        id: Number(ev.id),
        title: ev.title,
        titleEn: original?.titleEn || '',
        date: formatDate(ev.startStr),
        endDate: ev.endStr ? exclusiveToInclusive(ev.endStr) : '',
        category: ev.extendedProps.category || '',
        description: ev.extendedProps.description || '',
        descriptionEn: original?.descriptionEn || '',
        location: ev.extendedProps.location || '',
        locationEn: original?.locationEn || '',
        link: original?.link || '',
      })
    },
    [events]
  )

  const handleDateClick = useCallback((info) => {
    setForm({
      ...EMPTY_FORM,
      date: info.dateStr,
    })
  }, [])

  const handleEventDrop = useCallback((info) => {
    const ev = info.event
    const newDate = formatDate(ev.startStr)
    const newEndDate = ev.endStr ? exclusiveToInclusive(ev.endStr) : null
    setEvents((prev) =>
      prev.map((e) =>
        e.id === Number(ev.id)
          ? { ...e, date: newDate, endDate: newEndDate }
          : e
      )
    )
    // Ha az áthúzott esemény épp szerkesztés alatt áll, frissítjük az űrlapot is
    setForm((prev) =>
      prev.id === Number(ev.id)
        ? { ...prev, date: newDate, endDate: newEndDate || '' }
        : prev
    )
  }, [])

  const isEditing = form.id !== null

  return (
    <div className="h-screen flex flex-col bg-gray-50 text-gray-800">
      {/* Fejléc */}
      <header className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-6 h-6 text-indigo-600" />
          <h1 className="text-lg font-bold text-gray-900">
            Egyetemi Naptár Kezelő
          </h1>
          {semester && (
            <span className="ml-2 text-sm font-normal text-gray-500">
              — {semester.name}
            </span>
          )}
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
            JSON Betöltés
          </button>
          <button
            onClick={handleDownload}
            disabled={events.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-emerald-600 text-white hover:bg-emerald-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4" />
            JSON Letöltés
          </button>
          {fileName && (
            <span className="text-xs text-gray-500 ml-2">
              Betöltve: {fileName}
            </span>
          )}
        </div>
      </header>

      {/* Fő elrendezés: bal oldal űrlap + jobb oldal naptár */}
      <div className="flex flex-1 overflow-hidden">
        {/* Bal panel — Szerkesztő űrlap */}
        <aside className="w-[350px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-5 flex flex-col gap-4">
          <h2 className="text-base font-semibold text-gray-700">
            {isEditing ? 'Esemény szerkesztése' : 'Új esemény hozzáadása'}
          </h2>

          {/* Cím */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Cím
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="Esemény neve"
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Kategória választó */}
          {categories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1.5">
                Kategória
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

          {/* Kezdés */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Kezdés
            </label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => updateField('date', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Vége (opcionális) */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Vége (opcionális)
            </label>
            <input
              type="date"
              value={form.endDate}
              onChange={(e) => updateField('endDate', e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Leírás */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Leírás
            </label>
            <input
              type="text"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Esemény leírása"
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Helyszín */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Helyszín
            </label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => updateField('location', e.target.value)}
              placeholder="Esemény helyszíne"
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Link */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Link
            </label>
            <input
              type="url"
              value={form.link}
              onChange={(e) => updateField('link', e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Angol mezők (összecsukható) */}
          <details className="border border-gray-200 rounded-md">
            <summary className="px-3 py-2 text-sm font-medium text-gray-600 cursor-pointer hover:bg-gray-50">
              Angol mezők (English)
            </summary>
            <div className="p-3 flex flex-col gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Title (EN)
                </label>
                <input
                  type="text"
                  value={form.titleEn}
                  onChange={(e) => updateField('titleEn', e.target.value)}
                  placeholder="English title"
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Description (EN)
                </label>
                <input
                  type="text"
                  value={form.descriptionEn}
                  onChange={(e) =>
                    updateField('descriptionEn', e.target.value)
                  }
                  placeholder="English description"
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Location (EN)
                </label>
                <input
                  type="text"
                  value={form.locationEn}
                  onChange={(e) => updateField('locationEn', e.target.value)}
                  placeholder="English location"
                  className="w-full px-3 py-2 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
          </details>

          {/* Művelet gombok */}
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleSave}
              className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              {isEditing ? 'Frissítés' : 'Mentés'}
            </button>
            {isEditing && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Törlés
              </button>
            )}
            <button
              onClick={handleClear}
              className="inline-flex items-center justify-center gap-1.5 w-full px-3 py-2 text-sm font-medium rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors border border-gray-300 cursor-pointer"
            >
              <FilePlus className="w-4 h-4" />
              Mégse / Új
            </button>
          </div>

          {/* Eseményszám összesítő */}
          {events.length > 0 && (
            <div className="mt-auto pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500">
                {events.length} esemény betöltve
                {categories.length > 0 &&
                  `, ${categories.length} kategória`}
              </p>
            </div>
          )}
        </aside>

        {/* Jobb panel — Naptár */}
        <main className="flex-1 overflow-auto p-4">
          {events.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <CalendarDays className="w-16 h-16 mb-4 opacity-40" />
              <p className="text-lg font-medium">Nincs betöltött esemény</p>
              <p className="text-sm mt-1">
                Tölts be egy JSON fájlt a kezdéshez
              </p>
            </div>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={huLocale}
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
