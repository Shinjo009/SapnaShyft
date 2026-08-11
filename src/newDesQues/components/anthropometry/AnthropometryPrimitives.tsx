import { useState } from 'react'
import { createPortal } from 'react-dom'
import infoIcon from '../../assets/family-history/info-icon.svg'

export function AnthropometryTriangleArrow({
  direction = 'right',
}: {
  direction?: 'right' | 'left' | 'up' | 'down'
}) {
  const rotation =
    direction === 'left' ? '180deg' : direction === 'up' ? '-90deg' : direction === 'down' ? '90deg' : '0deg'
  return (
    <svg
      style={{ transform: `rotate(${rotation})` }}
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="15"
      viewBox="0 0 13 15"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12.2341 8.12403C12.8956 7.73815 12.8956 6.78235 12.2341 6.39647L1.50443 0.137513C0.837772 -0.251371 0.000557121 0.229501 0.000557112 1.00129L0.000556966 13.5192C0.000556957 14.291 0.837771 14.7719 1.50443 14.383L12.2341 8.12403Z"
        fill="#CC203B"
      />
    </svg>
  )
}

export function AnthropometryDialIndicator({ angle = 0 }: { angle?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="25" viewBox="0 0 36 25" fill="none" aria-hidden="true">
      <path
        className="ndq-anthro__indicator-needle"
        d="M19.7802 0L22.9881 23H36H0H16.1292L19.7802 0Z"
        fill="#CC203B"
        style={{ transform: `rotate(${angle}deg)`, transformOrigin: '19.5px 19.5px' }}
      />
      <circle cx="19.5" cy="19.5" r="5.5" fill="#CC203B" />
    </svg>
  )
}

function UnitDropdownArrow() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden="true">
      <path
        d="M3.74486 6.56097C4.14368 7.11932 4.97351 7.11932 5.37233 6.56097L8.92914 1.58143C9.4019 0.919565 8.92878 0.000194936 8.1154 0.000194864L1.00178 0.000194243C0.18841 0.000194171 -0.284713 0.919564 0.18805 1.58143L3.74486 6.56097Z"
        fill="white"
      />
    </svg>
  )
}

export function AnthropometryUnitDropdown({
  value,
  options,
  onChange,
}: {
  value: string
  options: string[]
  onChange: (next: string) => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="ndq-anthro__unit-wrap">
      <button
        type="button"
        className="ndq-anthro__unit"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="ndq-anthro__unit-label">{value}</span>
        <span className="inline-flex size-2.5 items-center justify-center" aria-hidden>
          <UnitDropdownArrow />
        </span>
      </button>
      {open ? (
        <ul className="ndq-anthro__unit-menu" role="listbox">
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                className={`ndq-anthro__unit-option${option === value ? ' is-active' : ''}`}
                role="option"
                aria-selected={option === value}
                onClick={() => {
                  onChange(option)
                  setOpen(false)
                }}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

export function AnthropometryInfoButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button type="button" className="ndq-anthro__info-btn" aria-label={label} onClick={onClick}>
      <img src={infoIcon} alt="" className="size-full" aria-hidden />
    </button>
  )
}

export function AnthropometryInfoPopup({
  open,
  label,
  gifSrc,
  onClose,
}: {
  open: boolean
  label: string
  gifSrc: string
  onClose: () => void
}) {
  if (!open) return null

  return createPortal(
    <div className="ndq-anthro__info-overlay" onClick={onClose} aria-hidden="true">
      <div
        className="ndq-anthro__info-popup"
        role="dialog"
        aria-label={label}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="ndq-anthro__info-handle" aria-hidden="true" />
        <button type="button" className="ndq-anthro__info-close" onClick={onClose} aria-label={`Close ${label}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12 4L4 12M4 4L12 12" stroke="#9A9A9A" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="ndq-anthro__info-gif" style={{ backgroundImage: `url(${gifSrc})` }} aria-label={`${label} guide`} />
      </div>
    </div>,
    document.body,
  )
}
