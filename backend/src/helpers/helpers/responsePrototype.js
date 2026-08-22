// called once in server file to apply the prototype to all response objects
export function applyResponsePrototype(app) {
    app.response.sendStructuredResponse = function (
        status,
        data = null,
        message = '',
    ) {
        return this.status(status).json({
            payload: data,
            success: status >= 200 && status < 300,
            message,
        })
    }
}
