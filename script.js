/* =========================
   LOGIN
========================= */

function loginUser(event) {

    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const message = document.getElementById("loginMessage");

    if (username.trim() !== "" && password.trim() !== "") {

        localStorage.setItem("username", username);

        message.style.color = "green";
        message.innerText = "Login successful!";

        setTimeout(function () {
            window.location.href = "details.html";
        }, 500);

    } else {

        message.style.color = "red";
        message.innerText = "Please enter username and password.";

    }
}


/* =========================
   SAVE USER DETAILS
========================= */

function saveDetails(event) {

    event.preventDefault();

    const name = document.getElementById("name").value;
    const age = document.getElementById("age").value;
    const gender = document.getElementById("gender").value;
    const height = document.getElementById("height").value;
    const weight = document.getElementById("weight").value;
    const goal = document.getElementById("goal").value;
    const activity = document.getElementById("activity").value;

    localStorage.setItem("name", name);
    localStorage.setItem("age", age);
    localStorage.setItem("gender", gender);
    localStorage.setItem("height", height);
    localStorage.setItem("weight", weight);
    localStorage.setItem("goal", goal);
    localStorage.setItem("activity", activity);

    window.location.href = "home.html";
}


/* =========================
   PROFILE
========================= */

function loadProfile() {

    const name = localStorage.getItem("name");
    const age = localStorage.getItem("age");
    const gender = localStorage.getItem("gender");
    const height = localStorage.getItem("height");
    const weight = localStorage.getItem("weight");
    const goal = localStorage.getItem("goal");
    const activity = localStorage.getItem("activity");

    if (document.getElementById("displayName")) {

        document.getElementById("displayName").innerText = name || "-";
        document.getElementById("displayAge").innerText = age || "-";
        document.getElementById("displayGender").innerText = gender || "-";
        document.getElementById("displayHeight").innerText =
            height ? height + " cm" : "-";
        document.getElementById("displayWeight").innerText =
            weight ? weight + " kg" : "-";
        document.getElementById("displayGoal").innerText = goal || "-";
        document.getElementById("displayActivity").innerText =
            activity || "-";

        document.getElementById("profileName").innerText =
            name || "Your Profile";
    }
}


/* =========================
   BMI CALCULATION
========================= */

function calculateBMI() {

    const height = parseFloat(localStorage.getItem("height"));
    const weight = parseFloat(localStorage.getItem("weight"));

    if (!height || !weight) {
        return;
    }

    const heightInMeters = height / 100;

    const bmi = weight / (heightInMeters * heightInMeters);

    document.getElementById("bmiValue").innerText =
        bmi.toFixed(1);

    document.getElementById("bmiHeight").innerText =
        height + " cm";

    document.getElementById("bmiWeight").innerText =
        weight + " kg";

    let status = "";

    if (bmi < 18.5) {
        status = "Underweight";
    }
    else if (bmi < 25) {
        status = "Normal";
    }
    else if (bmi < 30) {
        status = "Overweight";
    }
    else {
        status = "Obesity";
    }

    document.getElementById("bmiStatus").innerText = status;
}


/* =========================
   WORKOUT
========================= */

function startWorkout(workoutName) {

    alert(
        "Great choice! 💪\n\n" +
        workoutName +
        " is starting now."
    );
}


/* =========================
   LOGOUT
========================= */

function logoutUser() {

    localStorage.clear();

    window.location.href = "login.html";
}


/* =========================
   PAGE LOAD
========================= */

document.addEventListener("DOMContentLoaded", function () {

    loadProfile();

    if (document.getElementById("bmiValue")) {
        calculateBMI();
    }

});
/* ===== FitSphere: New Page Functions ===== */

function fsGet(key, fallback) {
    try {
        const value = localStorage.getItem("fitsphere_" + key);
        return value === null ? fallback : JSON.parse(value);
    } catch (e) {
        return fallback;
    }
}

function fsSet(key, value) {
    try {
        localStorage.setItem("fitsphere_" + key, JSON.stringify(value));
    } catch (e) {
        console.log("Could not save FitSphere data.");
    }
}

