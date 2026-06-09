function errorMiddleware(err, req, res, next) {
    console.error('[ERROR]', err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Errore interno del server.'
    });
}

module.exports = errorMiddleware;