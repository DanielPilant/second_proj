// Lobby page logic: load current user, render greeting, gallery, and leaderboard.

function getElement(id) {
	return document.getElementById(id);
}

function getCurrentUsername() {
	try {
		return localStorage.getItem("currentUser");
	} catch (_) {
		return null;
	}
}

function handleLogout() {
	try {
		localStorage.removeItem("currentUser");
	} catch (_) {
		// ignore storage errors
	}
	window.location.href = "../index.html";
}

function findUserByName(username) {
	if (!username || typeof getAllUsers !== "function") return null;
	try {
		const users = getAllUsers();
		return users.find((u) => u && u.username === username) || null;
	} catch (_) {
		return null;
	}
}

function renderGreeting(name) {
	const el = getElement("greeting");
	if (!el) return;
	const display = name ? `Welcome ${name}` : "Welcome";
	el.textContent = display;
}

function gamesData() {
	// Two playable games; others marked as coming soon
	return [
		{
			key: "snake",
			title: "Snake",
			href: "./game1.html",
			available: true,
			decors: ["pink", "mint"],
		},
		{
			key: "chess",
			title: "Chess",
			href: "./game2.html",
			available: true,
			decors: ["orange", "blue"],
		},
		{
			key: "comming-soon-1",
			title: "Coming Soon",
			href: "#",
			available: false,
			decors: ["blue", "pink"],
		},
		{
			key: "comming-soon-2",
			title: "Coming Soon",
			href: "#",
			available: false,
			decors: ["mint", "orange"],
		},
	];
}

function renderGallery() {
	const container = getElement("gallery");
	if (!container) return;
	container.textContent = "";

	gamesData().forEach((g) => {
		const cardTag = g.available ? "a" : "div";
		const card = document.createElement(cardTag);
		card.className = "game-card";
		card.setAttribute("role", "listitem");
		if (g.available) {
			card.href = g.href;
			card.setAttribute("aria-label", `${g.title} – Play now`);
		} else {
			card.setAttribute("aria-label", `${g.title} – Coming soon`);
			card.setAttribute("aria-disabled", "true");
		}

		const title = document.createElement("div");
		title.className = "title";
		title.textContent = g.title;

		const pill = document.createElement("span");
		pill.className = `pill ${g.available ? "live" : "soon"}`;
		pill.textContent = g.available ? "Play now" : "Coming soon";

		const decors = document.createElement("div");
		decors.className = "card-decors";
		g.decors.forEach((c) => {
			const d = document.createElement("div");
			d.className = `dot ${c}`;
			decors.appendChild(d);
		});

		card.appendChild(title);
		card.appendChild(pill);
		card.appendChild(decors);
		container.appendChild(card);
	});
}

function getUserStats(user) {
	// Default shape if absent
	const games = (user && user.games) || {};
	const snake = games.snake || { highScore: 0, gamesPlayed: 0 };
	const chess = games.chess || { highScore: 0, gamesPlayed: 0 };
	return [
		{ name: "Snake", high: snake.highScore || 0, played: snake.gamesPlayed || 0 },
		{ name: "Chess", high: chess.highScore || 0, played: chess.gamesPlayed || 0 },
	];
}

function renderLeaderboard(user) {
	const tbody = getElement("leaderboard-body");
	if (!tbody) return;
	tbody.textContent = "";

	getUserStats(user).forEach((row) => {
		const tr = document.createElement("tr");
		const tdGame = document.createElement("td");
		const tdHigh = document.createElement("td");
		const tdPlayed = document.createElement("td");

		tdGame.textContent = row.name;
		tdHigh.textContent = String(row.high);
		tdPlayed.textContent = String(row.played);

		tr.appendChild(tdGame);
		tr.appendChild(tdHigh);
		tr.appendChild(tdPlayed);
		tbody.appendChild(tr);
	});
}

function init() {
	const username = getCurrentUsername();
	const user = findUserByName(username);
	const logoutBtn = getElement("logout-btn");

	if (logoutBtn) {
		logoutBtn.addEventListener("click", handleLogout);
	}
	renderGreeting(username || "");
	renderGallery();
	renderLeaderboard(user);
}

// Defer attribute ensures DOM is ready; still safe-guard.
if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", init);
} else {
	init();
}

