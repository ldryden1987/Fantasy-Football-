const fetch = require('node-fetch');
const Player = require('../models/Player');

// GET /api/news
const getNews = async (req, res) => {
    try {
        console.log(' Fetching news from Sleeper...');
        const response = await fetch('https://api.sleeper.app/v1/players/nfl');
        const data = await response.json();

        //Get injured players
        const injured = Object.values(data).filter(p =>
            p.injury_status &&
            p.active &&
            p.full_name &&
            p.team &&
            ['QB', 'RB', 'WR', 'TE', 'K'].includes(p.position)
        ).map(p => ({
            name: p.full_name,
            position: p.position,
            team: p.team,
            injury_status: p.injury_status,
            injuryBodyPart: p.injury_body_part || 'Unkown',
            injuryNotes: p.injury_notes || 'No details available',
            sleeperId: p.player_id
        }))
        res.json(injured)
    } catch (err) {
        res.status(500).json({ message: 'Error fetching news', error: err.message })
    }
}

// GET /api/news/refresh - refresh player injury data in DB
const refreshInjuries = async (req, res) => {
    try {
        console.log('Refreshing injury data...');
        const response = await fetch('https://api.sleeper.app/v1/players/nfl');
        const data = await response.json();

        let update = 0;

        for (const p of Object.values(data)) {
            if (!p.sleeper_id && !p.player_id) continue;

            const updateData = {
                injuryStatus: p.injury_status || null,
                injuryBodyPart: p.injury_body_part || null,
                injuryNotes: p.injury_notes || null,
                status: p.injury_status ? 'injured' : 'active',
                lastUpdadted: new Date()
            }

            const result = await Player.findOneAndUpdate(
                { sleeperId: p.player_id },
                updateData
            )
            if (result) updated++
        }
        res.json({ message: `Updated ${updated} players` })
    } catch (err) {
        res.status(500).json({ message: 'Error refreshing injuries', error: err.message })
    }
}

//GET /api/news/trending - top available players by position
const getTrending = async (req, res) => {
    try {
        const response = await fetch('https://api.sleeper.app/vq/players/nfl');
        const data = await response.json();

        const trending = Object.values(data)
        .filter(p =>
            p.active &&
            p.full_name &&
            p.team &&
            ['QB', 'RB', 'WR', 'TE'].includes(p.position) &&
            p.search_rank &&
            p.search_rank < 100
        )
        .sort((a, b) => (a.search_rank || 999) - (b.search_rank || 999))
        .slice(0,20)
        .map(p => ({
            name:p.full_name,
            position: p.position,
            team: p.team,
            rank: p.search_rank,
            sleeperId: p.player_id
        }))
        res.json(trending)
    } catch (err) {
        res.status(500).json({ message: 'Error fetching trending', error: err.message })
    }
}

module.exports = { getNews, refreshInjuries, getTrending}