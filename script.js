// Supabase-Initialisierung
const supabaseUrl = "https://qwcmpnguqsramlhbdcrx.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3Y21wbmd1cXNyYW1saGJkY3J4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU5ODM4NzAsImV4cCI6MjA2MTU1OTg3MH0.DRKem19okKPpSbeNrx4qW494kLsVtHLtIfdGVya0xhE";
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Motivationszitate
const MOTIVATIONAL_QUOTES = [
  "Heute ist ein guter Tag, um neu zu beginnen.",
  "Deine Gedanken formen deine Welt.",
  "Vertraue deinem inneren Licht.",
  "Kleine Schritte führen zu großen Veränderungen.",
  "Du bist genug – genau jetzt."
];

let currentUser = null;

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

async function showApp() {
  document.getElementById("auth-section").style.display = "none";
  document.getElementById("app-section").style.display = "block";

  await rewardCoins();
  await loadGoal();
}

async function rewardCoins() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabaseClient
    .from("coins")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("date", today);

  if (data.length === 0) {
    await supabaseClient.from("coins").insert({ user_id: currentUser.id, date: today, amount: 5 });
    document.getElementById("coins").innerText = "🪙 Du hast heute 5 Münzen erhalten!";
  } else {
    document.getElementById("coins").innerText = "🪙 Münzen heute bereits erhalten.";
  }
}

async function saveDiary() {
  const text = document.getElementById("diaryEntry").value;
  await supabaseClient.from("diary").insert({ user_id: currentUser.id, content: text });
  alert("Eintrag gespeichert!");
}

async function askSoul() {
  const question = document.getElementById("chatInput").value;
  // Platzhalter für echten Chatbot – aktuell einfache Spiegelung
  document.getElementById("chatResponse").innerText =
    "Deine Seele sagt: " + question.split("").reverse().join("");
}

async function saveGoal() {
  const goal = document.getElementById("goalInput").value;
  await supabaseClient
    .from("goals")
    .upsert({ user_id: currentUser.id, goal: goal }, { onConflict: ['user_id'] });
  document.getElementById("goalDisplay").innerText = "🎯 Dein Ziel: " + goal;
}

async function loadGoal() {
  const { data } = await supabaseClient
    .from("goals")
    .select("goal")
    .eq("user_id", currentUser.id)
    .single();

  if (data) {
    document.getElementById("goalDisplay").innerText = "🎯 Dein Ziel: " + data.goal;
  }
}

async function playGame() {
  const today = new Date().toISOString().split("T")[0];
  const { data, error } = await supabaseClient
    .from("coins")
    .select("*")
    .eq("user_id", currentUser.id)
    .eq("date", today)
    .single();

  if (data && data.amount >= 5) {
    await supabaseClient
      .from("coins")
      .update({ amount: data.amount - 5 })
      .eq("user_id", currentUser.id)
      .eq("date", today);
    document.getElementById("gameStatus").innerText = "🎮 Du hast das Spiel gestartet! (Simuliert)";
  } else {
    document.getElementById("gameStatus").innerText = "😢 Nicht genug Münzen!";
  }
}
