// Lista de microservicios a monitorizar
const services = [
    { name: "Libros Servicio",  url: "http://localhost:8081/actuator/health" },
    { name: "Usuarios Servicio", url: "http://localhost:8082/actuator/health" },
    { name: "Pedidos Servicio",  url: "http://localhost:8083/actuator/health" }
  ];
  
  /**
   * Obtiene el estado de un microservicio a través de su endpoint de Actuator.
   * Si ocurre algún error se actualiza la tarjeta con status "DOWN".
   */
  function fetchServiceStatus(service) {
    fetch(service.url)
      .then(response => response.json())
      .then(data => {
        const status = data.status;
        updateServiceCard(service.name, status, data);
      })
      .catch(error => {
        console.error("Error en", service.name, error);
        updateServiceCard(service.name, "DOWN", { error: "No se pudo obtener información" });
      });
  }
  
  /**
   * Crea una ficha (sub-card) para mostrar un componente del microservicio.
   * @param {string} componentName - El nombre del componente (por ejemplo, "clientConfigServer").
   * @param {object} componentData - Objeto con la información del componente.
   * @param {string} serviceName - El nombre del microservicio (para un id único en caso necesario).
   * @returns {HTMLElement} El elemento div que representa la sub-card.
   */
  function createComponentCard(componentName, componentData, serviceName) {
    const card = document.createElement('div');
    card.classList.add('component-card');
  
    // Título de la ficha (nombre del componente)
    const title = document.createElement('h3');
    title.textContent = componentName;
    card.appendChild(title);
  
    // Mostrar el estado del componente, si existe
    if (componentData.status) {
      const statusP = document.createElement('p');
      statusP.innerHTML = `Estado: <span class="status ${componentData.status === "UP" ? "status-up" : "status-down"}">${componentData.status}</span>`;
      card.appendChild(statusP);
    }
  
    // Si existe la propiedad "details" lo mostramos; de lo contrario, puede mostrarse otro tipo de dato
    if (componentData.details) {
      // Caso especial para diskSpace (mostramos gráfica de pie y detalles formateados)
      if (componentName === "diskSpace") {
        // Contenedor para la gráfica
        const diskChartContainer = document.createElement('div');
        diskChartContainer.classList.add('disk-chart-container');
        card.appendChild(diskChartContainer);
  
        // Se crea un canvas para la gráfica
        const canvas = document.createElement('canvas');
        canvas.width = 250;
        canvas.height = 250;
        diskChartContainer.appendChild(canvas);
  
        // Extraemos los valores para la gráfica
        const diskInfo = componentData.details;
        const total = diskInfo.total;
        const free = diskInfo.free;
        const used = total - free;
        const ctx = canvas.getContext("2d");
  
        new Chart(ctx, {
          type: "pie",
          data: {
            labels: ["Libre", "Usado"],
            datasets: [{
              data: [free, used],
              backgroundColor: ["#4CAF50", "#F44336"]
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: "Espacio en Disco"
              },
              legend: {
                position: "bottom"
              }
            }
          }
        });
  
        // También mostramos los detalles en texto (formateado)
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('component-details');
        detailsDiv.textContent = JSON.stringify(diskInfo, null, 2);
        card.appendChild(detailsDiv);
      } else {
        // Para otros componentes, mostramos los detalles formateados en una ficha
        const detailsDiv = document.createElement('div');
        detailsDiv.classList.add('component-details');
        detailsDiv.textContent = JSON.stringify(componentData.details, null, 2);
        card.appendChild(detailsDiv);
      }
    } else {
      // Si no hay detalles, se puede mostrar un mensaje
      const noDetails = document.createElement('p');
      noDetails.textContent = "No hay detalles para mostrar.";
      card.appendChild(noDetails);
    }
  
    return card;
  }
  
  /**
   * Crea o actualiza la tarjeta de un microservicio.
   * Se extraen los componentes dentro de "data.components" y se crea una ficha para cada uno.
   * @param {string} name - Nombre del microservicio.
   * @param {string} status - Estado del microservicio ("UP" o "DOWN").
   * @param {object} data - Objeto JSON recibido del endpoint Actuator.
   */
  function updateServiceCard(name, status, data) {
    const dashboard = document.getElementById("dashboard");
    let card = document.getElementById(name);
  
    // Si la tarjeta principal del microservicio no existe, se crea.
    if (!card) {
      card = document.createElement("div");
      card.classList.add("service-card");
      card.id = name;
      card.innerHTML = `
        <h2>${name}</h2>
        <p>Estado: <span class="status"></span></p>
        <div class="components-container"></div>
      `;
      dashboard.appendChild(card);
    }
  
    // Actualizamos el estado del microservicio
    const statusSpan = card.querySelector(".status");
    statusSpan.textContent = status;
    statusSpan.className = "status " + (status === "UP" ? "status-up" : "status-down");
  
    // Actualizamos el contenedor de componentes
    const componentsContainer = card.querySelector(".components-container");
    componentsContainer.innerHTML = "";
  
    if (data.components) {
      // Recorremos cada componente dentro de "data.components"
      for (const comp in data.components) {
        if (Object.prototype.hasOwnProperty.call(data.components, comp)) {
          const compCard = createComponentCard(comp, data.components[comp], name);
          componentsContainer.appendChild(compCard);
        }
      }
    } else {
      // Si no existen componentes, mostramos un mensaje
      const message = document.createElement("p");
      message.textContent = "No se encontraron componentes.";
      componentsContainer.appendChild(message);
    }
  }
  
  /**
   * Actualiza el dashboard llamando a cada microservicio.
   */
  function updateDashboard() {
    services.forEach(service => fetchServiceStatus(service));
  }
  
  // Llamada inicial para actualizar el dashboard al cargar la página
  updateDashboard();
  // Si se requiere actualizar de forma periódica, se puede descomentar la siguiente línea:
  // setInterval(updateDashboard, 10000);
  