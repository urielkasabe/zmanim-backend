const express = require('express');
const SunCalc = require('suncalc');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/zmanim', (req, res) => {
    const { lat, lng, date } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing lat or lng' });
    }

    const dateObj = date ? new Date(date) : new Date();
    const times = SunCalc.getTimes(dateObj, parseFloat(lat), parseFloat(lng));

    const sunrise = times.sunrise;
    const sunset = times.sunset;

    // חישוב שעה זמנית
    const dayLengthMs = sunset - sunrise;
    const shaahZmanit = dayLengthMs / 12;

    // זמני היום
    const alosHashachar = new Date(sunrise.getTime() - 72 * 60 * 1000);
    const tzeitHakochavim = new Date(sunset.getTime() + 18 * 60 * 1000);
    const chatzot = new Date(sunrise.getTime() + (dayLengthMs / 2));
    const minchaGedola = new Date(chatzot.getTime() + 30 * 60 * 1000);
    const minchaKetana = new Date(sunset.getTime() - (shaahZmanit * 2.5));
    const kriatShema = new Date(sunrise.getTime() + (shaahZmanit * 3));
    const tfila = new Date(sunrise.getTime() + (shaahZmanit * 4));

    function fmt(time) {
        return time.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
    }

    res.json({
        date: dateObj.toISOString().split('T')[0],
        calculationMethod: 'שיטת הגר"א (לפי שעות זמניות בין זריחה לשקיעה)',
        alosHashachar: fmt(alosHashachar),
        sunrise: fmt(sunrise),
        kriatShema: fmt(kriatShema),
        tfila: fmt(tfila),
        chatzot: fmt(chatzot),
        minchaGedola: fmt(minchaGedola),
        minchaKetana: fmt(minchaKetana),
        sunset: fmt(sunset),
        tzeitHakochavim: fmt(tzeitHakochavim)
    });

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Zmanim API is running on http://localhost:${PORT}`);
});
