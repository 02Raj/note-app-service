// middleware/updateLastActivity.js

const Session = require('../models/session.model'); // Session मॉडल को इंपोर्ट करें

const updateLastActivity = async (req, res, next) => {
  // सुनिश्चित करें कि यूजर लॉग इन है और उसके पास एक एक्टिव सेशन ID है
  // req.user JWT ऑथ मिडलवेयर से आता है जो user की जानकारी स्टोर करता है (जैसे _id)
  // req.session.currentSessionId वह सेशन ID है जो आपने लॉगिन के बाद क्लाइंट को दी थी
  // और जिसे क्लाइंट आपको हर रिक्वेस्ट के साथ वापस भेज रहा होगा (उदाहरण के लिए, हेडर में, या किसी और तरीके से)

  // अभी के लिए, मान लेते हैं कि sessionId req.body या req.headers में आ रहा है
  // या अगर आप JWT payload में sessionId को शामिल कर रहे हैं और उसे डिकोड कर रहे हैं:
  const userId = req.user._id; // यह JWT token से आना चाहिए
  const sessionId = req.headers['x-session-id'] || req.body.sessionId; // उदाहरण के लिए, क्लाइंट इसे भेजेगा

  if (userId && sessionId) {
    try {
      // एक्टिव सेशन को ढूंढें और lastActivityTime अपडेट करें
      // हम userId को भी चेक कर रहे हैं ताकि सुनिश्चित हो सके कि सेशन उसी यूजर का है
      await Session.findOneAndUpdate(
        { _id: sessionId, userId: userId, endTime: { $exists: false } }, // endTime सेट न हो यह भी चेक करें
        { lastActivityTime: new Date() },
        { new: true } // अपडेटेड डॉक्यूमेंट वापस पाने के लिए, हालांकि यहाँ इसकी ज़रूरत नहीं
      );
      // console.log(`Session ${sessionId} last activity updated for user ${userId}`);
    } catch (error) {
      console.error("Error updating session last activity time:", error);
      // त्रुटि को हैंडल करें लेकिन रिक्वेस्ट को ब्लॉक न करें
    }
  }
  next(); // अगले मिडलवेयर या राउट हैंडलर पर जाएँ
};

module.exports = updateLastActivity;