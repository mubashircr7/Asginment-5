// API URLs----------------------->

const ALL_ISSUES_API = "https://phi-lab-server.vercel.app/api/v1/lab/issues";
const SINGLE_ISSUE_API = "https://phi-lab-server.vercel.app/api/v1/lab/issue/";
const SEARCH_API = "https://phi-lab-server.vercel.app/api/v1/lab/issues/search?q=";


// DOM Elements-------------------->
// cards container (grid)
const container = document.querySelector(".grid");

// search input
const searchInput = document.querySelector("input");
// tab buttons
const tabs = document.querySelectorAll(".flex.gap-3.mb-6 button");


// Loading Spinner------------------>
function showLoading() {
  container.innerHTML = `
  <div class="col-span-4 text-center py-10">
     <span class="loading loading-spinner loading-lg"></span>
  </div>
  `;
}


// Fetch All Issues------------------>
async function loadIssues() {

  showLoading();

  try {
    const res = await fetch(ALL_ISSUES_API);
    const data = await res.json();
    renderIssues(data.data);
  } 
  catch (error) {
    console.log("Error loading issues", error);
  }
}


// Render Issues (Create Cards)--------->
function renderIssues(issues) {

  container.innerHTML = "";

  issues.forEach(issue => {

    // border color based on status
    const borderColor =
      issue.status === "open"
        ? "border-t-4 border-green-500"
        : "border-t-4 border-purple-500";

    const card = document.createElement("div");

    card.className =
      `bg-white rounded-xl p-5 shadow-sm border ${borderColor} cursor-pointer`;

    card.innerHTML = `
    
    <div class="flex justify-between items-center mb-3">
      <span class="text-xs bg-gray-100 px-3 py-1 rounded-full">
        ${issue.priority}
      </span>
    </div>

    <h3 class="font-semibold mb-2">${issue.title}</h3>

    <p class="text-sm text-gray-500 mb-3">
      ${issue.description.substring(0, 80)}...
    </p>

    <div class="flex gap-2 mb-4">

      ${issue.labels
        .map(
          label =>
            `<span class="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">${label}</span>`
        )
        .join("")}

    </div>

    <div class="text-xs text-gray-400 flex justify-between">
      <span>#${issue.id} by ${issue.author}</span>
      <span>${issue.createdAt}</span>
    </div>
    `;

    // click card → open modal
    card.addEventListener("click", () => openIssue(issue.id));

    container.appendChild(card);
  });

  updateIssueCount(issues.length);
}


// Update Issue Count--------->
function updateIssueCount(count) {
  const title = document.querySelector("h2");
  title.textContent = `${count} Issues`;
}


// Tab Filter------------------>
tabs.forEach(tab => {

  tab.addEventListener("click", async () => {

    // active button style
    tabs.forEach(t => {
      t.classList.remove("bg-purple-600", "text-white");
      t.classList.add("bg-gray-200");
    });

    tab.classList.add("bg-purple-600", "text-white");

    const category = tab.textContent.trim().toLowerCase();

    showLoading();

    const res = await fetch(ALL_ISSUES_API);
    const data = await res.json();

    if (category === "all") {
      renderIssues(data.data);
    } else {
      const filtered = data.data.filter(
        issue => issue.status === category
      );
      renderIssues(filtered);
    }
  });
});


// Search Functionality-------->
searchInput.addEventListener("keyup", async (e) => {

  const text = e.target.value;

  if (text.length < 2) return;

  showLoading();

  const res = await fetch(SEARCH_API + text);
  const data = await res.json();

  renderIssues(data.data);
});


// Issue Modal----------------->
async function openIssue(id) {

  // single issue fetch
  const res = await fetch(SINGLE_ISSUE_API + id);
  const data = await res.json();
  const issue = data.data;

  // create modal overlay
  const modal = document.createElement("div");

  modal.className =
  "fixed inset-0 bg-black/50 flex items-center justify-center z-50";

  // modal content
  modal.innerHTML = `
  
  <div class="bg-white rounded-xl w-[520px] shadow-lg p-6">

    <!-- title -->
    <h2 class="text-xl font-semibold mb-2">
      ${issue.title}
    </h2>

    <!-- status + author -->
    <div class="flex items-center gap-3 text-sm mb-3">

      <span class="px-2 py-1 rounded-full text-xs 
      ${issue.status === "open"
        ? "bg-green-100 text-green-600"
        : "bg-purple-100 text-purple-600"}">
        ${issue.status}
      </span>

      <span class="text-gray-500">
        Opened by ${issue.author}
      </span>

      <span class="text-gray-400">
        ${issue.createdAt}
      </span>

    </div>

    <!-- labels -->
    <div class="flex gap-2 mb-4">

      ${issue.labels.map(label =>
        `<span class="text-xs bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full">${label}</span>`
      ).join("")}

    </div>

    <!-- description -->
    <p class="text-gray-600 text-sm mb-6">
      ${issue.description}
    </p>

    <!-- bottom section -->
    <div class="flex justify-between items-center">

      <div class="text-sm">
        <p class="text-gray-500">Assignee</p>
        <p class="font-medium">${issue.author}</p>
      </div>

      <div class="text-sm">
        <p class="text-gray-500">Priority</p>
        <span class="px-2 py-1 text-xs rounded-full
        ${issue.priority === "HIGH"
          ? "bg-red-100 text-red-600"
          : "bg-yellow-100 text-yellow-600"}">
          ${issue.priority}
        </span>
      </div>

      <button class="bg-purple-600 text-white px-4 py-2 rounded closeBtn">
        Close
      </button>

    </div>

  </div>
  `;

  // add modal to body
  document.body.appendChild(modal);

  // close button
  modal.querySelector(".closeBtn").addEventListener("click", () => {
    modal.remove();
  });

}

loadIssues();