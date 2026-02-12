import { useState, useRef } from 'react'
import { motion } from 'framer-motion'

const RippleButton = ({ 
  children, 
  onClick, 
  className = '', 
  disabled = false,
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  ...props 
}) => {
  const [ripples, setRipples] = useState([])
  const buttonRef = useRef(null)

  const handleClick = (e) => {
    if (disabled) return

    const button = buttonRef.current
    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newRipple = {
      x,
      y,
      id: Date.now(),
    }

    setRipples((prev) => [...prev, newRipple])

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, 600)

    onClick?.(e)
  }

  return (
    <motion.button
      ref={buttonRef}
      onClick={handleClick}
      disabled={disabled}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: 10,
            height: 10,
            marginLeft: -5,
            marginTop: -5,
            borderRadius: '50%',
            backgroundColor: rippleColor,
            pointerEvents: 'none',
          }}
        />
      ))}
      <span className="relative z-10">{children}</span>
    </motion.button>
  )
}

export default RippleButton
