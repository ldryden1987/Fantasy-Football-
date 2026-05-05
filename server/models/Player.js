const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    name: { type: String, required: true},
    position: {
        type: String,
        enum: ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'],
        required: 'active'
    },
    nflTeam: { type: String, required: true},
    status: {
        type: String,
        enum: [ 'active', 'injured', 'bye'], 
        default: 'active'
    },
    stats: {
        passingYards: { type: Number, default: 0 },
        passingTDs: { type: Number, default: 0},
        interceptions: { type: Number, default: 0},
        rushingYards: { type: Number, default: 0},
        rushingTDs: { type: Number, default: 0},
        receivingYards: { type: Number, default: 0},
        receivingTDs: { type: Number, default: 0},
        receptions: { type: Number, default: 0},
        fieldGoals: { type: Number, default: 0},
        extraPoints: { type: Number, default: 0},
    },
    fantasyPoints: { type: Number, default: 0},
    owned: { type: Boolean, default: false },
    ownedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team',
        default: null
    }

});

module.exports = mongoose.model('Player', PlayerSchema);