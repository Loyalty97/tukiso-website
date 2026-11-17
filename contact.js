
const contactForm = document.getElementById("contactForm");

contactForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const messageBox = document.getElementById("formMessage");
    const submitButton = contactForm.querySelector("button");

    const enquiry = {
        customer_name: document.getElementById("customer_name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        service: document.getElementById("service").value,
        message: document.getElementById("message").value.trim()
    };

    if (
        !enquiry.customer_name ||
        !enquiry.email ||
        !enquiry.phone ||
        !enquiry.service ||
        !enquiry.message
    ) {
        messageBox.textContent = "Please complete all fields.";
        return;
    }

    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {

        const { error } = await supabaseClient
            .from("enquiries")
            .insert([enquiry]);

        if (error) {
            throw error;
        }

        messageBox.textContent =
            "Thank you! Your enquiry has been submitted successfully.";

        contactForm.reset();

    } catch (error) {

        console.error("Enquiry error:", error);

        messageBox.textContent =
            "Sorry, we could not submit your enquiry. Please try again.";

    } finally {

        submitButton.disabled = false;
        submitButton.textContent = "Send Enquiry";

    }

});
