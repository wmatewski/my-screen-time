import { publicEnv } from "@/lib/env/public";
import type { ScreenTimeEntry, SessionAnalytics } from "@/lib/types";

const average = (values: number[]) => {
  if (!values.length) {
    return null;
  }

  return Math.round((values.reduce((total, value) => total + value, 0) / values.length) * 10) / 10;
};

const getAlignmentScore = (minutes: number, recommendedMinutes: number) => {
  const ratio = minutes / recommendedMinutes;

  if (ratio <= 1) {
    return Math.max(80, Math.round(100 - ratio * 20));
  }

  if (ratio <= 1.5) {
    return Math.max(60, Math.round(80 - (ratio - 1) * 40));
  }

  return Math.max(10, Math.round(60 - (ratio - 1.5) * 25));
};

export const buildSessionAnalytics = ({
  latestEntry,
  participantEntries,
  sessionEntries,
}: {
  latestEntry: ScreenTimeEntry | null;
  participantEntries: ScreenTimeEntry[];
  sessionEntries: ScreenTimeEntry[];
}): SessionAnalytics | null => {
  if (!latestEntry) {
    return null;
  }

  const recommendedMinutes = publicEnv.recommendedDailyLimitMinutes;
  const participantMinutes = participantEntries.map((entry) => entry.screen_time_minutes);
  const overallAverageMinutes = average(participantMinutes);
  const osEntries = participantEntries.filter(
    (entry) => entry.detected_os === latestEntry.detected_os,
  );
  const osAverageMinutes = average(osEntries.map((entry) => entry.screen_time_minutes));
  const participantCount = participantEntries.length;
  const lowerCount = participantEntries.filter(
    (entry) => entry.screen_time_minutes < latestEntry.screen_time_minutes,
  ).length;
  const higherCount = participantEntries.filter(
    (entry) => entry.screen_time_minutes > latestEntry.screen_time_minutes,
  ).length;
  const lowerPercentage = participantCount
    ? Math.round((lowerCount / participantCount) * 100)
    : 0;
  const higherPercentage = participantCount
    ? Math.round((higherCount / participantCount) * 100)
    : 0;

  const previousEntry = sessionEntries[1] ?? null;
  const trendPercentage =
    previousEntry && previousEntry.screen_time_minutes > 0
      ? Math.round(
          ((latestEntry.screen_time_minutes - previousEntry.screen_time_minutes) /
            previousEntry.screen_time_minutes) *
            100,
        )
      : null;

  let resultLabel = "Dobry";
  let resultTone: SessionAnalytics["resultTone"] = "good";
  let summary =
    "Mieścisz się w limicie rekreacyjnego czasu ekranowego dla młodzieży 12-17 lat.";
  let guidance =
    "Utrzymaj regularne przerwy, ruch i odkładanie ekranu przed snem, żeby wynik pozostał stabilny.";

  if (latestEntry.screen_time_minutes > recommendedMinutes) {
    resultLabel = "Umiarkowany";
    resultTone = "balanced";
    summary =
      "Jesteś ponad limitem 2 godzin rekreacyjnego screen time, ale nadal możesz szybko wrócić do lepszej równowagi.";
    guidance =
      "Spróbuj skrócić jedną najdłuższą aktywność ekranową dzisiaj o 20-30 minut i porównaj wynik jutro.";
  }

  if (latestEntry.screen_time_minutes > recommendedMinutes + 60) {
    resultLabel = "Wysoki";
    resultTone = "high";
    summary =
      "Dzisiejszy wynik wyraźnie przekracza limit dla wieku 12-17 lat, więc warto potraktować go jako sygnał do korekty nawyków.";
    guidance =
      "Zaplanuj jutro konkretną przerwę offline i ogranicz najbardziej czasochłonną aplikację lub serię treści.";
  }

  return {
    recommendedMinutes,
    overallAverageMinutes,
    osAverageMinutes,
    lowerPercentage,
    higherPercentage,
    participantCount,
    alignmentScore: getAlignmentScore(
      latestEntry.screen_time_minutes,
      recommendedMinutes,
    ),
    resultLabel,
    resultTone,
    summary,
    guidance,
    trendPercentage,
  };
};