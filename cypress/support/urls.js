export default {
	register: token =>
		(token
			? `/register.html?token=${token}`
			: '/register.html'
		),
	login: '/login.html',
	welcome: '/welcome',
	home: '/',
}