export function abbreviateInput(input) {
  if (typeof input === 'string') {
    const el = String(input).substring(0, 5);
    return el;
  }

  const el = input.toFixed(0);
  return el;
}

export function createTableRow(data, tableBody, orderRowMap) {
  const newRow = document.createElement('tr');

  newRow.innerHTML = `
        <td>#${abbreviateInput(data.orderId)}</td>
        <td>${data.name}</td>
        <td>${data.location.x}/${data.location.y}</td>
        <td>#${abbreviateInput(data.customerId)}</td>
        <td>${abbreviateInput(data.distance)}</td>
        <td> - </td>
        <td>${data.status}</td>
      `;

  tableBody.appendChild(newRow);
  orderRowMap.set(data.orderId, newRow);
}

export function updateTable(data, tableBody, orderRowMap) {
  console.log(data);

  const { orderId } = data;
  const existingRow = orderRowMap.get(orderId);

  const timeCell = existingRow.cells[5];
  const statusCell = existingRow.cells[6];

  timeCell.textContent = abbreviateInput(data.time);
  statusCell.textContent = data.status; // === 'completed' ? 'completed' : 'in progress';

  // Remove order
  // if (data.status === 'Completed') {
  //   tableBody.removeChild(existingRow);
  //   orderRowMap.delete(orderId);
  // }
}

export function highlightElement(element) {
  if (element.classList.contains('active')) {
    element.classList.remove('active');
    return;
  }
  element.classList.add('active');
}
