const express = require('express');
const SunCalc = require('suncalc');
const cors = require('cors');
const tzlookup = require('tz-lookup');
const moment = require('moment-timezone');

const app = express();
app.use(cors());

app.get('/zmanim', (req, res) => {
    const { lat, lng, date } = req.query;

    if (!lat || !lng) {
        return res.status(400).json({ error: 'Missing lat or lng' });
    }

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    // Obtener zona horaria
    let timeZone;
    try {
        timeZone = tzlookup(latNum, lngNum);
    } catch (e) {
        return res.status(400).json({ error: 'No se pudo determinar la zona horaria.' });
    }

    // ✅ Corrección aquí: convertir la fecha a una hora local controlada
    let dateObj;
    if (date) {
        const [year, month, day] = date.split('-').map(Number);
        dateObj = moment.tz({ year, month: month - 1, day, hour: 12 }, timeZone).toDate(); // hora fija para evitar desplazamiento
    } else {
        dateObj = moment().tz(timeZone).toDate();
    }

    const times = SunCalc.getTimes(dateObj, latNum, lngNum);

    const sunrise = times.sunrise;
    const sunset = times.sunset;

    const dayLengthMs = sunset - sunrise;
    const shaahZmanit = dayLengthMs / 12;

    const alosHashachar = new Date(sunrise.getTime() - 72 * 60 * 1000);
    const tzeitHakochavim = new Date(sunset.getTime() + 18 * 60 * 1000);
    const chatzot = new Date(sunrise.getTime() + (dayLengthMs / 2));
    const minchaGedola = new Date(chatzot.getTime() + 30 * 60 * 1000);
    const minchaKetana = new Date(sunset.getTime() - (shaahZmanit * 2.5));
    const kriatShema = new Date(sunrise.getTime() + (shaahZmanit * 3));
    const tfila = new Date(sunrise.getTime() + (shaahZmanit * 4));

    function fmt(time) {
        return moment(time).tz(timeZone).format('HH:mm');
    }

    res.json({
        date: moment(dateObj).tz(timeZone).format('YYYY-MM-DD'),
        timeZone,
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
