const supabaseUrl = "https://qwcmpnguqsramlhbdcrx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Y21wbmd1cXNyYW1saGJkY3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5ODM4NzAsImV4cCI6MjA2MTU1OTg3MH0.DRKem19okKPpSbeNrx4qW494kLsVtHLtIfdGVya0xhE";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const MOTIVATIONAL_QUOTES = [
  "Heute ist ein guter Tag, um neu zu beginnen.",
  "Deine Gedanken formen deine Welt.",
  "Vertraue deinem inneren Licht.",
  "Kleine Schritte führen zu großen Veränderungen.",
  "Du bist genug – genau jetzt."
];

let currentUser = null;
let diaryEntries = [];
let currentPage = 0;

document.addEventListener("DOMContentLoaded", async () => {
  showMotivation();
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    currentUser = session.user;
    showApp();
  }
});

function showMotivation() {
  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
  document.getElementById("motivation").innerText = "✨ " + quote;
}

async function signIn() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error, data } = await supabaseClient.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);
  currentUser = data.user;
  showApp();
}

async function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const { error, data } = await supabaseClient.auth.signUp({ email, password });
  if (error) return alert(error.message);
  alert("Registrierung erfolgreich! Bitte einloggen.");
}

async function logout() {
  await supabaseClient.auth.signOut();
  currentUser = null;
  document.getElementById("auth-section").style.display = "block";
  document.getElementById("app-section").style.display = "none";
}

async function showApp() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("app-section").style.display = "block";
  await rewardCoins();
  await loadGoal();
  await loadDiaryEntries();
}

async function rewardCoins() {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabaseClient
    .from("coins")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("date", today)
    .maybeSingle();

  if (!data) {
    await supabaseClient.from("coins").insert({
      user_id: currentUser.id,
      date: today,
      amount: 5
    });
    document.getElementById("coins").innerText = "💰 Du hast heute 5 Münzen erhalten!";
  } else {
    document.getElementById("coins").innerText = `💰 Verfügbare Münzen heute: ${data.amount}`;
  }
}

async function saveDiary() {
  const text = document.getElementById("diaryEntry").value;
  if (!text.trim()) return alert("Bitte schreibe etwas.");
  await supabaseClient.from("diary").insert({
    user_id: currentUser.id,
    content: text
  });
  alert("Eintrag gespeichert!");
  document.getElementById("diaryEntry").value = "";
  await loadDiaryEntries();
}

async function askSoul() {
  const question = document.getElementById("chatInput").value;
  if (!question.trim()) return;
  document.getElementById("chatResponse").innerText =
    "Deine Seele sagt: " + question.split("").reverse().join("");
  document.getElementById("chatInput").value = "";
}

async function saveGoal() {
  const goal = document.getElementById("goalInput").value;
  if (!goal.trim()) return alert("Bitte gib ein Ziel ein.");
  await supabaseClient
    .from("goals")
    .upsert({ user_id: currentUser.id, goal: goal }, { onConflict: ['user_id'] });
  document.getElementById("goalDisplay").innerText = "🎯 Dein Ziel: " + goal;
  document.getElementById("goalInput").value = "";
}

async function loadGoal() {
  const { data } = await supabaseClient
    .from("goals")
    .select("goal")
    .eq("user_id", currentUser.id)
    .maybeSingle();

  if (data && data.goal) {
    document.getElementById("goalDisplay").innerText = "🎯 Dein Ziel: " + data.goal;
  }
}

async function playGame() {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabaseClient
    .from("coins")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("date", today)
    .maybeSingle();

  if (data && data.amount >= 5) {
    await supabaseClient
      .from("coins")
      .update({ amount: data.amount - 5 })
      .eq("user_id", currentUser.id)
      .eq("date", today);
    document.getElementById("gameStatus").innerText = "🎮 Spiel gestartet!";
    rewardCoins();
  } else {
    document.getElementById("gameStatus").innerText = "❌ Nicht genug Münzen!";
  }
}

async function loadDiaryEntries() {
  const { data, error } = await supabaseClient
    .from("diary")
    .select("content, created_at")
    .eq("user_id", currentUser.id)
    .order("created_at", { ascending: true });

  if (error) return;

  diaryEntries = data;
  currentPage = diaryEntries.length > 0 ? diaryEntries.length - 1 : 0;
  renderCurrentPage();
}

function renderCurrentPage() {
  const bookPage = document.getElementById("bookPage");
  const indicator = document.getElementById("pageIndicator");

  if (diaryEntries.length === 0) {
    bookPage.innerHTML = "📭 Noch keine Einträge vorhanden.";
    indicator.innerText = "0 / 0";
    return;
  }

  const entry = diaryEntries[currentPage];
  const date = new Date(entry.created_at).toLocaleDateString("de-DE", {
    weekday: "short", year: "numeric", month: "short", day: "numeric"
  });

  bookPage.innerHTML = `<strong>${date}</strong><br><br>${entry.content}`;
  indicator.innerText = `${currentPage + 1} / ${diaryEntries.length}`;
}

function nextEntry() {
  if (currentPage < diaryEntries.length - 1) {
    currentPage++;
    renderCurrentPage();
  }
}

function prevEntry() {
  if (currentPage > 0) {
    currentPage--;
    renderCurrentPage();
  }
}

const bookContainer = document.getElementById("bookContainer");
let startX = 0;

bookContainer.addEventListener("touchstart", e => {
  startX = e.touches[0].clientX;
});

bookContainer.addEventListener("touchend", e => {
  const endX = e.changedTouches[0].clientX;
  const diff = startX - endX;
  if (diff > 50) nextEntry();
  else if (diff < -50) prevEntry();
});
