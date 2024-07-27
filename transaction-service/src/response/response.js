class ResponseHelper {
  static success(data) {
    return {
      statusCode: 200,
      status: "success",
      data: data,
    };
  }

  static successMessage(message, statusCode) {
    return {
      statusCode: statusCode,
      status: "success",
      message: message,
    };
  }

  static error(message, statusCode) {
    return {
      statusCode: statusCode,
      status: "error",
      message: message,
    };
  }
}

module.exports = ResponseHelper;
