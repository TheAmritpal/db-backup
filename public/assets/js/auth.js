const loginForm = document.querySelector("#loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const response = await res.json();
      if (!res.ok) throw new Error(response.message);
      Swal.fire({
        title: "Logged in",
        text: response.message,
        icon: response.success ? "success" : "error",
      }).then(() => {
        window.location.href = "/";
      });
    } catch (error) {
      Swal.fire({
        title: "Oops!",
        text: error?.message || "Something went wrong",
        icon: "error",
      });
    }
  });
}
