// Definimos la lista de microservicios que queremos monitorizar
const services = [
    { name: "Libros Servicio", url: "http://localhost:8081/actuator/health" },
    { name: "Usuarios Servicio", url: "http://localhost:8082/actuator/health" },
    { name: "Pedidos Servicio", url: "http://localhost:8083/actuator/health" }
  ];

  // Función para obtener el estado de cada servicio a través del endpoint de Actuator
  function fetchServiceStatus(service) {
    fetch(service.url)
      .then(response => response.json())
      .then(data => {
        const status = data.status;
        updateServiceCard(service.name, status, JSON.stringify(data, null, 2));
      })
      .catch(error => {
        console.error("Error en", service.name, error);
        updateServiceCard(service.name, "DOWN", "No se pudo obtener información");
      });
  }

  // Actualiza o crea la tarjeta de un servicio
  function updateServiceCard(name, status, details) {
    const dashboard = document.getElementById("dashboard");
    let card = document.getElementById(name);
    if (!card) {
      card = document.createElement("div");
      card.classList.add("service-card");
      card.id = name;
      card.innerHTML = `
        <h2>${name}</h2>
        <p>Estado: <span class="status"></span></p>
        <pre class="details"></pre>`;
      dashboard.appendChild(card);
    }
    card.querySelector(".status").textContent = status;
    card.querySelector(".status").className = "status " + (status === "UP" ? "status-up" : "status-down");
    card.querySelector(".details").textContent = details;
  }

  // Función que actualiza el dashboard llamando a cada servicio
  function updateDashboard() {
    services.forEach(service => fetchServiceStatus(service));
  }

  // Actualiza el dashboard al cargar la página y luego cada 10 segundos
  updateDashboard();
  setInterval(updateDashboard, 10000);