export function isMobileDevice() {
  const minWidth = 768 // Minimum width for desktop devices
  return window.innerWidth < minWidth || screen.width < minWidth
}
