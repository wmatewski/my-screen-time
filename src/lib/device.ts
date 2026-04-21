const lookup = [
  { pattern: /iPhone/i, label: "iPhone" },
  { pattern: /iPad/i, label: "iPad" },
  { pattern: /Pixel/i, label: "Google Pixel" },
  { pattern: /Samsung|SM-/i, label: "Samsung Galaxy" },
  { pattern: /Huawei/i, label: "Huawei" },
  { pattern: /Xiaomi|Redmi|Mi /i, label: "Xiaomi" },
  { pattern: /OnePlus/i, label: "OnePlus" },
  { pattern: /Macintosh/i, label: "Komputer Mac" },
  { pattern: /Windows/i, label: "Komputer z Windows" },
  { pattern: /Android/i, label: "Telefon z Androidem" },
  { pattern: /Linux/i, label: "Komputer z Linux" },
];

export const getDeviceLabel = (userAgent: string | null | undefined) => {
  if (!userAgent) {
    return "Nieznane urządzenie";
  }

  const match = lookup.find((item) => item.pattern.test(userAgent));

  return match?.label ?? "Nieznane urządzenie";
};
