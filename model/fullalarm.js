
import mongoose from '../database/index.js';

const FullAlarmSchema = new mongoose.Schema({
    empresa: {
        type: String,
    },
    loja: {
        type: String,
    },
    usuario: {
        type: String,
    },
    fullalarm: {
        type: Boolean,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

const FullAlarm = mongoose.model('FullAlarm', FullAlarmSchema);

export default FullAlarm;