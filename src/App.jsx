import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL =
  'https://apis2.ccbp.in/packers-and-movers/packers-and-movers-details'

const menuItems = [
  { label: 'MY MOVES', icon: 'truck' },
  { label: 'MY PROFILE', icon: 'profile' },
  { label: 'GET QUOTE', icon: 'quote' },
  { label: 'LOGOUT', icon: 'logout' },
]

function Icon({ name }) {
  const paths = {
    truck: (
      <>
        <path d="M3 7h10v8H3z" />
        <path d="M13 10h4l3 3v2h-7z" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </>
    ),
    profile: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c1.8-4.3 14.2-4.3 16 0" />
      </>
    ),
    quote: (
      <>
        <path d="M5 5h14v14H5z" />
        <path d="M8 9h8M8 13h5" />
      </>
    ),
    logout: (
      <>
        <path d="M9 5H5v14h4" />
        <path d="M11 12h9M17 8l4 4-4 4" />
      </>
    ),
    home: <path d="M3 11 12 4l9 7v9h-6v-6H9v6H3z" />,
    boxes: (
      <>
        <path d="M4 4h7v7H4zM13 4h7v7h-7zM8 13h8v7H8z" />
      </>
    ),
    route: (
      <>
        <circle cx="6" cy="6" r="2" />
        <circle cx="18" cy="18" r="2" />
        <path d="M8 6h4a4 4 0 0 1 0 8H9a3 3 0 0 0 0 6h7" />
      </>
    ),
    calendar: (
      <>
        <path d="M5 4h14v16H5zM8 2v4M16 2v4M5 9h14" />
        <path d="M9 13h2v2H9zM13 13h2v2h-2z" />
      </>
    ),
    warning: (
      <>
        <path d="M12 3 2 21h20z" />
        <path d="M12 9v5M12 17h.01" />
      </>
    ),
    arrow: <path d="M5 12h14M14 6l6 6-6 6" />,
    edit: <path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4" />,
  }

  return (
    <svg className={`icon icon-${name}`} viewBox="0 0 24 24" aria-hidden="true">
      {paths[name]}
    </svg>
  )
}

