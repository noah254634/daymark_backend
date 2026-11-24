class ApiResponse {
    constructor(statusCode, message, data = null, meta = null) {
        this.success = true;
        this.message = message;
        this.data = data;
        this.meta = meta;
        this.statusCode = statusCode;
    }
}

export default ApiResponse;