/* WATER TRACKER */
function initWater() {
    const goalInput = document.getElementById("waterGoal");
    const countEl = document.getElementById("waterCount");
    const fillEl = document.getElementById("waterFill");
    const messageEl = document.getElementById("waterMessage");

    if (!goalInput || !countEl) return;

    let data = fsGet("water", { count: 0, goal: 8, date: "" });
    const today = new Date().toDateString();

    if (data.date !== today) {
        data = { count: 0, goal: data.goal || 8, date: today };
        fsSet("water", data);
    }

    function render() {
        data.goal = Math.max(1, Number(goalInput.value) || 8);
        countEl.textContent = data.count;
        fillEl.style.width =
            Math.min(100, data.count / data.goal * 100) + "%";

        messageEl.textContent = data.count >= data.goal
            ? "Daily goal reached! Great job 💧"
            : (data.goal - data.count) + " glasses left to reach your goal.";

        fsSet("water", data);
    }

    goalInput.value = data.goal;
    goalInput.addEventListener("change", render);

    document.getElementById("addWater").addEventListener("click", () => {
        data.count++;
        render();
    });

    document.getElementById("removeWater").addEventListener("click", () => {
        data.count = Math.max(0, data.count - 1);
        render();
    });

    render();
}

/* SLEEP TRACKER */
function initSleep() {
    const form = document.getElementById("sleepForm");
    if (!form) return;

    const hoursInput = document.getElementById("sleepHours");
    const dateInput = document.getElementById("sleepDate");
    const message = document.getElementById("sleepMessage");
    const history = document.getElementById("sleepHistory");

    const today = new Date().toISOString().slice(0, 10);
    dateInput.value = today;

    function renderHistory() {
        const records = fsGet("sleep", []);
        history.innerHTML = "";

        records.slice(0, 7).forEach(record => {
            const item = document.createElement("p");
            item.textContent = record.date + " — " + record.hours + " hours";
            history.appendChild(item);
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        const hours = Number(hoursInput.value);
        const date = dateInput.value;

        if (!date || !Number.isFinite(hours) || hours < 0 || hours > 24) {
            message.textContent = "Enter a valid date and hours between 0 and 24.";
            return;
        }

        let records = fsGet("sleep", []);
        records = records.filter(item => item.date !== date);
        records.unshift({ date, hours });
        fsSet("sleep", records.slice(0, 30));

        message.textContent = hours >= 7 && hours <= 9
            ? "Saved! This is within the usual adult sleep recommendation."
            : "Sleep record saved. Most adults generally need around 7–9 hours.";

        renderHistory();
    });

    renderHistory();
}

/* BMI CALCULATOR */
function initBMI() {
    const form = document.getElementById("bmiForm");
    if (!form) return;

    const result = document.getElementById("bmiResult");

    form.addEventListener("submit", event => {
        event.preventDefault();

        const heightCm = Number(document.getElementById("bmiHeight").value);
        const weightKg = Number(document.getElementById("bmiWeight").value);

        if (heightCm < 50 || heightCm > 250 ||
            weightKg < 10 || weightKg > 500) {
            result.textContent = "Please enter a valid height and weight.";
            return;
        }

        const bmi = weightKg / Math.pow(heightCm / 100, 2);
        let category;

        if (bmi < 18.5) category = "Below the usual adult reference range";
        else if (bmi < 25) category = "Within the usual adult reference range";
        else if (bmi < 30) category = "Above the usual adult reference range";
        else category = "In the obesity range";

        result.innerHTML = "";
        const heading = document.createElement("h2");
        heading.textContent = "Your BMI: " + bmi.toFixed(1);

        const description = document.createElement("p");
        description.textContent = category;

        const note = document.createElement("p");
        note.textContent =
            "BMI is a screening measure, not a diagnosis. Interpret it with a qualified health professional.";

        result.append(heading, description, note);
        fsSet("bmi", { heightCm, weightKg, bmi: bmi.toFixed(1), category });
    });

    const saved = fsGet("bmi", null);
    if (saved) {
        document.getElementById("bmiHeight").value = saved.heightCm;
        document.getElementById("bmiWeight").value = saved.weightKg;
    }
}

/* ACHIEVEMENTS */
function initAchievements() {
    const waterCount = fsGet("water", { count: 0 }).count;
    const sleepRecords = fsGet("sleep", []);
    const bmiRecord = fsGet("bmi", null);

    const waterBadge = document.getElementById("waterBadge");
    const sleepBadge = document.getElementById("sleepBadge");
    const bmiBadge = document.getElementById("bmiBadge");

    if (waterBadge && waterCount >= 8) {
        waterBadge.classList.remove("badge-locked");
    }

    if (sleepBadge && sleepRecords.length >= 1) {
        sleepBadge.classList.remove("badge-locked");
    }

    if (bmiBadge && bmiRecord) {
        bmiBadge.classList.remove("badge-locked");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    initWater();
    initSleep();
    initBMI();
    initAchievements();
});

async function checkFitSphereBackend() {
    try {
        const response = await fetch("http://localhost:3000/api/status");
        const data = await response.json();

        console.log("FitSphere Backend:", data.message);
        console.log("Database:", data.database);
    } catch (error) {
        console.error("Backend connection failed:", error);
    }
}

checkFitSphereBackend();
