// Get DOM elements
const form = document.querySelector("form");
const tBody = document.querySelector("tbody");
const grandTotalElement = document.querySelector("#grandTotal");
const labelInput = document.querySelector("#label");
const quantityInput = document.querySelector("#quantity");
const priceInput = document.querySelector("#price");
const notification = document.querySelector("#notification");

// Initialize localStorage if empty
if (!localStorage.getItem("data")) {
  localStorage.setItem("data", "[]");
}

// Show notification
function showNotification(message, isError = false) {
  notification.textContent = message;
  notification.style.backgroundColor = isError ? '#ff4444' : '#4CAF50';
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}

// Load data from localStorage
function loadData() {
  try {
    const data = JSON.parse(localStorage.getItem("data") || "[]");
    tBody.innerHTML = "";
    data.forEach(addTableRow);
    updateGrandTotal();
  } catch (error) {
    console.error("Error loading data:", error);
    localStorage.setItem("data", "[]");
    showNotification("Error loading data. Data has been reset.", true);
  }
}

// Format currency
function formatCurrency(number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(number);
}

// Add a new row to the table
function addTableRow(item) {
  const row = document.createElement("tr");
  const total = (item.quantity * item.price);
  
  row.innerHTML = `
    <td>${item.label}</td>
    <td>${item.quantity}</td>
    <td>${formatCurrency(item.price)}</td>
    <td>${formatCurrency(total)}</td>
    <td>
      <button onclick="deleteItem('${item.label}')" class="delete-btn">
        Delete
      </button>
    </td>
  `;
  tBody.appendChild(row);
}

// Calculate and update grand total
function updateGrandTotal() {
  try {
    const data = JSON.parse(localStorage.getItem("data") || "[]");
    const total = data.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    grandTotalElement.textContent = formatCurrency(total);
  } catch (error) {
    console.error("Error updating grand total:", error);
    showNotification("Error calculating total", true);
  }
}

// Delete an item
function deleteItem(label) {
  try {
    let data = JSON.parse(localStorage.getItem("data") || "[]");
    data = data.filter(item => item.label !== label);
    localStorage.setItem("data", JSON.stringify(data));
    loadData();
    showNotification("Item deleted successfully");
  } catch (error) {
    console.error("Error deleting item:", error);
    showNotification("Error deleting item", true);
  }
}

// Handle form submission
form.addEventListener("submit", function(e) {
  e.preventDefault();
  form.classList.add('loading');

  try {
    // Get values from inputs
    const newItem = {
      label: labelInput.value.trim(),
      quantity: parseInt(quantityInput.value),
      price: parseFloat(priceInput.value)
    };

    // Validate inputs
    if (!newItem.label || isNaN(newItem.quantity) || isNaN(newItem.price)) {
      showNotification("Please fill all fields correctly", true);
      return;
    }

    // Get existing data
    let data = JSON.parse(localStorage.getItem("data") || "[]");
    
    // Check for duplicate labels
    if (data.some(item => item.label === newItem.label)) {
      showNotification("An item with this label already exists!", true);
      return;
    }

    // Add new item
    data.push(newItem);
    localStorage.setItem("data", JSON.stringify(data));

    // Add to table and update total
    addTableRow(newItem);
    updateGrandTotal();

    // Reset form
    form.reset();
    labelInput.focus();
    showNotification("Item added successfully");
  } catch (error) {
    console.error("Error adding item:", error);
    showNotification("Error adding item", true);
  } finally {
    form.classList.remove('loading');
  }
});

// Load data when page loads
window.addEventListener("load", loadData);

// Add input validation
quantityInput.addEventListener('input', function() {
  if (this.value < 0) this.value = 0;
});

priceInput.addEventListener('input', function() {
  if (this.value < 0) this.value = 0;
});
