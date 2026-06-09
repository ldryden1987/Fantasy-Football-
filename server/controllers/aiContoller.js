const Anthropic = require('@anthropic-ai/sdk');
const Player = require('../models/Player');
const Team = require('../models/Team');

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// POST /api/ai/analyze-trade
const analyzeTrade = async (req, res) => {
  const { senderPlayerIds, receiverPlayerIds, scoringType } = req.body;

  try {
    // Fetch player details
    const senderPlayers = await Player.find({ _id: { $in: senderPlayerIds } });
    const receiverPlayers = await Player.find({ _id: { $in: receiverPlayerIds } });

    if (senderPlayers.length === 0 || receiverPlayers.length === 0) {
      return res.status(400).json({ message: 'Invalid players selected' });
    }

    // Build prompt
    const formatPlayer = (p) =>
      `${p.name} (${p.position} - ${p.nflTeam})${p.injuryStatus ? ` [${p.injuryStatus}]` : ''}`

    const prompt = `You are an expert fantasy football analyst. Analyze this trade offer:

GIVING UP:
${senderPlayers.map(formatPlayer).join('\n')}

RECEIVING:
${receiverPlayers.map(formatPlayer).join('\n')}

Scoring format: ${scoringType || 'PPR'}

Please provide:
1. A verdict: "Accept", "Reject", or "Consider"
2. A overall grade for each side (A, B, C, D, F)
3. A brief analysis of each player (1-2 sentences each)
4. Key factors that make this trade good or bad
5. A final recommendation in 2-3 sentences

Format your response as JSON with this exact structure:
{
  "verdict": "Accept" | "Reject" | "Consider",
  "givingGrade": "A" | "B" | "C" | "D" | "F",
  "receivingGrade": "A" | "B" | "C" | "D" | "F",
  "playerAnalysis": [
    { "name": "Player Name", "side": "giving" | "receiving", "analysis": "..." }
  ],
  "keyFactors": ["factor 1", "factor 2", "factor 3"],
  "recommendation": "..."
}

Return ONLY the JSON, no markdown, no extra text.`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;
    const analysis = JSON.parse(responseText);

    res.json({
      analysis,
      senderPlayers: senderPlayers.map(p => ({
        _id: p._id,
        name: p.name,
        position: p.position,
        nflTeam: p.nflTeam,
        injuryStatus: p.injuryStatus,
        fantasyPoints: p.fantasyPoints
      })),
      receiverPlayers: receiverPlayers.map(p => ({
        _id: p._id,
        name: p.name,
        position: p.position,
        nflTeam: p.nflTeam,
        injuryStatus: p.injuryStatus,
        fantasyPoints: p.fantasyPoints
      }))
    });
  } catch (err) {
    console.error('❌ AI analysis error:', err.message);
    res.status(500).json({ message: 'Error analyzing trade', error: err.message });
  }
};

// POST /api/ai/roster-advice
const getRosterAdvice = async (req, res) => {
  const { teamId, scoringType } = req.body;

  try {
    const team = await Team.findById(teamId).populate('roster.player');
    if (!team) return res.status(404).json({ message: 'Team not found' });

    const rosterList = team.roster
      .filter(r => r.player)
      .map(r => `${r.player.name} (${r.player.position} - ${r.player.nflTeam}, Slot: ${r.slot})${
        r.player.injuryStatus ? ` [${r.player.injuryStatus}]` : ''
      }`)
      .join('\n')

    const prompt = `You are an expert fantasy football analyst. Analyze this roster:

${rosterList}

Scoring format: ${scoringType || 'PPR'}

Provide:
1. Overall roster grade (A-F)
2. Strongest position group
3. Weakest position group  
4. Top 3 actionable recommendations

Format as JSON:
{
  "grade": "A-F",
  "strength": "position or player",
  "weakness": "position or player",
  "recommendations": ["rec 1", "rec 2", "rec 3"],
  "summary": "2-3 sentence overall assessment"
}

Return ONLY the JSON, no markdown, no extra text.`

    const message = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text;
    const advice = JSON.parse(responseText);

    res.json(advice);
  } catch (err) {
    console.error('❌ Roster advice error:', err.message);
    res.status(500).json({ message: 'Error getting roster advice', error: err.message });
  }
};

module.exports = { analyzeTrade, getRosterAdvice };
