const mongoose = require('mongoose');

const MatchupSchema = new mongoose.Schema ({
    league: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'League',
        required: true
    },
    week: {
        type: Number,
        required: true
    },
    homeTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    awayTeam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        required: true
    },
    homeScore: {
        type: Number,
        default: 0
    },
    awayScore: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'completed'],
        default: 'scheduled'
    },
    winner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    },
    isPlayoff: { type: Boolean, default: false },
    playoffRound: {
    type: String,
    enum: ['semifinal', 'final', 'third_place', null],
    default: null
  },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Matchup', MatchupSchema);