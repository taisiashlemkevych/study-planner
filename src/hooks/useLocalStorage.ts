import { useState } from 'react';

function getStoredValue<T>(key: string, initialValue: T): T {
  try {
    const storedValue = localStorage.getItem(key);

    return storedValue !== null
      ? (JSON.parse(storedValue) as T)
      : initialValue;
  } catch {
    return initialValue;
  }
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() =>
    getStoredValue(key, initialValue)
  );

  const updateValue = (newValue: T) => {
    setValue(newValue);

    try {
      localStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Failed to save value to localStorage:', error);
    }
  };

  return [value, updateValue];
}
