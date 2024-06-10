
import mongoose from '../database/index.js';

const ParametersSchema = new mongoose.Schema({
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

const Parameters = mongoose.model('Parameters', ParametersSchema);

export default Parameters;