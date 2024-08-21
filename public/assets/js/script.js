const addDatabaseForm = document.querySelector("#addDatabaseForm");
if (addDatabaseForm) {
  addDatabaseForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.target);
      const res = await fetch("/api/database", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const response = await res.json();
      if (!res.ok) throw new Error(response.message);
    } catch (error) {
      console.log(error);
    }
  });
}
