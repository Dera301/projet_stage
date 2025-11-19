const sendResponse = (res, data = null, message = "Success", code = 200) => {
  return res.status(code).json({
    success: code >= 200 && code < 300,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, message = "Error", code = 400) => {
  return sendResponse(res, null, message, code);
};

module.exports = { sendResponse, sendError };

