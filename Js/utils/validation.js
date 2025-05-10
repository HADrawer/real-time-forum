
export function validateRegisterForm() {
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("passwordConfirm").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return false;
    }
    return true;
}