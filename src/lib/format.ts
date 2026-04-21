export const formatMinutes = (minutes: number | null | undefined) => {
  if (minutes == null || Number.isNaN(minutes)) {
    return "Brak danych";
  }

  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (!hours) {
    return `${remainingMinutes} min`;
  }

  if (!remainingMinutes) {
    return `${hours}h`;
  }

  return `${hours}h ${remainingMinutes}m`;
};

export const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

export const formatPercentage = (value: number | null | undefined) => {
  if (value == null || Number.isNaN(value)) {
    return "Brak danych";
  }

  if (value > 0) {
    return `+${value}%`;
  }

  return `${value}%`;
};

export const formatRole = (role: string) => {
  if (role === "owner") {
    return "Właściciel";
  }

  if (role === "admin") {
    return "Administrator";
  }

  if (role === "member") {
    return "Członek organizacji";
  }

  return "Użytkownik";
};

export const formatStatus = (status: string) => {
  if (status === "active") {
    return "Aktywny";
  }

  if (status === "invited") {
    return "Zaproszony";
  }

  return "Wyłączony";
};
