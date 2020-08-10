export default function convertHourToMinutes(time: string): number {
  const [hour, minutes] = time.split(':').map(Number);
  // eslint-disable-next-line prettier/prettier
  const timeInMinutes = ( hour * 60 ) + minutes;

  return timeInMinutes;
}
