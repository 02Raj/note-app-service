const interactionService = require("../services/interaction.service");

exports.createInteraction = async (req, res) => {
  try {
    const interaction = await interactionService.createInteraction(req.body);
    res.status(201).json({ success: true, data: interaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getByHR = async (req, res) => {
  try {
    const list = await interactionService.getInteractionsByHR(req.params.hrId);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
