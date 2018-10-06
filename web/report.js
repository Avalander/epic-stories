import 'whatwg-fetch'


window.onerror = function (message, source, lineno, colno, error) {
    fetch('/api/report/error', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message,
            source,
            lineno,
            colno,
            error: {
                message: error.message,
                stack: error.stack,
            },
            from: window.location.href,
        })
    })
    .then(function () {
        document.body.innerHTML = `
			<h1>There was an error while runnig the app</h1>
			<h2>The error has been reported</h2>
			`
    })
    .catch(function (err) {
        document.body.innerHTML = `
			<h1>There was an error while running the app</h1>
			<h2>The error could not be reported, please send the following information to your web master</h2>
			<code>${error}</code>
			`
	})
}