const moneyFormatter = new Intl.NumberFormat('es-PA', { style: 'currency', currency: 'PAB', minimumFractionDigits: 2, maximumFractionDigits: 2 });
const percentFormatter = new Intl.NumberFormat('es-PA', { style: 'percent', maximumFractionDigits: 2 });
const numberFormatter = new Intl.NumberFormat('es-PA', { maximumFractionDigits: 2 });
const dateFormatter = new Intl.DateTimeFormat('es-PA', { dateStyle: 'long', timeZone: 'UTC' });

export const formatMoney = (value: number) => moneyFormatter.format(value);
export const formatPercent = (value: number) => percentFormatter.format(value);
export const formatNumber = (value: number) => numberFormatter.format(value);
export const formatDate = (isoDate: string) => dateFormatter.format(new Date(`${isoDate}T00:00:00Z`));
