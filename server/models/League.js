const mongoose = require('mongoose');

const LeagueSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    commissioner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required:true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    teams: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Team'
    }],
    inviteCode: {
        type: String,
        unique: true
    },
    settings: {
        maxTeams: { type: Number, default: 10},
        rosterSize: { type: Number, default: 15},
        scoringType: { type: String, enum: ['standard', 'ppr', 'half-ppr'], default: 'ppr'},
        draftType: { type: String, enum: ['snake', 'auction'], default: 'snake' },
    },
    status: {
        type: String,
        enum: ['forming', 'drafting', 'active', 'completed'],
        default: 'forming'
    },
    createAt: {
        type: Date,
        default: Date.now
    }
});

model.exporta = mongoose.model('League', LeagueSchema);