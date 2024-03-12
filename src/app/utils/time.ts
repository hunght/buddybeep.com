import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import duration from 'dayjs/plugin/duration'

dayjs.extend(relativeTime)
dayjs.extend(duration)

export function formatTimestamp(timestamp: string): string {
  const now = dayjs()
  const givenDate = dayjs(Number(timestamp))
  const diff = now.diff(givenDate)

  const weeks = Math.floor(dayjs.duration(diff).asWeeks())
  const days = Math.floor(dayjs.duration(diff).days())
  const hours = Math.floor(dayjs.duration(diff).asHours())
  const minutes = Math.floor(dayjs.duration(diff).asMinutes())

  if (weeks > 0) {
    return `${weeks}w`
  }
  if (days > 0) {
    return `${days}d`
  }
  if (hours > 0) {
    return `${hours}h`
  }
  if (minutes > 0) {
    return `${minutes}m`
  }

  return '1m'
}
