const mongoose = require('mongoose');

const WaiverSchema = new mongoose.Schema({
    league: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League',
        required: true
    },
    team: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    addPlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: true
    },
    dropPlayer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Player',
        required: null
    },
    priority: {
        type: Number,
        default: 1
    },
    status: {
        type: String,
        enum: ['pending', 'processed', 'denied'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Waiver', WaiverSchema);