
const loginSection = document.getElementById("loginSection");
const dashboardSection = document.getElementById("dashboardSection");

const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

const tableBody = document.getElementById("enquiriesTable");
const dashboardMessage = document.getElementById("dashboardMessage");

let allEnquiries = [];

// Check whether a director is already logged in

async function checkLogin() {

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        loginMessage.textContent = "Could not check your login.";
        return;
    }

    if (data.session) {
        showDashboard(data.session.user);
    } else {
        showLogin();
    }
}

function showLogin() {

    loginSection.classList.remove("hidden");
    dashboardSection.classList.add("hidden");

}

async function showDashboard(user) {

    loginSection.classList.add("hidden");
    dashboardSection.classList.remove("hidden");

    document.getElementById("loggedInUser").textContent =
        "Logged in as: " + user.email;

    await loadEnquiries();

}

// Director login

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    loginMessage.textContent = "Checking login details...";

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
    });

    if (error) {

        loginMessage.textContent =
            "Login failed. Check your email and password.";

        return;

    }

    loginForm.reset();

    await showDashboard(data.user);

});

// Load enquiries from Supabase

async function loadEnquiries() {

    dashboardMessage.textContent = "Loading enquiries...";

    const { data, error } = await supabaseClient
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {

        console.error(error);

        dashboardMessage.textContent =
            "Could not load enquiries. Please try again.";

        return;

    }

    allEnquiries = data || [];

    updateStatistics();
    displayEnquiries(allEnquiries);

    dashboardMessage.textContent =
        allEnquiries.length + " enquiries loaded.";

}

// Update dashboard totals

function updateStatistics() {

    document.getElementById("totalCount").textContent =
        allEnquiries.length;

    document.getElementById("newCount").textContent =
        allEnquiries.filter(item => item.status === "New").length;

    document.getElementById("progressCount").textContent =
        allEnquiries.filter(item => item.status === "In Progress").length;

    document.getElementById("completedCount").textContent =
        allEnquiries.filter(item => item.status === "Completed").length;

}

// Display enquiries safely

function displayEnquiries(enquiries) {

    tableBody.replaceChildren();

    if (enquiries.length === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 7;
        cell.textContent = "No enquiries found.";

        row.appendChild(cell);
        tableBody.appendChild(row);

        return;

    }

    enquiries.forEach(item => {

        const row = document.createElement("tr");

        function addCell(value, className = "") {

            const cell = document.createElement("td");

            cell.textContent = value ?? "";
            if (className) cell.className = className;

            row.appendChild(cell);

            return cell;

        }

        addCell(new Date(item.created_at).toLocaleString());

        addCell(item.customer_name);

        const contactCell = addCell(
            item.email + "\n" + item.phone
        );

        addCell(item.service);

        addCell(item.message, "message-cell");

        // Status dropdown

        const statusCell = document.createElement("td");
        const statusSelect = document.createElement("select");

        ["New", "In Progress", "Completed"].forEach(status => {

            const option = document.createElement("option");

            option.value = status;
            option.textContent = status;

            statusSelect.appendChild(option);

        });

        statusSelect.value = item.status;

        statusSelect.addEventListener("change", async function() {

            const { error } = await supabaseClient
                .from("enquiries")
                .update({ status: statusSelect.value })
                .eq("id", item.id);

            if (error) {

                alert("Could not update enquiry status.");
                statusSelect.value = item.status;
                return;

            }

            item.status = statusSelect.value;

            updateStatistics();

        });

        statusCell.appendChild(statusSelect);
        row.appendChild(statusCell);

        // Delete button

        const actionCell = document.createElement("td");
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "admin-button";

        deleteButton.addEventListener("click", async function() {

            const confirmed = confirm(
                "Are you sure you want to delete this enquiry?"
            );

            if (!confirmed) return;

            const { error } = await supabaseClient
                .from("enquiries")
                .delete()
                .eq("id", item.id);

            if (error) {

                alert("Could not delete this enquiry.");
                return;

            }

            await loadEnquiries();

        });

        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        tableBody.appendChild(row);

    });

}

// Search enquiries

document.getElementById("searchInput").addEventListener("input", function() {

    const search = this.value.toLowerCase();

    const filtered = allEnquiries.filter(item => {

        return (
            item.customer_name.toLowerCase().includes(search) ||
            item.email.toLowerCase().includes(search)
        );

    });

    displayEnquiries(filtered);

});

// Refresh dashboard

document.getElementById("refreshButton").addEventListener("click", function() {
    loadEnquiries();
});

// Logout

document.getElementById("logoutButton").addEventListener("click", async function() {

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        alert("Could not log out. Please try again.");
        return;
    }

    showLogin();

});

// Listen for authentication changes

supabaseClient.auth.onAuthStateChange((event, session) => {

    if (event === "SIGNED_OUT" || !session) {
        showLogin();
    }

});

// Start the application

checkLogin();
