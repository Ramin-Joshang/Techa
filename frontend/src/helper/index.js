export const formatDuration = minutes => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    let minuteText = '';
    if (remainingMinutes >= 10 && remainingMinutes < 20) {
        minuteText = 'و ربع';
    } else if (remainingMinutes >= 25 && remainingMinutes < 35) {
        minuteText = 'و نیم';
    } else if (remainingMinutes >= 40 && remainingMinutes < 50) {
        minuteText = 'و سه‌ربع';
    } else if (remainingMinutes >= 50) {
        // نزدیک به ساعت بعد
        return `حدود ${hours + 1} ساعت`;
    }
    return `${hours} ساعت${minuteText ? ' ' + minuteText : ''}`;
};