import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for merging classes
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Format time from seconds to MM:SS
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Debounce function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Generate random color from your theme
export function getRandomThemeColor() {
  const colors = ['#d12200', '#a51502', '#f8c5c0', '#cf2100'];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Truncate text
export function truncateText(text, length = 100) {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

// Validate email
export function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Create slug from text
export function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
}
