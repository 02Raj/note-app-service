const hrService = require("../services/hr.service");

exports.createHR = async (req, res) => {
  try {
    const hr = await hrService.createHR(req.user.id, req.body);
    res.status(201).json({ success: true, data: hr });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllHR = async (req, res) => {
  try {
    const list = await hrService.getAllHR(req.user.id);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getHRById = async (req, res) => {
  try {
    const hr = await hrService.getHRById(req.user.id, req.params.id);
    if (!hr) {
      return res.status(404).json({ message: "HR not found" });
    }
    res.json({ success: true, data: hr });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateHR = async (req, res) => {
  try {
    const hr = await hrService.updateHR(
      req.user.id,
      req.params.id,
      req.body
    );
    res.json({ success: true, data: hr });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const hr = await hrService.updateStatus(
      req.user.id,
      req.params.id,
      req.body.status
    );
    res.json({ success: true, data: hr });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