function formatMoveDate(value) {
  if (!value) return 'Date not available'
  const date = new Date(value.replace(' ', 'T'))
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function selectedOptions(options = []) {
  return options
    .filter((option) => option.selected)
    .map((option) => option.option.trim())
    .join(', ')
}

function getItemQuantity(item) {
  const childQuantity = (item.childItems || []).reduce(
    (sum, child) => sum + Number(child.qty || 0),
    0,
  )
  return Number(item.qty || 0) + childQuantity
}

function flattenPositiveItems(items = []) {
  return items.flatMap((item) => {
    const entries = []
    if (Number(item.qty || 0) > 0) entries.push(item)
    ;(item.childItems || []).forEach((child) => {
      if (Number(child.qty || 0) > 0) entries.push(child)
    })
    return entries
  })
}

function getInventoryCount(section) {
  return (section.category || []).reduce(
    (sum, group) =>
      sum + (group.items || []).reduce((groupSum, item) => groupSum + getItemQuantity(item), 0),
    0,
  )
}

function Sidebar() {
  return (
    <aside className="sidebar" aria-label="Account navigation">
      {menuItems.map((item, index) => (
        <button
          className={`side-link ${index === 0 ? 'side-link-active' : ''}`}
          type="button"
          key={item.label}
        >
          <Icon name={item.icon} />
          <span>{item.label}</span>
        </button>
      ))}
    </aside>
  )
}

function MoveMetric({ icon, children }) {
  return (
    <div className="move-metric">
      <Icon name={icon} />
      <span>{children}</span>
    </div>
  )
}

function MoveCard({ move, isOpen, onToggle }) {
  const [openInventory, setOpenInventory] = useState(null)
  const inventory = move.items?.inventory || []

  useEffect(() => {
    if (!isOpen) setOpenInventory(null)
  }, [isOpen])

  return (
    <article className="move-card">
      <div className="route-grid">
        <div className="address-block">
          <h2>From</h2>
          <p>{move.moving_from}</p>
        </div>

        <div className="arrow-badge">
          <Icon name="arrow" />
        </div>

        <div className="address-block">
          <h2>To</h2>
          <p>{move.moving_to}</p>
        </div>

        <div className="request-block">
          <h2>Request#</h2>
          <strong>{move.estimate_id}</strong>
        </div>
      </div>

      <div className="move-row">
        <MoveMetric icon="home">{move.property_size}</MoveMetric>
        <MoveMetric icon="boxes">{move.total_items}</MoveMetric>
        <MoveMetric icon="route">{move.distance}</MoveMetric>
        <MoveMetric icon="calendar">{formatMoveDate(move.moving_on)}</MoveMetric>
        <button className="icon-button" type="button" aria-label="Edit move date">
          <Icon name="edit" />
        </button>
        <label className="flexible-label">
          <input type="checkbox" checked={move.move_date_flexible === '1'} readOnly />
          <span>Is flexible</span>
        </label>
        <button className="details-button" type="button" onClick={onToggle}>
          {isOpen ? 'Hide move details' : 'View move details'}
        </button>
        <button className="quote-button" type="button">
          Quotes Awaiting
        </button>
      </div>

      <p className="disclaimer">
        <Icon name="warning" />
        <strong>Disclaimer:</strong> Please update your move date before two days of shifting
      </p>

      {isOpen && (
        <section className="expanded-details">
          <div className="section-title-row">
            <h2>Additional Information</h2>
            <button type="button">Edit Additional Info</button>
          </div>
          <p className="muted">
            {move.old_house_additional_info ||
              move.new_house_additional_info ||
              'No additional information added'}
          </p>

          <div className="section-title-row">
            <h2>House Details</h2>
            <button type="button">Edit House Details</button>
          </div>
          <HouseDetails move={move} />

          <div className="section-title-row">
            <h2>Inventory Details</h2>
            <button type="button">Edit Inventory</button>
          </div>
          <div className="inventory-list">
            {inventory.map((section) => {
              const sectionCount = getInventoryCount(section)
              const isInventoryOpen = openInventory === section.id

              return (
                <InventorySection
                  key={section.id}
                  section={section}
                  count={sectionCount}
                  isOpen={isInventoryOpen}
                  onToggle={() => setOpenInventory(isInventoryOpen ? null : section.id)}
                />
              )
            })}
          </div>
        </section>
      )}
    </article>
  )
}

function HouseDetails({ move }) {
  const rows = [
    {
      title: 'Existing House Details',
      floor: move.old_floor_no,
      elevator: move.old_elevator_availability,
      distance: move.old_parking_distance,
    },
    {
      title: 'New House Details',
      floor: move.new_floor_no,
      elevator: move.new_elevator_availability,
      distance: move.new_parking_distance,
    },
  ]

  return (
    <div className="house-details">
      {rows.map((row) => (
        <section key={row.title}>
          <h3>{row.title}</h3>
          <dl>
            <div>
              <dt>Floor No.</dt>
              <dd>{row.floor || '-'}</dd>
            </div>
            <div>
              <dt>Elevator Available.</dt>
              <dd>{row.elevator || '-'}</dd>
            </div>
            <div>
              <dt>Distance from Elevator / Staircase to truck</dt>
              <dd>{row.distance || '-'}</dd>
            </div>
          </dl>
        </section>
      ))}
    </div>
  )
}

function InventorySection({ section, count, isOpen, onToggle }) {
  const groupsWithItems = (section.category || [])
    .map((group) => ({
      ...group,
      positiveItems: flattenPositiveItems(group.items || []),
    }))
    .filter((group) => group.positiveItems.length > 0)

  return (
    <section className="inventory-section">
      <button className="inventory-header" type="button" onClick={onToggle}>
        <span>
          {section.displayName}
          <strong>{count}</strong>
        </span>
        <span aria-hidden="true">{isOpen ? '^' : 'v'}</span>
      </button>

      {isOpen && (
        <div className="inventory-content">
          {groupsWithItems.length > 0 ? (
            groupsWithItems.map((group) => (
              <div className="inventory-group" key={group.id}>
                <h3>{group.displayName}</h3>
                <div className="inventory-items">
                  {group.positiveItems.map((item) => (
                    <InventoryItem key={item.id} item={item} />
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="muted">No selected items in this category.</p>
          )}
        </div>
      )}
    </section>
  )
}

function InventoryItem({ item }) {
  const selectedType = selectedOptions(item.type)
  const selectedSize = selectedOptions(item.size)
  const meta = [selectedType, selectedSize].filter(Boolean).join(', ')

  return (
    <div className="inventory-item">
      <div>
        <p>{item.displayName}</p>
        {meta && <small>{meta}</small>}
      </div>
      <strong>{item.qty}</strong>
    </div>
  )
}

function App() {
  const [moves, setMoves] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')
  const [openMoveId, setOpenMoveId] = useState(null)

  useEffect(() => {
    let ignore = false

    async function loadMoves() {
      try {
        const response = await fetch(API_URL)
        if (!response.ok) throw new Error(`API responded with ${response.status}`)
        const data = await response.json()
        const nextMoves = data.Customer_Estimate_Flow || []

        if (!ignore) {
          setMoves(nextMoves)
          setStatus('ready')
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.message)
          setStatus('error')
        }
      }
    }

    loadMoves()

    return () => {
      ignore = true
    }
  }, [])

  const totalMoves = useMemo(() => moves.length, [moves])

  return (
    <div className="app-shell">
      <Sidebar />

      <main className="moves-panel">
        <header className="page-header">
          <h1>My Moves</h1>
          {status === 'ready' && <p>{totalMoves} move requests found</p>}
        </header>

        {status === 'loading' && <p className="state-message">Loading move details...</p>}

        {status === 'error' && (
          <section className="state-message error-message">
            <h2>Unable to load moves</h2>
            <p>{error}</p>
          </section>
        )}

        {status === 'ready' && (
          <section className="moves-list" aria-label="Move requests">
            {moves.map((move) => (
              <MoveCard
                key={move.estimate_id}
                move={move}
                isOpen={openMoveId === move.estimate_id}
                onToggle={() =>
                  setOpenMoveId(openMoveId === move.estimate_id ? null : move.estimate_id)
                }
              />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}

export default App
