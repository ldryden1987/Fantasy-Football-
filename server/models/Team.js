const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    League: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League',
        required: false
    },
    roster: [{
        player: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
        slot: { type: String, enum: ['QB','RB', 'WR', 'TE', 'FLEX', 'K', 'DEF', 'BN'], default: 'BN'}
    }],
    waiverPriority: {
        type: Number,
        default: 1
    },
    wins: { type: Number, default: 0 },
    losses: {type: Number, default: 0 },
    points: {type: Number, default: 0},
    createAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Team', TeamSchema);