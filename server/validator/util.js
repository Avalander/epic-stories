const exists = obj => obj !== undefined && obj !== null

const hasContent = value => exists(value) && typeof value === 'string' ? value.length > 0 : true

module.exports = {
	exists,
	hasContent,
}